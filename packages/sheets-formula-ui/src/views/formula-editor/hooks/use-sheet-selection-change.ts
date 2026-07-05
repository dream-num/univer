/**
 * Copyright 2023-present DreamNum Co., Ltd.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/* eslint-disable max-lines-per-function */

import type { IRange, Workbook } from '@univerjs/core';
import type { Editor } from '@univerjs/docs-ui';
import type { ISelectionWithCoord, ISetSelectionsOperationParams } from '@univerjs/sheets';
import type { RefObject } from 'react';
import type { IRefSelection } from './use-highlight';
import {
    DisposableCollection,
    FOCUSING_FX_BAR_EDITOR,
    ICommandService,
    IContextService,
    IUniverInstanceService,
    noop,
    Rectangle,
    ThemeService,
    UniverInstanceType,
} from '@univerjs/core';
import { DocSelectionManagerService } from '@univerjs/docs';
import { IEditorService } from '@univerjs/docs-ui';
import {
    deserializeRangeWithSheet,
    generateStringWithSequence,
    isFormulaLexerToken,
    LexerTreeBuilder,
    matchRefDrawToken,
    matchToken,
    sequenceNodeType,
    serializeRange,
    serializeRangeWithSheet,
    serializeRangeWithSpreadsheet,
} from '@univerjs/engine-formula';
import { IRenderManagerService } from '@univerjs/engine-render';
import { IRefSelectionsService, SetSelectionsOperation } from '@univerjs/sheets';
import { SheetSkeletonManagerService } from '@univerjs/sheets-ui';
import { useDependency, useEvent, useObservable } from '@univerjs/ui';
import { useEffect, useMemo } from 'react';
import { merge } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { RefSelectionsRenderService } from '../../../services/render-services/ref-selections.render.service';
import { findIndexFromSequenceNodes, findRefSequenceIndex } from '../../range-selector/utils/find-index-from-sequence-nodes';
import { getOffsetFromSequenceNodes } from '../../range-selector/utils/get-offset-from-sequence-nodes';
import { sequenceNodeToText } from '../../range-selector/utils/sequence-node-to-text';
import { unitRangesToText } from '../../range-selector/utils/unit-ranges-to-text';
import { FormulaSelectingType, resolveFormulaSelectionWorkbook } from './use-formula-selection';
import { calcHighlightRanges } from './use-highlight';
import { isFormulaEditorInteractionOwner } from './use-left-and-right-arrow';
import { useStateRef } from './use-state-ref';

export const prepareSelectionChangeContext = (opts: { editor?: Editor; lexerTreeBuilder: LexerTreeBuilder }) => {
    const { editor, lexerTreeBuilder } = opts;
    const currentDocSelections = editor?.getSelectionRanges();
    const dataStream = (editor?.getDocumentData().body?.dataStream ?? '\r\n').slice(0, -2);
    const sequenceNodes = lexerTreeBuilder.sequenceNodesBuilder(dataStream.slice(1)) ?? [];
    let offset: number;

    if (currentDocSelections?.length === 1) {
        offset = currentDocSelections[0].startOffset - 1;
    } else if (dataStream.startsWith('=')) {
        offset = Math.max(dataStream.length - 1, 0);
    } else {
        return;
    }

    const nodeIndex = findIndexFromSequenceNodes(sequenceNodes, offset, false);
    const updatingRefIndex = findRefSequenceIndex(sequenceNodes, nodeIndex);
    return {
        nodeIndex,
        updatingRefIndex,
        formulaText: dataStream.slice(1),
        sequenceNodes,
        offset,
    };
};

export function getSequenceNodeCharAtOffset(sequenceNodes: (string | { token: string })[], offset: number): string | undefined {
    let currentOffset = 0;
    for (const node of sequenceNodes) {
        const text = typeof node === 'string' ? node : node.token;
        const nextOffset = currentOffset + text.length;
        if (offset > currentOffset && offset <= nextOffset) {
            return text[offset - currentOffset - 1];
        }
        currentOffset = nextOffset;
    }

    return undefined;
}

export function isFormulaReferenceAddingContext(sequenceNodes: (string | { token: string })[], offset: number): boolean {
    const char = getSequenceNodeCharAtOffset(sequenceNodes, offset);
    return Boolean(char && matchRefDrawToken(char));
}

export function isFormulaReferenceAddingTextContext(formulaText: string, offset: number): boolean {
    const char = formulaText[offset - 1];
    const nextChar = formulaText[offset];
    return Boolean(char && matchRefDrawToken(char) && (!nextChar || (isFormulaLexerToken(nextChar) && nextChar !== matchToken.OPEN_BRACKET)));
}

export function insertFormulaReferenceText(formulaText: string, refText: string, offset: number): string {
    return `${formulaText.slice(0, offset)}${refText}${formulaText.slice(offset)}`;
}

export function shouldSkipFormulaReferenceUpdate(isAdd: boolean, selectionCount: number): boolean {
    return !isAdd && selectionCount === 0;
}

export function getSelectionsForFormulaRefUpdate(
    selections: IRange[],
    updatingRefIndex: number,
    isCtrlAddMode?: boolean
): { orderedSelections: IRange[]; insertedSelection?: IRange } {
    const orderedSelections = [...selections];
    if (updatingRefIndex === -1) {
        return { orderedSelections };
    }

    const insertedSelection = isCtrlAddMode ? orderedSelections.pop() : undefined;
    const activeSelection = orderedSelections.pop();
    if (activeSelection) {
        orderedSelections.splice(updatingRefIndex, 0, activeSelection);
    }

    return { orderedSelections, insertedSelection };
}

export function getLastFormulaSelection(selections: IRange[]): IRange | undefined {
    return selections[selections.length - 1];
}

export interface ISelectionChangeDuplicateEndGuard<TSelection> {
    shouldSkip(selections: TSelection[], isEnd: boolean): boolean;
    reset(): void;
}

export function getFormulaSelectionIdentityKey(selection: unknown): string {
    const item = selection as Partial<IRange> & { range?: Partial<IRange>; rangeWithCoord?: Partial<IRange> };
    const range = item.rangeWithCoord ?? item.range ?? item;
    return [
        range.startRow ?? '',
        range.endRow ?? '',
        range.startColumn ?? '',
        range.endColumn ?? '',
    ].join(':');
}

export function isSameFormulaSelection(first: unknown, second: unknown): boolean {
    return getFormulaSelectionIdentityKey(first) === getFormulaSelectionIdentityKey(second);
}

const SHARED_SELECTION_CHANGE_DUPLICATE_END_GUARDS = new Map<string, ISelectionChangeDuplicateEndGuard<IRange>>();

export function getSharedSelectionChangeDuplicateEndGuard(key: string): ISelectionChangeDuplicateEndGuard<IRange> {
    let guard = SHARED_SELECTION_CHANGE_DUPLICATE_END_GUARDS.get(key);
    if (!guard) {
        guard = createSelectionChangeDuplicateEndGuard<IRange>();
        SHARED_SELECTION_CHANGE_DUPLICATE_END_GUARDS.set(key, guard);
    }

    return guard;
}

export function createSelectionChangeDuplicateEndGuard<TSelection>(): ISelectionChangeDuplicateEndGuard<TSelection> {
    let lastTransientSelectionsKey: string | undefined;
    const getSelectionsKey = (selections: TSelection[]) => selections.map(getFormulaSelectionIdentityKey).join('|');

    return {
        shouldSkip(selections, isEnd) {
            const selectionsKey = getSelectionsKey(selections);
            if (selectionsKey === lastTransientSelectionsKey) {
                return true;
            }

            if (isEnd) {
                lastTransientSelectionsKey = undefined;
                return false;
            }

            lastTransientSelectionsKey = selectionsKey;
            return false;
        },
        reset() {
            lastTransientSelectionsKey = undefined;
        },
    };
}

export function createSelectionChangeHandler<TSelection>(opts: {
    initialSelectionsCount: number;
    onSelectionsChange: (selections: TSelection[], isEnd: boolean, isCtrlAddMode?: boolean) => void;
    onDuplicateEnd?: (selections: TSelection[]) => void;
    duplicateEndGuard?: ISelectionChangeDuplicateEndGuard<TSelection>;
}) {
    let prevSelectionsCount = opts.initialSelectionsCount;
    let pendingCtrlAddCount = 0;
    const duplicateEndGuard = opts.duplicateEndGuard ?? createSelectionChangeDuplicateEndGuard<TSelection>();

    return (selections: TSelection[], isEnd: boolean, options?: { initial?: boolean }) => {
        if (options?.initial) {
            // Ignore the BehaviorSubject replay when subscribing; real user selections arrive through later move events.
            return;
        }

        if (selections.length === 0) {
            return;
        }

        const isCtrlAddMode = !options?.initial && prevSelectionsCount > 0 && selections.length > prevSelectionsCount;
        if (isCtrlAddMode && !isEnd) {
            pendingCtrlAddCount = selections.length;
            if (duplicateEndGuard.shouldSkip(selections, false)) {
                return;
            }
            opts.onSelectionsChange(selections, false, true);
            prevSelectionsCount = selections.length;
            pendingCtrlAddCount = 0;
            return;
        }
        const shouldApplyPendingCtrlAdd = isEnd && selections.length === pendingCtrlAddCount;
        if (duplicateEndGuard.shouldSkip(selections, isEnd)) {
            if (isEnd) {
                opts.onDuplicateEnd?.(selections);
            }
            prevSelectionsCount = selections.length;
            pendingCtrlAddCount = 0;
            return;
        }

        if (isEnd) {
            prevSelectionsCount = selections.length;
            pendingCtrlAddCount = 0;
        }

        opts.onSelectionsChange(selections, isEnd, isCtrlAddMode || shouldApplyPendingCtrlAdd);
    };
}

export function replaceFormulaControlSelection(
    selections: IRange[],
    index: number,
    newRange: IRange
): IRange[] | undefined {
    const current = selections[index];
    if (!current) {
        return undefined;
    }

    const nextRange = {
        ...newRange,
        sheetId: current.sheetId,
        unitId: current.unitId,
    };
    const nextSelections = [...selections];
    nextSelections[index] = nextRange;
    return nextSelections;
}

export function getInitialFormulaReferenceSelectionCount(renderSelectionCount: number, formulaReferenceCount: number, selectingType?: FormulaSelectingType): number {
    return Math.max(renderSelectionCount, formulaReferenceCount);
}

export const useSheetSelectionChange = (
    isNeed: boolean,
    isFocus: boolean,
    isSelectingRef: RefObject<FormulaSelectingType>,
    unitId: string,
    subUnitId: string,
    getRefSelections: () => IRefSelection[],
    isSupportAcrossSheet: boolean,
    listenSelectionSet: boolean,
    editor?: Editor,
    handleRangeChange: ((refString: string, offset: number, isEnd: boolean, isModify?: boolean) => void) = noop as any
) => {
    const renderManagerService = useDependency(IRenderManagerService);
    const univerInstanceService = useDependency(IUniverInstanceService);
    const commandService = useDependency(ICommandService);
    const contextService = useDependency(IContextService);
    const docSelectionManagerService = useDependency(DocSelectionManagerService);
    const editorService = useDependency(IEditorService);
    const themeService = useDependency(ThemeService);
    const lexerTreeBuilder = useDependency(LexerTreeBuilder);

    const workbook = univerInstanceService.getUnit<Workbook>(unitId);
    const getSheetNameById = useEvent((unitId: string, sheetId: string) => univerInstanceService.getUnit<Workbook>(unitId)?.getSheetBySheetId(sheetId)?.getName() ?? '');
    const sheetName = useMemo(() => getSheetNameById(unitId, subUnitId), [getSheetNameById, subUnitId, unitId]);
    const activeSheet = useObservable(workbook?.activeSheet$);
    const contextRef = useStateRef({ activeSheet, sheetName });
    const currentUnit = useObservable(useMemo(() => univerInstanceService.getCurrentTypeOfUnit$<Workbook>(UniverInstanceType.UNIVER_SHEET), [univerInstanceService]));
    const activeWorkbook = resolveFormulaSelectionWorkbook(currentUnit, workbook);
    const render = renderManagerService.getRenderById(activeWorkbook?.getUnitId() ?? unitId);
    const refSelectionsRenderService = render?.with(RefSelectionsRenderService);
    const sheetSkeletonManagerService = render?.with(SheetSkeletonManagerService);
    const refSelectionsService = useDependency(IRefSelectionsService);
    const duplicateEndGuard = useMemo(() => getSharedSelectionChangeDuplicateEndGuard(`${unitId}:${subUnitId}`), [subUnitId, unitId]);
    // eslint-disable-next-line complexity
    const onSelectionsChange = useEvent((selections: IRange[], isEnd: boolean, isCtrlAddMode?: boolean) => {
        if (!editor || !isFormulaEditorInteractionOwner(editorService.getFocusId(), editor.getEditorId(), {
            fxBarFocused: contextService.getContextValue(FOCUSING_FX_BAR_EDITOR),
        })) {
            return;
        }

        const ctx = prepareSelectionChangeContext({ editor, lexerTreeBuilder });
        if (!ctx) return;
        const { nodeIndex, updatingRefIndex, formulaText, sequenceNodes, offset } = ctx;
        const isAddingReference = isSelectingRef.current === FormulaSelectingType.NEED_ADD ||
            isFormulaReferenceAddingContext(sequenceNodes, offset) ||
            isFormulaReferenceAddingTextContext(formulaText, offset);
        if (isAddingReference) {
            if (offset !== 0) {
                if (nodeIndex === -1 && sequenceNodes.length) {
                    return;
                }
                const range = getLastFormulaSelection(selections);
                if (!range) {
                    return;
                }
                const lastNodes = sequenceNodes.splice(nodeIndex + 1);
                const rangeSheetId = range.sheetId ?? subUnitId;
                const unitRangeName = {
                    range,
                    unitId: range.unitId ?? activeWorkbook!.getUnitId(),
                    sheetName: getSheetNameById(range.unitId ?? activeWorkbook!.getUnitId(), rangeSheetId),
                };
                const isAcrossSheet = rangeSheetId !== subUnitId;
                const isAcrossWorkbook = activeWorkbook?.getUnitId() !== unitId;
                const refRanges = unitRangesToText([unitRangeName], isSupportAcrossSheet && (isAcrossSheet || isAcrossWorkbook), sheetName, isAcrossWorkbook);
                if (isFormulaReferenceAddingTextContext(formulaText, offset)) {
                    const result = insertFormulaReferenceText(formulaText, refRanges[0], offset);
                    handleRangeChange(result, offset + refRanges[0].length, isEnd);
                    return;
                }
                sequenceNodes.push({ token: refRanges[0], nodeType: sequenceNodeType.REFERENCE } as any);
                const newSequenceNodes = [...sequenceNodes, ...lastNodes];
                const result = sequenceNodeToText(newSequenceNodes);
                handleRangeChange(result, getOffsetFromSequenceNodes(sequenceNodes), isEnd);
            } else {
                const range = getLastFormulaSelection(selections);
                if (!range) {
                    return;
                }
                const rangeSheetId = range.sheetId ?? subUnitId;
                const unitRangeName = {
                    range,
                    unitId: range.unitId ?? activeWorkbook!.getUnitId(),
                    sheetName: getSheetNameById(range.unitId ?? activeWorkbook!.getUnitId(), rangeSheetId),
                };
                const isAcrossSheet = rangeSheetId !== subUnitId;
                const isAcrossWorkbook = activeWorkbook?.getUnitId() !== unitId;
                const refRanges = unitRangesToText([unitRangeName], isSupportAcrossSheet && (isAcrossSheet || isAcrossWorkbook), sheetName, isAcrossWorkbook);
                sequenceNodes.unshift({ token: refRanges[0], nodeType: sequenceNodeType.REFERENCE } as any);
                const result = sequenceNodeToText(sequenceNodes);
                handleRangeChange(result, refRanges[0].length, isEnd);
            }
        } else if (isSelectingRef.current === FormulaSelectingType.EDIT_OTHER_SHEET_REFERENCE || isSelectingRef.current === FormulaSelectingType.EDIT_OTHER_WORKBOOK_REFERENCE) {
            const last = selections.pop();
            if (!last) return;
            const node = sequenceNodes[nodeIndex];
            if (typeof node === 'object' && node.nodeType === sequenceNodeType.REFERENCE) {
                const oldToken = node.token;
                const isAcrossWorkbook = activeWorkbook?.getUnitId() !== unitId;
                if (isAcrossWorkbook) {
                    node.token = serializeRangeWithSpreadsheet(activeWorkbook?.getUnitId() ?? '', sheetName, last);
                } else {
                    node.token = sheetName === activeSheet?.getName() ? serializeRange(last) : serializeRangeWithSheet(activeSheet!.getName(), last);
                }
                const newOffset = offset + (node.token.length - oldToken.length);
                handleRangeChange(generateStringWithSequence(sequenceNodes), newOffset, isEnd);
            }
        } else {
            const { orderedSelections, insertedSelection } = getSelectionsForFormulaRefUpdate(selections, updatingRefIndex, isCtrlAddMode);
            const getRefRangeText = (range: IRange) => {
                const rangeSheetId = range.sheetId ?? subUnitId;
                const unitRangeName = {
                    range,
                    unitId: range.unitId ?? activeWorkbook!.getUnitId(),
                    sheetName: getSheetNameById(range.unitId ?? activeWorkbook!.getUnitId(), rangeSheetId),
                };
                const isAcrossWorkbook = activeWorkbook?.getUnitId() !== unitId;
                const isAcrossSheet = rangeSheetId !== subUnitId;
                const refRanges = unitRangesToText([unitRangeName], isSupportAcrossSheet && (isAcrossSheet || isAcrossWorkbook), sheetName, isAcrossWorkbook);
                return refRanges[0];
            };
            // Update all ref Selections
            let currentRefIndex = 0;
            const newTokens = sequenceNodes.map((item) => {
                if (typeof item === 'string') {
                    return item;
                }
                if (item.nodeType === sequenceNodeType.REFERENCE) {
                    const nodeRange = deserializeRangeWithSheet(item.token);
                    if (!nodeRange.sheetName) {
                        nodeRange.sheetName = sheetName;
                    }

                    if (((nodeRange.unitId || unitId) !== activeWorkbook?.getUnitId())) {
                        return item.token;
                    }

                    if (isSupportAcrossSheet) {
                        // Directly skip nodes that are not in the current sheet
                        if (contextRef.current.activeSheet?.getName() !== nodeRange.sheetName) {
                            return item.token;
                        }
                    }
                    const refIndex = currentRefIndex;
                    const selection = orderedSelections[currentRefIndex];
                    currentRefIndex++;
                    if (!selection) {
                        return '';
                    }
                    const refRangeText = getRefRangeText(selection);
                    if (insertedSelection && refIndex === updatingRefIndex) {
                        return `${refRangeText},${getRefRangeText(insertedSelection)}`;
                    }

                    return refRangeText;
                }
                return item.token;
            });

            let currentText = '';
            let newOffset;
            newTokens.forEach((item, index) => {
                currentText += item;
                if (index === nodeIndex) {
                    newOffset = currentText.length;
                }
            });
            const theLastList: string[] = [];
            for (let index = currentRefIndex; index <= orderedSelections.length - 1; index++) {
                const selection = orderedSelections[index];
                theLastList.push(getRefRangeText(selection));
            }
            const preNode = sequenceNodes[sequenceNodes.length - 1];
            const isPreNodeRef = preNode && (typeof preNode === 'string' ? false : preNode.nodeType === sequenceNodeType.REFERENCE);
            const result = `${currentText}${theLastList.length && isPreNodeRef ? ',' : ''}${theLastList.join(',')}`;
            handleRangeChange(result, !theLastList.length && newOffset ? newOffset : result.length, isEnd);
        }
    });

    useEffect(() => {
        if (refSelectionsRenderService && isNeed) {
            const initialSelectionsCount = getInitialFormulaReferenceSelectionCount(
                refSelectionsRenderService.getSelectionDataWithStyle().length,
                getRefSelections().length,
                isSelectingRef.current
            );
            const handleSelectionsChange = createSelectionChangeHandler<ISelectionWithCoord>({
                initialSelectionsCount,
                duplicateEndGuard: {
                    shouldSkip: (selections, isEnd) => duplicateEndGuard.shouldSkip(selections.map((i) => i.rangeWithCoord), isEnd),
                    reset: duplicateEndGuard.reset,
                },
                onSelectionsChange: (selections, isEnd, isCtrlAddMode) => {
                    onSelectionsChange(selections.map((i) => i.rangeWithCoord), isEnd, isCtrlAddMode);
                },
                onDuplicateEnd: () => {
                    const ctx = prepareSelectionChangeContext({ editor, lexerTreeBuilder });
                    if (!ctx) {
                        return;
                    }
                    handleRangeChange(ctx.formulaText, ctx.offset, true);
                },
            });
            let isInitialMoveEnd = true;

            const disposableCollection = new DisposableCollection();
            disposableCollection.add(refSelectionsRenderService.selectionMoveStart$.subscribe((selections) => {
                handleSelectionsChange(selections, false);
            }));
            disposableCollection.add(refSelectionsRenderService.selectionMoving$.subscribe((selections) => {
                handleSelectionsChange(selections, false);
            }));
            disposableCollection.add(refSelectionsRenderService.selectionMoveEnd$.subscribe((selections) => {
                handleSelectionsChange(selections, true, { initial: isInitialMoveEnd });
                isInitialMoveEnd = false;
            }));

            return () => {
                disposableCollection.dispose();
            };
        }
    }, [getRefSelections, isNeed, onSelectionsChange, refSelectionsRenderService, refSelectionsService]);

    useEffect(() => {
        if (isFocus && refSelectionsRenderService && editor) {
            const disposableCollection = new DisposableCollection();

            const reListen = () => {
                disposableCollection.dispose();
                const controls = refSelectionsRenderService.getSelectionControls();
                controls.forEach((control, index) => {
                    disposableCollection.add(
                        control.selectionScaling$
                            .subscribe((newRange) => {
                                const selections = refSelectionsRenderService.getSelectionDataWithStyle().map((i) => i.rangeWithCoord);
                                const nextSelections = replaceFormulaControlSelection(selections, index, newRange);
                                if (nextSelections) {
                                    onSelectionsChange(nextSelections, false);
                                }
                            })
                    );

                    disposableCollection.add(
                        control.selectionMoving$
                            .subscribe((newRange) => {
                                const selections = refSelectionsRenderService.getSelectionDataWithStyle().map((i) => i.rangeWithCoord);
                                const nextSelections = replaceFormulaControlSelection(selections, index, newRange);
                                if (nextSelections) {
                                    onSelectionsChange(nextSelections, true);
                                }
                            })
                    );
                });
            };
            const dispose = merge(
                editor.input$,
                refSelectionsService.selectionSet$,
                refSelectionsRenderService.selectionMoveEnd$
            ).pipe(debounceTime(50)
            ).subscribe(() => {
                reListen();
            });

            return () => {
                dispose.unsubscribe();
                disposableCollection.dispose();
            };
        }
    }, [editor, isFocus, onSelectionsChange, refSelectionsRenderService, refSelectionsService.selectionSet$]);

    refSelectionsRenderService?.getSelectionDataWithStyle();

    useEffect(() => {
        if (listenSelectionSet) {
            // selection changed by keyborad
            const d = commandService.onCommandExecuted((commandInfo) => {
                if (commandInfo.id !== SetSelectionsOperation.id) {
                    return;
                }
                if (!editor || !isFormulaEditorInteractionOwner(editorService.getFocusId(), editor.getEditorId(), {
                    fxBarFocused: contextService.getContextValue(FOCUSING_FX_BAR_EDITOR),
                })) {
                    return;
                }

                const params = commandInfo.params as ISetSelectionsOperationParams;
                if (params.extra !== 'formula-editor') {
                    return;
                }
                if (params.selections.length) {
                    const last = params.selections[params.selections.length - 1];
                    if (last) {
                        const { range, primary } = last;
                        // When in formula editor, if the current cell is a merged cell, only set the main cell of the merged cell as the selection.
                        if ((primary?.isMergedMainCell || primary?.isMerged) && Rectangle.contains(primary, range)) {
                            range.startRow = primary.startRow;
                            range.endRow = primary.startRow;
                            range.startColumn = primary.startColumn;
                            range.endColumn = primary.startColumn;
                        }
                        range.unitId = params.unitId;
                        range.sheetId = params.subUnitId;

                        const ctx = prepareSelectionChangeContext({ editor, lexerTreeBuilder });
                        const isAdd = isSelectingRef.current === FormulaSelectingType.NEED_ADD ||
                            Boolean(ctx && (
                                isFormulaReferenceAddingContext(ctx.sequenceNodes, ctx.offset) ||
                                isFormulaReferenceAddingTextContext(ctx.formulaText, ctx.offset)
                            ));
                        const selections: IRange[] = (refSelectionsRenderService?.getSelectionDataWithStyle() ?? []).map((i) => i.rangeWithCoord);
                        if (isAdd) {
                            if (selections.length > 0 && isSameFormulaSelection(selections[selections.length - 1], range)) {
                                return;
                            }
                            selections.push(range);
                        } else {
                            if (shouldSkipFormulaReferenceUpdate(isAdd, selections.length)) {
                                return;
                            }
                            selections[selections.length - 1] = range;
                        }
                        if (duplicateEndGuard.shouldSkip(selections, true)) {
                            return;
                        }
                        onSelectionsChange(selections, true);
                    }
                }
            });

            return () => {
                d.dispose();
            };
        }
    }, [commandService, contextService, duplicateEndGuard, editor, editorService, isSelectingRef, lexerTreeBuilder, listenSelectionSet, onSelectionsChange, refSelectionsRenderService]);

    useEffect(() => {
        if (!editor) {
            return;
        }
        const sub = docSelectionManagerService.textSelection$.subscribe((e) => {
            if (e.unitId !== editor.getEditorId()) {
                return;
            }

            calcHighlightRanges({
                unitId,
                subUnitId,
                refSelections: getRefSelections(),
                editor,
                refSelectionsService,
                refSelectionsRenderService,
                sheetSkeletonManagerService,
                themeService,
                univerInstanceService,
                currentWorkbook: activeWorkbook!,
            });
        });

        return () => sub.unsubscribe();
    }, [docSelectionManagerService.textSelection$, editor, getRefSelections, refSelectionsRenderService, refSelectionsService, sheetSkeletonManagerService, subUnitId, themeService, unitId, univerInstanceService]);
};

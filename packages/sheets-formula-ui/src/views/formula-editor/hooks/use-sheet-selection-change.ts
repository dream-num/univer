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
    Rectangle,
    ThemeService,
    UniverInstanceType,
} from '@univerjs/core';
import { DocSelectionManagerService } from '@univerjs/docs';
import { IEditorService } from '@univerjs/docs-ui';
import {
    deserializeRangeWithSheet,
    generateStringWithSequence,
    isFormulaReferenceAddingContext,
    LexerTreeBuilder,
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
import {
    findIndexFromSequenceNodes,
    findRefSequenceIndex,
} from '../../range-selector/utils/find-index-from-sequence-nodes';
import { getOffsetFromSequenceNodes } from '../../range-selector/utils/get-offset-from-sequence-nodes';
import { sequenceNodeToText } from '../../range-selector/utils/sequence-node-to-text';
import { unitRangesToText } from '../../range-selector/utils/unit-ranges-to-text';
import { FormulaSelectingType, resolveFormulaSelectionWorkbook, shouldAddFormulaReference } from './use-formula-selection';
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

    return (selections: TSelection[], isEnd: boolean, options?: { initial?: boolean; start?: boolean }) => {
        if (options?.initial) {
            // Ignore the BehaviorSubject replay when subscribing; real user selections arrive through later move events.
            return;
        }

        if (selections.length === 0) {
            return;
        }

        if (options?.start) {
            // A new gesture may intentionally select the same reference after an edit was cancelled or committed.
            duplicateEndGuard.reset();
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

export function getInitialFormulaReferenceSelectionCount(renderSelectionCount: number, formulaReferenceCount: number): number {
    return Math.max(renderSelectionCount, formulaReferenceCount);
}

interface IFormulaSelectionChangeOptions {
    isNeed: boolean;
    isFocus: boolean;
    isSelectingRef: RefObject<FormulaSelectingType>;
    unitId: string;
    subUnitId: string;
    getRefSelections: () => IRefSelection[];
    isSupportAcrossSheet: boolean;
    listenSelectionSet: boolean;
    editor?: Editor;
    handleRangeChange: (refString: string, offset: number, isEnd: boolean, isModify?: boolean) => void;
    allowMissingEditorFocus: boolean;
}

type IFormulaSelectionChangeContext = ReturnType<typeof useFormulaSelectionChangeContext>;
type ISelectionChangeContext = NonNullable<ReturnType<typeof prepareSelectionChangeContext>>;
type IHandleSelectionsChange = (selections: IRange[], isEnd: boolean, isCtrlAddMode?: boolean) => void;

function useFormulaSelectionChangeContext(opts: IFormulaSelectionChangeOptions) {
    const { unitId, subUnitId, editor, allowMissingEditorFocus, isSupportAcrossSheet } = opts;
    const renderManagerService = useDependency(IRenderManagerService);
    const univerInstanceService = useDependency(IUniverInstanceService);
    const commandService = useDependency(ICommandService);
    const contextService = useDependency(IContextService);
    const docSelectionManagerService = useDependency(DocSelectionManagerService);
    const editorService = useDependency(IEditorService);
    const themeService = useDependency(ThemeService);
    const lexerTreeBuilder = useDependency(LexerTreeBuilder);
    const refSelectionsService = useDependency(IRefSelectionsService);
    const workbook = univerInstanceService.getUnit<Workbook>(unitId);
    const getSheetNameById = useEvent((unitId: string, sheetId: string) => univerInstanceService.getUnit<Workbook>(unitId)?.getSheetBySheetId(sheetId)?.getName() ?? '');
    const sheetName = useMemo(() => getSheetNameById(unitId, subUnitId), [getSheetNameById, subUnitId, unitId]);
    const activeSheet = useObservable(workbook?.activeSheet$);
    const contextRef = useStateRef({ activeSheet, sheetName });
    const currentUnit = useObservable(useMemo(() => univerInstanceService.getCurrentTypeOfUnit$<Workbook>(UniverInstanceType.UNIVER_SHEET), [univerInstanceService]));
    const activeWorkbook = resolveFormulaSelectionWorkbook(currentUnit, workbook);
    const render = renderManagerService.getRenderUnitById(activeWorkbook?.getUnitId() ?? unitId);
    const refSelectionsRenderService = render?.with(RefSelectionsRenderService);
    const sheetSkeletonManagerService = render?.with(SheetSkeletonManagerService);
    const duplicateEndGuard = useMemo(() => getSharedSelectionChangeDuplicateEndGuard(`${unitId}:${subUnitId}`), [subUnitId, unitId]);
    const isInteractionOwner = useEvent(() => Boolean(editor && isFormulaEditorInteractionOwner(editorService.getFocusId(), editor.getEditorId(), {
        fxBarFocused: contextService.getContextValue(FOCUSING_FX_BAR_EDITOR),
        allowMissingFocus: allowMissingEditorFocus,
    })));
    const getRefRangeText = useEvent((range: IRange) => {
        const rangeSheetId = range.sheetId ?? subUnitId;
        const unitRangeName = {
            range,
            unitId: range.unitId ?? activeWorkbook!.getUnitId(),
            sheetName: getSheetNameById(range.unitId ?? activeWorkbook!.getUnitId(), rangeSheetId),
        };
        const isAcrossWorkbook = activeWorkbook?.getUnitId() !== unitId;
        const isAcrossSheet = rangeSheetId !== subUnitId;
        return unitRangesToText([unitRangeName], isSupportAcrossSheet && (isAcrossSheet || isAcrossWorkbook), sheetName, isAcrossWorkbook)[0];
    });
    return {
        ...opts,
        univerInstanceService,
        commandService,
        docSelectionManagerService,
        themeService,
        lexerTreeBuilder,
        refSelectionsService,
        sheetName,
        activeSheet,
        contextRef,
        activeWorkbook,
        refSelectionsRenderService,
        sheetSkeletonManagerService,
        duplicateEndGuard,
        isInteractionOwner,
        getRefRangeText,
    };
}

function useAddFormulaReference(context: IFormulaSelectionChangeContext) {
    const { getRefRangeText, handleRangeChange } = context;
    return useEvent((ctx: ISelectionChangeContext, selections: IRange[], isEnd: boolean) => {
        const { nodeIndex, formulaText, sequenceNodes, offset } = ctx;
        const range = getLastFormulaSelection(selections);
        if (!range) return;
        const refText = getRefRangeText(range);
        // Raw text insertion does not depend on a lexer node at the cursor. The lexer
        // omits trailing whitespace, but the editor must retain it. See #7676.
        if (shouldAddFormulaReference(formulaText, offset)) {
            handleRangeChange(insertFormulaReferenceText(formulaText, refText, offset), offset + refText.length, isEnd);
        } else if (offset === 0) {
            sequenceNodes.unshift(refText);
            handleRangeChange(sequenceNodeToText(sequenceNodes), refText.length, isEnd);
        } else if (nodeIndex !== -1 || sequenceNodes.length === 0) {
            const lastNodes = sequenceNodes.splice(nodeIndex + 1);
            sequenceNodes.push(refText);
            const result = sequenceNodeToText([...sequenceNodes, ...lastNodes]);
            handleRangeChange(result, getOffsetFromSequenceNodes(sequenceNodes), isEnd);
        }
    });
}

function useReplaceCrossSheetFormulaReference(context: IFormulaSelectionChangeContext) {
    const { activeWorkbook, unitId, sheetName, activeSheet, handleRangeChange } = context;
    return useEvent((ctx: ISelectionChangeContext, selections: IRange[], isEnd: boolean) => {
        const last = selections.pop();
        if (!last) return;
        const { sequenceNodes, nodeIndex, offset } = ctx;
        const node = sequenceNodes[nodeIndex];
        if (typeof node !== 'object' || node.nodeType !== sequenceNodeType.REFERENCE) return;
        const oldToken = node.token;
        if (activeWorkbook?.getUnitId() !== unitId) {
            node.token = serializeRangeWithSpreadsheet(activeWorkbook?.getUnitId() ?? '', sheetName, last);
        } else {
            node.token = sheetName === activeSheet?.getName() ? serializeRange(last) : serializeRangeWithSheet(activeSheet!.getName(), last);
        }
        handleRangeChange(generateStringWithSequence(sequenceNodes), offset + node.token.length - oldToken.length, isEnd);
    });
}

function useUpdateFormulaReferences(context: IFormulaSelectionChangeContext) {
    const { unitId, sheetName, activeWorkbook, isSupportAcrossSheet, contextRef, getRefRangeText, handleRangeChange } = context;
    return useEvent((ctx: ISelectionChangeContext, selections: IRange[], isEnd: boolean, isCtrlAddMode?: boolean) => {
        const { sequenceNodes, nodeIndex, updatingRefIndex } = ctx;
        const { orderedSelections, insertedSelection } = getSelectionsForFormulaRefUpdate(selections, updatingRefIndex, isCtrlAddMode);
        let currentRefIndex = 0;
        const newTokens = sequenceNodes.map((item) => {
            if (typeof item === 'string') return item;
            if (item.nodeType !== sequenceNodeType.REFERENCE) return item.token;
            const nodeRange = deserializeRangeWithSheet(item.token);
            if (!nodeRange.sheetName) nodeRange.sheetName = sheetName;
            if ((nodeRange.unitId || unitId) !== activeWorkbook?.getUnitId()) return item.token;
            if (isSupportAcrossSheet && contextRef.current.activeSheet?.getName() !== nodeRange.sheetName) return item.token;
            const refIndex = currentRefIndex;
            const selection = orderedSelections[currentRefIndex++];
            if (!selection) return '';
            const refRangeText = getRefRangeText(selection);
            return insertedSelection && refIndex === updatingRefIndex
                ? `${refRangeText},${getRefRangeText(insertedSelection)}`
                : refRangeText;
        });
        let currentText = '';
        let newOffset;
        newTokens.forEach((item, index) => {
            currentText += item;
            if (index === nodeIndex) newOffset = currentText.length;
        });
        const remainingRefs = orderedSelections.slice(currentRefIndex).map(getRefRangeText);
        const preNode = sequenceNodes[sequenceNodes.length - 1];
        const isPreNodeRef = preNode && typeof preNode !== 'string' && preNode.nodeType === sequenceNodeType.REFERENCE;
        const result = `${currentText}${remainingRefs.length && isPreNodeRef ? ',' : ''}${remainingRefs.join(',')}`;
        handleRangeChange(result, !remainingRefs.length && newOffset ? newOffset : result.length, isEnd);
    });
}

function useFormulaReferenceChange(context: IFormulaSelectionChangeContext): IHandleSelectionsChange {
    const { editor, lexerTreeBuilder, isSelectingRef, isInteractionOwner } = context;
    const addReference = useAddFormulaReference(context);
    const replaceCrossSheetReference = useReplaceCrossSheetFormulaReference(context);
    const updateReferences = useUpdateFormulaReferences(context);
    return useEvent((selections: IRange[], isEnd: boolean, isCtrlAddMode?: boolean) => {
        if (!isInteractionOwner()) return;
        const ctx = prepareSelectionChangeContext({ editor, lexerTreeBuilder });
        if (!ctx) return;
        const isAddingReference = isSelectingRef.current === FormulaSelectingType.NEED_ADD ||
            isFormulaReferenceAddingContext(ctx.sequenceNodes, ctx.offset) || shouldAddFormulaReference(ctx.formulaText, ctx.offset);
        if (isAddingReference) {
            addReference(ctx, selections, isEnd);
        } else if (isSelectingRef.current === FormulaSelectingType.EDIT_OTHER_SHEET_REFERENCE || isSelectingRef.current === FormulaSelectingType.EDIT_OTHER_WORKBOOK_REFERENCE) {
            replaceCrossSheetReference(ctx, selections, isEnd);
        } else {
            updateReferences(ctx, selections, isEnd, isCtrlAddMode);
        }
    });
}

function useFormulaPointerSelection(context: IFormulaSelectionChangeContext, onSelectionsChange: IHandleSelectionsChange) {
    const { refSelectionsRenderService, isNeed, isInteractionOwner, getRefSelections, isSelectingRef, duplicateEndGuard, editor, lexerTreeBuilder, handleRangeChange } = context;
    useEffect(() => {
        if (!refSelectionsRenderService || !isNeed) return;
        const initialSelectionsCount = getInitialFormulaReferenceSelectionCount(refSelectionsRenderService.getSelectionDataWithStyle().length, getRefSelections().length);
        const handleSelectionsChange = createSelectionChangeHandler<ISelectionWithCoord>({
            initialSelectionsCount,
            duplicateEndGuard: {
                shouldSkip: (selections, isEnd) => duplicateEndGuard.shouldSkip(selections.map((i) => i.rangeWithCoord), isEnd),
                reset: duplicateEndGuard.reset,
            },
            onSelectionsChange: (selections, isEnd, isCtrlAddMode) => onSelectionsChange(selections.map((i) => i.rangeWithCoord), isEnd, isCtrlAddMode),
            onDuplicateEnd: () => {
                const ctx = prepareSelectionChangeContext({ editor, lexerTreeBuilder });
                if (ctx) handleRangeChange(ctx.formulaText, ctx.offset, true);
            },
        });
        let isInitialMoveEnd = true;
        const disposables = new DisposableCollection();
        disposables.add(refSelectionsRenderService.selectionMoveStart$.subscribe((selections) => {
            if (isInteractionOwner()) handleSelectionsChange(selections, false, { start: true });
        }));
        disposables.add(refSelectionsRenderService.selectionMoving$.subscribe((selections) => {
            if (isInteractionOwner()) handleSelectionsChange(selections, false);
        }));
        disposables.add(refSelectionsRenderService.selectionMoveEnd$.subscribe((selections) => {
            if (!isInteractionOwner()) return;
            handleSelectionsChange(selections, true, { initial: isInitialMoveEnd });
            isInitialMoveEnd = false;
        }));
        return () => disposables.dispose();
    }, [refSelectionsRenderService, isNeed, isInteractionOwner, getRefSelections, isSelectingRef, duplicateEndGuard, editor, lexerTreeBuilder, handleRangeChange, onSelectionsChange]);
}

function useFormulaReferenceControls(context: IFormulaSelectionChangeContext, onSelectionsChange: IHandleSelectionsChange) {
    const { isFocus, refSelectionsRenderService, editor, refSelectionsService } = context;
    useEffect(() => {
        if (!isFocus || !refSelectionsRenderService || !editor) return;
        const disposables = new DisposableCollection();
        const reListen = () => {
            disposables.dispose();
            refSelectionsRenderService.getSelectionControls().forEach((control, index) => {
                disposables.add(control.selectionScaling$.subscribe((newRange) => {
                    const selections = refSelectionsRenderService.getSelectionDataWithStyle().map((i) => i.rangeWithCoord);
                    const next = replaceFormulaControlSelection(selections, index, newRange);
                    if (next) onSelectionsChange(next, false);
                }));
                disposables.add(control.selectionMoving$.subscribe((newRange) => {
                    const selections = refSelectionsRenderService.getSelectionDataWithStyle().map((i) => i.rangeWithCoord);
                    const next = replaceFormulaControlSelection(selections, index, newRange);
                    if (next) onSelectionsChange(next, true);
                }));
            });
        };
        const sub = merge(editor.input$, refSelectionsService.selectionSet$, refSelectionsRenderService.selectionMoveEnd$)
            .pipe(debounceTime(50))
            .subscribe(reListen);
        return () => {
            sub.unsubscribe();
            disposables.dispose();
        };
    }, [editor, isFocus, onSelectionsChange, refSelectionsRenderService, refSelectionsService.selectionSet$]);
}

function useFormulaKeyboardSelection(context: IFormulaSelectionChangeContext, onSelectionsChange: IHandleSelectionsChange) {
    const { listenSelectionSet, commandService, isInteractionOwner, editor, lexerTreeBuilder, isSelectingRef, refSelectionsRenderService, duplicateEndGuard } = context;
    useEffect(() => {
        if (!listenSelectionSet) return;
        const sub = commandService.onCommandExecuted((commandInfo) => {
            if (commandInfo.id !== SetSelectionsOperation.id || !isInteractionOwner()) return;
            const params = commandInfo.params as ISetSelectionsOperationParams;
            const last = params.selections[params.selections.length - 1];
            if (params.extra !== 'formula-editor' || !last) return;
            const { range, primary } = last;
            if ((primary?.isMergedMainCell || primary?.isMerged) && Rectangle.contains(primary, range)) {
                range.startRow = primary.startRow;
                range.endRow = primary.startRow;
                range.startColumn = primary.startColumn;
                range.endColumn = primary.startColumn;
            }
            range.unitId = params.unitId;
            range.sheetId = params.subUnitId;
            const ctx = prepareSelectionChangeContext({ editor, lexerTreeBuilder });
            const isAdd = isSelectingRef.current === FormulaSelectingType.NEED_ADD || Boolean(ctx && (
                isFormulaReferenceAddingContext(ctx.sequenceNodes, ctx.offset) || shouldAddFormulaReference(ctx.formulaText, ctx.offset)
            ));
            const selections: IRange[] = (refSelectionsRenderService?.getSelectionDataWithStyle() ?? []).map((i) => i.rangeWithCoord);
            if (isAdd) {
                if (selections.length > 0 && isSameFormulaSelection(selections[selections.length - 1], range)) return;
                selections.push(range);
            } else {
                if (shouldSkipFormulaReferenceUpdate(isAdd, selections.length)) return;
                selections[selections.length - 1] = range;
            }
            if (!duplicateEndGuard.shouldSkip(selections, true)) onSelectionsChange(selections, true);
        });
        return () => sub.dispose();
    }, [listenSelectionSet, commandService, isInteractionOwner, editor, lexerTreeBuilder, isSelectingRef, refSelectionsRenderService, duplicateEndGuard, onSelectionsChange]);
}

function useFormulaSelectionHighlight(context: IFormulaSelectionChangeContext) {
    const { editor, docSelectionManagerService, unitId, subUnitId, getRefSelections, refSelectionsService, refSelectionsRenderService, sheetSkeletonManagerService, themeService, univerInstanceService, activeWorkbook } = context;
    useEffect(() => {
        if (!editor) return;
        const sub = docSelectionManagerService.textSelection$.subscribe((event) => {
            if (event.unitId !== editor.getEditorId()) return;
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
    }, [docSelectionManagerService.textSelection$, editor, getRefSelections, refSelectionsRenderService, refSelectionsService, sheetSkeletonManagerService, subUnitId, themeService, unitId, univerInstanceService, activeWorkbook]);
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
    handleRangeChange: IFormulaSelectionChangeOptions['handleRangeChange'] = () => {},
    allowMissingEditorFocus = false
) => {
    const context = useFormulaSelectionChangeContext({
        isNeed,
        isFocus,
        isSelectingRef,
        unitId,
        subUnitId,
        getRefSelections,
        isSupportAcrossSheet,
        listenSelectionSet,
        editor,
        handleRangeChange,
        allowMissingEditorFocus,
    });
    const onSelectionsChange = useFormulaReferenceChange(context);
    useFormulaPointerSelection(context, onSelectionsChange);
    useFormulaReferenceControls(context, onSelectionsChange);
    useFormulaKeyboardSelection(context, onSelectionsChange);
    useFormulaSelectionHighlight(context);
};

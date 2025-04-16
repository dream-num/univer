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
import { DisposableCollection, ICommandService, IUniverInstanceService, ThemeService, UniverInstanceType } from '@univerjs/core';
import { DocSelectionManagerService } from '@univerjs/docs';
import { deserializeRangeWithSheet, generateStringWithSequence, LexerTreeBuilder, sequenceNodeType, serializeRange, serializeRangeWithSheet } from '@univerjs/engine-formula';
import { IRenderManagerService } from '@univerjs/engine-render';
import { IRefSelectionsService, SetSelectionsOperation } from '@univerjs/sheets';
import { SheetSkeletonManagerService } from '@univerjs/sheets-ui';
import { useDependency, useEvent, useObservable } from '@univerjs/ui';
import { useEffect, useMemo } from 'react';
import { merge } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { RefSelectionsRenderService } from '../../../services/render-services/ref-selections.render-service';
import { findIndexFromSequenceNodes, findRefSequenceIndex } from '../../range-selector/utils/find-index-from-sequence-nodes';
import { getOffsetFromSequenceNodes } from '../../range-selector/utils/get-offset-from-sequence-nodes';
import { sequenceNodeToText } from '../../range-selector/utils/sequence-node-to-text';
import { unitRangesToText } from '../../range-selector/utils/unit-ranges-to-text';
import { useStateRef } from '../hooks/use-state-ref';
import { FormulaSelectingType } from './use-formula-selection';
import { calcHighlightRanges } from './use-highlight';

const prepareSelectionChangeContext = (opts: { editor?: Editor; lexerTreeBuilder: LexerTreeBuilder }) => {
    const { editor, lexerTreeBuilder } = opts;
    const currentDocSelections = editor?.getSelectionRanges();
    if (currentDocSelections?.length !== 1) {
        return;
    }
    const docRange = currentDocSelections[0];
    const offset = docRange.startOffset - 1;
    const dataStream = (editor?.getDocumentData().body?.dataStream ?? '\r\n').slice(0, -2);
    const sequenceNodes = lexerTreeBuilder.sequenceNodesBuilder(dataStream.slice(1)) ?? [];
    const nodeIndex = findIndexFromSequenceNodes(sequenceNodes, offset, false);
    const updatingRefIndex = findRefSequenceIndex(sequenceNodes, nodeIndex);
    return {
        nodeIndex,
        updatingRefIndex,
        sequenceNodes,
        offset,
    };
};

const noop = (() => { }) as any;
export const useSheetSelectionChange = (
    isNeed: boolean,
    isFocus: boolean,
    isSelectingRef: RefObject<FormulaSelectingType>,
    unitId: string,
    subUnitId: string,
    refSelectionRef: React.MutableRefObject<IRefSelection[]>,
    isSupportAcrossSheet: boolean,
    listenSelectionSet: boolean,
    editor?: Editor,
    handleRangeChange: ((refString: string, offset: number, isEnd: boolean, isModify?: boolean) => void) = noop
) => {
    const renderManagerService = useDependency(IRenderManagerService);
    const univerInstanceService = useDependency(IUniverInstanceService);
    const commandService = useDependency(ICommandService);
    const docSelectionManagerService = useDependency(DocSelectionManagerService);
    const themeService = useDependency(ThemeService);
    const lexerTreeBuilder = useDependency(LexerTreeBuilder);

    const workbook = univerInstanceService.getUnit<Workbook>(unitId);
    const getSheetNameById = useEvent((sheetId: string) => workbook?.getSheetBySheetId(sheetId)?.getName() ?? '');
    const sheetName = useMemo(() => getSheetNameById(subUnitId), [getSheetNameById, subUnitId]);
    const activeSheet = useObservable(workbook?.activeSheet$);
    const contextRef = useStateRef({ activeSheet, sheetName });
    const currentUnit = useObservable(useMemo(() => univerInstanceService.getCurrentTypeOfUnit$<Workbook>(UniverInstanceType.UNIVER_SHEET), [univerInstanceService]));
    const render = renderManagerService.getRenderById(currentUnit?.getUnitId() ?? '');

    const refSelectionsRenderService = render?.with(RefSelectionsRenderService);
    const sheetSkeletonManagerService = render?.with(SheetSkeletonManagerService);
    const refSelectionsService = useDependency(IRefSelectionsService);
    // eslint-disable-next-line complexity
    const onSelectionsChange = useEvent((selections: IRange[], isEnd: boolean) => {
        const ctx = prepareSelectionChangeContext({ editor, lexerTreeBuilder });
        if (!ctx) return;
        const { nodeIndex, updatingRefIndex, sequenceNodes, offset } = ctx;
        if (isSelectingRef.current === FormulaSelectingType.NEED_ADD) {
            if (offset !== 0) {
                if (nodeIndex === -1 && sequenceNodes.length) {
                    return;
                }
                const range = selections[selections.length - 1];
                const lastNodes = sequenceNodes.splice(nodeIndex + 1);
                const rangeSheetId = range.sheetId ?? subUnitId;
                const unitRangeName = {
                    range,
                    unitId: range.unitId ?? currentUnit!.getUnitId(),
                    sheetName: getSheetNameById(rangeSheetId),
                };
                const isAcrossSheet = rangeSheetId !== subUnitId;
                const isAcrossWorkbook = currentUnit?.getUnitId() !== unitId;
                const refRanges = unitRangesToText([unitRangeName], isSupportAcrossSheet && (isAcrossSheet || isAcrossWorkbook), sheetName, isAcrossWorkbook);
                sequenceNodes.push({ token: refRanges[0], nodeType: sequenceNodeType.REFERENCE } as any);
                const newSequenceNodes = [...sequenceNodes, ...lastNodes];
                const result = sequenceNodeToText(newSequenceNodes);
                handleRangeChange(result, getOffsetFromSequenceNodes(sequenceNodes), isEnd);
            } else {
                const range = selections[selections.length - 1];
                const rangeSheetId = range.sheetId ?? subUnitId;
                const unitRangeName = {
                    range,
                    unitId: range.unitId ?? unitId,
                    sheetName: getSheetNameById(rangeSheetId),
                };
                const isAcrossSheet = rangeSheetId !== subUnitId;
                const refRanges = unitRangesToText([unitRangeName], isSupportAcrossSheet && isAcrossSheet);
                sequenceNodes.unshift({ token: refRanges[0], nodeType: sequenceNodeType.REFERENCE } as any);
                const result = sequenceNodeToText(sequenceNodes);
                handleRangeChange(result, refRanges[0].length, isEnd);
            }
        } else if (isSelectingRef.current === FormulaSelectingType.EDIT_OTHER_SHEET_REFERENCE) {
            const last = selections.pop();
            if (!last) return;
            const node = sequenceNodes[nodeIndex];
            if (typeof node === 'object' && node.nodeType === sequenceNodeType.REFERENCE) {
                const oldToken = node.token;
                node.token = sheetName === activeSheet?.getName() ? serializeRange(last) : serializeRangeWithSheet(activeSheet!.getName(), last);
                const newOffset = offset + (node.token.length - oldToken.length);
                handleRangeChange(generateStringWithSequence(sequenceNodes), newOffset, isEnd);
            }
        } else {
            const orderedSelections = [...selections];
            if (updatingRefIndex !== -1) {
                const last = orderedSelections.pop();
                last && orderedSelections.splice(updatingRefIndex, 0, last);
            }
            // 更新全部的 ref Selection
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

                    if (isSupportAcrossSheet) {
                        // 直接跳过非当前表的 node 节点
                        if (contextRef.current.activeSheet?.getName() !== nodeRange.sheetName) {
                            return item.token;
                        }
                    }
                    const selection = orderedSelections[currentRefIndex];
                    currentRefIndex++;
                    if (!selection) {
                        return '';
                    }
                    const rangeSheetId = selection.sheetId ?? subUnitId;
                    const unitRangeName = {
                        range: selection,
                        unitId: selection.unitId ?? unitId,
                        sheetName: getSheetNameById(rangeSheetId),
                    };
                    const refRanges = unitRangesToText([unitRangeName], isSupportAcrossSheet, sheetName);
                    return refRanges[0];
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
            for (let index = currentRefIndex; index <= selections.length - 1; index++) {
                const selection = selections[index];
                const rangeSheetId = selection.sheetId ?? subUnitId;
                const unitRangeName = {
                    range: selection,
                    unitId: selection.unitId ?? unitId,
                    sheetName: getSheetNameById(rangeSheetId),
                };
                const isAcrossSheet = rangeSheetId !== subUnitId;
                const refRanges = unitRangesToText([unitRangeName], isSupportAcrossSheet && isAcrossSheet, sheetName);
                theLastList.push(refRanges[0]);
            }
            const preNode = sequenceNodes[sequenceNodes.length - 1];
            const isPreNodeRef = preNode && (typeof preNode === 'string' ? false : preNode.nodeType === sequenceNodeType.REFERENCE);
            const result = `${currentText}${theLastList.length && isPreNodeRef ? ',' : ''}${theLastList.join(',')}`;
            handleRangeChange(result, !theLastList.length && newOffset ? newOffset : result.length, isEnd);
        }
    });

    useEffect(() => {
        if (refSelectionsRenderService && isNeed) {
            let isFirst = true;

            const handleSelectionsChange = (selections: ISelectionWithCoord[], isEnd: boolean) => {
                if (isFirst) {
                    isFirst = false;
                    return;
                }
                onSelectionsChange(selections.map((i) => i.rangeWithCoord), isEnd);
            };

            const disposableCollection = new DisposableCollection();
            disposableCollection.add(refSelectionsRenderService.selectionMoving$.subscribe((selections) => {
                handleSelectionsChange(selections, false);
            }));
            disposableCollection.add(refSelectionsRenderService.selectionMoveEnd$.subscribe((selections) => {
                handleSelectionsChange(selections, true);
            }));

            return () => {
                disposableCollection.dispose();
            };
        }
    }, [isNeed, onSelectionsChange, refSelectionsRenderService]);

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
                                const current = selections[index];
                                newRange.sheetId = current.sheetId;
                                newRange.unitId = current.unitId;
                                selections[index] = newRange;
                                onSelectionsChange(selections, false);
                            })
                    );

                    disposableCollection.add(
                        control.selectionMoving$
                            .subscribe((newRange) => {
                                const selections = refSelectionsRenderService.getSelectionDataWithStyle().map((i) => i.rangeWithCoord);
                                const current = selections[index];
                                newRange.sheetId = current.sheetId;
                                newRange.unitId = current.unitId;
                                selections[index] = newRange;
                                onSelectionsChange(selections, true);
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

                const params = commandInfo.params as ISetSelectionsOperationParams;
                if (params.extra !== 'formula-editor') {
                    return;
                }
                if (params.selections.length) {
                    const last = params.selections[params.selections.length - 1];
                    if (last) {
                        const isAdd = isSelectingRef.current === FormulaSelectingType.NEED_ADD;
                        const selections: IRange[] = (refSelectionsRenderService?.getSelectionDataWithStyle() ?? []).map((i) => i.rangeWithCoord);
                        if (isAdd) {
                            selections.push(last.range);
                        } else {
                            selections[selections.length - 1] = last.range;
                        }
                        onSelectionsChange(selections, true);
                    }
                }
            });

            return () => {
                d.dispose();
            };
        }
    }, [commandService, editor, isSelectingRef, lexerTreeBuilder, listenSelectionSet, onSelectionsChange, refSelectionsRenderService]);

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
                refSelections: refSelectionRef.current,
                editor,
                refSelectionsService,
                refSelectionsRenderService,
                sheetSkeletonManagerService,
                themeService,
                univerInstanceService,
                currentWorkbook: currentUnit!,
            });
        });

        return () => sub.unsubscribe();
    }, [docSelectionManagerService.textSelection$, editor, refSelectionRef, refSelectionsRenderService, refSelectionsService, sheetSkeletonManagerService, subUnitId, themeService, unitId, univerInstanceService]);
};

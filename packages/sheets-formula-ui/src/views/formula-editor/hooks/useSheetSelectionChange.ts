/**
 * Copyright 2023-present DreamNum Inc.
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

import type { Workbook } from '@univerjs/core';
import type { Editor } from '@univerjs/docs-ui';
import type { ISelectionWithCoord, ISetSelectionsOperationParams } from '@univerjs/sheets';
import type { INode } from '../../range-selector/utils/filterReferenceNode';
import { DisposableCollection, ICommandService, IUniverInstanceService, ThemeService, useDependency, useObservable } from '@univerjs/core';
import { DocSelectionManagerService } from '@univerjs/docs';
import { deserializeRangeWithSheet, sequenceNodeType, serializeRange, serializeRangeWithSheet } from '@univerjs/engine-formula';
import { IRenderManagerService } from '@univerjs/engine-render';
import { IRefSelectionsService, SetSelectionsOperation } from '@univerjs/sheets';
import { SheetSkeletonManagerService } from '@univerjs/sheets-ui';
import { useEvent } from '@univerjs/ui';
import { useEffect, useMemo, useRef } from 'react';
import { merge } from 'rxjs';
import { debounceTime, distinctUntilChanged, map } from 'rxjs/operators';
import { RefSelectionsRenderService } from '../../../services/render-services/ref-selections.render-service';
import { calcHighlightRanges, type IRefSelection } from '../../range-selector/hooks/useHighlight';
import { findIndexFromSequenceNodes } from '../../range-selector/utils/findIndexFromSequenceNodes';
import { getOffsetFromSequenceNodes } from '../../range-selector/utils/getOffsetFromSequenceNodes';
import { sequenceNodeToText } from '../../range-selector/utils/sequenceNodeToText';
import { unitRangesToText } from '../../range-selector/utils/unitRangesToText';
import { useStateRef } from '../hooks/useStateRef';
import { FormulaSelectingType } from './useFormulaSelection';

const noop = (() => { }) as any;
export const useSheetSelectionChange = (
    isNeed: boolean,
    isFocus: boolean,
    isSelecting: FormulaSelectingType,
    unitId: string,
    subUnitId: string,
    sequenceNodes: INode[],
    refSelectionRef: React.MutableRefObject<IRefSelection[]>,
    isSupportAcrossSheet: boolean,
    listenSelectionSet: boolean,
    editor?: Editor,
    handleRangeChange: ((refString: string, offset: number, isEnd: boolean, isModify?: boolean) => void) = noop
) => {
    const renderManagerService = useDependency(IRenderManagerService);
    const univerInstanceService = useDependency(IUniverInstanceService);
    const commandService = useDependency(ICommandService);
    const sequenceNodesRef = useStateRef(sequenceNodes);
    const docSelectionManagerService = useDependency(DocSelectionManagerService);
    const themeService = useDependency(ThemeService);

    const workbook = univerInstanceService.getUnit<Workbook>(unitId);
    const getSheetNameById = useEvent((sheetId: string) => workbook?.getSheetBySheetId(sheetId)?.getName() ?? '');
    const sheetName = useMemo(() => getSheetNameById(subUnitId), [getSheetNameById, subUnitId]);
    const activeSheet = useObservable(workbook?.activeSheet$);
    const contextRef = useStateRef({ activeSheet, sheetName });
    const render = renderManagerService.getRenderById(unitId);
    const refSelectionsRenderService = render?.with(RefSelectionsRenderService);
    const sheetSkeletonManagerService = render?.with(SheetSkeletonManagerService);
    const refSelectionsService = useDependency(IRefSelectionsService);
    const isScalingRef = useRef(false);
    const isSelectingRef = useRef(isSelecting);
    isSelectingRef.current = isSelecting;

    const scalingOptionRef = useRef<{ result: string; offset: number }>();

    useEffect(() => {
        if (refSelectionsRenderService && isNeed) {
            let isFirst = true;
            // eslint-disable-next-line complexity
            const handleSelectionsChange = (selections: ISelectionWithCoord[], isEnd: boolean) => {
                if (isFirst) {
                    isFirst = false;
                    return;
                }
                const currentDocSelections = editor?.getSelectionRanges();
                if (currentDocSelections?.length !== 1) {
                    return;
                }
                const docRange = currentDocSelections[0];
                const offset = docRange.startOffset - 1;
                const sequenceNodes = [...sequenceNodesRef.current];
                const nodeIndex = findIndexFromSequenceNodes(sequenceNodes, offset, false);

                if (isSelectingRef.current === FormulaSelectingType.NEED_ADD) {
                    if (offset !== 0) {
                        if (nodeIndex === -1 && sequenceNodes.length) {
                            return;
                        }
                        const range = selections[selections.length - 1];
                        const lastNodes = sequenceNodes.splice(nodeIndex + 1);
                        const rangeSheetId = range.rangeWithCoord.sheetId ?? subUnitId;
                        const unitRangeName = {
                            range: range.rangeWithCoord,
                            unitId: range.rangeWithCoord.unitId ?? unitId,
                            sheetName: getSheetNameById(rangeSheetId),
                        };
                        const isAcrossSheet = rangeSheetId !== subUnitId;
                        const refRanges = unitRangesToText([unitRangeName], isSupportAcrossSheet && isAcrossSheet, sheetName);
                        sequenceNodes.push({ token: refRanges[0], nodeType: sequenceNodeType.REFERENCE } as any);
                        const newSequenceNodes = [...sequenceNodes, ...lastNodes];
                        const result = sequenceNodeToText(newSequenceNodes);
                        handleRangeChange(result, getOffsetFromSequenceNodes(sequenceNodes), isEnd);
                    } else {
                        const range = selections[selections.length - 1];
                        const rangeSheetId = range.rangeWithCoord.sheetId ?? subUnitId;
                        const unitRangeName = {
                            range: range.rangeWithCoord,
                            unitId: range.rangeWithCoord.unitId ?? unitId,
                            sheetName: getSheetNameById(rangeSheetId),
                        };
                        const isAcrossSheet = rangeSheetId !== subUnitId;
                        const refRanges = unitRangesToText([unitRangeName], isSupportAcrossSheet && isAcrossSheet);
                        sequenceNodes.unshift({ token: refRanges[0], nodeType: sequenceNodeType.REFERENCE } as any);
                        const result = sequenceNodeToText(sequenceNodes);
                        handleRangeChange(result, refRanges[0].length, isEnd);
                    }
                } else {
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
                            const selection = selections[currentRefIndex];
                            currentRefIndex++;
                            if (!selection) {
                                return '';
                            }
                            const rangeSheetId = selection.rangeWithCoord.sheetId ?? subUnitId;
                            const unitRangeName = {
                                range: selection.rangeWithCoord,
                                unitId: selection.rangeWithCoord.unitId ?? unitId,
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
                        const rangeSheetId = selection.rangeWithCoord.sheetId ?? subUnitId;
                        const unitRangeName = {
                            range: selection.rangeWithCoord,
                            unitId: selection.rangeWithCoord.unitId ?? unitId,
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
            };
            const disposableCollection = new DisposableCollection();
            disposableCollection.add(refSelectionsRenderService.selectionMoving$.subscribe((selections) => {
                if (isScalingRef.current) return;
                handleSelectionsChange(selections, false);
            }));
            disposableCollection.add(refSelectionsRenderService.selectionMoveEnd$.subscribe((selections) => {
                if (isScalingRef.current) return;
                handleSelectionsChange(selections, true);
            }));

            return () => {
                disposableCollection.dispose();
            };
        }
    }, [refSelectionsRenderService, editor, isSupportAcrossSheet, isNeed, sequenceNodesRef, subUnitId, unitId, getSheetNameById, sheetName, handleRangeChange, contextRef]);

    useEffect(() => {
        if (isFocus && refSelectionsRenderService && editor) {
            const disposableCollection = new DisposableCollection();
            const handleSequenceNodeReplace = (token: string, index: number) => {
                let currentIndex = 0;
                let offset = 0;
                let isFinish = false;
                const { sheetName } = contextRef.current;

                const newSequenceNodes = sequenceNodesRef.current.map((node) => {
                    if (typeof node === 'string') {
                        if (!isFinish) {
                            offset += node.length;
                        }
                        return node;
                    } else if (node.nodeType === sequenceNodeType.REFERENCE) {
                        const unitRange = deserializeRangeWithSheet(node.token);
                        if (!unitRange.unitId) {
                            unitRange.unitId = unitId;
                        }
                        if (!unitRange.sheetName) {
                            unitRange.sheetName = sheetName;
                        }
                        if (isSupportAcrossSheet) {
                            // 直接跳过非当前表的 node 节点
                            if (contextRef.current.activeSheet?.getName() !== unitRange.sheetName) {
                                if (!isFinish) {
                                    offset += node.token.length;
                                }
                                return node;
                            }
                        }
                        if (currentIndex === index) {
                            isFinish = true;
                            const cloneNode = { ...node, token };
                            if (isSupportAcrossSheet) {
                                if (unitRange.sheetName !== sheetName) {
                                    cloneNode.token = serializeRangeWithSheet(unitRange.sheetName, deserializeRangeWithSheet(token).range);
                                } else {
                                    cloneNode.token = token;
                                }
                            } else {
                                cloneNode.token = token;
                            }
                            offset += cloneNode.token.length;
                            currentIndex++;
                            return cloneNode;
                        }
                        if (!isFinish) {
                            offset += node.token.length;
                        }
                        currentIndex++;
                        return node;
                    }
                    if (!isFinish) {
                        offset += node.token.length;
                    }
                    return node;
                });
                const result = sequenceNodeToText(newSequenceNodes);
                handleRangeChange(result, -1, true);
                scalingOptionRef.current = { result, offset };
            };

            const reListen = () => {
                disposableCollection.dispose();
                const controls = refSelectionsRenderService.getSelectionControls();
                controls.forEach((control, index) => {
                    disposableCollection.add(merge(control.selectionMoving$, control.selectionScaling$).pipe(
                        map((e) => {
                            return serializeRange(e);
                        }),
                        distinctUntilChanged(),
                        debounceTime(100)
                    ).subscribe((rangeText) => {
                        isScalingRef.current = true;
                        handleSequenceNodeReplace(rangeText, index);
                    }));
                });

                disposableCollection.add(refSelectionsRenderService.selectionMoveEnd$.subscribe((selections) => {
                    isScalingRef.current = false;
                    if (scalingOptionRef.current) {
                        const { result, offset } = scalingOptionRef.current;
                        handleRangeChange(result, offset || -1, true);
                        scalingOptionRef.current = undefined;
                    }
                }));
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
    }, [isFocus, refSelectionsRenderService, editor, refSelectionsService.selectionSet$, contextRef, sequenceNodesRef, handleRangeChange, isSupportAcrossSheet, unitId]);

    useEffect(() => {
        if (listenSelectionSet) {
            const d = commandService.onCommandExecuted((commandInfo) => {
                if (commandInfo.id !== SetSelectionsOperation.id) {
                    return;
                }

                const params = commandInfo.params as ISetSelectionsOperationParams;
                if (params.extra !== 'formula-editor') {
                    return;
                }
                const { selections } = params;
                if (selections.length) {
                    const last = selections[selections.length - 1];
                    if (last) {
                        const range = last.range;
                        const sheetId = subUnitId;
                        const unitRangeName = {
                            range,
                            unitId: params.unitId === unitId ? '' : params.unitId,
                            sheetName: params.subUnitId === sheetId ? '' : getSheetNameById(sheetId),
                        };
                        const sequenceNodes = [...sequenceNodesRef.current];
                        const refRanges = unitRangesToText([unitRangeName], isSupportAcrossSheet, sheetName);
                        const result = refRanges[0];
                        let lastNode = sequenceNodes[sequenceNodes.length - 1];
                        if (typeof lastNode === 'object' && lastNode.nodeType === sequenceNodeType.REFERENCE) {
                            lastNode = { ...lastNode };
                            lastNode.token = result;
                            lastNode.endIndex = lastNode.startIndex + result.length;
                            sequenceNodes[sequenceNodes.length - 1] = lastNode;
                            const refStr = sequenceNodeToText(sequenceNodes);
                            handleRangeChange(refStr, getOffsetFromSequenceNodes(sequenceNodes), true);
                        } else {
                            const start = getOffsetFromSequenceNodes(sequenceNodes);
                            sequenceNodes.push({
                                nodeType: sequenceNodeType.REFERENCE,
                                token: result,
                                startIndex: start,
                                endIndex: start + result.length,
                            });

                            const refStr = sequenceNodeToText(sequenceNodes);
                            handleRangeChange(refStr, getOffsetFromSequenceNodes(sequenceNodes), true);
                        }
                    }
                }
            });

            return () => {
                d.dispose();
            };
        }
    }, [commandService, getSheetNameById, handleRangeChange, isSupportAcrossSheet, listenSelectionSet, sequenceNodesRef, sheetName, subUnitId, unitId]);

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
            });
        });

        return () => sub.unsubscribe();
    }, [docSelectionManagerService.textSelection$, editor, refSelectionRef, refSelectionsRenderService, refSelectionsService, sequenceNodesRef, sheetSkeletonManagerService, subUnitId, themeService, unitId, univerInstanceService]);
};

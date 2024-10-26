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

import type { ISelectionWithCoordAndStyle } from '@univerjs/sheets';
import type { INode } from '../../range-selector/utils/filterReferenceNode';
import { DisposableCollection, IUniverInstanceService, useDependency } from '@univerjs/core';
import { deserializeRangeWithSheet, sequenceNodeType, serializeRange, serializeRangeWithSheet } from '@univerjs/engine-formula';
import { IRenderManagerService } from '@univerjs/engine-render';
import { useEffect, useRef } from 'react';
import { merge } from 'rxjs';
import { debounceTime, distinctUntilChanged, map } from 'rxjs/operators';
import { RefSelectionsRenderService } from '../../../services/render-services/ref-selections.render-service';
import { findIndexFromSequenceNodes } from '../../range-selector/utils/findIndexFromSequenceNodes';
import { getOffsetFromSequenceNodes } from '../../range-selector/utils/getOffsetFromSequenceNodes';
import { sequenceNodeToText } from '../../range-selector/utils/sequenceNodeToText';
import { unitRangesToText } from '../../range-selector/utils/unitRangesToText';
import { useStateRef } from '../hooks/useStateRef';
import { useSelectionAdd } from './useSelectionAdd';

const noop = (() => { }) as any;
export const useSheetSelectionChange = (
    isNeed: boolean,
    unitId: string,
    subUnitId: string,
    sequenceNodes: INode[],
    isSupportAcrossSheet: boolean,
    editor?: Editor,
    handleRangeChange: ((refString: string, offset: number) => void) = noop) => {
    const renderManagerService = useDependency(IRenderManagerService);
    const univerInstanceService = useDependency(IUniverInstanceService);

    const sequenceNodesRef = useStateRef(sequenceNodes);

    const { getIsNeedAddSelection } = useSelectionAdd(unitId, sequenceNodes, editor);

    const workbook = univerInstanceService.getUnit<Workbook>(unitId);
    const getSheetNameById = (sheetId: string) => workbook?.getSheetBySheetId(sheetId)?.getName() ?? '';

    const render = renderManagerService.getRenderById(unitId);
    const refSelectionsRenderService = render?.with(RefSelectionsRenderService);

    const isScalingRef = useRef(false);

    useEffect(() => {
        if (refSelectionsRenderService && isNeed) {
            let isFirst = true;
            const handleSelectionsChange = (selections: ISelectionWithCoordAndStyle[]) => {
                if (isFirst || isScalingRef.current) {
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
                if (getIsNeedAddSelection()) {
                    const index = findIndexFromSequenceNodes(sequenceNodes, offset, false);
                    if (index === -1 && sequenceNodes.length) {
                        return;
                    }
                    const range = selections[selections.length - 1];
                    const lastNodes = sequenceNodes.splice(index + 1);
                    const rangeSheetId = range.rangeWithCoord.sheetId ?? subUnitId;
                    const unitRangeName = {
                        range: range.rangeWithCoord,
                        unitId: range.rangeWithCoord.unitId ?? unitId,
                        sheetName: getSheetNameById(rangeSheetId),
                    };
                    const refRanges = unitRangesToText([unitRangeName], isSupportAcrossSheet);
                    sequenceNodes.push({ token: refRanges[0], nodeType: sequenceNodeType.REFERENCE } as any);
                    const newSequenceNodes = [...sequenceNodes, ...lastNodes];
                    const result = sequenceNodeToText(newSequenceNodes);
                    handleRangeChange(result, getOffsetFromSequenceNodes(sequenceNodes));
                } else {
                    // 更新全部的 ref Selection
                    let currentRefIndex = 0;
                    const currentText = sequenceNodes.map((item) => {
                        if (typeof item === 'string') {
                            return item;
                        }
                        if (item.nodeType === sequenceNodeType.REFERENCE) {
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
                            const refRanges = unitRangesToText([unitRangeName], isSupportAcrossSheet);
                            return refRanges[0];
                        }
                        return item.token;
                    }).join('');
                    const theLastList: string[] = [];
                    for (let index = currentRefIndex; index <= selections.length - 1; index++) {
                        const selection = selections[index];
                        const rangeSheetId = selection.rangeWithCoord.sheetId ?? subUnitId;
                        const unitRangeName = {
                            range: selection.rangeWithCoord,
                            unitId: selection.rangeWithCoord.unitId ?? unitId,
                            sheetName: getSheetNameById(rangeSheetId),
                        };
                        const refRanges = unitRangesToText([unitRangeName], isSupportAcrossSheet);
                        theLastList.push(refRanges[0]);
                    }
                    const result = `${currentText}${theLastList.length && currentText.length ? ',' : ''}${theLastList.join(',')}`;
                    handleRangeChange(result, result.length);
                }
            };
            const d1 = refSelectionsRenderService.selectionMoveEnd$.subscribe((selections) => {
                handleSelectionsChange(selections);
                isScalingRef.current = false;
            });

            // const d2 = refSelectionsRenderService.selectionMoving$.subscribe((selections) => {
            //     handleSelectionsChange(selections);
            // });

            return () => {
                d1.unsubscribe();
                // d2.unsubscribe();
            };
        }
    }, [refSelectionsRenderService, editor, isSupportAcrossSheet, isNeed]);

    useEffect(() => {
        if (isNeed && refSelectionsRenderService && editor) {
            const disposableCollection = new DisposableCollection();
            const handleSequenceNodeReplace = (token: string, index: number) => {
                let currentIndex = 0;
                let offset = 0;
                let isFinish = false;
                const workbook = univerInstanceService.getUnit<Workbook>(unitId);
                const currentSheetName = workbook?.getActiveSheet()?.getName() || '';
                const newSequenceNodes = sequenceNodesRef.current.map((node) => {
                    if (typeof node === 'string') {
                        if (!isFinish) {
                            offset += node.length;
                        }
                        return node;
                    } else if (node.nodeType === sequenceNodeType.REFERENCE) {
                        const unitRange = deserializeRangeWithSheet(token);
                        unitRange.unitId = unitRange.unitId === '' ? unitId : unitRange.unitId;
                        unitRange.sheetName = unitRange.sheetName === '' ? currentSheetName : unitRange.sheetName;
                        if (currentIndex === index) {
                            isFinish = true;
                            const cloneNode = { ...node, token };
                            if (isSupportAcrossSheet) {
                                cloneNode.token = serializeRangeWithSheet(unitRange.sheetName, unitRange.range);
                            } else {
                                cloneNode.token = serializeRange(unitRange.range);
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
                handleRangeChange(result, offset || -1);
            };
            const dispose = merge(editor.input$, refSelectionsRenderService.selectionMoveEnd$).pipe(debounceTime(30)).subscribe(() => {
                disposableCollection.dispose();
                const controls = refSelectionsRenderService.getSelectionControls();
                controls.forEach((control, index) => {
                    disposableCollection.add(control.selectionScaling$.subscribe((e) => {
                        isScalingRef.current = true;
                        const rangeText = serializeRange(e);
                        handleSequenceNodeReplace(rangeText, index);
                    }));
                    disposableCollection.add(control.selectionMoving$.pipe(map((e) => {
                        return serializeRange(e);
                    }), distinctUntilChanged()).subscribe((rangeText) => {
                        handleSequenceNodeReplace(rangeText, index);
                    }));
                });
            });

            return () => {
                dispose.unsubscribe();
                disposableCollection.dispose();
            };
        }
    }, [isNeed, refSelectionsRenderService, editor]);
};

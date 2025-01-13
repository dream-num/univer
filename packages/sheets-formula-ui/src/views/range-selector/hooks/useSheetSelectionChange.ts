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
import type { ISelectionWithCoord } from '@univerjs/sheets';
import type { INode } from '../utils/filterReferenceNode';

import { DisposableCollection, IUniverInstanceService, useDependency } from '@univerjs/core';
import { deserializeRangeWithSheet, matchToken, sequenceNodeType, serializeRange, serializeRangeWithSheet } from '@univerjs/engine-formula';
import { IRenderManagerService } from '@univerjs/engine-render';
import { useEffect, useMemo, useRef } from 'react';
import { distinctUntilChanged, map, merge } from 'rxjs';
import { throttleTime } from 'rxjs/operators';
import { RefSelectionsRenderService } from '../../../services/render-services/ref-selections.render-service';
import { filterReferenceNode, isComma } from '../utils/filterReferenceNode';
import { rangePreProcess } from '../utils/rangePreProcess';
import { sequenceNodeToText } from '../utils/sequenceNodeToText';
import { getSheetNameById, unitRangesToText } from '../utils/unitRangesToText';

export const useSheetSelectionChange = (
    isNeed: boolean,
    unitId: string,
    _subUnitId: string,
    sequenceNodes: INode[],
    isSupportAcrossSheet: boolean,
    isOnlyOneRange: boolean,
    handleRangeChange: (refString: string, offset: number, isEnd: boolean) => void) => {
    const renderManagerService = useDependency(IRenderManagerService);
    const univerInstanceService = useDependency(IUniverInstanceService);
    const isScalingRef = useRef(false);

    const render = renderManagerService.getRenderById(unitId);
    const refSelectionsRenderService = render?.with(RefSelectionsRenderService);
    const oldFilterReferenceNodes = useRef<INode[]>([]);
    const filterReferenceNodes = useMemo(() => {
        const newFilterReferenceNodes = filterReferenceNode(sequenceNodes);
        const old = oldFilterReferenceNodes.current;
        if (newFilterReferenceNodes.length === old.length) {
            old.splice(0);
            old.push(...newFilterReferenceNodes);
            return old;
        }
        return newFilterReferenceNodes;
    }, [sequenceNodes]);
    oldFilterReferenceNodes.current = filterReferenceNodes;

    const scalingOptionRef = useRef<{ result: string; offset: number }>();

    useEffect(() => {
        if (isNeed && refSelectionsRenderService) {
            let isFirst = true;
            const handleSelectionsChange = (selections: ISelectionWithCoord[], isEnd: boolean) => {
                if (isFirst || isScalingRef.current) {
                    isFirst = false;
                    return;
                }
                const cloneSelectionList = [...selections];
                const workbook = univerInstanceService.getUnit<Workbook>(unitId);
                const currentSheetName = workbook?.getActiveSheet()?.getName() || '';
                const newSequenceNodes = filterReferenceNodes.map((node, index) => {
                    if (typeof node === 'string') {
                        const preItem = filterReferenceNodes[index - 1];
                        if (!preItem) {
                            return null;
                        }
                        const nextItem = filterReferenceNodes[index + 1];
                        if (isComma(node)) {
                            if (isComma(nextItem)) {
                                return null;
                            }
                            if (index === (filterReferenceNodes.length - 1)) {
                                return null;
                            }
                        }
                        return node;
                    } else if (node.nodeType === sequenceNodeType.REFERENCE) {
                        const unitRange = deserializeRangeWithSheet(node.token);
                        unitRange.unitId = unitRange.unitId === '' ? unitId : unitRange.unitId;
                        unitRange.sheetName = unitRange.sheetName === '' ? currentSheetName : unitRange.sheetName;

                        const { unitId: rangeUnitId, sheetName: rangeSubName } = unitRange;
                        if (isOnlyOneRange) {
                            if (rangeUnitId !== unitId || currentSheetName !== rangeSubName) {
                                return null;
                            }
                        }
                        if (rangeUnitId === unitId && currentSheetName === rangeSubName) {
                            const currentSelection = cloneSelectionList.shift();
                            if (currentSelection && getSheetNameById(univerInstanceService, unitId, currentSelection.rangeWithCoord.sheetId || '') === rangeSubName) {
                                const cloneNode = { ...node };
                                rangePreProcess(currentSelection.rangeWithCoord);
                                if (isSupportAcrossSheet) {
                                    cloneNode.token = serializeRangeWithSheet(currentSheetName, currentSelection.rangeWithCoord);
                                } else {
                                    cloneNode.token = serializeRange(currentSelection.rangeWithCoord);
                                }
                                return cloneNode;
                            }
                        }
                        return node;
                    }
                    return null;
                }).filter((e) => !!e) as INode[];
                const theLast = unitRangesToText(
                    cloneSelectionList.map((e) => ({
                        range: e.rangeWithCoord,
                        unitId: e.rangeWithCoord.unitId ?? '',
                        sheetName: getSheetNameById(univerInstanceService, e.rangeWithCoord.unitId ?? '', e.rangeWithCoord.sheetId ?? ''),
                    })),
                    isSupportAcrossSheet
                )
                    .join(matchToken.COMMA);
                const thePre = sequenceNodeToText(newSequenceNodes);
                const result = `${thePre}${(thePre && theLast) ? matchToken.COMMA : ''}${theLast}`;
                const isScaling = isScalingRef.current;
                handleRangeChange(result, isScaling ? -1 : result.length, isEnd);
            };
            const d1 = refSelectionsRenderService.selectionMoveEnd$.subscribe((selections) => {
                handleSelectionsChange(selections, true);
                isScalingRef.current = false;
                if (scalingOptionRef.current) {
                    const { result, offset } = scalingOptionRef.current;
                    handleRangeChange(result, offset, true);
                    scalingOptionRef.current = undefined;
                }
            });

            const d2 = refSelectionsRenderService.selectionMoving$.pipe(throttleTime(50)).subscribe((selections) => {
                handleSelectionsChange(selections, false);
            });

            return () => {
                d1.unsubscribe();
                d2.unsubscribe();
            };
        }
    }, [isNeed, filterReferenceNodes, refSelectionsRenderService, isSupportAcrossSheet, isOnlyOneRange, handleRangeChange, univerInstanceService, unitId]);

    useEffect(() => {
        if (isNeed && refSelectionsRenderService) {
            const disposableCollection = new DisposableCollection();
            const handleSequenceNodeReplace = (token: string, index: number) => {
                let currentIndex = 0;
                let offset = 0;
                let isFinish = false;
                const workbook = univerInstanceService.getUnit<Workbook>(unitId);
                const currentSheetName = workbook?.getActiveSheet()?.getName() || '';
                const newSequenceNodes = filterReferenceNodes.map((node) => {
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
                            currentIndex++;
                            offset += cloneNode.token.length;
                            return cloneNode;
                        }
                        currentIndex++;
                        if (!isFinish) {
                            offset += node.token.length;
                        }
                        return node;
                    }
                    return node;
                });
                const result = sequenceNodeToText(newSequenceNodes);
                scalingOptionRef.current = { result, offset };
                handleRangeChange(result, -1, false);
            };
            let time = 0 as any;
            const dispose = refSelectionsRenderService.selectionMoveEnd$.subscribe(() => {
                time = setTimeout(() => {
                    disposableCollection.dispose();
                    const controls = refSelectionsRenderService.getSelectionControls();
                    controls.forEach((control, index) => {
                        disposableCollection.add(merge(control.selectionMoving$, control.selectionScaling$).pipe(
                            map((e) => {
                                return serializeRange(e);
                            }),
                            distinctUntilChanged()
                        ).subscribe((rangeText) => {
                            isScalingRef.current = true;
                            handleSequenceNodeReplace(rangeText, index);
                        }));
                    });
                }, 30);
            });

            return () => {
                dispose.unsubscribe();
                disposableCollection.dispose();
                clearTimeout(time);
            };
        }
    }, [isNeed, refSelectionsRenderService, filterReferenceNodes, handleRangeChange, univerInstanceService, unitId, isSupportAcrossSheet]);
};

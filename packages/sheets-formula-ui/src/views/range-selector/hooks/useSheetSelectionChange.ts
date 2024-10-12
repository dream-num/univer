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
import type { INode } from '../utils/filterReferenceNode';
import { debounce, DisposableCollection, IUniverInstanceService, useDependency } from '@univerjs/core';

import { deserializeRangeWithSheet, matchToken, sequenceNodeType, serializeRange, serializeRangeWithSheet } from '@univerjs/engine-formula';
import { IRenderManagerService } from '@univerjs/engine-render';
import { useEffect, useMemo, useRef } from 'react';
import { distinctUntilChanged, map } from 'rxjs';
import { RefSelectionsRenderService } from '../../../services/render-services/ref-selections.render-service';
import { filterReferenceNode, isComma } from '../utils/filterReferenceNode';
import { rangePreProcess } from '../utils/rangePreProcess';
import { sequenceNodeToText } from '../utils/sequenceNodeToText';
import { getSheetNameById, unitRangesToText } from '../utils/unitRangesToText';

export const useSheetSelectionChange = (isNeed: boolean,
    unitId: string,
    subUnitId: string,
    sequenceNodes: INode[],
    isSupportAcrossSheet: boolean,
    isOnlyOneRange: boolean,
    handleRangeChange: (refString: string, offset: number) => void) => {
    const renderManagerService = useDependency(IRenderManagerService);
    const univerInstanceService = useDependency(IUniverInstanceService);
    const isScalingRef = useRef(false);

    const sheetName = useMemo(() => {
        const workbook = univerInstanceService.getUnit<Workbook>(unitId);
        const sheet = workbook?.getSheetBySheetId(subUnitId);
        return sheet?.getName() || '';
    }, [unitId, subUnitId]);

    const debounceReset = useMemo(() => debounce(() => {
        isScalingRef.current = false;
    }, 300), []);

    const setIsScaling = () => {
        isScalingRef.current = true;
        debounceReset();
    };

    const render = renderManagerService.getRenderById(unitId);
    const refSelectionsRenderService = render?.with(RefSelectionsRenderService);
    const filterReferenceNodes = useMemo(() => filterReferenceNode(sequenceNodes), [sequenceNodes]);

    useEffect(() => {
        if (isNeed && refSelectionsRenderService) {
            let isFirst = true;
            const dispose = refSelectionsRenderService.selectionMoveEnd$.subscribe((selections) => {
                if (isFirst) {
                    isFirst = false;
                    return;
                }
                const cloneSelectionList = [...selections];

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
                        unitRange.sheetName = unitRange.sheetName === '' ? sheetName : unitRange.sheetName;

                        const { unitId: rangeUnitId, sheetName: rangeSubName } = unitRange;
                        if (isOnlyOneRange) {
                            if (rangeUnitId !== unitId || sheetName !== rangeSubName) {
                                return null;
                            }
                        }
                        if (rangeUnitId === unitId && sheetName === rangeSubName) {
                            const currentSelection = cloneSelectionList.shift();
                            if (currentSelection && getSheetNameById(univerInstanceService, unitId, currentSelection.rangeWithCoord.sheetId || '') === rangeSubName) {
                                const cloneNode = { ...node };
                                rangePreProcess(currentSelection.rangeWithCoord);
                                if (isSupportAcrossSheet) {
                                    cloneNode.token = serializeRangeWithSheet(sheetName, currentSelection.rangeWithCoord);
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
                handleRangeChange(result, isScaling ? -1 : result.length);
            });
            return () => {
                dispose.unsubscribe();
            };
        }
    }, [isNeed, filterReferenceNodes, refSelectionsRenderService, isSupportAcrossSheet, isOnlyOneRange]);

    useEffect(() => {
        if (isNeed && refSelectionsRenderService) {
            const disposableCollection = new DisposableCollection();
            const handleSequenceNodeReplace = (token: string, index: number) => {
                let currentIndex = 0;
                let offset = 0;
                let isFinish = false;
                const newSequenceNodes = filterReferenceNodes.map((node) => {
                    if (typeof node === 'string') {
                        if (!isFinish) {
                            offset += node.length;
                        }
                        return node;
                    } else if (node.nodeType === sequenceNodeType.REFERENCE) {
                        if (!isFinish) {
                            offset += node.token.length;
                        }
                        const unitRange = deserializeRangeWithSheet(token);
                        unitRange.unitId = unitRange.unitId === '' ? unitId : unitRange.unitId;
                        unitRange.sheetName = unitRange.sheetName === '' ? sheetName : unitRange.sheetName;
                        if (currentIndex === index) {
                            isFinish = true;
                            const cloneNode = { ...node, token };
                            if (isSupportAcrossSheet) {
                                cloneNode.token = serializeRangeWithSheet(unitRange.sheetName, unitRange.range);
                            } else {
                                cloneNode.token = serializeRange(unitRange.range);
                            }
                            currentIndex++;
                            return cloneNode;
                        }
                        currentIndex++;
                        return node;
                    }
                    return node;
                });
                const result = sequenceNodeToText(newSequenceNodes);
                handleRangeChange(result, offset || -1);
            };
            let time = 0 as any;
            const dispose = refSelectionsRenderService.selectionMoveEnd$.subscribe(() => {
                time = setTimeout(() => {
                    const controls = refSelectionsRenderService.getSelectionControls();
                    controls.forEach((control, index) => {
                        disposableCollection.add(control.selectionScaling$.subscribe((e) => {
                            const rangeText = serializeRange(e);
                            handleSequenceNodeReplace(rangeText, index);
                            setIsScaling();
                        }));
                        disposableCollection.add(control.selectionMoving$.pipe(map((e) => {
                            return serializeRange(e);
                        }), distinctUntilChanged()).subscribe((rangeText) => {
                            handleSequenceNodeReplace(rangeText, index);
                            setIsScaling();
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
    }, [isNeed, refSelectionsRenderService, filterReferenceNodes]);
};

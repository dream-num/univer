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

import { debounce, DisposableCollection, IContextService, IUniverInstanceService, useDependency } from '@univerjs/core';

import { deserializeRangeWithSheet, type ISequenceNode, sequenceNodeType, serializeRange } from '@univerjs/engine-formula';
import { IRenderManagerService } from '@univerjs/engine-render';
import { DISABLE_NORMAL_SELECTIONS } from '@univerjs/sheets';
import { IEditorBridgeService } from '@univerjs/sheets-ui';
import { useEffect, useMemo, useRef } from 'react';
import { RefSelectionsRenderService } from '../../../services/render-services/ref-selections.render-service';
import { RANGE_SPLIT_STRING } from '../index';
import { rangePreProcess } from '../utils/rangePreProcess';
import { sequenceNodeToText } from '../utils/sequenceNodeToText';
import { getSheetNameById, unitRangesToText } from '../utils/unitRangesToText';

export const useSheetSelectionChange = (isNeed: boolean,
    unitId: string,
    subUnitId: string,
    sequenceNodes: (string | ISequenceNode)[],
    handleRangeChange: (refString: string, offset: number) => void) => {
    const renderManagerService = useDependency(IRenderManagerService);
    const univerInstanceService = useDependency(IUniverInstanceService);
    const contextService = useDependency(IContextService);
    const editorBridgeService = useDependency(IEditorBridgeService);

    const isScalingRef = useRef(false);

    const debounceReset = useMemo(() => debounce(() => {
        isScalingRef.current = false;
    }, 300), []);
    const setIsScaling = () => {
        isScalingRef.current = true;
        debounceReset();
    };

    const render = renderManagerService.getRenderById(unitId);
    const refSelectionsRenderService = render?.with(RefSelectionsRenderService);

    // TODO: 拆除 prompt后，这段代码就不用了
    useEffect(() => {
        const d1 = refSelectionsRenderService?.enableSelectionChanging();
        contextService.setContextValue(DISABLE_NORMAL_SELECTIONS, true);
        editorBridgeService.enableForceKeepVisible();
        const d2 = contextService.subscribeContextValue$(DISABLE_NORMAL_SELECTIONS).subscribe((e) => {
            if (!e) {
                refSelectionsRenderService?.enableSelectionChanging();
                contextService.setContextValue(DISABLE_NORMAL_SELECTIONS, true);
                editorBridgeService.enableForceKeepVisible();
            }
        });
        return () => {
            d1?.dispose();
            d2.unsubscribe();
            contextService.setContextValue(DISABLE_NORMAL_SELECTIONS, false);
            editorBridgeService.disableForceKeepVisible();
        };
    }, []);

    useEffect(() => {
        if (isNeed && refSelectionsRenderService) {
            let isFirst = true;
            const dispose = refSelectionsRenderService.selectionMoveEnd$.subscribe((selections) => {
                if (isFirst) {
                    isFirst = false;
                    return;
                }
                const cloneSelectionList = [...selections];
                const newSequenceNodes = sequenceNodes.map((node) => {
                    if (typeof node === 'string') {
                        return node;
                    } else if (node.nodeType === sequenceNodeType.REFERENCE) {
                        const unitRange = deserializeRangeWithSheet(node.token);
                        if (!unitRange.unitId && !unitRange.sheetName) {
                            const currentSelection = cloneSelectionList.shift();
                            if (currentSelection) {
                                const cloneNode = { ...node };
                                rangePreProcess(currentSelection.rangeWithCoord);
                                cloneNode.token = serializeRange(currentSelection.rangeWithCoord);
                                return cloneNode;
                            }
                        }
                        return node;
                    }
                    return node;
                });
                const theLast = unitRangesToText(cloneSelectionList.map((e) => ({ range: e.rangeWithCoord, unitId: e.rangeWithCoord.unitId ?? '', sheetName: getSheetNameById(univerInstanceService, e.rangeWithCoord.unitId ?? '', e.rangeWithCoord.sheetId ?? '') })), unitId, subUnitId, univerInstanceService).join(RANGE_SPLIT_STRING);
                const thePre = sequenceNodeToText(newSequenceNodes);
                const result = `${thePre}${(thePre && theLast) ? RANGE_SPLIT_STRING : ''}${theLast}`;
                const isScaling = isScalingRef.current;
                handleRangeChange(result, isScaling ? -1 : result.length);
            });
            return () => {
                dispose.unsubscribe();
            };
        }
    }, [isNeed, sequenceNodes, refSelectionsRenderService]);

    useEffect(() => {
        if (isNeed && refSelectionsRenderService) {
            const disposableCollection = new DisposableCollection();
            const handleSequenceNodeReplace = (token: string, index: number) => {
                let currentIndex = 0;
                let offset = 0;
                let isFinish = false;
                const newSequenceNodes = sequenceNodes.map((node) => {
                    if (typeof node === 'string') {
                        if (!isFinish) {
                            offset += node.length;
                        }
                        return node;
                    } else if (node.nodeType === sequenceNodeType.REFERENCE) {
                        if (!isFinish) {
                            offset += node.token.length;
                        }
                        const unitRange = deserializeRangeWithSheet(node.token);
                        if (!unitRange.unitId && !unitRange.sheetName) {
                            if (currentIndex === index) {
                                isFinish = true;
                                const cloneNode = { ...node, token };
                                currentIndex++;
                                return cloneNode;
                            }
                            currentIndex++;
                        }
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
                    });
                }, 30);
            });

            return () => {
                dispose.unsubscribe();
                disposableCollection.dispose();
                clearTimeout(time);
            };
        }
    }, [isNeed, refSelectionsRenderService, sequenceNodes]);
};

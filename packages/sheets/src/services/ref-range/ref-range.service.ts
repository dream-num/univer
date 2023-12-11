/**
 * Copyright 2023 DreamNum Inc.
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

import type { IMutationInfo, IRange } from '@univerjs/core';
import {
    createInterceptorKey,
    Disposable,
    InterceptorManager,
    IUniverInstanceService,
    LifecycleStages,
    OnLifecycle,
    Rectangle,
    toDisposable,
} from '@univerjs/core';
import type { IDisposable } from '@wendellhu/redi';
import { Inject } from '@wendellhu/redi';

import { SelectionManagerService } from '../selection-manager.service';
import { SheetInterceptorService } from '../sheet-interceptor/sheet-interceptor.service';
import type { EffectRefRangeParams } from './type';
import { EffectRefRangId } from './type';

type RefRangCallback = (params: EffectRefRangeParams) => {
    redos: IMutationInfo[];
    undos: IMutationInfo[];
};
const MERGE_REDO = createInterceptorKey<IMutationInfo[], null>('MERGE_REDO');
const MERGE_UNDO = createInterceptorKey<IMutationInfo[], null>('MERGE_UNDO');

/**
 * Collect side effects caused by ref range change
 */
@OnLifecycle(LifecycleStages.Steady, RefRangeService)
export class RefRangeService extends Disposable {
    interceptor = new InterceptorManager({ MERGE_REDO, MERGE_UNDO });

    constructor(
        @Inject(SheetInterceptorService) private _sheetInterceptorService: SheetInterceptorService,
        @Inject(IUniverInstanceService) private _univerInstanceService: IUniverInstanceService,
        @Inject(SelectionManagerService) private _selectionManagerService: SelectionManagerService
    ) {
        super();
        this._onRefRangeChange();
        this.interceptor.intercept(this.interceptor.getInterceptPoints().MERGE_REDO, {
            priority: -1,
            handler: (list) => list,
        });
        this.interceptor.intercept(this.interceptor.getInterceptPoints().MERGE_UNDO, {
            priority: -1,
            handler: (list) => list,
        });
    }

    private _refRangeManagerMap = new Map<string, Map<string, Set<RefRangCallback>>>();

    private _serializer = createRangeSerializer();

    private _onRefRangeChange = () => {
        this._sheetInterceptorService.interceptCommand({
            getMutations: (command: EffectRefRangeParams) => {
                const workSheet = this._univerInstanceService.getCurrentUniverSheetInstance().getActiveSheet();
                const workbookId = getWorkbookId(this._univerInstanceService);
                const worksheetId = getWorksheetId(this._univerInstanceService);
                const getEffectsCbList = () => {
                    switch (command.id) {
                        case EffectRefRangId.MoveRangeCommandId: {
                            const params = command;
                            return this._checkRange(
                                [params.params!.fromRange, params.params!.toRange],
                                workbookId,
                                worksheetId
                            );
                        }
                        case EffectRefRangId.InsertRowCommandId: {
                            const params = command;
                            const rowStart = params.params!.range.startRow;
                            const range: IRange = {
                                startRow: rowStart,
                                endRow: workSheet.getRowCount() - 1,
                                startColumn: 0,
                                endColumn: workSheet.getColumnCount() - 1,
                            };
                            return this._checkRange([range], workbookId, worksheetId);
                        }
                        case EffectRefRangId.InsertColCommandId: {
                            const params = command;
                            const colStart = params.params!.range.startColumn;
                            const range: IRange = {
                                startRow: 0,
                                endRow: workSheet.getRowCount() - 1,
                                startColumn: colStart,
                                endColumn: workSheet.getColumnCount() - 1,
                            };
                            return this._checkRange([range], workbookId, worksheetId);
                        }
                        case EffectRefRangId.RemoveRowCommandId: {
                            const params = command;
                            const ranges = params.params?.ranges || [];
                            const rowStart = Math.min(...ranges.map((range) => range.startRow));
                            const range: IRange = {
                                startRow: rowStart,
                                endRow: workSheet.getRowCount() - 1,
                                startColumn: 0,
                                endColumn: workSheet.getColumnCount() - 1,
                            };
                            return this._checkRange([range], workbookId, worksheetId);
                        }
                        case EffectRefRangId.RemoveColCommandId: {
                            const params = command;
                            const ranges = params.params?.ranges || [];
                            const colStart = Math.min(...ranges.map((range) => range.startColumn));
                            const range: IRange = {
                                startRow: 0,
                                endRow: workSheet.getRowCount() - 1,
                                startColumn: colStart,
                                endColumn: workSheet.getColumnCount() - 1,
                            };
                            return this._checkRange([range], workbookId, worksheetId);
                        }
                        case EffectRefRangId.DeleteRangeMoveUpCommandId:
                        case EffectRefRangId.InsertRangeMoveDownCommandId: {
                            const params = command;
                            const ranges = params.params!.ranges || getSelectionRanges(this._selectionManagerService);
                            const effectRanges = ranges.map((range) => ({
                                startRow: range.startRow,
                                startColumn: range.startColumn,
                                endColumn: range.endColumn,
                                endRow: workSheet.getRowCount() - 1,
                            }));
                            return this._checkRange(effectRanges, workbookId, worksheetId);
                        }
                        case EffectRefRangId.DeleteRangeMoveLeftCommandId:
                        case EffectRefRangId.InsertRangeMoveRightCommandId: {
                            const params = command;
                            const ranges = params.params!.ranges || getSelectionRanges(this._selectionManagerService);
                            const effectRanges = ranges.map((range) => ({
                                startRow: range.startRow,
                                startColumn: range.startColumn,
                                endColumn: workSheet.getColumnCount() - 1,
                                endRow: range.endRow,
                            }));
                            return this._checkRange(effectRanges, workbookId, worksheetId);
                        }
                    }
                };
                const cbList = getEffectsCbList() || [];
                const result = cbList
                    .reduce(
                        (result, currentFn) => {
                            const v = currentFn(command);
                            result.push(v);
                            return result;
                        },
                        [] as Array<{ redos: IMutationInfo[]; undos: IMutationInfo[] }>
                    )
                    .reduce(
                        (result, currentValue) => {
                            result.redos.push(...currentValue.redos);
                            result.undos.push(...currentValue.undos);
                            return result;
                        },
                        { redos: [], undos: [] }
                    );
                const redos =
                    this.interceptor.fetchThroughInterceptors(this.interceptor.getInterceptPoints().MERGE_REDO)(
                        result.redos,
                        null
                    ) || [];

                const undos =
                    this.interceptor.fetchThroughInterceptors(this.interceptor.getInterceptPoints().MERGE_UNDO)(
                        result.undos,
                        null
                    ) || [];

                return { redos, undos };
            },
        });
    };

    private _checkRange = (effectRanges: IRange[], workbookId: string, worksheetId: string) => {
        const managerId = getRefRangId(workbookId, worksheetId);
        const manager = this._refRangeManagerMap.get(managerId);
        if (manager) {
            const callbackSet = new Set<RefRangCallback>();
            // this keyList will to prevent an endless cycle ！！！
            const keyList = [...manager.keys()];

            keyList.forEach((key) => {
                const cbList = manager.get(key);
                const range = this._serializer.deserialize(key);
                // Todo@Gggpound : How to reduce this calculation
                if (effectRanges.some((item) => Rectangle.intersects(item, range))) {
                    cbList &&
                        cbList.forEach((callback) => {
                            callbackSet.add(callback);
                        });
                }
            });
            return [...callbackSet];
        }
        return [];
    };

    /**
     * Listens to an area and triggers a fall back when movement occurs
     * @param {IRange} range the area that needs to be monitored
     * @param {RefRangCallback} callback the callback function that is executed when the range changes
     * @param {string} [_workbookId]
     * @param {string} [_worksheetId]
     * @memberof RefRangeService
     */
    registerRefRange = (
        range: IRange,
        callback: RefRangCallback,
        _workbookId?: string,
        _worksheetId?: string
    ): IDisposable => {
        const workbookId = _workbookId || getWorkbookId(this._univerInstanceService);
        const worksheetId = _worksheetId || getWorksheetId(this._univerInstanceService);
        const refRangeManagerId = getRefRangId(workbookId, worksheetId);
        const rangeString = this._serializer.serialize(range);

        let manager = this._refRangeManagerMap.get(refRangeManagerId) as Map<string, Set<RefRangCallback>>;
        if (!manager) {
            manager = new Map();
            this._refRangeManagerMap.set(refRangeManagerId, manager);
        }
        const refRangeCallbackList = manager.get(rangeString);

        if (refRangeCallbackList) {
            refRangeCallbackList.add(callback);
        } else {
            manager.set(rangeString, new Set([callback]));
        }
        return toDisposable(() => {
            const refRangeCallbackList = manager.get(rangeString);
            if (refRangeCallbackList) {
                refRangeCallbackList.delete(callback);
                if (!refRangeCallbackList.size) {
                    manager.delete(rangeString);
                    if (!manager.size) {
                        this._refRangeManagerMap.delete(refRangeManagerId);
                    }
                }
            }
        });
    };
}

function getWorkbookId(univerInstanceService: IUniverInstanceService) {
    return univerInstanceService.getCurrentUniverSheetInstance().getUnitId();
}

function getWorksheetId(univerInstanceService: IUniverInstanceService) {
    return univerInstanceService.getCurrentUniverSheetInstance().getActiveSheet().getSheetId();
}

function getSelectionRanges(selectionManagerService: SelectionManagerService) {
    return selectionManagerService.getSelectionRanges() || [];
}

function getRefRangId(workbookId: string, worksheetId: string) {
    return `${workbookId}_${worksheetId}`;
}

function createRangeSerializer() {
    const keyList = ['startRow', 'startColumn', 'endRow', 'endColumn', 'rangeType'];
    const SPLIT_CODE = '_';
    return {
        deserialize: (rangeString: string) => {
            const map = keyList.reduce(
                (preValue, currentValue, index) => {
                    preValue[String(index)] = currentValue;
                    return preValue;
                },
                {} as Record<string, string>
            );
            const res = rangeString.split(SPLIT_CODE).reduce(
                (preValue, currentValue, _index) => {
                    const index = String(_index) as keyof typeof map;
                    if (currentValue && map[index]) {
                        preValue[map[index]] = currentValue;
                    }
                    return preValue;
                },
                {} as Record<string, string>
            );
            return res as unknown as IRange;
        },
        serialize: (range: IRange) =>
            keyList.reduce((preValue, currentValue, index) => {
                const value = range[currentValue as keyof IRange];
                if (value !== undefined) {
                    return `${preValue}${index > 0 ? SPLIT_CODE : ''}${value}`;
                }
                return `${preValue}`;
            }, ''),
    };
}

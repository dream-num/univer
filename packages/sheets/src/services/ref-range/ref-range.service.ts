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
                const unitId = getunitId(this._univerInstanceService);
                const subUnitId = getsubUnitId(this._univerInstanceService);
                const getEffectsCbList = () => {
                    switch (command.id) {
                        case EffectRefRangId.MoveColsCommandId: {
                            const params = command.params!;
                            const startColumn = Math.min(params.fromRange.startColumn, params.toRange.startColumn);
                            return this._checkRange(
                                [{ ...params.fromRange, startColumn, endColumn: workSheet.getColumnCount() - 1 }],
                                unitId,
                                subUnitId
                            );
                        }
                        case EffectRefRangId.MoveRowsCommandId: {
                            const params = command.params!;
                            const startRow = Math.min(params.fromRange.startRow, params.toRange.startRow);

                            return this._checkRange(
                                [{ ...params.fromRange, startRow, endRow: workSheet.getRowCount() - 1 }],
                                unitId,
                                subUnitId
                            );
                        }
                        case EffectRefRangId.MoveRangeCommandId: {
                            const params = command;
                            return this._checkRange(
                                [params.params!.fromRange, params.params!.toRange],
                                unitId,
                                subUnitId
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
                            return this._checkRange([range], unitId, subUnitId);
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
                            return this._checkRange([range], unitId, subUnitId);
                        }
                        case EffectRefRangId.RemoveRowCommandId: {
                            const params = command;

                            const rowStart = params.params!.range.startRow;
                            const range: IRange = {
                                startRow: rowStart,
                                endRow: workSheet.getRowCount() - 1,
                                startColumn: 0,
                                endColumn: workSheet.getColumnCount() - 1,
                            };
                            return this._checkRange([range], unitId, subUnitId);
                        }
                        case EffectRefRangId.RemoveColCommandId: {
                            const params = command;
                            const colStart = params.params!.range.startColumn;
                            const range: IRange = {
                                startRow: 0,
                                endRow: workSheet.getRowCount() - 1,
                                startColumn: colStart,
                                endColumn: workSheet.getColumnCount() - 1,
                            };
                            return this._checkRange([range], unitId, subUnitId);
                        }
                        case EffectRefRangId.DeleteRangeMoveUpCommandId:
                        case EffectRefRangId.InsertRangeMoveDownCommandId: {
                            const params = command;
                            const range = params.params!.range || getSelectionRanges(this._selectionManagerService)[0];
                            const effectRange = {
                                startRow: range.startRow,
                                startColumn: range.startColumn,
                                endColumn: range.endColumn,
                                endRow: workSheet.getRowCount() - 1,
                            };
                            return this._checkRange([effectRange], unitId, subUnitId);
                        }
                        case EffectRefRangId.DeleteRangeMoveLeftCommandId:
                        case EffectRefRangId.InsertRangeMoveRightCommandId: {
                            const params = command;
                            const range = params.params!.range || getSelectionRanges(this._selectionManagerService)[0];
                            const effectRange = {
                                startRow: range.startRow,
                                startColumn: range.startColumn,
                                endColumn: workSheet.getColumnCount() - 1,
                                endRow: range.endRow,
                            };
                            return this._checkRange([effectRange], unitId, subUnitId);
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

    private _checkRange = (effectRanges: IRange[], unitId: string, subUnitId: string) => {
        const managerId = getRefRangId(unitId, subUnitId);
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
     * @param {string} [_unitId]
     * @param {string} [_subUnitId]
     * @memberof RefRangeService
     */
    registerRefRange = (
        range: IRange,
        callback: RefRangCallback,
        _unitId?: string,
        _subUnitId?: string
    ): IDisposable => {
        const unitId = _unitId || getunitId(this._univerInstanceService);
        const subUnitId = _subUnitId || getsubUnitId(this._univerInstanceService);
        const refRangeManagerId = getRefRangId(unitId, subUnitId);
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

function getunitId(univerInstanceService: IUniverInstanceService) {
    return univerInstanceService.getCurrentUniverSheetInstance().getUnitId();
}

function getsubUnitId(univerInstanceService: IUniverInstanceService) {
    return univerInstanceService.getCurrentUniverSheetInstance().getActiveSheet().getSheetId();
}

function getSelectionRanges(selectionManagerService: SelectionManagerService) {
    return selectionManagerService.getSelectionRanges() || [];
}

function getRefRangId(unitId: string, subUnitId: string) {
    return `${unitId}_${subUnitId}`;
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

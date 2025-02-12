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

import type { IDisposable, IMutationInfo, IRange, Nullable, Workbook } from '@univerjs/core';
import type { IMoveRangeMutationParams } from '../../commands/mutations/move-range.mutation';

import type { ISheetCommandSharedParams } from '../../commands/utils/interface';
import type { EffectRefRangeParams } from './type';
import {
    CommandType,
    createInterceptorKey,
    Disposable,
    ICommandService,
    Inject,
    InterceptorManager,
    IUniverInstanceService,
    RANGE_TYPE,
    Rectangle,
    toDisposable,
    UniverInstanceType,
} from '@univerjs/core';
import { MoveRangeMutation } from '../../commands/mutations/move-range.mutation';
import { RemoveSheetMutation } from '../../commands/mutations/remove-sheet.mutation';
import { SheetsSelectionsService } from '../selections/selection.service';
import { SheetInterceptorService } from '../sheet-interceptor/sheet-interceptor.service';
import { EffectRefRangId } from './type';
import { adjustRangeOnMutation, getEffectedRangesOnMutation } from './util';

type RefRangCallback = (params: EffectRefRangeParams) => {
    redos: IMutationInfo[];
    undos: IMutationInfo[];
    preRedos?: IMutationInfo[];
    preUndos?: IMutationInfo[];
};

export type WatchRangeCallback = (before: IRange, after: Nullable<IRange>) => void;

const MERGE_REDO = createInterceptorKey<IMutationInfo[], null>('MERGE_REDO');
const MERGE_UNDO = createInterceptorKey<IMutationInfo[], null>('MERGE_UNDO');

const MAX_ROW_COL = Math.floor(Number.MAX_SAFE_INTEGER / 10);

class WatchRange extends Disposable {
    constructor(
        private readonly _unitId: string,
        private readonly _subUnitId: string,
        private _range: Nullable<IRange>,
        private readonly _callback: WatchRangeCallback,
        private readonly _skipIntersects: boolean = false
    ) {
        super();
    }

    onMutation(mutation: IMutationInfo<ISheetCommandSharedParams>) {
        if (mutation.params?.unitId !== this._unitId) {
            return;
        }
        // move range don't have subUnitId on params
        if (mutation.id === MoveRangeMutation.id) {
            const params = mutation.params as unknown as IMoveRangeMutationParams;
            if (params.from.subUnitId !== this._subUnitId || params.to.subUnitId !== this._subUnitId) {
                return;
            }
        } else if (mutation.params?.subUnitId !== this._subUnitId) {
            return;
        }

        if (!this._range) {
            return;
        }

        if (this._skipIntersects) {
            if (mutation.id === RemoveSheetMutation.id) {
                return;
            }
            const effectRanges = getEffectedRangesOnMutation(mutation);
            if (effectRanges?.some((effectRange) => Rectangle.intersects(effectRange, this._range!))) {
                return;
            }
        }

        const afterRange: Nullable<IRange> = adjustRangeOnMutation(this._range, mutation);
        if (afterRange && Rectangle.equals(afterRange, this._range)) {
            return false;
        }

        const beforeChange = this._range;
        this._range = afterRange;
        this._callback(beforeChange, afterRange);
    }
}

/**
 * Collect side effects caused by ref range change
 */
export class RefRangeService extends Disposable {
    interceptor = new InterceptorManager({ MERGE_REDO, MERGE_UNDO });

    private _watchRanges = new Set<WatchRange>();

    constructor(
        @ICommandService private readonly _commandService: ICommandService,
        @Inject(SheetInterceptorService) private _sheetInterceptorService: SheetInterceptorService,
        @Inject(IUniverInstanceService) private _univerInstanceService: IUniverInstanceService,
        @Inject(SheetsSelectionsService) private _selectionManagerService: SheetsSelectionsService
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

    watchRange(unitId: string, subUnitId: string, range: IRange, callback: WatchRangeCallback, skipIntersects?: boolean): IDisposable {
        let watchRangesListener: Nullable<IDisposable>;
        if (this._watchRanges.size === 0) {
            watchRangesListener = this._commandService.onCommandExecuted((command) => {
                if (command.type !== CommandType.MUTATION) return false;
                for (const watchRange of this._watchRanges) {
                    watchRange.onMutation(command as IMutationInfo<ISheetCommandSharedParams>);
                }
            });
        }

        const watchRange = new WatchRange(unitId, subUnitId, range, callback, skipIntersects);
        this._watchRanges.add(watchRange);

        const teardownWatching = toDisposable(() => {
            this._watchRanges.delete(watchRange);

            if (this._watchRanges.size === 0) {
                watchRangesListener?.dispose();
                watchRangesListener = null;
            }
        });

        const registerToService = this.disposeWithMe(teardownWatching);

        return toDisposable(() => {
            registerToService.dispose();
            teardownWatching.dispose();
        });
    }

    private _refRangeManagerMap = new Map<string, Map<string, Set<RefRangCallback>>>();

    private _serializer = createRangeSerializer();

    // eslint-disable-next-line max-lines-per-function
    private _onRefRangeChange = () => {
        this._sheetInterceptorService.interceptCommand({
            // eslint-disable-next-line max-lines-per-function
            getMutations: (command: EffectRefRangeParams) => {
                const worksheet = this._univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET)!.getActiveSheet();
                const unitId = getUnitId(this._univerInstanceService);
                const subUnitId = getSubUnitId(this._univerInstanceService);
                if (!worksheet || !unitId || !subUnitId) {
                    return { redos: [], undos: [], preRedos: [], preUndos: [] };
                }
                // eslint-disable-next-line max-lines-per-function
                const getEffectsCbList = () => {
                    switch (command.id) {
                        case EffectRefRangId.MoveColsCommandId: {
                            const params = command.params!;
                            const startColumn = Math.min(params.fromRange.startColumn, params.toRange.startColumn);
                            return this._checkRange(
                                [{ ...params.fromRange, startColumn, endColumn: worksheet.getColumnCount() - 1 }],
                                unitId,
                                subUnitId
                            );
                        }
                        case EffectRefRangId.MoveRowsCommandId: {
                            const params = command.params!;
                            const startRow = Math.min(params.fromRange.startRow, params.toRange.startRow);

                            return this._checkRange(
                                [{ ...params.fromRange, startRow, endRow: worksheet.getRowCount() - 1 }],
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
                                endRow: worksheet.getRowCount() - 1,
                                startColumn: 0,
                                endColumn: worksheet.getColumnCount() - 1,
                                rangeType: RANGE_TYPE.ROW,
                            };
                            return this._checkRange([range], unitId, subUnitId);
                        }
                        case EffectRefRangId.InsertColCommandId: {
                            const params = command;
                            const colStart = params.params!.range.startColumn;
                            const range: IRange = {
                                startRow: 0,
                                endRow: worksheet.getRowCount() - 1,
                                startColumn: colStart,
                                endColumn: worksheet.getColumnCount() - 1,
                                rangeType: RANGE_TYPE.COLUMN,
                            };
                            return this._checkRange([range], unitId, subUnitId);
                        }
                        case EffectRefRangId.RemoveRowCommandId: {
                            const params = command;

                            const rowStart = params.params!.range.startRow;
                            const range: IRange = {
                                startRow: rowStart,
                                endRow: worksheet.getRowCount() - 1,
                                startColumn: 0,
                                endColumn: worksheet.getColumnCount() - 1,
                                rangeType: RANGE_TYPE.ROW,
                            };
                            return this._checkRange([range], unitId, subUnitId);
                        }
                        case EffectRefRangId.RemoveColCommandId: {
                            const params = command;
                            const colStart = params.params!.range.startColumn;
                            const range: IRange = {
                                startRow: 0,
                                endRow: worksheet.getRowCount() - 1,
                                startColumn: colStart,
                                endColumn: worksheet.getColumnCount() - 1,
                                rangeType: RANGE_TYPE.COLUMN,
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
                                endRow: MAX_ROW_COL,
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
                                endColumn: MAX_ROW_COL,
                                endRow: range.endRow,
                            };
                            return this._checkRange([effectRange], unitId, subUnitId);
                        }
                        case EffectRefRangId.ReorderRangeCommandId: {
                            const params = command;
                            const { range, order } = params.params!;
                            const effectRanges = [];
                            for (let row = range.startRow; row <= range.endRow; row++) {
                                if (row in order) {
                                    effectRanges.push({
                                        startRow: row,
                                        endRow: row,
                                        startColumn: range.startColumn,
                                        endColumn: range.endColumn,
                                    });
                                }
                            }
                            return this._checkRange(effectRanges, unitId, subUnitId);
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
                        [] as Array<{ redos: IMutationInfo[]; undos: IMutationInfo[]; preUndos?: IMutationInfo[]; preRedos?: IMutationInfo[] }>
                    )
                    .reduce(
                        (result, currentValue) => {
                            result.redos.push(...currentValue.redos);
                            result.undos.push(...currentValue.undos);
                            result.preRedos!.push(...(currentValue.preRedos ?? []));
                            result.preUndos!.push(...(currentValue.preUndos ?? []));
                            return result;
                        },
                        { redos: [], undos: [], preUndos: [], preRedos: [] }
                    );

                const preRedos = this.interceptor.fetchThroughInterceptors(this.interceptor.getInterceptPoints().MERGE_REDO)(
                    result.preRedos,
                    null
                ) || [];

                const redos =
                    this.interceptor.fetchThroughInterceptors(this.interceptor.getInterceptPoints().MERGE_REDO)(
                        result.redos,
                        null
                    ) || [];

                const preUndos = this.interceptor.fetchThroughInterceptors(this.interceptor.getInterceptPoints().MERGE_UNDO)(
                    result.preUndos,
                    null
                ) || [];

                const undos =
                    this.interceptor.fetchThroughInterceptors(this.interceptor.getInterceptPoints().MERGE_UNDO)(
                        result.undos,
                        null
                    ) || [];

                return { redos, undos, preRedos, preUndos };
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
                const realRange: IRange = {
                    ...range,
                    startRow: +range.startRow,
                    endRow: +range.endRow,
                    startColumn: +range.startColumn,
                    endColumn: +range.endColumn,
                    rangeType: range.rangeType && +range.rangeType,
                };
                // Todo@Gggpound : How to reduce this calculation
                if (
                    effectRanges.some((item) => Rectangle.intersects(item, realRange))
                ) {
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
        const unitId = _unitId || getUnitId(this._univerInstanceService);
        const subUnitId = _subUnitId || getSubUnitId(this._univerInstanceService);
        if (!unitId || !subUnitId) {
            return toDisposable(() => {});
        }

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

function getUnitId(univerInstanceService: IUniverInstanceService) {
    return univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET)!.getUnitId();
}

function getSubUnitId(univerInstanceService: IUniverInstanceService) {
    return univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET)!.getActiveSheet()?.getSheetId();
}

function getSelectionRanges(selectionManagerService: SheetsSelectionsService) {
    return selectionManagerService.getCurrentSelections()?.map((s) => s.range) || [];
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

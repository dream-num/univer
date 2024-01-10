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
    Disposable,
    DisposableCollection,
    ICommandService,
    IUniverInstanceService,
    LifecycleStages,
    OnLifecycle,
    Range,
    toDisposable,
} from '@univerjs/core';
import type {
    EffectRefRangeParams,
    IOperator,
    IRemoveNumfmtMutationParams,
    ISetCellsNumfmt,
    ISetNumfmtMutationParams,
} from '@univerjs/sheets';
import {
    EffectRefRangId,
    factoryRemoveNumfmtUndoMutation,
    factorySetNumfmtUndoMutation,
    handleDeleteRangeMoveLeft,
    handleDeleteRangeMoveUp,
    handleInsertCol,
    handleInsertRangeMoveDown,
    handleInsertRangeMoveRight,
    handleInsertRow,
    handleIRemoveCol,
    handleIRemoveRow,
    handleMoveCols,
    handleMoveRange,
    handleMoveRows,
    INumfmtService,
    RefRangeService,
    RemoveNumfmtMutation,
    runRefRangeMutations,
    SetNumfmtMutation,
    transformCellsToRange,
} from '@univerjs/sheets';
import { SheetSkeletonManagerService } from '@univerjs/sheets-ui';
import type { IDisposable } from '@wendellhu/redi';
import { Inject, Injector } from '@wendellhu/redi';
import { merge, Observable } from 'rxjs';
import { bufferTime, distinctUntilChanged, filter, map, switchMap } from 'rxjs/operators';

import { mergeNumfmtMutations } from '../utils/mutation';

const numfmtMutation = [SetNumfmtMutation.id, RemoveNumfmtMutation.id];
@OnLifecycle(LifecycleStages.Rendered, NumfmtRefRangeController)
export class NumfmtRefRangeController extends Disposable {
    constructor(
        @Inject(INumfmtService) private _numfmtService: INumfmtService,
        @Inject(IUniverInstanceService) private _univerInstanceService: IUniverInstanceService,
        @Inject(Injector) private _injector: Injector,
        @Inject(RefRangeService) private _refRangeService: RefRangeService,
        @Inject(SheetSkeletonManagerService) private _sheetSkeletonManagerService: SheetSkeletonManagerService,
        @Inject(ICommandService) private _commandService: ICommandService
    ) {
        super();
        this._registerRefRange();
        this._mergeRefMutations();
    }

    private _mergeRefMutations() {
        this._refRangeService.interceptor.intercept(this._refRangeService.interceptor.getInterceptPoints().MERGE_REDO, {
            handler: (list, _c, next) => {
                if (!list) {
                    return next(list);
                }
                const result = list.filter((item) => !numfmtMutation.includes(item.id));
                result.push(...mergeNumfmtMutations(list));
                return next(result);
            },
        });
    }

    private _registerRefRange() {
        this.disposeWithMe(
            toDisposable(
                merge(
                    this._sheetSkeletonManagerService.currentSkeleton$.pipe(
                        map((skeleton) => skeleton?.sheetId),
                        distinctUntilChanged()
                    ),
                    this._numfmtService.modelReplace$
                )
                    .pipe(
                        switchMap(
                            () =>
                                new Observable<DisposableCollection>((subscribe) => {
                                    const disposableCollection = new DisposableCollection();
                                    subscribe.next(disposableCollection);
                                    return () => {
                                        disposableCollection.dispose();
                                    };
                                })
                        )
                    )
                    .subscribe((disposableCollection) => {
                        const workbook = this._univerInstanceService.getCurrentUniverSheetInstance();
                        const unitId = workbook.getUnitId();
                        const subUnitId = this._univerInstanceService
                            .getCurrentUniverSheetInstance()
                            .getActiveSheet()
                            .getSheetId();
                        const model = this._numfmtService.getModel(unitId, subUnitId);
                        const disposableMap: Map<string, IDisposable> = new Map();
                        const register = (commandInfo: EffectRefRangeParams, row: number, col: number) => {
                            const targetRange = {
                                startRow: row,
                                startColumn: col,
                                endRow: row,
                                endColumn: col,
                            };
                            let operators: IOperator[] = [];
                            switch (commandInfo.id) {
                                case EffectRefRangId.DeleteRangeMoveLeftCommandId: {
                                    operators = handleDeleteRangeMoveLeft(commandInfo, targetRange);
                                    break;
                                }
                                case EffectRefRangId.DeleteRangeMoveUpCommandId: {
                                    operators = handleDeleteRangeMoveUp(commandInfo, targetRange);
                                    break;
                                }
                                case EffectRefRangId.InsertColCommandId: {
                                    operators = handleInsertCol(commandInfo, targetRange);
                                    break;
                                }
                                case EffectRefRangId.InsertRangeMoveDownCommandId: {
                                    operators = handleInsertRangeMoveDown(commandInfo, targetRange);
                                    break;
                                }
                                case EffectRefRangId.InsertRangeMoveRightCommandId: {
                                    operators = handleInsertRangeMoveRight(commandInfo, targetRange);
                                    break;
                                }
                                case EffectRefRangId.InsertRowCommandId: {
                                    operators = handleInsertRow(commandInfo, targetRange);
                                    break;
                                }
                                case EffectRefRangId.MoveRangeCommandId: {
                                    operators = handleMoveRange(commandInfo, targetRange);
                                    break;
                                }
                                case EffectRefRangId.RemoveColCommandId: {
                                    operators = handleIRemoveCol(commandInfo, targetRange);
                                    break;
                                }
                                case EffectRefRangId.RemoveRowCommandId: {
                                    operators = handleIRemoveRow(commandInfo, targetRange);
                                    break;
                                }
                                case EffectRefRangId.MoveColsCommandId: {
                                    operators = handleMoveCols(commandInfo, targetRange);
                                    break;
                                }
                                case EffectRefRangId.MoveRowsCommandId: {
                                    operators = handleMoveRows(commandInfo, targetRange);
                                }
                            }
                            const resultRange = runRefRangeMutations(operators, targetRange);

                            const numfmtValue = this._numfmtService.getValue(unitId, subUnitId, row, col);
                            if (!resultRange && numfmtValue) {
                                const removeRedo = {
                                    id: RemoveNumfmtMutation.id,
                                    params: {
                                        unitId,
                                        subUnitId,
                                        ranges: [{ startColumn: col, startRow: row, endColumn: col, endRow: row }],
                                    },
                                };
                                const undoRemove = factoryRemoveNumfmtUndoMutation(this._injector, removeRedo.params);
                                return {
                                    redos: [removeRedo],
                                    undos: undoRemove,
                                };
                            }
                            if (numfmtValue && resultRange) {
                                const redos: Array<
                                    IMutationInfo<IRemoveNumfmtMutationParams | ISetNumfmtMutationParams>
                                > = [];
                                const undos: Array<
                                    IMutationInfo<IRemoveNumfmtMutationParams | ISetNumfmtMutationParams>
                                > = [];
                                const setRedoCells: ISetCellsNumfmt = [
                                    {
                                        pattern: numfmtValue.pattern,
                                        type: numfmtValue.type,
                                        row: resultRange.startRow,
                                        col: resultRange.startColumn,
                                    },
                                ];
                                const setRedo = {
                                    id: SetNumfmtMutation.id,
                                    params: transformCellsToRange(unitId, subUnitId, setRedoCells),
                                };
                                const undoSet = factorySetNumfmtUndoMutation(this._injector, setRedo.params);

                                const removeRedo = {
                                    id: RemoveNumfmtMutation.id,
                                    params: {
                                        unitId,
                                        subUnitId,
                                        ranges: [{ startColumn: col, startRow: row, endColumn: col, endRow: row }],
                                    },
                                };
                                const undoRemove = factoryRemoveNumfmtUndoMutation(this._injector, removeRedo.params);
                                redos.push(setRedo, removeRedo);
                                undos.push(...undoSet, ...undoRemove);

                                return {
                                    redos,
                                    undos: undos.reverse(),
                                };
                            }
                            return { redos: [], undos: [] };
                        };

                        model &&
                            model.forValue((row, col) => {
                                const targetRange = {
                                    startRow: row,
                                    startColumn: col,
                                    endRow: row,
                                    endColumn: col,
                                };
                                const disposable = this._refRangeService.registerRefRange(targetRange, (commandInfo) =>
                                    register(commandInfo, row, col)
                                );
                                disposableMap.set(`${row}_${col}`, disposable);
                                disposableCollection.add(disposable);
                            });

                        // on change
                        disposableCollection.add(
                            toDisposable(
                                new Observable<ISetNumfmtMutationParams & IRemoveNumfmtMutationParams>((subscribe) => {
                                    disposableCollection.add(
                                        this._commandService.onCommandExecuted((commandInfo) => {
                                            if (
                                                [SetNumfmtMutation.id, RemoveNumfmtMutation.id].includes(commandInfo.id)
                                            ) {
                                                subscribe.next(commandInfo.params as any);
                                            }
                                        })
                                    );
                                })
                                    .pipe(
                                        filter(
                                            (commandInfo) =>
                                                commandInfo.unitId === unitId && commandInfo.subUnitId === subUnitId
                                        ),
                                        map((commandInfo) => {
                                            if (commandInfo.ranges) {
                                                return commandInfo.ranges;
                                            }
                                            if (commandInfo.values) {
                                                return Object.keys(commandInfo.values).reduce((list, key) => {
                                                    const v = commandInfo.values[key];
                                                    list.push(...v.ranges);
                                                    return list;
                                                }, [] as IRange[]);
                                            }
                                            return [];
                                        }),
                                        bufferTime(300), // updating the listener moves to the next queue
                                        map((values) =>
                                            values.reduce((pre, cur) => {
                                                pre.push(...cur);
                                                return pre;
                                            }, [])
                                        ),
                                        filter((values) => !!values.length)
                                    )
                                    .subscribe((ranges) => {
                                        ranges.forEach((range) => {
                                            Range.foreach(range, (row, col) => {
                                                const key = `${row}_${col}`;
                                                const disposable = disposableMap.get(key);
                                                disposableMap.delete(key);
                                                disposable && disposable.dispose();
                                                const value = this._numfmtService.getValue(unitId, subUnitId, row, col);
                                                if (value) {
                                                    const targetRange = {
                                                        startRow: row,
                                                        startColumn: col,
                                                        endRow: row,
                                                        endColumn: col,
                                                    };
                                                    const disposable = this._refRangeService.registerRefRange(
                                                        targetRange,
                                                        (commandInfo) => register(commandInfo, row, col)
                                                    );
                                                    disposableMap.set(key, disposable);
                                                    disposableCollection.add(disposable);
                                                }
                                            });
                                        });
                                    })
                            )
                        );
                    })
            )
        );
    }
}

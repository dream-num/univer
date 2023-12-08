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
    FormatType,
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
    handleMoveRange,
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

    private _refToReal(values: ISetNumfmtMutationParams['values'], refMap: ISetNumfmtMutationParams['refMap']) {
        const patternMap: {
            [pattern: string]: {
                pattern: string;
                ranges: IRange[];
                type: FormatType;
            };
        } = {};

        Object.keys(values).forEach((id) => {
            const v = refMap[id];
            if (!v) {
                return;
            }
            const ranges = values[id].ranges;
            const pattern = v.pattern;
            const type = v.type;
            patternMap[pattern] = { ranges, pattern, type };
        });
        return patternMap;
    }

    private _mergeNumfmtSetMutation(list: ISetNumfmtMutationParams[]) {
        if (!list.length) {
            return [];
        }
        const firstOne = list[0];
        const patternMap: {
            [pattern: string]: {
                pattern: string;
                ranges: IRange[];
                type: FormatType;
            };
        } = {};
        const refMap: ISetNumfmtMutationParams['refMap'] = {};
        const values: ISetNumfmtMutationParams['values'] = {};
        list.forEach((item) => {
            const { refMap, values } = item;
            const value = this._refToReal(values, refMap);
            Object.keys(value).forEach((key) => {
                if (patternMap[key]) {
                    patternMap[key].ranges.push(...value[key].ranges);
                } else {
                    patternMap[key] = value[key];
                }
            });
        });
        Object.keys(patternMap).forEach((key, index) => {
            const id = `${index + 1}`;
            const item = patternMap[key];
            refMap[id] = { pattern: item.pattern, type: item.type };
            values[id] = { ranges: item.ranges };
        });
        return {
            ...firstOne,
            refMap,
            values,
        };
    }

    private _mergeNumfmtRemoveMutation(list: IRemoveNumfmtMutationParams[]) {
        if (!list.length) {
            return [];
        }
        const ranges: IRange[] = [];
        list.forEach((item) => {
            ranges.push(...item.ranges);
        });
        const firstOne = list[0];
        return {
            ...firstOne,
            ranges,
        };
    }

    private _mergeRefMutations() {
        this._refRangeService.interceptor.intercept(this._refRangeService.interceptor.getInterceptPoints().MERGE_REDO, {
            handler: (list, _c, next) => {
                const result = list?.filter((item) => !numfmtMutation.includes(item.id)) || [];
                const numfmtSetMutation = (list?.filter((item) => item.id === SetNumfmtMutation.id) || []).map(
                    (item) => item.params
                ) as unknown as ISetNumfmtMutationParams[];
                const numfmtRemoveMutation = (list?.filter((item) => item.id === RemoveNumfmtMutation.id) || []).map(
                    (item) => item.params
                ) as unknown as IRemoveNumfmtMutationParams[];

                if (numfmtRemoveMutation.length) {
                    const params = this._mergeNumfmtRemoveMutation(numfmtRemoveMutation);
                    result.push({ id: RemoveNumfmtMutation.id, params });
                }
                if (numfmtSetMutation.length) {
                    const params = this._mergeNumfmtSetMutation(numfmtSetMutation);
                    result.push({ id: SetNumfmtMutation.id, params });
                }
                return next(result);
            },
        });
        // this.disposeWithMe(
        //     this._refRangeService.intercept({
        //         handler: (list, current, next) => {
        //             if (!list || !list.length || !current.length) {
        //                 return next(list);
        //             }
        //             const theLastMutation = list[list.length - 1];
        //             const theFirstMutation = current[0];
        //             if (theLastMutation.id === SetNumfmtMutation.id && theFirstMutation.id === SetNumfmtMutation.id) {
        //                 const theLastMutationParams = theLastMutation.params as ISetNumfmtMutationParams;
        //                 const theFirstMutationParams = theFirstMutation.params as ISetNumfmtMutationParams;
        //                 if (
        //                     theLastMutationParams.workbookId === theFirstMutationParams.workbookId &&
        //                     theLastMutationParams.worksheetId === theFirstMutationParams.worksheetId
        //                 ) {
        //                     const values = theLastMutationParams.values;
        //                     current.forEach((mutation) => {
        //                         const params = mutation.params as ISetNumfmtMutationParams;
        //                         Object.keys(params.values).forEach((id) => {
        //                             if (values[id]) {
        //                                 values[id].ranges.push(...params.values[id].ranges);
        //                             }
        //                         });
        //                     });
        //                     return list;
        //                 }
        //             }
        //             return next(list);
        //         },
        //     })
        // );
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
                        const workbookId = workbook.getUnitId();
                        const worksheetId = this._univerInstanceService
                            .getCurrentUniverSheetInstance()
                            .getActiveSheet()
                            .getSheetId();
                        const model = this._numfmtService.getModel(workbookId, worksheetId);
                        const disposableMap: Map<string, IDisposable> = new Map();
                        const register = (
                            commandInfo: EffectRefRangeParams,
                            preValues: Array<{ redos: IMutationInfo[]; undos: IMutationInfo[] }>,
                            row: number,
                            col: number
                        ) => {
                            const targetRange = {
                                startRow: row,
                                startColumn: col,
                                endRow: row,
                                endColumn: col,
                            };
                            let operators = [];
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
                            }
                            const resultRange = runRefRangeMutations(operators, targetRange);

                            const numfmtValue = this._numfmtService.getValue(workbookId, worksheetId, row, col);
                            if (!resultRange && numfmtValue) {
                                const removeRedo = {
                                    id: RemoveNumfmtMutation.id,
                                    params: {
                                        workbookId,
                                        worksheetId,
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
                                    params: transformCellsToRange(workbookId, worksheetId, setRedoCells),
                                };
                                const undoSet = factorySetNumfmtUndoMutation(this._injector, setRedo.params);

                                const removeRedo = {
                                    id: RemoveNumfmtMutation.id,
                                    params: {
                                        workbookId,
                                        worksheetId,
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
                                const disposable = this._refRangeService.registerRefRange(
                                    targetRange,
                                    (commandInfo, preValues) => register(commandInfo, preValues, row, col)
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
                                                commandInfo.workbookId === workbookId &&
                                                commandInfo.worksheetId === worksheetId
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
                                                const value = this._numfmtService.getValue(
                                                    workbookId,
                                                    worksheetId,
                                                    row,
                                                    col
                                                );
                                                if (value) {
                                                    const targetRange = {
                                                        startRow: row,
                                                        startColumn: col,
                                                        endRow: row,
                                                        endColumn: col,
                                                    };
                                                    const disposable = this._refRangeService.registerRefRange(
                                                        targetRange,
                                                        (commandInfo, preValues) =>
                                                            register(commandInfo, preValues, row, col)
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

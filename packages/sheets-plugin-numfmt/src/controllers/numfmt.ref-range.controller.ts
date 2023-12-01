import type { EffectRefRangeParams, ISetNumfmtMutationParams } from '@univerjs/base-sheets';
import {
    EffectRefRangId,
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
    runRefRangeMutations,
    SetNumfmtMutation,
} from '@univerjs/base-sheets';
import type { IMutationInfo } from '@univerjs/core';
import {
    Disposable,
    DisposableCollection,
    ICommandService,
    IUniverInstanceService,
    LifecycleStages,
    OnLifecycle,
    toDisposable,
} from '@univerjs/core';
import { SheetSkeletonManagerService } from '@univerjs/ui-plugin-sheets';
import type { IDisposable } from '@wendellhu/redi';
import { Inject, Injector } from '@wendellhu/redi';
import { Observable } from 'rxjs';
import { bufferTime, distinctUntilChanged, filter, map, switchMap } from 'rxjs/operators';

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
        this.disposeWithMe(
            this._refRangeService.intercept({
                handler: (list, current, next) => {
                    if (!list || !list.length) {
                        return next(list);
                    }
                    const theLastMutation = list[list.length - 1];
                    const theFirstMutation = current[0];
                    if (theLastMutation.id === SetNumfmtMutation.id && theFirstMutation.id === SetNumfmtMutation.id) {
                        const theLastMutationParams = theLastMutation.params as ISetNumfmtMutationParams;
                        const theFirstMutationParams = theFirstMutation.params as ISetNumfmtMutationParams;
                        if (
                            theLastMutationParams.workbookId === theFirstMutationParams.workbookId &&
                            theLastMutationParams.worksheetId === theFirstMutationParams.worksheetId
                        ) {
                            const values = theLastMutationParams.values;
                            current.forEach((mutation) => {
                                const params = mutation.params as ISetNumfmtMutationParams;
                                params.values.forEach((item) => {
                                    values.push(item);
                                });
                            });
                            return list;
                        }
                    }
                    return next(list);
                },
            })
        );
    }

    private _registerRefRange() {
        this.disposeWithMe(
            toDisposable(
                this._sheetSkeletonManagerService.currentSkeleton$
                    .pipe(
                        map((skeleton) => skeleton?.sheetId),
                        distinctUntilChanged(),
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
                            /**
                             * Each registry area is modified to generate a pair of delete and set operations,
                             * which should not  generate delete operation if another registry area has previously generate set operations.
                             */
                            const isPreSetNumfmt = preValues
                                .reduce((list, item) => {
                                    list.push(...item.redos);
                                    return list;
                                }, [] as IMutationInfo[])
                                .filter((item) => item.id === SetNumfmtMutation.id)
                                .some((mutation) =>
                                    (mutation.params as ISetNumfmtMutationParams).values!.some(
                                        (item) => item.row === row && item.col === col && !!item.pattern
                                    )
                                );
                            if (!resultRange && !isPreSetNumfmt) {
                                const redoParams: ISetNumfmtMutationParams = {
                                    workbookId,
                                    worksheetId,
                                    values: [{ row, col }],
                                };
                                const undoParams = factorySetNumfmtUndoMutation(this._injector, redoParams);
                                return {
                                    redos: [
                                        {
                                            id: SetNumfmtMutation.id,
                                            params: redoParams,
                                        },
                                    ],
                                    undos: [
                                        {
                                            id: SetNumfmtMutation.id,
                                            params: undoParams,
                                        },
                                    ],
                                };
                            }
                            const numfmtValue = this._numfmtService.getValue(workbookId, worksheetId, row, col);

                            if (numfmtValue && resultRange) {
                                const redoParams: ISetNumfmtMutationParams = {
                                    workbookId,
                                    worksheetId,
                                    values: [
                                        { ...numfmtValue, row: resultRange.startRow, col: resultRange.startColumn },
                                    ],
                                };
                                if (!isPreSetNumfmt) {
                                    redoParams.values.unshift({ row, col });
                                }
                                const undoParams = factorySetNumfmtUndoMutation(this._injector, redoParams);
                                return {
                                    redos: [
                                        {
                                            id: SetNumfmtMutation.id,
                                            params: redoParams,
                                        },
                                    ],
                                    undos: [
                                        {
                                            id: SetNumfmtMutation.id,
                                            params: undoParams,
                                        },
                                    ],
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
                                new Observable<ISetNumfmtMutationParams>((subscribe) => {
                                    disposableCollection.add(
                                        this._commandService.onCommandExecuted((commandInfo) => {
                                            if (commandInfo.id === SetNumfmtMutation.id) {
                                                subscribe.next(commandInfo.params as ISetNumfmtMutationParams);
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
                                        map((commandInfo) => commandInfo.values),
                                        bufferTime(300), // updating the listener moves to the next queue
                                        map((values) =>
                                            values.reduce((pre, cur) => {
                                                pre.push(...cur);
                                                return pre;
                                            }, [])
                                        ),
                                        filter((values) => !!values.length)
                                    )
                                    .subscribe((values) => {
                                        values.forEach((value) => {
                                            const { row, col } = value;
                                            const key = `${row}_${col}`;
                                            const disposable = disposableMap.get(key);
                                            disposableMap.delete(key);
                                            disposable && disposable.dispose();
                                            if (value.pattern) {
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
                                    })
                            )
                        );
                    })
            )
        );
    }
}

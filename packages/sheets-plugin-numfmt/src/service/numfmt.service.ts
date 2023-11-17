import numfmt from '@univerjs/base-numfmt-engine';
import {
    EffectRefRangeParams,
    EffectRefRangId,
    handleDeleteRangeMoveLeft,
    handleDeleteRangeMoveUp,
    handleInsertCol,
    handleInsertRangeMoveDown,
    handleInsertRangeMoveRight,
    handleInsertRow,
    handleIRemoveCol,
    handleIRemoveRow,
    handleMoveRange,
    RefRangeService,
    runRefRangeMutations,
    SetRangeValuesCommand,
} from '@univerjs/base-sheets';
import {
    CellValueType,
    Disposable,
    DisposableCollection,
    ICommandService,
    INTERCEPTOR_POINT,
    IUniverInstanceService,
    LifecycleStages,
    Nullable,
    ObjectMatrix,
    OnLifecycle,
    SheetInterceptorService,
    ThemeService,
    toDisposable,
} from '@univerjs/core';
import { SheetSkeletonManagerService } from '@univerjs/ui-plugin-sheets';
import { IDisposable, Inject, Injector } from '@wendellhu/redi';
import { Observable } from 'rxjs';
import { bufferTime, distinctUntilChanged, filter, map, switchMap } from 'rxjs/operators';

import { NumfmtItem } from '../base/types';
import {
    factorySetNumfmtUndoMutation,
    SetNumfmtMutation,
    SetNumfmtMutationParams,
} from '../commands/mutations/set.numfmt.mutation';
import { getPatternPreview, getPatternType } from '../utils/pattern';

type NumfmtItemWithCache = NumfmtItem & {
    // when change parameters or pattern, the cache is cleared follow mutation execute
    _cache?: {
        result: any;
        parameters: number; // The parameter that was last calculated
    };
};

const createCollectEffectMutation = () => {
    type Config = { workbookId: string; worksheetId: string; row: number; col: number; value: Nullable<NumfmtItem> };
    let list: Config[] = [];
    const add = (workbookId: string, worksheetId: string, row: number, col: number, value: Nullable<NumfmtItem>) =>
        list.push({ workbookId, worksheetId, row, col, value });
    const getEffects = () => list;
    const clean = () => {
        list = [];
    };
    return {
        add,
        getEffects,
        clean,
    };
};
@OnLifecycle(LifecycleStages.Ready, NumfmtService)
export class NumfmtService extends Disposable {
    numfmtModel: Map<string, ObjectMatrix<NumfmtItemWithCache>> = new Map();
    // collect effect mutations when edit end and push this to  commands stack in next commands progress
    collectEffectMutation = createCollectEffectMutation();

    constructor(
        @Inject(SheetInterceptorService) private _sheetInterceptorService: SheetInterceptorService,
        @Inject(ThemeService) private _themeService: ThemeService,
        @Inject(Injector) private _injector: Injector,
        @Inject(IUniverInstanceService) private _univerInstanceService: IUniverInstanceService,
        @Inject(RefRangeService) private _refRangeService: RefRangeService,
        @Inject(SheetSkeletonManagerService) private _sheetSkeletonManagerService: SheetSkeletonManagerService,
        @Inject(ICommandService) private _commandService: ICommandService
    ) {
        super();
        this._initInterceptorCellContent();
        this._initInterceptorEditorStart();
        this._initInterceptorEditorEnd();
        this._initInterceptorCommands();
        this._registerRefRange();
    }

    getValue(workbookId: string, worksheetId: string, row: number, col: number) {
        const model = this._getModel(workbookId, worksheetId);
        if (!model) {
            return null;
        }
        return model.getValue(row, col);
    }

    setValue(workbookId: string, worksheetId: string, row: number, col: number, value: Nullable<NumfmtItem>) {
        let model = this._getModel(workbookId, worksheetId);
        if (!model) {
            const key = getModelKey(workbookId, worksheetId);
            model = new ObjectMatrix();
            this.numfmtModel.set(key, model);
        }
        if (value) {
            model.setValue(row, col, value);
        } else {
            model.deleteValue(row, col);
        }
    }

    private _initInterceptorCommands() {
        const self = this;
        this._sheetInterceptorService.interceptCommand({
            getMutations(command) {
                const workbookId = self._univerInstanceService.getCurrentUniverSheetInstance().getUnitId();
                const worksheetId = self._univerInstanceService
                    .getCurrentUniverSheetInstance()
                    .getActiveSheet()
                    .getSheetId();
                switch (command.id) {
                    case SetRangeValuesCommand.id: {
                        const list = self.collectEffectMutation.getEffects();
                        if (!list.length) {
                            return {
                                redos: [],
                                undos: [],
                            };
                        }
                        const redos: SetNumfmtMutationParams = {
                            workbookId,
                            worksheetId,
                            values: list.map((item) => ({
                                pattern: item.value ? item.value.pattern : '',
                                row: item.row,
                                col: item.col,
                                type: item.value?.type,
                            })),
                        };
                        const undos = factorySetNumfmtUndoMutation(self._injector, redos);
                        return {
                            redos: [{ id: SetNumfmtMutation.id, params: redos }],
                            undos: [{ id: SetNumfmtMutation.id, params: undos }],
                        };
                    }
                }
                return {
                    redos: [],
                    undos: [],
                };
            },
        });
    }

    private _initInterceptorCellContent() {
        this._sheetInterceptorService.intercept(INTERCEPTOR_POINT.CELL_CONTENT, {
            handler: (cell, location, next) => {
                const workbookId = location.workbookId;
                const sheetId = location.worksheetId;
                const key = getModelKey(workbookId, sheetId);
                const model = this.numfmtModel.get(key);
                if (!model) {
                    return next(cell);
                }
                const numfmtValue = model.getValue(location.row, location.col);
                if (!numfmtValue) {
                    return next(cell);
                }
                const originCellValue = location.worksheet.getCellRaw(location.row, location.col);
                if (!originCellValue) {
                    return next(cell);
                }
                // just handle number
                if (originCellValue.t !== CellValueType.NUMBER) {
                    return next(cell);
                }

                let numfmtRes: string = '';
                if (numfmtValue._cache && numfmtValue._cache.parameters === originCellValue.v) {
                    return numfmtValue._cache.result;
                }

                const info = getPatternPreview(numfmtValue.pattern, Number(originCellValue.v));

                numfmtRes = info.result;

                if (!numfmtRes) {
                    return next(cell);
                }

                const res = { ...cell, v: numfmtRes };

                if (info.color) {
                    const color = this._themeService.getCurrentTheme()[`${info.color}500`];

                    if (color) {
                        res.s = { cl: { rgb: color } };
                    }
                }

                numfmtValue._cache = {
                    result: res,
                    parameters: originCellValue.v as number,
                };

                return res;
            },
        });
    }

    /**
     * Process the initial values before entering the edit
     * @private
     * @memberof NumfmtService
     */
    private _initInterceptorEditorStart() {
        this._sheetInterceptorService.intercept(INTERCEPTOR_POINT.BEFORE_CELL_EDIT, {
            handler: (value, context, next) => {
                const row = context.row;
                const col = context.col;
                const numfmtCell = this.getValue(context.workbookId, context.worksheetId, row, col);
                if (numfmtCell) {
                    const type = getPatternType(numfmtCell.pattern);
                    switch (type) {
                        case 'scientific':
                        case 'percent':
                        case 'currency':
                        case 'grouped':
                        case 'number': {
                            // remove the style atr
                            const cell = context.worksheet.getCellRaw(row, col);
                            return cell ? filterAtr(cell, ['s']) : cell;
                        }
                        case 'date':
                        case 'time':
                        case 'datetime':
                        default: {
                            return next && next(value);
                        }
                    }
                }
                return next(value);
            },
        });
    }

    /**
     * Process the  values after  edit
     * @private
     * @memberof NumfmtService
     */
    private _initInterceptorEditorEnd() {
        this._sheetInterceptorService.intercept(INTERCEPTOR_POINT.AFTER_CELL_EDIT, {
            handler: (value, context, next) => {
                // clear the effect
                this.collectEffectMutation.clean();
                const currentNumfmtValue = this.getValue(
                    context.workbookId,
                    context.worksheetId,
                    context.row,
                    context.col
                );
                const clean = () => {
                    currentNumfmtValue &&
                        this.collectEffectMutation.add(
                            context.workbookId,
                            context.worksheetId,
                            context.row,
                            context.col,
                            null
                        );
                };
                if (!value?.v) {
                    clean();
                    return next(value);
                }

                const content = String(value.v);

                const dateInfo = numfmt.parseDate(content) || numfmt.parseTime(content);
                const isTranslateDate = !!dateInfo;
                if (isTranslateDate) {
                    if (dateInfo && dateInfo.z) {
                        const v = Number(dateInfo.v);
                        this.collectEffectMutation.add(
                            context.workbookId,
                            context.worksheetId,
                            context.row,
                            context.col,
                            {
                                type: 'date',
                                pattern: dateInfo.z,
                            }
                        );
                        return { ...value, v, t: CellValueType.NUMBER };
                    }
                } else if (
                    ['date', 'time', 'datetime'].includes(currentNumfmtValue?.type || '') ||
                    !isNumeric(content)
                ) {
                    clean();
                }
                return next(value);
            },
        });
    }

    private _getModel(workbookId: string, worksheetId: string) {
        const key = getModelKey(workbookId, worksheetId);
        return this.numfmtModel.get(key);
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
                        const model = this._getModel(workbookId, worksheetId);
                        const disposableMap: Map<string, IDisposable> = new Map();
                        const register = (commandInfo: EffectRefRangeParams, row: number, col: number) => {
                            const targetRange = {
                                startRow: row,
                                startColumn: col,
                                endRow: row,
                                endColumn: col,
                            };
                            const numfmtValue = this._getModel(workbookId, worksheetId)?.getValue(row, col);
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
                            const result = runRefRangeMutations(operators, targetRange);
                            if (!result) {
                                // 删除
                                const redoParams: SetNumfmtMutationParams = {
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
                            if (numfmtValue) {
                                const redoParams: SetNumfmtMutationParams = {
                                    workbookId,
                                    worksheetId,
                                    values: [
                                        { row, col },
                                        { ...numfmtValue, row: result.startRow, col: result.startColumn },
                                    ],
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
                            return { redos: [], undos: [] };
                        };
                        if (model) {
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
                        }

                        // on change
                        disposableCollection.add(
                            toDisposable(
                                new Observable<SetNumfmtMutationParams>((subscribe) => {
                                    disposableCollection.add(
                                        this._commandService.onCommandExecuted((commandInfo) => {
                                            if (commandInfo.id === SetNumfmtMutation.id) {
                                                subscribe.next(commandInfo.params as SetNumfmtMutationParams);
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
                                            if (!value.pattern) {
                                                disposable && disposable.dispose();
                                            } else {
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
                                    })
                            )
                        );
                    })
            )
        );
    }
}

const getModelKey = (workbookId: string, worksheetId: string) => `${workbookId}_${worksheetId}`;
const filterAtr = (obj: Record<any, any>, filterKey: string[]) => {
    const keys = Object.keys(obj).filter((key) => !filterKey.includes(key));
    return keys.reduce(
        (pre, cur) => {
            pre[cur] = obj[cur];
            return pre;
        },
        {} as Record<any, any>
    );
};

function isNumeric(str: string) {
    return /^-?\d+(\.\d+)?$/.test(str);
}

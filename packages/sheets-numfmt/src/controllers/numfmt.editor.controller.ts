import type { Nullable } from '@univerjs/core';
import { CellValueType, Disposable, IUniverInstanceService, LifecycleStages, OnLifecycle } from '@univerjs/core';
import numfmt from '@univerjs/engine-numfmt';
import type { INumfmtItemWithCache, ISetNumfmtMutationParams } from '@univerjs/sheets';
import {
    factorySetNumfmtUndoMutation,
    INTERCEPTOR_POINT,
    INumfmtService,
    SetNumfmtMutation,
    SetRangeValuesCommand,
    SheetInterceptorService,
} from '@univerjs/sheets';
import { Inject, Injector } from '@wendellhu/redi';

import { getPatternType } from '../utils/pattern';

const createCollectEffectMutation = () => {
    interface IConfig {
        workbookId: string;
        worksheetId: string;
        row: number;
        col: number;
        value: Nullable<INumfmtItemWithCache>;
    }
    let list: IConfig[] = [];
    const add = (
        workbookId: string,
        worksheetId: string,
        row: number,
        col: number,
        value: Nullable<INumfmtItemWithCache>
    ) => list.push({ workbookId, worksheetId, row, col, value });
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
@OnLifecycle(LifecycleStages.Rendered, NumfmtEditorController)
export class NumfmtEditorController extends Disposable {
    // collect effect mutations when edit end and push this to  commands stack in next commands progress
    private _collectEffectMutation = createCollectEffectMutation();

    constructor(
        @Inject(SheetInterceptorService) private _sheetInterceptorService: SheetInterceptorService,
        @Inject(INumfmtService) private _numfmtService: INumfmtService,
        @Inject(IUniverInstanceService) private _univerInstanceService: IUniverInstanceService,
        @Inject(Injector) private _injector: Injector
    ) {
        super();
        this._initInterceptorEditorStart();
        this._initInterceptorEditorEnd();
        this._initInterceptorCommands();
    }

    private _initInterceptorEditorStart() {
        this.disposeWithMe(
            this._sheetInterceptorService.intercept(INTERCEPTOR_POINT.BEFORE_CELL_EDIT, {
                handler: (value, context, next) => {
                    const row = context.row;
                    const col = context.col;
                    const numfmtCell = this._numfmtService.getValue(context.workbookId, context.worksheetId, row, col);
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
            })
        );
    }

    /**
     * Process the  values after  edit
     * @private
     * @memberof NumfmtService
     */
    private _initInterceptorEditorEnd() {
        this.disposeWithMe(
            this._sheetInterceptorService.intercept(INTERCEPTOR_POINT.AFTER_CELL_EDIT, {
                handler: (value, context, next) => {
                    // clear the effect
                    this._collectEffectMutation.clean();
                    const currentNumfmtValue = this._numfmtService.getValue(
                        context.workbookId,
                        context.worksheetId,
                        context.row,
                        context.col
                    );
                    const clean = () => {
                        currentNumfmtValue &&
                            this._collectEffectMutation.add(
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
                            this._collectEffectMutation.add(
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
            })
        );
    }

    private _initInterceptorCommands() {
        const self = this;
        this.disposeWithMe(
            this._sheetInterceptorService.interceptCommand({
                getMutations(command) {
                    switch (command.id) {
                        case SetRangeValuesCommand.id: {
                            const workbookId = self._univerInstanceService.getCurrentUniverSheetInstance().getUnitId();
                            const worksheetId = self._univerInstanceService
                                .getCurrentUniverSheetInstance()
                                .getActiveSheet()
                                .getSheetId();
                            const list = self._collectEffectMutation.getEffects();
                            if (!list.length) {
                                return {
                                    redos: [],
                                    undos: [],
                                };
                            }
                            const redos: ISetNumfmtMutationParams = {
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
            })
        );
    }
}

const filterAtr = (obj: Record<string, any>, filterKey: string[]) => {
    const keys = Object.keys(obj).filter((key) => !filterKey.includes(key));
    return keys.reduce(
        (pre, cur) => {
            pre[cur] = obj[cur];
            return pre;
        },
        {} as Record<string, any>
    );
};

function isNumeric(str: string) {
    return /^-?\d+(\.\d+)?$/.test(str);
}

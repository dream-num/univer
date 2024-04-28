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

import type { IRange, Nullable, Workbook } from '@univerjs/core';
import {
    CellValueType,
    Disposable,
    IUniverInstanceService,
    LifecycleStages,
    OnLifecycle,
    toDisposable,
    UniverInstanceType,
} from '@univerjs/core';
import numfmt from '@univerjs/engine-numfmt';
import type {
    INumfmtItemWithCache,
    IRemoveNumfmtMutationParams,
    ISetCellsNumfmt,
    ISetNumfmtMutationParams,
} from '@univerjs/sheets';
import {
    factoryRemoveNumfmtUndoMutation,
    factorySetNumfmtUndoMutation,
    INumfmtService,
    RemoveNumfmtMutation,
    SetNumfmtMutation,
    SetRangeValuesCommand,
    SheetInterceptorService,
    transformCellsToRange,
} from '@univerjs/sheets';
import { IEditorBridgeService } from '@univerjs/sheets-ui';
import { Inject, Injector } from '@wendellhu/redi';

import { getPatternType } from '../utils/pattern';

const createCollectEffectMutation = () => {
    interface IConfig {
        unitId: string;
        subUnitId: string;
        row: number;
        col: number;
        value: Nullable<INumfmtItemWithCache>;
    }
    let list: IConfig[] = [];
    const add = (unitId: string, subUnitId: string, row: number, col: number, value: Nullable<INumfmtItemWithCache>) =>
        list.push({ unitId, subUnitId, row, col, value });
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
        @Inject(Injector) private _injector: Injector,
        @Inject(IEditorBridgeService) private _editorBridgeService: IEditorBridgeService
    ) {
        super();
        this._initInterceptorEditorStart();
        this._initInterceptorEditorEnd();
        this._initInterceptorCommands();
    }

    private _initInterceptorEditorStart() {
        this.disposeWithMe(
            toDisposable(
                this._editorBridgeService.interceptor.intercept(
                    this._editorBridgeService.interceptor.getInterceptPoints().BEFORE_CELL_EDIT,
                    {
                        handler: (value, context, next) => {
                            const row = context.row;
                            const col = context.col;
                            const numfmtCell = this._numfmtService.getValue(
                                context.unitId,
                                context.subUnitId,
                                row,
                                col
                            );
                            if (numfmtCell) {
                                const type = getPatternType(numfmtCell.pattern);
                                switch (type) {
                                    case 'scientific':
                                    case 'percent':
                                    case 'currency':
                                    case 'grouped':
                                    case 'number': {
                                        const cell = context.worksheet.getCellRaw(row, col);
                                        return cell;
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
                    }
                )
            )
        );
    }

    /**
     * Process the  values after  edit
     * @private
     * @memberof NumfmtService
     */
    private _initInterceptorEditorEnd() {
        this.disposeWithMe(
            toDisposable(
                this._editorBridgeService.interceptor.intercept(
                    this._editorBridgeService.interceptor.getInterceptPoints().AFTER_CELL_EDIT,
                    {
                        handler: (value, context, next) => {
                            // clear the effect
                            this._collectEffectMutation.clean();
                            const currentNumfmtValue = this._numfmtService.getValue(
                                context.unitId,
                                context.subUnitId,
                                context.row,
                                context.col
                            );
                            const currentNumfmtType = (currentNumfmtValue && getPatternType(currentNumfmtValue.pattern)) ?? '';
                            const clean = () => {
                                currentNumfmtValue &&
                                    this._collectEffectMutation.add(
                                        context.unitId,
                                        context.subUnitId,
                                        context.row,
                                        context.col,
                                        null
                                    );
                            };
                            if (!value?.v) {
                                return next(value);
                            }

                            const content = String(value.v);

                            const dateInfo = numfmt.parseDate(content) || numfmt.parseTime(content);
                            const isTranslateDate = !!dateInfo;
                            if (isTranslateDate) {
                                if (dateInfo && dateInfo.z) {
                                    const v = Number(dateInfo.v);
                                    this._collectEffectMutation.add(
                                        context.unitId,
                                        context.subUnitId,
                                        context.row,
                                        context.col,
                                        {
                                            pattern: dateInfo.z,
                                        }
                                    );
                                    return { ...value, v, t: CellValueType.NUMBER };
                                }
                            } else if (
                                ['date', 'time', 'datetime'].includes(currentNumfmtType) ||
                                !isNumeric(content)
                            ) {
                                clean();
                            }
                            return next(value);
                        },
                    }
                )
            )
        );
    }

    private _initInterceptorCommands() {
        const self = this;
        this.disposeWithMe(
            this._sheetInterceptorService.interceptCommand({
                getMutations(command) {
                    switch (command.id) {
                        case SetRangeValuesCommand.id: {
                            const workbook = self._univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET)!;
                            const unitId = workbook.getUnitId();
                            const subUnitId = workbook.getActiveSheet().getSheetId();
                            const list = self._collectEffectMutation.getEffects();
                            if (!list.length) {
                                return {
                                    redos: [],
                                    undos: [],
                                };
                            }
                            const cells: ISetCellsNumfmt = list
                                .filter((item) => !!item.value?.pattern)
                                .map((item) => ({
                                    row: item.row,
                                    col: item.col,
                                    pattern: item.value!.pattern,
                                }));
                            const removeCells: IRange[] = list
                                .filter((item) => !item.value?.pattern)
                                .map((item) => ({
                                    startRow: item.row,
                                    endColumn: item.col,
                                    startColumn: item.col,
                                    endRow: item.row,
                                }));
                            const redos = [];
                            const undos = [];
                            if (cells) {
                                const redo = {
                                    id: SetNumfmtMutation.id,
                                    params: transformCellsToRange(unitId, subUnitId, cells) as ISetNumfmtMutationParams,
                                };
                                redos.push(redo);
                                undos.push(...factorySetNumfmtUndoMutation(self._injector, redo.params));
                            }
                            if (removeCells) {
                                const redo = {
                                    id: RemoveNumfmtMutation.id,
                                    params: {
                                        unitId,
                                        subUnitId,
                                        ranges: removeCells,
                                    } as IRemoveNumfmtMutationParams,
                                };
                                redos.push(redo);
                                undos.push(...factoryRemoveNumfmtUndoMutation(self._injector, redo.params));
                            }
                            return {
                                redos,
                                undos: undos.reverse(),
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

function isNumeric(str: string) {
    return /^-?\d+(\.\d+)?$/.test(str);
}

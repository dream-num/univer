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

import type { ICommandInfo } from '@univerjs/core';
import { CellValueType, Disposable, ICommandService, LifecycleStages, OnLifecycle, ThemeService } from '@univerjs/core';
import type { ISetArrayFormulaDataMutationParams } from '@univerjs/engine-formula';
import { FormulaDataModel, SetArrayFormulaDataMutation } from '@univerjs/engine-formula';
import { INTERCEPTOR_POINT, SheetInterceptorService } from '@univerjs/sheets';
import { getPatternPreview } from '@univerjs/sheets-numfmt';
import { Inject } from '@wendellhu/redi';

@OnLifecycle(LifecycleStages.Ready, ArrayFormulaDisplayController)
export class ArrayFormulaDisplayController extends Disposable {
    constructor(
        @ICommandService private readonly _commandService: ICommandService,
        @Inject(SheetInterceptorService) private _sheetInterceptorService: SheetInterceptorService,
        @Inject(FormulaDataModel) private readonly _formulaDataModel: FormulaDataModel,
        @Inject(ThemeService) private readonly _themeService: ThemeService
    ) {
        super();

        this._initialize();
    }

    private _initialize(): void {
        this._commandExecutedListener();

        this._initInterceptorCellContent();
    }

    private _commandExecutedListener() {
        this.disposeWithMe(
            this._commandService.onCommandExecuted((command: ICommandInfo) => {
                // Synchronous data from worker
                if (command.id !== SetArrayFormulaDataMutation.id) {
                    return;
                }

                const params = command.params as ISetArrayFormulaDataMutationParams;

                if (params == null) {
                    return;
                }

                const { arrayFormulaRange, arrayFormulaCellData } = params;
                this._formulaDataModel.setArrayFormulaRange(arrayFormulaRange);
                this._formulaDataModel.setArrayFormulaCellData(arrayFormulaCellData);
            })
        );
    }

    private _initInterceptorCellContent() {
        this.disposeWithMe(
            this._sheetInterceptorService.intercept(INTERCEPTOR_POINT.CELL_CONTENT, {
                priority: 100,
                handler: (cell, location, next) => {
                    const { unitId, subUnitId, row, col } = location;
                    const arrayFormulaCellData = this._formulaDataModel.getArrayFormulaCellData();
                    const arrayFormulaRange = this._formulaDataModel.getArrayFormulaRange();
                    const cellData = arrayFormulaCellData?.[unitId]?.[subUnitId]?.[row]?.[col];
                    const cellRange = arrayFormulaRange?.[unitId]?.[subUnitId]?.[row]?.[col];
                    if (cellData == null) {
                        return next(cell);
                    }

                    if (cellRange != null && cellRange.startRow === row && cellRange.startColumn === col) {
                        return next(cell);
                    }

                    const numfmtItemMap = this._formulaDataModel.getNumfmtItemMap();
                    const numfmtItem = numfmtItemMap[unitId]?.[subUnitId]?.[row]?.[col];

                    if (numfmtItem) {
                        const value = cellData?.v;
                        const type = cellData?.t;

                        if (value == null || type !== CellValueType.NUMBER) {
                            return next(cell);
                        }

                        const info = getPatternPreview(numfmtItem, value as number);

                        if (info.color) {
                            const colorMap = this._themeService.getCurrentTheme();
                            const color = colorMap[`${info.color}500`];
                            return {
                                ...cell,
                                v: info.result,
                                t: CellValueType.STRING,
                                s: { cl: { rgb: color } },
                            };
                        }

                        return {
                            ...cell,
                            v: info.result,
                            t: CellValueType.STRING,
                        };
                    }

                    return next({ ...cell, ...cellData });
                },
            })
        );
    }
}

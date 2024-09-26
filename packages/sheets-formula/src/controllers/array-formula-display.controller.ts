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

import { CellValueType, Disposable, ICommandService, Inject, InterceptorEffectEnum, LifecycleStages, OnLifecycle, ThemeService } from '@univerjs/core';
import { FormulaDataModel, SetArrayFormulaDataMutation, stripErrorMargin } from '@univerjs/engine-formula';
import { INTERCEPTOR_POINT, SheetInterceptorService } from '@univerjs/sheets';
import type { ICommandInfo } from '@univerjs/core';
import type { ISetArrayFormulaDataMutationParams } from '@univerjs/engine-formula';

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
                effect: InterceptorEffectEnum.Value,
                handler: (cell, location, next) => {
                    const { unitId, subUnitId, row, col } = location;
                    const arrayFormulaCellData = this._formulaDataModel.getArrayFormulaCellData();
                    const cellData = arrayFormulaCellData?.[unitId]?.[subUnitId]?.[row]?.[col];
                    if (cellData == null) {
                        return next(cell);
                    }

                    // The cell in the upper left corner of the array formula also triggers the default value determination
                    if (cellData.v == null && cellData.t == null) {
                        return next({
                            ...cell,
                            v: 0, // Default value for empty cell
                            t: CellValueType.NUMBER,
                        });
                    }

                    // Dealing with precision issues
                    if (cell?.t === CellValueType.NUMBER && typeof cell?.v === 'number') {
                        return next({
                            ...cell,
                            v: stripErrorMargin(cell.v),
                        });
                    }

                    return next({
                        ...cell,
                        v: cellData.v,
                        t: cellData.t,
                    });
                },
            })
        );
    }
}

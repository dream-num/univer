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

import type { ICellData } from '@univerjs/core';
import { CellValueType, Disposable, Inject, InterceptorEffectEnum, isFormulaId, isFormulaString } from '@univerjs/core';
import { FormulaDataModel } from '@univerjs/engine-formula';
import { IRenderManagerService } from '@univerjs/engine-render';
import { INTERCEPTOR_POINT, SheetInterceptorService } from '@univerjs/sheets';
import { SheetSkeletonManagerService } from '@univerjs/sheets-ui';
import { SheetsShowFormulasService } from '../services/show-formulas.service';

/**
 * Renders formula text instead of computed values for worksheets where "Show Formulas"
 * is enabled, and refreshes the affected render unit when the state changes.
 */
export class ShowFormulasRenderController extends Disposable {
    constructor(
        @Inject(SheetsShowFormulasService) private readonly _showFormulasService: SheetsShowFormulasService,
        @Inject(FormulaDataModel) private readonly _formulaDataModel: FormulaDataModel,
        @Inject(SheetInterceptorService) private readonly _sheetInterceptorService: SheetInterceptorService,
        @IRenderManagerService private readonly _renderManagerService: IRenderManagerService
    ) {
        super();

        this._initInterceptor();
        this._initRefresh();
    }

    private _initInterceptor(): void {
        this.disposeWithMe(this._sheetInterceptorService.intercept(INTERCEPTOR_POINT.CELL_CONTENT, {
            // Run after the built-in value interceptors (array formula 100, number format 10,
            // data validation 9) so the formula text is what ends up on screen while their
            // style contributions are kept. Must stay above the default -1 terminator.
            priority: 1,
            effect: InterceptorEffectEnum.Value,
            handler: (cell, pos, next) => {
                const { unitId, subUnitId, row, col, rawData } = pos;
                if (!rawData || !this._showFormulasService.isEnabled(unitId, subUnitId)) {
                    return next(cell);
                }

                if (!isFormulaString(rawData.f) && !isFormulaId(rawData.si)) {
                    return next(cell);
                }

                const formula = this._formulaDataModel.getFormulaStringByCell(row, col, subUnitId, unitId);
                if (formula == null) {
                    return next(cell);
                }

                const shown: ICellData = { ...(cell ?? rawData), v: formula, t: CellValueType.STRING };
                delete shown.p;

                return next(shown);
            },
        }));
    }

    private _initRefresh(): void {
        this.disposeWithMe(this._showFormulasService.changed$.subscribe(({ unitId, subUnitId }) => {
            const render = this._renderManagerService.getRenderUnitById(unitId);
            if (!render) {
                return;
            }

            // Inactive worksheets rebuild their skeleton when they become active.
            const skeletonManagerService = render.with(SheetSkeletonManagerService);
            if (skeletonManagerService.getCurrentParam()?.sheetId !== subUnitId) {
                return;
            }

            skeletonManagerService.reCalculate();
            render.mainComponent?.makeForceDirty(true);
        }));
    }
}

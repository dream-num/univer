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

import type { ErrorType } from '@univerjs/engine-formula';
import { CellValueType, Disposable, Inject, InterceptorEffectEnum, isDefaultFormat, isRealNum, LocaleService, numfmt, RegionService } from '@univerjs/core';
import { getErrorAliases, getFunctionAliases } from '@univerjs/engine-formula';
import { extractBooleanValue } from '../basics/cell-value';
import { INTERCEPTOR_POINT } from '../services/sheet-interceptor/interceptor-const';
import { SheetInterceptorService } from '../services/sheet-interceptor/sheet-interceptor.service';

export class NumberCellDisplayController extends Disposable {
    constructor(
        @Inject(SheetInterceptorService) private _sheetInterceptorService: SheetInterceptorService,
        @Inject(RegionService) private readonly _regionService: RegionService,
        @Inject(LocaleService) private readonly _localeService: LocaleService
    ) {
        super();

        this._initialize();
    }

    private _initialize(): void {
        this._initInterceptorCellContent();
    }

    private _initInterceptorCellContent() {
        this.disposeWithMe(
            this._sheetInterceptorService.intercept(INTERCEPTOR_POINT.CELL_CONTENT, {
                displayOnly: true,
                priority: 11,
                effect: InterceptorEffectEnum.Value | InterceptorEffectEnum.Style,
                handler: (cell, location, next) => {
                    if (!cell) {
                        return next(cell);
                    }

                    if (cell.t === CellValueType.BOOLEAN) {
                        const token = extractBooleanValue(cell.v) ? 'TRUE' : 'FALSE';
                        const label = getFunctionAliases(this._localeService)[token];
                        if (label) return next({ ...cell, v: label });
                    } else if (cell.t === CellValueType.STRING && typeof cell.v === 'string' && cell.v.startsWith('#')) {
                        const label = getErrorAliases(this._localeService)[cell.v as ErrorType];
                        if (label) return next({ ...cell, v: label });
                    }

                    // Skip if the cell contains a numfmt pattern
                    const style = location.workbook.getStyles().getStyleByCell(cell);
                    if (!isDefaultFormat(style?.n?.pattern)) {
                        return next(cell);
                    }

                    // Dealing with precision issues
                    // Need to be compatible with the case where v is a string but the cell type is a number
                    // e.g.
                    // "v": "123413.23000000001",
                    // "t": 2,
                    if (cell?.t === CellValueType.NUMBER && cell.v !== undefined && cell.v !== null && isRealNum(cell.v)) {
                        if (!cell || cell === location.rawData) {
                            cell = { ...location.rawData };
                        }

                        const value = Number(cell.v);
                        const display = numfmt.format('General', value, { region: this._regionService.getCurrentRegion() });
                        cell.v = display === String(value) ? value : display;

                        return next(cell);
                    }

                    return next(cell);
                },
            })
        );
    }
}

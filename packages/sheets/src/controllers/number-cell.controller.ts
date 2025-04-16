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

import { CellValueType, Disposable, Inject, InterceptorEffectEnum, isRealNum } from '@univerjs/core';
import { stripErrorMargin } from '@univerjs/engine-formula';
import { INTERCEPTOR_POINT } from '../services/sheet-interceptor/interceptor-const';
import { SheetInterceptorService } from '../services/sheet-interceptor/sheet-interceptor.service';

export class NumberCellDisplayController extends Disposable {
    constructor(
        @Inject(SheetInterceptorService) private _sheetInterceptorService: SheetInterceptorService
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
                priority: 11,
                effect: InterceptorEffectEnum.Value | InterceptorEffectEnum.Style,
                handler: (cell, location, next) => {
                    // Skip if the cell contains a numfmt pattern
                    const style = location.workbook.getStyles().getStyleByCell(cell);
                    if (style?.n?.pattern) {
                        return next({ ...cell });
                    }

                    // Dealing with precision issues
                    // Need to be compatible with the case where v is a string but the cell type is a number
                    // e.g.
                    // "v": "123413.23000000001",
                    // "t": 2,
                    if (cell?.t === CellValueType.NUMBER && cell.v !== undefined && cell.v !== null && isRealNum(cell.v)) {
                        return next({
                            ...cell,
                            v: stripErrorMargin(Number(cell.v)),
                        });
                    }

                    return next({ ...cell });
                },
            })
        );
    }
}

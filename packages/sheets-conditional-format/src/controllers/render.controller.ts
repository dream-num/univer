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

import { LifecycleStages, OnLifecycle } from '@univerjs/core';
import { INTERCEPTOR_POINT, SheetInterceptorService } from '@univerjs/sheets';
import { Inject } from '@wendellhu/redi';
import { ConditionalFormatService } from '../services/conditional-format.service';

@OnLifecycle(LifecycleStages.Rendered, RenderController)
export class RenderController {
    constructor(@Inject(SheetInterceptorService) private _sheetInterceptorService: SheetInterceptorService,
        @Inject(ConditionalFormatService) private _conditionalFormatService: ConditionalFormatService) {
        this._initHighlightCell();
    }

    _initHighlightCell() {
        this._sheetInterceptorService.intercept(INTERCEPTOR_POINT.CELL_CONTENT, { priority: 99, handler: (cell, context, next) => {
            const result = this._conditionalFormatService.composeStyle(context.unitId, context.subUnitId, context.row, context.col);

            if (!result) {
                return next(cell);
            }

            if (result.style) {
                if (result.style.b) {
                    const s = (typeof cell?.s === 'object' && cell.s !== null) ? { ...cell.s } : {};
                    s.bl = 1;
                    return next({ ...cell, s });
                }
            }

            return next(cell);
        },
        });
    }
}

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

import { LifecycleStages, OnLifecycle, RxDisposable } from '@univerjs/core';
import { Inject } from '@wendellhu/redi';
import { INTERCEPTOR_POINT, SheetInterceptorService } from '@univerjs/sheets';
import { extractFormulaError, extractFormulaNumber } from './utils/utils';

const FORMULA_ERROR_MARK = {
    tl: {
        size: 6,
        color: '#409f11',
    },
};

@OnLifecycle(LifecycleStages.Rendered, FormulaRenderManagerController)
export class FormulaRenderManagerController extends RxDisposable {
    constructor(
        @Inject(SheetInterceptorService) private readonly _sheetInterceptorService: SheetInterceptorService
    ) {
        super();

        this._init();
    }

    private _init() {
        this.disposeWithMe(this._sheetInterceptorService.intercept(
            INTERCEPTOR_POINT.CELL_CONTENT,
            {
                handler: (cell, pos, next) => {
                    // Dealing with precision issues
                    const formulaNumber = extractFormulaNumber(cell);
                    if (formulaNumber !== null) {
                        return next({
                            ...cell,
                            v: formulaNumber,
                        });
                    }

                    const errorType = extractFormulaError(cell);
                    if (!errorType) {
                        return next(cell);
                    }

                    return next({
                        ...cell,
                        markers: {
                            ...cell?.markers,
                            ...FORMULA_ERROR_MARK,
                        },
                    });
                },
                priority: 10,
            }
        ));
    }
}


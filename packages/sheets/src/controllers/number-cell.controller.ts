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

import { CellValueType, Disposable, ICommandService, LifecycleStages, OnLifecycle, ThemeService } from '@univerjs/core';
import { stripErrorMargin } from '@univerjs/engine-formula';
import { INTERCEPTOR_POINT, SheetInterceptorService } from '@univerjs/sheets';
import { Inject } from '@wendellhu/redi';

@OnLifecycle(LifecycleStages.Ready, NumberCellDisplayController)
export class NumberCellDisplayController extends Disposable {
    constructor(
        @ICommandService private readonly _commandService: ICommandService,
        @Inject(SheetInterceptorService) private _sheetInterceptorService: SheetInterceptorService,
        @Inject(ThemeService) private readonly _themeService: ThemeService
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
                handler: (cell, location, next) => {
                    // Dealing with precision issues
                    if (cell?.t === CellValueType.NUMBER && typeof cell?.v === 'number') {
                        return next({
                            ...cell,
                            v: stripErrorMargin(cell.v),
                        });
                    }

                    return next({ ...cell });
                },
            })
        );
    }
}

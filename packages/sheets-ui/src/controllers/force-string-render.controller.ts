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

import type { Workbook } from '@univerjs/core';
import type { IRenderContext, IRenderModule } from '@univerjs/engine-render';
import { CellValueType, Inject, InterceptorEffectEnum, isRealNum, RxDisposable } from '@univerjs/core';
import { isTextFormat } from '@univerjs/engine-numfmt';
import { INTERCEPTOR_POINT, SheetInterceptorService } from '@univerjs/sheets';
import { SheetSkeletonManagerService } from '../services/sheet-skeleton-manager.service';

export class ForceStringRenderController extends RxDisposable implements IRenderModule {
    constructor(
        private readonly _context: IRenderContext<Workbook>,
        @Inject(SheetSkeletonManagerService) private readonly _sheetSkeletonManagerService: SheetSkeletonManagerService,
        @Inject(SheetInterceptorService) private readonly _sheetInterceptorService: SheetInterceptorService
    ) {
        super();

        this._initViewModelIntercept();
    }

    private _initViewModelIntercept() {
        const FORCE_STRING_MARK = {
            tl: {
                size: 6,
                color: '#409f11',
            },
        };

        this.disposeWithMe(
            this._sheetInterceptorService.intercept(
                INTERCEPTOR_POINT.CELL_CONTENT,
                {
                    priority: 10,
                    effect: InterceptorEffectEnum.Style,
                    handler: (cell, pos, next) => {
                        const skeleton = this._sheetSkeletonManagerService.getCurrentParam()?.skeleton;
                        if (!skeleton) {
                            return next(cell);
                        }

                        const cellRaw = pos.worksheet.getCellRaw(pos.row, pos.col);

                        if (!cellRaw || cellRaw.v === null || cellRaw.v === undefined) {
                            return next(cell);
                        }

                        if ((cell?.t === CellValueType.FORCE_STRING || cell?.t === CellValueType.STRING) && isRealNum(cellRaw.v)) {
                            // If the cell is in text format, follow the logic of number format
                            const cellStyle = pos.workbook.getStyles().get(cellRaw.s);
                            if (isTextFormat(cellStyle?.n?.pattern)) {
                                return next(cell);
                            }

                            return next({
                                ...cell,
                                markers: {
                                    ...cell?.markers,
                                    ...FORCE_STRING_MARK,
                                },
                            });
                        }

                        return next(cell);
                    },
                }
            )
        );
    }
}

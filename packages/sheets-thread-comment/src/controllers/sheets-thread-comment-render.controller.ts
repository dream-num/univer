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

import { Disposable, LifecycleStages, OnLifecycle } from '@univerjs/core';
import { INTERCEPTOR_POINT, SheetInterceptorService } from '@univerjs/sheets';
import { Inject } from '@wendellhu/redi';
import { SheetsThreadCommentModel } from '../models/sheets-thread-comment.model';

@OnLifecycle(LifecycleStages.Ready, SheetsThreadCommentRenderController)
export class SheetsThreadCommentRenderController extends Disposable {
    constructor(
        @Inject(SheetInterceptorService) private readonly _sheetInterceptorService: SheetInterceptorService,
        @Inject(SheetsThreadCommentModel) private readonly _sheetsThreadCommentModel: SheetsThreadCommentModel
    ) {
        super();
        this._initViewModelIntercept();
    }

    private _initViewModelIntercept() {
        this.disposeWithMe(
            this._sheetInterceptorService.intercept(
                INTERCEPTOR_POINT.CELL_CONTENT,
                {
                    handler: (cell, pos, next) => {
                        const { row, col, unitId, subUnitId } = pos;
                        if (this._sheetsThreadCommentModel.showCommentMarker(unitId, subUnitId, row, col)) {
                            return next({
                                ...cell,
                                markers: {
                                    ...cell?.markers,
                                    tr: {
                                        color: '#FFBD37',
                                        size: 6,
                                    },
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

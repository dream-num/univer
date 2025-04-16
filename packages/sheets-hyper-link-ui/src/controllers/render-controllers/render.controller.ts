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
import { Disposable, Inject, InterceptorEffectEnum } from '@univerjs/core';
import { INTERCEPTOR_POINT, SheetInterceptorService } from '@univerjs/sheets';
import { HyperLinkModel } from '@univerjs/sheets-hyper-link';
import { debounceTime } from 'rxjs';

export class SheetsHyperLinkRenderController extends Disposable implements IRenderModule {
    constructor(
        private readonly _context: IRenderContext<Workbook>,
        @Inject(HyperLinkModel) private readonly _hyperLinkModel: HyperLinkModel
    ) {
        super();
        this._initSkeletonChange();
    }

    private _initSkeletonChange() {
        const markSkeletonDirty = () => {
            this._context.mainComponent?.makeForceDirty();
        };

        this.disposeWithMe(this._hyperLinkModel.linkUpdate$.pipe(debounceTime(16)).subscribe(() => {
            markSkeletonDirty();
        }));
    }
}

export class SheetsHyperLinkRenderManagerController extends Disposable {
    constructor(
        @Inject(SheetInterceptorService) private readonly _sheetInterceptorService: SheetInterceptorService,
        @Inject(HyperLinkModel) private readonly _hyperLinkModel: HyperLinkModel
    ) {
        super();

        this._initViewModelIntercept();
    }

    private _initViewModelIntercept() {
        this.disposeWithMe(
            this._sheetInterceptorService.intercept(
                INTERCEPTOR_POINT.CELL_CONTENT,
                {
                    effect: InterceptorEffectEnum.Value,
                    priority: 100,
                    handler: (cell, pos, next) => {
                        const { row, col, unitId, subUnitId } = pos;
                        const link = this._hyperLinkModel.getHyperLinkByLocation(unitId, subUnitId, row, col);

                        if (link) {
                            return next({
                                ...cell,
                                linkUrl: link.payload,
                                linkId: link.id,
                            });
                        }

                        return next(cell);
                    },
                }
            )
        );
    }
}

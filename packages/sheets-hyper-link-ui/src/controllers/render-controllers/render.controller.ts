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

import type { Workbook } from '@univerjs/core';
import { BooleanNumber, Disposable, LifecycleStages, OnLifecycle, ThemeService } from '@univerjs/core';
import { INTERCEPTOR_POINT, SheetInterceptorService } from '@univerjs/sheets';
import { Inject } from '@wendellhu/redi';
import { SheetSkeletonManagerService } from '@univerjs/sheets-ui';
import type { IRenderContext, IRenderModule, Spreadsheet } from '@univerjs/engine-render';
import { IRenderManagerService } from '@univerjs/engine-render';
import { HyperLinkModel } from '@univerjs/sheets-hyper-link';

export class SheetsHyperLinkRenderController extends Disposable implements IRenderModule {
    constructor(
        private readonly _context: IRenderContext<Workbook>,
        @Inject(HyperLinkModel) private readonly _hyperLinkModel: HyperLinkModel,
        @Inject(SheetSkeletonManagerService) private readonly _sheetSkeletonManagerService: SheetSkeletonManagerService,
        @IRenderManagerService private readonly _renderManagerService: IRenderManagerService
    ) {
        super();
        this._initSkeletonChange();
    }

    private _initSkeletonChange() {
        const markSkeletonDirty = () => {
            const workbook = this._context.unit;
            const unitId = workbook.getUnitId();
            const subUnitId = workbook.getActiveSheet().getSheetId();
            const skeleton = this._sheetSkeletonManagerService.getOrCreateSkeleton({ sheetId: subUnitId });
            const currentRender = this._renderManagerService.getRenderById(unitId);

            skeleton?.makeDirty(true);
            skeleton?.calculate();

            if (currentRender) {
                (currentRender.mainComponent as Spreadsheet).makeForceDirty();
            }
        };

        this.disposeWithMe(this._hyperLinkModel.linkUpdate$.subscribe(() => {
            markSkeletonDirty();
        }));
    }
}

@OnLifecycle(LifecycleStages.Ready, SheetsHyperLinkRenderManagerController)
export class SheetsHyperLinkRenderManagerController extends Disposable {
    constructor(
        @Inject(SheetInterceptorService) private readonly _sheetInterceptorService: SheetInterceptorService,
        @Inject(HyperLinkModel) private readonly _hyperLinkModel: HyperLinkModel,
        @Inject(ThemeService) private readonly _themeService: ThemeService
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
                        const link = this._hyperLinkModel.getHyperLinkByLocation(unitId, subUnitId, row, col);
                        const styleSheet = this._themeService.getCurrentTheme();

                        if (link) {
                            return next({
                                ...cell,
                                interceptorStyle: {
                                    ul: {
                                        s: BooleanNumber.TRUE,
                                    },
                                    cl: {
                                        rgb: styleSheet.blue500,
                                    },
                                },
                            });
                        }

                        return next(cell);
                    },
                    priority: 100,
                }
            )
        );
    }
}

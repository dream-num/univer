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
import { Disposable, IUniverInstanceService, LifecycleStages, OnLifecycle, UniverInstanceType } from '@univerjs/core';
import { INTERCEPTOR_POINT, SheetInterceptorService } from '@univerjs/sheets';
import { Inject } from '@wendellhu/redi';
import { SheetSkeletonManagerService } from '@univerjs/sheets-ui';
import type { Spreadsheet } from '@univerjs/engine-render';
import { IRenderManagerService } from '@univerjs/engine-render';
import { SheetsThreadCommentModel } from '@univerjs/sheets-thread-comment-base';

@OnLifecycle(LifecycleStages.Ready, SheetsThreadCommentRenderController)
export class SheetsThreadCommentRenderController extends Disposable {
    constructor(
        @Inject(SheetInterceptorService) private readonly _sheetInterceptorService: SheetInterceptorService,
        @Inject(SheetsThreadCommentModel) private readonly _sheetsThreadCommentModel: SheetsThreadCommentModel,
        @IUniverInstanceService private readonly _univerInstanceService: IUniverInstanceService,
        @IRenderManagerService private readonly _renderManagerService: IRenderManagerService
    ) {
        super();
        this._initViewModelIntercept();
        this._initSkeletonChange();
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
                    priority: 100,
                }
            )
        );
    }

    private _initSkeletonChange() {
        const markSkeletonDirty = () => {
            const workbook = this._univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET);
            if (!workbook) return;

            const unitId = workbook.getUnitId();
            const subUnitId = workbook.getActiveSheet().getSheetId();
            const currentRender = this._renderManagerService.getRenderById(unitId);
            const skeleton = currentRender?.with(SheetSkeletonManagerService).getOrCreateSkeleton({ sheetId: subUnitId });

            skeleton?.makeDirty(true);
            skeleton?.calculate();

            if (currentRender) {
                (currentRender.mainComponent as Spreadsheet).makeForceDirty();
            }
        };

        this.disposeWithMe(this._sheetsThreadCommentModel.commentUpdate$.subscribe(() => {
            markSkeletonDirty();
        }));
    }
}

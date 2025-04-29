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
import { Disposable, Inject, InterceptorEffectEnum, IUniverInstanceService, UniverInstanceType } from '@univerjs/core';
import { IRenderManagerService } from '@univerjs/engine-render';
import { INTERCEPTOR_POINT, SheetInterceptorService } from '@univerjs/sheets';
import { SheetsNoteModel } from '@univerjs/sheets-note';
import { debounceTime } from 'rxjs';

export class SheetsCellContentController extends Disposable {
    constructor(
        @Inject(SheetInterceptorService) private readonly _sheetInterceptorService: SheetInterceptorService,
        @Inject(SheetsNoteModel) private readonly _sheetsNoteModel: SheetsNoteModel,
        @IRenderManagerService private readonly _renderManagerService: IRenderManagerService,
        @IUniverInstanceService private readonly _univerInstanceService: IUniverInstanceService
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
                    effect: InterceptorEffectEnum.Style,
                    handler: (cell, pos, next) => {
                        const { row, col, unitId, subUnitId } = pos;
                        const note = this._sheetsNoteModel.getNote(unitId, subUnitId, row, col);
                        if (note) {
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
            const currentRender = this._renderManagerService.getRenderById(unitId);
            currentRender?.mainComponent?.makeForceDirty();
        };

        this.disposeWithMe(this._sheetsNoteModel.change$.pipe(debounceTime(16)).subscribe(() => {
            markSkeletonDirty();
        }));
    }
}

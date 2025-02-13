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
import type { IValidStatusChange } from '@univerjs/sheets-data-validation';
import { bufferDebounceTime, Disposable, Inject } from '@univerjs/core';
import { SheetDataValidationModel } from '@univerjs/sheets-data-validation';
import { SheetSkeletonManagerService } from '@univerjs/sheets-ui';

export class SheetsDataValidationReRenderController extends Disposable implements IRenderModule {
    constructor(
        private readonly _context: IRenderContext<Workbook>,
        @Inject(SheetDataValidationModel) private readonly _sheetDataValidationModel: SheetDataValidationModel,
        @Inject(SheetSkeletonManagerService) private readonly _sheetSkeletonManagerService: SheetSkeletonManagerService
    ) {
        super();
        this._initSkeletonChange();
    }

    private _initSkeletonChange() {
        const reRender = (values: IValidStatusChange[]) => {
            if (!values.length) {
                return;
            }
            const sheetIds = new Set<string>();
            values.forEach((value) => {
                sheetIds.add(value.subUnitId);
            });
            sheetIds.forEach((sheetId) => {
                this._sheetSkeletonManagerService.getSkeletonParam(sheetId)?.skeleton.makeDirty(true);
            });
            this._context.mainComponent?.makeForceDirty();
        };

        this.disposeWithMe(this._sheetDataValidationModel.validStatusChange$.pipe(bufferDebounceTime(16)).subscribe(reRender));
    }
}

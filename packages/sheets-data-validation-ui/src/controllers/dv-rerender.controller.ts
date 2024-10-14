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
import type { IRenderContext, IRenderModule } from '@univerjs/engine-render';
import { Disposable, Inject } from '@univerjs/core';
import { SheetDataValidationModel } from '@univerjs/sheets-data-validation';
import { debounceTime } from 'rxjs';

export class SheetsDataValidationReRenderController extends Disposable implements IRenderModule {
    constructor(
        private readonly _context: IRenderContext<Workbook>,
        @Inject(SheetDataValidationModel) private readonly _sheetDataValidationModel: SheetDataValidationModel
    ) {
        super();
        this._initSkeletonChange();
    }

    private _initSkeletonChange() {
        const reRender = () => {
            this._context.mainComponent?.makeForceDirty();
        };

        // this.disposeWithMe(this._sheetDataValidationModel.ruleChange$.pipe(debounceTime(16)).subscribe(reRender));
        this.disposeWithMe(this._sheetDataValidationModel.validStatusChange$.pipe(debounceTime(16)).subscribe(reRender));
    }
}

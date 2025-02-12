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

import { Disposable, Inject, Injector, ObjectMatrix } from '@univerjs/core';
import { IAutoFillService } from '@univerjs/sheets-ui';
import { resizeImageByCell } from './sheet-cell-image.controller';

export class SheetCellImageAutofillController extends Disposable {
    constructor(
        @Inject(IAutoFillService) private readonly _autoFillService: IAutoFillService,
        @Inject(Injector) private readonly _injector: Injector
    ) {
        super();

        this._initAutoFillHooks();
    }

    private _initAutoFillHooks(): void {
        this.disposeWithMe(
            this._autoFillService.addHook({
                id: 'sheet-cell-image-autofill',
                onBeforeSubmit: (location, direction, applyType, cellValue) => {
                    new ObjectMatrix(cellValue).forValue((row, col, cell) => {
                        resizeImageByCell(this._injector, { unitId: location.unitId, subUnitId: location.subUnitId, row, col }, cell);
                    });
                },
            })
        );
    }
}

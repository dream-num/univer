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

import type { Ctor } from '@univerjs/core';
import type { BaseSheetDataValidatorView } from '../views/validator-views/sheet-validator-view';
import { Inject, Injector, RxDisposable } from '@univerjs/core';
import { DataValidatorRegistryService } from '@univerjs/data-validation';
import { CheckboxValidatorView } from '../views/validator-views/checkbox-validator-view';
import { CustomFormulaValidatorView } from '../views/validator-views/custom-validator-view';
import { DateValidatorView } from '../views/validator-views/date-validator-view';
import { DecimalValidatorView } from '../views/validator-views/decimal-validator-view';
import { ListMultipleValidatorView } from '../views/validator-views/list-multiple-view';
import { ListValidatorView } from '../views/validator-views/list-validator-view';
import { TextLengthValidatorView } from '../views/validator-views/text-length-validator.view';
import { WholeValidatorView } from '../views/validator-views/whole-validator-view';

export class SheetsDataValidationUIController extends RxDisposable {
    constructor(
        @Inject(Injector) private readonly _injector: Injector,
        @Inject(DataValidatorRegistryService) private readonly _dataValidatorRegistryService: DataValidatorRegistryService
    ) {
        super();

        this._registerValidatorViews();
    }

    private _registerValidatorViews(): void {
        ([
            DecimalValidatorView,
            WholeValidatorView,
            TextLengthValidatorView,
            DateValidatorView,
            CheckboxValidatorView,
            ListValidatorView,
            ListMultipleValidatorView,
            CustomFormulaValidatorView,
        ] as Ctor<BaseSheetDataValidatorView>[]).forEach((v) => {
            const view = this._injector.createInstance(v);
            const validator = this._dataValidatorRegistryService.getValidatorItem(view.id);
            if (validator) {
                validator.formulaInput = view.formulaInput;
                validator.canvasRender = view.canvasRender;
                validator.dropdownType = view.dropdownType;
                validator.optionsInput = view.optionsInput;
            }
        });
    }
}

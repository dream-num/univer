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

import type { DataValidatorDropdownType, IBaseDataValidationWidget } from '@univerjs/data-validation';
import { Inject, Injector, type Nullable } from '@univerjs/core';
import { LIST_FORMULA_INPUT_NAME } from '../components/formula-input';

/**
 * This is the base class for all sheet data validator views. It is used to extend {@link BaseDataValidator}.
 */
export abstract class BaseSheetDataValidatorView {
    canvasRender: Nullable<IBaseDataValidationWidget> = null;
    dropdownType: DataValidatorDropdownType | undefined = undefined;
    optionsInput: string | undefined = undefined;

    abstract id: string;
    formulaInput: string = LIST_FORMULA_INPUT_NAME;

    constructor(
        @Inject(Injector) protected readonly injector: Injector
    ) {
        // empty
    }
}

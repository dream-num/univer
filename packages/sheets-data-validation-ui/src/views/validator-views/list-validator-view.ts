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

import type { IBaseDataValidationWidget } from '@univerjs/data-validation';
import { DataValidationType, type Nullable } from '@univerjs/core';
import { LIST_DROPDOWN_KEY } from '../components';
import { LIST_FORMULA_INPUT_NAME } from '../components/formula-input';
import { ListRenderModeInput } from '../components/render-mode';
import { DropdownWidget } from '../widgets/dropdown-widget';
import { BaseSheetDataValidatorView } from './sheet-validator-view';

export class ListValidatorView extends BaseSheetDataValidatorView {
    override id = DataValidationType.LIST;
    override canvasRender: Nullable<IBaseDataValidationWidget> = this.injector.createInstance(DropdownWidget);
    override dropdown: string | undefined = LIST_DROPDOWN_KEY;
    override optionsInput: string | undefined = ListRenderModeInput.componentKey;
    override formulaInput: string = LIST_FORMULA_INPUT_NAME;
}

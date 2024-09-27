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

import { DataValidationType } from '@univerjs/core';
import { DropdownMultipleWidget } from '../widgets/dropdown-multiple-widget';
import { ListValidator } from './list-validator';

export class ListMultipleValidator extends ListValidator {
    override id: string = DataValidationType.LIST_MULTIPLE;
    override title: string = 'dataValidation.listMultiple.title';
    override canvasRender = this.injector.createInstance(DropdownMultipleWidget);

    override skipDefaultFontRender = () => {
        return true;
    };
}

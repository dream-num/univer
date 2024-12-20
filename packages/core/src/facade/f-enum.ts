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

import { DataValidationErrorStyle } from '../types/enum/data-validation-error-style';
import { DataValidationOperator } from '../types/enum/data-validation-operator';
import { DataValidationRenderMode } from '../types/enum/data-validation-render-mode';
import { DataValidationStatus } from '../types/enum/data-validation-status';
import { DataValidationType } from '../types/enum/data-validation-type';
import { FBase } from './f-base';

export class FEnum extends FBase {
    static fEnums: FEnum | null = null;
    static getEnums() {
        if (!this.fEnums) {
            this.fEnums = new FEnum();
        }
        return this.fEnums;
    }

    dataValidation = {
        type: DataValidationType,
        errorStyle: DataValidationErrorStyle,
        renderMode: DataValidationRenderMode,
        operator: DataValidationOperator,
        validStatus: DataValidationStatus,
    };
}


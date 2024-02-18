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

import type { DataValidationOperator, IDataValidationRule } from '@univerjs/core';

export interface IFormulaInputProps {
    value?: string;
    onChange?: (value: string) => void;
}

export interface IDataValidator {
    /**
     * validator type
     */
    id: string;
    title: string;
    /**
     * supported operators
     */
    operators: DataValidationOperator[];
    defaultErrorText: (rule: IDataValidationRule) => string;
    /**
     * custom formula input,
     * such as formula-input or data-picker
     */
    formulaInput?: string;
    /**
     * validator effect scopes: sheet/doc/slide
     */
    scopes: string[] | string;
}

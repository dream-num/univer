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

import { DataValidationOperator } from '@univerjs/core';

export const OperatorTextMap: Record<DataValidationOperator, string> = {
    [DataValidationOperator.BETWEEN]: 'dataValidation.operators.between',
    [DataValidationOperator.EQUAL]: 'dataValidation.operators.equal',
    [DataValidationOperator.GREATER_THAN]: 'dataValidation.operators.greaterThan',
    [DataValidationOperator.GREATER_THAN_OR_EQUAL]: 'dataValidation.operators.greaterThanOrEqual',
    [DataValidationOperator.LESS_THAN]: 'dataValidation.operators.lessThan',
    [DataValidationOperator.LESS_THAN_OR_EQUAL]: 'dataValidation.operators.lessThanOrEqual',
    [DataValidationOperator.NOT_BETWEEN]: 'dataValidation.operators.notBetween',
    [DataValidationOperator.NOT_EQUAL]: 'dataValidation.operators.notEqual',
};

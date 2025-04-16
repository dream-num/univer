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

import { DataValidationOperator } from '@univerjs/core';

export const DateOperatorNameMap: Record<DataValidationOperator, string> = {
    [DataValidationOperator.BETWEEN]: 'dataValidation.date.operators.between',
    [DataValidationOperator.EQUAL]: 'dataValidation.date.operators.equal',
    [DataValidationOperator.GREATER_THAN]: 'dataValidation.date.operators.greaterThan',
    [DataValidationOperator.GREATER_THAN_OR_EQUAL]: 'dataValidation.date.operators.greaterThanOrEqual',
    [DataValidationOperator.LESS_THAN]: 'dataValidation.date.operators.lessThan',
    [DataValidationOperator.LESS_THAN_OR_EQUAL]: 'dataValidation.date.operators.lessThanOrEqual',
    [DataValidationOperator.NOT_BETWEEN]: 'dataValidation.date.operators.notBetween',
    [DataValidationOperator.NOT_EQUAL]: 'dataValidation.date.operators.notEqual',
};

export const DateOperatorTextMap: Record<DataValidationOperator, string> = {
    [DataValidationOperator.BETWEEN]: 'dataValidation.date.operators.between',
    [DataValidationOperator.EQUAL]: 'dataValidation.date.operators.equal',
    [DataValidationOperator.GREATER_THAN]: 'dataValidation.date.operators.greaterThan',
    [DataValidationOperator.GREATER_THAN_OR_EQUAL]: 'dataValidation.date.operators.greaterThanOrEqual',
    [DataValidationOperator.LESS_THAN]: 'dataValidation.date.operators.lessThan',
    [DataValidationOperator.LESS_THAN_OR_EQUAL]: 'dataValidation.date.operators.lessThanOrEqual',
    [DataValidationOperator.NOT_BETWEEN]: 'dataValidation.date.operators.notBetween',
    [DataValidationOperator.NOT_EQUAL]: 'dataValidation.date.operators.notEqual',
};

export const DateOperatorTitleMap: Record<DataValidationOperator | 'NONE', string> = {
    [DataValidationOperator.BETWEEN]: 'dataValidation.date.ruleName.between',
    [DataValidationOperator.EQUAL]: 'dataValidation.date.ruleName.equal',
    [DataValidationOperator.GREATER_THAN]: 'dataValidation.date.ruleName.greaterThan',
    [DataValidationOperator.GREATER_THAN_OR_EQUAL]: 'dataValidation.date.ruleName.greaterThanOrEqual',
    [DataValidationOperator.LESS_THAN]: 'dataValidation.date.ruleName.lessThan',
    [DataValidationOperator.LESS_THAN_OR_EQUAL]: 'dataValidation.date.ruleName.lessThanOrEqual',
    [DataValidationOperator.NOT_BETWEEN]: 'dataValidation.date.ruleName.notBetween',
    [DataValidationOperator.NOT_EQUAL]: 'dataValidation.date.ruleName.notEqual',
    NONE: 'dataValidation.date.ruleName.legal',
};

export const DateOperatorErrorTitleMap: Record<DataValidationOperator | 'NONE', string> = {
    [DataValidationOperator.BETWEEN]: 'dataValidation.date.errorMsg.between',
    [DataValidationOperator.EQUAL]: 'dataValidation.date.errorMsg.equal',
    [DataValidationOperator.GREATER_THAN]: 'dataValidation.date.errorMsg.greaterThan',
    [DataValidationOperator.GREATER_THAN_OR_EQUAL]: 'dataValidation.date.errorMsg.greaterThanOrEqual',
    [DataValidationOperator.LESS_THAN]: 'dataValidation.date.errorMsg.lessThan',
    [DataValidationOperator.LESS_THAN_OR_EQUAL]: 'dataValidation.date.errorMsg.lessThanOrEqual',
    [DataValidationOperator.NOT_BETWEEN]: 'dataValidation.date.errorMsg.notBetween',
    [DataValidationOperator.NOT_EQUAL]: 'dataValidation.date.errorMsg.notEqual',
    NONE: 'dataValidation.date.errorMsg.legal',
};

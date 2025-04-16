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

export const OperatorTitleMap: Record<DataValidationOperator | 'NONE', string> = {
    [DataValidationOperator.BETWEEN]: 'dataValidation.ruleName.between',
    [DataValidationOperator.EQUAL]: 'dataValidation.ruleName.equal',
    [DataValidationOperator.GREATER_THAN]: 'dataValidation.ruleName.greaterThan',
    [DataValidationOperator.GREATER_THAN_OR_EQUAL]: 'dataValidation.ruleName.greaterThanOrEqual',
    [DataValidationOperator.LESS_THAN]: 'dataValidation.ruleName.lessThan',
    [DataValidationOperator.LESS_THAN_OR_EQUAL]: 'dataValidation.ruleName.lessThanOrEqual',
    [DataValidationOperator.NOT_BETWEEN]: 'dataValidation.ruleName.notBetween',
    [DataValidationOperator.NOT_EQUAL]: 'dataValidation.ruleName.notEqual',
    NONE: 'dataValidation.ruleName.legal',
};

export const OperatorErrorTitleMap: Record<DataValidationOperator | 'NONE', string> = {
    [DataValidationOperator.BETWEEN]: 'dataValidation.errorMsg.between',
    [DataValidationOperator.EQUAL]: 'dataValidation.errorMsg.equal',
    [DataValidationOperator.GREATER_THAN]: 'dataValidation.errorMsg.greaterThan',
    [DataValidationOperator.GREATER_THAN_OR_EQUAL]: 'dataValidation.errorMsg.greaterThanOrEqual',
    [DataValidationOperator.LESS_THAN]: 'dataValidation.errorMsg.lessThan',
    [DataValidationOperator.LESS_THAN_OR_EQUAL]: 'dataValidation.errorMsg.lessThanOrEqual',
    [DataValidationOperator.NOT_BETWEEN]: 'dataValidation.errorMsg.notBetween',
    [DataValidationOperator.NOT_EQUAL]: 'dataValidation.errorMsg.notEqual',
    NONE: 'dataValidation.errorMsg.legal',
};

export const TextLengthErrorTitleMap: Record<DataValidationOperator, string> = {
    [DataValidationOperator.BETWEEN]: 'dataValidation.textLength.errorMsg.between',
    [DataValidationOperator.EQUAL]: 'dataValidation.textLength.errorMsg.equal',
    [DataValidationOperator.GREATER_THAN]: 'dataValidation.textLength.errorMsg.greaterThan',
    [DataValidationOperator.GREATER_THAN_OR_EQUAL]: 'dataValidation.textLength.errorMsg.greaterThanOrEqual',
    [DataValidationOperator.LESS_THAN]: 'dataValidation.textLength.errorMsg.lessThan',
    [DataValidationOperator.LESS_THAN_OR_EQUAL]: 'dataValidation.textLength.errorMsg.lessThanOrEqual',
    [DataValidationOperator.NOT_BETWEEN]: 'dataValidation.textLength.errorMsg.notBetween',
    [DataValidationOperator.NOT_EQUAL]: 'dataValidation.textLength.errorMsg.notEqual',
};

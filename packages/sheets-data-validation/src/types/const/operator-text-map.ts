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
    [DataValidationOperator.BETWEEN]: 'sheets-data-validation.operators.between',
    [DataValidationOperator.EQUAL]: 'sheets-data-validation.operators.equal',
    [DataValidationOperator.GREATER_THAN]: 'sheets-data-validation.operators.greaterThan',
    [DataValidationOperator.GREATER_THAN_OR_EQUAL]: 'sheets-data-validation.operators.greaterThanOrEqual',
    [DataValidationOperator.LESS_THAN]: 'sheets-data-validation.operators.lessThan',
    [DataValidationOperator.LESS_THAN_OR_EQUAL]: 'sheets-data-validation.operators.lessThanOrEqual',
    [DataValidationOperator.NOT_BETWEEN]: 'sheets-data-validation.operators.notBetween',
    [DataValidationOperator.NOT_EQUAL]: 'sheets-data-validation.operators.notEqual',
};

export const OperatorTitleMap: Record<DataValidationOperator | 'NONE', string> = {
    [DataValidationOperator.BETWEEN]: 'sheets-data-validation.ruleName.between',
    [DataValidationOperator.EQUAL]: 'sheets-data-validation.ruleName.equal',
    [DataValidationOperator.GREATER_THAN]: 'sheets-data-validation.ruleName.greaterThan',
    [DataValidationOperator.GREATER_THAN_OR_EQUAL]: 'sheets-data-validation.ruleName.greaterThanOrEqual',
    [DataValidationOperator.LESS_THAN]: 'sheets-data-validation.ruleName.lessThan',
    [DataValidationOperator.LESS_THAN_OR_EQUAL]: 'sheets-data-validation.ruleName.lessThanOrEqual',
    [DataValidationOperator.NOT_BETWEEN]: 'sheets-data-validation.ruleName.notBetween',
    [DataValidationOperator.NOT_EQUAL]: 'sheets-data-validation.ruleName.notEqual',
    NONE: 'sheets-data-validation.ruleName.legal',
};

export const OperatorErrorTitleMap: Record<DataValidationOperator | 'NONE', string> = {
    [DataValidationOperator.BETWEEN]: 'sheets-data-validation.errorMsg.between',
    [DataValidationOperator.EQUAL]: 'sheets-data-validation.errorMsg.equal',
    [DataValidationOperator.GREATER_THAN]: 'sheets-data-validation.errorMsg.greaterThan',
    [DataValidationOperator.GREATER_THAN_OR_EQUAL]: 'sheets-data-validation.errorMsg.greaterThanOrEqual',
    [DataValidationOperator.LESS_THAN]: 'sheets-data-validation.errorMsg.lessThan',
    [DataValidationOperator.LESS_THAN_OR_EQUAL]: 'sheets-data-validation.errorMsg.lessThanOrEqual',
    [DataValidationOperator.NOT_BETWEEN]: 'sheets-data-validation.errorMsg.notBetween',
    [DataValidationOperator.NOT_EQUAL]: 'sheets-data-validation.errorMsg.notEqual',
    NONE: 'sheets-data-validation.errorMsg.legal',
};

export const TextLengthErrorTitleMap: Record<DataValidationOperator, string> = {
    [DataValidationOperator.BETWEEN]: 'sheets-data-validation.textLength.errorMsg.between',
    [DataValidationOperator.EQUAL]: 'sheets-data-validation.textLength.errorMsg.equal',
    [DataValidationOperator.GREATER_THAN]: 'sheets-data-validation.textLength.errorMsg.greaterThan',
    [DataValidationOperator.GREATER_THAN_OR_EQUAL]: 'sheets-data-validation.textLength.errorMsg.greaterThanOrEqual',
    [DataValidationOperator.LESS_THAN]: 'sheets-data-validation.textLength.errorMsg.lessThan',
    [DataValidationOperator.LESS_THAN_OR_EQUAL]: 'sheets-data-validation.textLength.errorMsg.lessThanOrEqual',
    [DataValidationOperator.NOT_BETWEEN]: 'sheets-data-validation.textLength.errorMsg.notBetween',
    [DataValidationOperator.NOT_EQUAL]: 'sheets-data-validation.textLength.errorMsg.notEqual',
};

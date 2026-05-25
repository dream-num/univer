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
    [DataValidationOperator.BETWEEN]: 'sheets-data-validation.date.operators.between',
    [DataValidationOperator.EQUAL]: 'sheets-data-validation.date.operators.equal',
    [DataValidationOperator.GREATER_THAN]: 'sheets-data-validation.date.operators.greaterThan',
    [DataValidationOperator.GREATER_THAN_OR_EQUAL]: 'sheets-data-validation.date.operators.greaterThanOrEqual',
    [DataValidationOperator.LESS_THAN]: 'sheets-data-validation.date.operators.lessThan',
    [DataValidationOperator.LESS_THAN_OR_EQUAL]: 'sheets-data-validation.date.operators.lessThanOrEqual',
    [DataValidationOperator.NOT_BETWEEN]: 'sheets-data-validation.date.operators.notBetween',
    [DataValidationOperator.NOT_EQUAL]: 'sheets-data-validation.date.operators.notEqual',
};

export const DateOperatorTextMap: Record<DataValidationOperator, string> = {
    [DataValidationOperator.BETWEEN]: 'sheets-data-validation.date.operators.between',
    [DataValidationOperator.EQUAL]: 'sheets-data-validation.date.operators.equal',
    [DataValidationOperator.GREATER_THAN]: 'sheets-data-validation.date.operators.greaterThan',
    [DataValidationOperator.GREATER_THAN_OR_EQUAL]: 'sheets-data-validation.date.operators.greaterThanOrEqual',
    [DataValidationOperator.LESS_THAN]: 'sheets-data-validation.date.operators.lessThan',
    [DataValidationOperator.LESS_THAN_OR_EQUAL]: 'sheets-data-validation.date.operators.lessThanOrEqual',
    [DataValidationOperator.NOT_BETWEEN]: 'sheets-data-validation.date.operators.notBetween',
    [DataValidationOperator.NOT_EQUAL]: 'sheets-data-validation.date.operators.notEqual',
};

export const DateOperatorTitleMap: Record<DataValidationOperator | 'NONE', string> = {
    [DataValidationOperator.BETWEEN]: 'sheets-data-validation.date.ruleName.between',
    [DataValidationOperator.EQUAL]: 'sheets-data-validation.date.ruleName.equal',
    [DataValidationOperator.GREATER_THAN]: 'sheets-data-validation.date.ruleName.greaterThan',
    [DataValidationOperator.GREATER_THAN_OR_EQUAL]: 'sheets-data-validation.date.ruleName.greaterThanOrEqual',
    [DataValidationOperator.LESS_THAN]: 'sheets-data-validation.date.ruleName.lessThan',
    [DataValidationOperator.LESS_THAN_OR_EQUAL]: 'sheets-data-validation.date.ruleName.lessThanOrEqual',
    [DataValidationOperator.NOT_BETWEEN]: 'sheets-data-validation.date.ruleName.notBetween',
    [DataValidationOperator.NOT_EQUAL]: 'sheets-data-validation.date.ruleName.notEqual',
    NONE: 'sheets-data-validation.date.ruleName.legal',
};

export const DateOperatorErrorTitleMap: Record<DataValidationOperator | 'NONE', string> = {
    [DataValidationOperator.BETWEEN]: 'sheets-data-validation.date.errorMsg.between',
    [DataValidationOperator.EQUAL]: 'sheets-data-validation.date.errorMsg.equal',
    [DataValidationOperator.GREATER_THAN]: 'sheets-data-validation.date.errorMsg.greaterThan',
    [DataValidationOperator.GREATER_THAN_OR_EQUAL]: 'sheets-data-validation.date.errorMsg.greaterThanOrEqual',
    [DataValidationOperator.LESS_THAN]: 'sheets-data-validation.date.errorMsg.lessThan',
    [DataValidationOperator.LESS_THAN_OR_EQUAL]: 'sheets-data-validation.date.errorMsg.lessThanOrEqual',
    [DataValidationOperator.NOT_BETWEEN]: 'sheets-data-validation.date.errorMsg.notBetween',
    [DataValidationOperator.NOT_EQUAL]: 'sheets-data-validation.date.errorMsg.notEqual',
    NONE: 'sheets-data-validation.date.errorMsg.legal',
};

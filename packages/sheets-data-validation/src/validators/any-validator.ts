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

import type { CellValue, DataValidationOperator, IDataValidationRule, IDataValidationRuleBase } from '@univerjs/core';
import type { IFormulaResult, IFormulaValidResult, IValidatorCellInfo } from '@univerjs/data-validation';
import type { LocaleKey } from '../locale/types';
import { DataValidationType } from '@univerjs/core';
import { BaseSheetValidator } from './base-sheet-validator';

export class AnyValidator extends BaseSheetValidator {
    override id: string = DataValidationType.ANY;
    override title: string = 'sheets-data-validation.any.title';
    override operators: DataValidationOperator[] = [];
    override scopes: string | string[] = ['sheet'];
    order = 0;

    override readonly offsetFormulaByRange = false;

    override async parseFormula(rule: IDataValidationRule, unitId: string, subUnitId: string): Promise<IFormulaResult> {
        return {
            formula1: rule.formula1,
            formula2: rule.formula2,
            isFormulaValid: true,
        };
    }

    override validatorFormula(rule: IDataValidationRule, unitId: string, subUnitId: string): IFormulaValidResult {
        return {
            success: true,
        };
    }

    override async isValidType(cellInfo: IValidatorCellInfo<CellValue>, formula: IFormulaResult, rule: IDataValidationRule): Promise<boolean> {
        return true;
    }

    override generateRuleErrorMessage(rule: IDataValidationRuleBase): string {
        return this.localeService.t<LocaleKey>('sheets-data-validation.any.error');
    }
}

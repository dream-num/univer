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

import { DataValidationType, Tools } from '@univerjs/core';
import type { CellValue, DataValidationOperator, IDataValidationRule, IDataValidationRuleBase } from '@univerjs/core';
import { BaseDataValidator } from '@univerjs/data-validation';
import { LIST_FORMULA_INPUT_NAME } from '../views/formula-input';
import { LIST_DROPDOWN_KEY } from '../views';

export const LIST_MULTIPLE_FORMULA = 'TRUE';

// TODO: cache
export class ListValidator extends BaseDataValidator {
    id: string = DataValidationType.LIST;
    title: string = 'dataValidation.list.title';
    operators: DataValidationOperator[] = [];
    scopes: string | string[] = ['sheet'];
    formulaInput: string = LIST_FORMULA_INPUT_NAME;

    override dropdown: string | undefined = LIST_DROPDOWN_KEY;

    override validatorFormula(rule: IDataValidationRuleBase): boolean {
        return !Tools.isBlank(rule.formula1);
    }

    private _isMultiple(rule: IDataValidationRule) {
        return rule.formula2 === LIST_MULTIPLE_FORMULA;
    }

    private _parseList(rule: IDataValidationRule) {
        return rule.formula1?.split(',') ?? [];
    }

    // TODO cache
    private _parseCellValue(cellValue: CellValue, rule: IDataValidationRule) {
        const cellString = cellValue.toString();
        if (this._isMultiple(rule)) {
            // TODO. full
            return cellString.split(',');
        } else {
            return [cellString];
        }
    }

    isValidType(cellValue: CellValue, info: IDataValidationRule): boolean {
        const { rule } = info;
        const selected = this._parseCellValue(cellValue, rule);
        const list = this._parseList(rule);
        return selected.every((i) => list.includes(i));
    }

    override generateRuleName() {
        return this.localeService.t('dataValidation.list.name');
    }

    override generateRuleErrorMessage(): string {
        return this.localeService.t('dataValidation.list.error');
    }

    transform(cellValue: CellValue, _rule: IDataValidationRule): CellValue {
        throw new Error('Method not implemented.');
    }

    async validatorIsEqual(cellValue: CellValue, rule: IDataValidationRule): Promise<boolean> {
        throw new Error('Method not implemented.');
    }

    async validatorIsNotEqual(cellValue: CellValue, rule: IDataValidationRule): Promise<boolean> {
        throw new Error('Method not implemented.');
    }

    async validatorIsBetween(cellValue: CellValue, rule: IDataValidationRule): Promise<boolean> {
        throw new Error('Method not implemented.');
    }

    async validatorIsNotBetween(cellValue: CellValue, rule: IDataValidationRule): Promise<boolean> {
        throw new Error('Method not implemented.');
    }

    async validatorIsGreaterThan(cellValue: CellValue, rule: IDataValidationRule): Promise<boolean> {
        throw new Error('Method not implemented.');
    }

    async validatorIsGreaterThanOrEqual(cellValue: CellValue, rule: IDataValidationRule): Promise<boolean> {
        throw new Error('Method not implemented.');
    }

    async validatorIsLessThan(cellValue: CellValue, rule: IDataValidationRule): Promise<boolean> {
        throw new Error('Method not implemented.');
    }

    async validatorIsLessThanOrEqual(cellValue: CellValue, rule: IDataValidationRule): Promise<boolean> {
        throw new Error('Method not implemented.');
    }
}

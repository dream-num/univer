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
import type { CellValue, DataValidationOperator, IDataValidationRuleBase, IDataValidationRuleInfo, IStyleData, Nullable } from '@univerjs/core';
import { BaseDataValidator } from '@univerjs/data-validation';
import { CheckboxRender } from '../widgets/checkbox-widget';

export const CHECKBOX_FORMULA_1 = 'TRUE';
export const CHECKBOX_FORMULA_2 = 'FALSE';

export class CheckboxValidator extends BaseDataValidator {
    override id: string = DataValidationType.CHECKBOX;
    override title: string = 'dataValidation.checkbox.title';
    override operators: DataValidationOperator[] = [];
    override scopes: string | string[] = ['sheet'];
    override formulaInput: string;
    override skipDefaultFontRender = true;

    override canvasRender = this.injector.createInstance(CheckboxRender);

    override validatorFormula(rule: IDataValidationRuleBase): boolean {
        const { formula1 = CHECKBOX_FORMULA_1, formula2 = CHECKBOX_FORMULA_2 } = rule;
        return typeof formula1 === 'string' && formula2 === 'string';
    }

    override isValidType(cellValue: CellValue, info: IDataValidationRuleInfo): boolean {
        const { rule } = info;
        const { formula1 = CHECKBOX_FORMULA_1, formula2 = CHECKBOX_FORMULA_2 } = rule;
        return !Tools.isDefine(cellValue) || cellValue === formula1 || cellValue === formula2;
    }

    override transform(cellValue: CellValue, rule: IDataValidationRuleInfo): CellValue {
        throw new Error('Method not implemented.');
    }

    override validatorIsEqual(cellValue: CellValue, rule: IDataValidationRuleInfo): Promise<boolean> {
        throw new Error('Method not implemented.');
    }

    override validatorIsNotEqual(cellValue: CellValue, rule: IDataValidationRuleInfo): Promise<boolean> {
        throw new Error('Method not implemented.');
    }

    override validatorIsBetween(cellValue: CellValue, rule: IDataValidationRuleInfo): Promise<boolean> {
        throw new Error('Method not implemented.');
    }

    override validatorIsNotBetween(cellValue: CellValue, rule: IDataValidationRuleInfo): Promise<boolean> {
        throw new Error('Method not implemented.');
    }

    override validatorIsGreaterThan(cellValue: CellValue, rule: IDataValidationRuleInfo): Promise<boolean> {
        throw new Error('Method not implemented.');
    }

    override validatorIsGreaterThanOrEqual(cellValue: CellValue, rule: IDataValidationRuleInfo): Promise<boolean> {
        throw new Error('Method not implemented.');
    }

    override validatorIsLessThan(cellValue: CellValue, rule: IDataValidationRuleInfo): Promise<boolean> {
        throw new Error('Method not implemented.');
    }

    override validatorIsLessThanOrEqual(cellValue: CellValue, rule: IDataValidationRuleInfo): Promise<boolean> {
        throw new Error('Method not implemented.');
    }
}

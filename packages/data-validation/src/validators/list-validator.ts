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

import { DataValidationType, IUniverInstanceService, LocaleService, Tools } from '@univerjs/core';
import type { CellValue, DataValidationOperator, IDataValidationRule, IDataValidationRuleBase } from '@univerjs/core';
import { Inject } from '@wendellhu/redi';
import { BASE_FORMULA_INPUT_NAME } from '../views/formula-input';
import { BaseDataValidator } from './base-data-validator';

export class ListValidator extends BaseDataValidator {
    id: string = DataValidationType.LIST;
    title: string = 'dataValidation.list.title';
    operators: DataValidationOperator[] = [];
    scopes: string | string[] = ['sheet'];
    formulaInput: string = BASE_FORMULA_INPUT_NAME;

    constructor(
        @Inject(LocaleService) override readonly localeService: LocaleService,
        @IUniverInstanceService readonly univerInstanceService: IUniverInstanceService
    ) {
        super(localeService);
    }

    override validatorFormula(rule: IDataValidationRuleBase): boolean {
        return !Tools.isBlank(rule.formula1);
    }

    isValidType(cellValue: CellValue, _rule: IDataValidationRule): boolean {
        return typeof cellValue === 'string' || typeof cellValue === 'number';
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

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

import type { IDataValidationRule, Injector } from '@univerjs/core';
import type { IFormulaResult, IFormulaValidResult, IValidatorCellInfo } from '../validators/base-data-validator';
import {
    DataValidationOperator,
    DataValidationType,
    LocaleService,
    LocaleType,
    Univer,
} from '@univerjs/core';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { DataValidatorRegistryScope, DataValidatorRegistryService } from '../services/data-validator-registry.service';
import { BaseDataValidator } from '../validators/base-data-validator';

function createRule(overrides: Partial<IDataValidationRule> = {}): IDataValidationRule {
    return {
        uid: 'rule-1',
        type: DataValidationType.DECIMAL,
        operator: DataValidationOperator.BETWEEN,
        formula1: '1',
        formula2: '5',
        allowBlank: true,
        showErrorMessage: true,
        error: 'Explicit error',
        ranges: [{ startRow: 0, endRow: 0, startColumn: 0, endColumn: 0 }],
        ...overrides,
    } as IDataValidationRule;
}

function createCellInfo(value: unknown): IValidatorCellInfo {
    return {
        value: value as never,
        interceptValue: null,
        row: 0,
        column: 0,
        unitId: 'unit-1',
        subUnitId: 'sheet-1',
        worksheet: null as never,
        workbook: null as never,
        t: null,
    };
}

class TestDataValidator extends BaseDataValidator {
    id = 'validator.number';
    title = 'validator.number';
    operators = [
        DataValidationOperator.BETWEEN,
        DataValidationOperator.EQUAL,
        DataValidationOperator.GREATER_THAN,
        DataValidationOperator.GREATER_THAN_OR_EQUAL,
        DataValidationOperator.LESS_THAN,
        DataValidationOperator.LESS_THAN_OR_EQUAL,
        DataValidationOperator.NOT_BETWEEN,
        DataValidationOperator.NOT_EQUAL,
    ];

    scopes = [DataValidatorRegistryScope.SHEET, 'custom-scope'];
    order = 1;

    formulaResult: IFormulaResult<number | undefined> = {
        formula1: 1,
        formula2: 5,
        isFormulaValid: true,
    };

    validType = true;

    override async parseFormula(rule: IDataValidationRule, _unitId: string, _subUnitId: string, _row: number, _column: number): Promise<IFormulaResult<number | undefined>> {
        return {
            ...this.formulaResult,
            formula1: Number(rule.formula1 ?? this.formulaResult.formula1),
            formula2: rule.formula2 == null ? undefined : Number(rule.formula2),
        };
    }

    override validatorFormula(rule: IDataValidationRule, _unitId: string, _subUnitId: string): IFormulaValidResult {
        return {
            success: true,
            formula1: rule.formula1,
            formula2: rule.formula2,
        };
    }

    override async isValidType(): Promise<boolean> {
        return this.validType;
    }

    override transform(cellInfo: IValidatorCellInfo): IValidatorCellInfo<number> {
        return {
            ...cellInfo,
            value: Number(cellInfo.value),
        };
    }
}

describe('data validator behavior', () => {
    let univer: Univer;
    let get: Injector['get'];
    let localeService: LocaleService;
    let registryService: DataValidatorRegistryService;
    let validator: TestDataValidator;

    beforeEach(() => {
        univer = new Univer();
        const injector = univer.__getInjector();
        get = injector.get.bind(injector);

        injector.add([DataValidatorRegistryService]);

        localeService = get(LocaleService);
        localeService.load({
            [LocaleType.EN_US]: {
                validator: {
                    number: 'Number',
                },
                dataValidation: {
                    operators: {
                        between: 'between',
                        equal: 'equal',
                        greaterThan: 'greater than',
                        greaterThanOrEqual: 'greater than or equal',
                        lessThan: 'less than',
                        lessThanOrEqual: 'less than or equal',
                        notBetween: 'not between',
                        notEqual: 'not equal',
                    },
                    ruleName: {
                        between: 'between {FORMULA1} and {FORMULA2}',
                        equal: 'equal to {FORMULA1}',
                        greaterThan: 'greater than {FORMULA1}',
                        greaterThanOrEqual: 'greater than or equal to {FORMULA1}',
                        lessThan: 'less than {FORMULA1}',
                        lessThanOrEqual: 'less than or equal to {FORMULA1}',
                        notBetween: 'not between {FORMULA1} and {FORMULA2}',
                        notEqual: 'not equal to {FORMULA1}',
                        legal: 'Legal {TYPE}',
                    },
                    errorMsg: {
                        between: 'Value must be between {FORMULA1} and {FORMULA2}',
                        equal: 'Value must equal {FORMULA1}',
                        greaterThan: 'Value must be greater than {FORMULA1}',
                        greaterThanOrEqual: 'Value must be greater than or equal to {FORMULA1}',
                        lessThan: 'Value must be less than {FORMULA1}',
                        lessThanOrEqual: 'Value must be less than or equal to {FORMULA1}',
                        notBetween: 'Value must not be between {FORMULA1} and {FORMULA2}',
                        notEqual: 'Value must not equal {FORMULA1}',
                        legal: 'Value must satisfy {TYPE}',
                    },
                },
            },
        });
        localeService.setLocale(LocaleType.EN_US);

        registryService = get(DataValidatorRegistryService);
        validator = new TestDataValidator(localeService, injector);
    });

    afterEach(() => {
        univer.dispose();
    });

    it('registers validators by scope and removes them with the returned disposable', () => {
        const changes: number[] = [];
        const sub = registryService.validatorsChange$.subscribe(() => changes.push(changes.length));

        const disposable = registryService.register(validator);

        expect(registryService.getValidatorItem(validator.id)).toBe(validator);
        expect(registryService.getValidatorsByScope(DataValidatorRegistryScope.SHEET)).toContain(validator);
        expect(registryService.getValidatorsByScope('custom-scope')).toContain(validator);

        expect(() => registryService.register(new TestDataValidator(localeService, get as never))).toThrow(/same id/);

        disposable.dispose();

        expect(registryService.getValidatorItem(validator.id)).toBeUndefined();
        expect(registryService.getValidatorsByScope(DataValidatorRegistryScope.SHEET)).toEqual([]);
        expect(changes.length).toBeGreaterThanOrEqual(3);

        sub.unsubscribe();
    });

    it('generates translated rule labels and validates values through the main validator flow', async () => {
        expect(validator.operatorNames).toEqual([
            'between',
            'equal',
            'greater than',
            'greater than or equal',
            'less than',
            'less than or equal',
            'not between',
            'not equal',
        ]);
        expect(validator.titleStr).toBe('Number');
        expect(validator.generateRuleName(createRule())).toBe('Number between 1 and 5');
        expect(validator.generateRuleName(createRule({ operator: undefined }))).toBe('Legal Number');
        expect(validator.generateRuleErrorMessage(createRule({ operator: DataValidationOperator.LESS_THAN, formula1: '10' }), {
            row: 0,
            col: 0,
            unitId: 'unit-1',
            subUnitId: 'sheet-1',
        })).toBe('Value must be less than 10');

        expect(validator.getRuleFinalError(createRule(), {
            row: 0,
            col: 0,
            unitId: 'unit-1',
            subUnitId: 'sheet-1',
        })).toBe('Explicit error');
        expect(validator.getRuleFinalError(createRule({ showErrorMessage: false, error: 'ignored' }), {
            row: 0,
            col: 0,
            unitId: 'unit-1',
            subUnitId: 'sheet-1',
        })).toBe('Value must be between 1 and 5');

        expect(validator.isEmptyCellValue('')).toBe(true);
        expect(validator.isEmptyCellValue(null)).toBe(true);
        expect(validator.isEmptyCellValue(0)).toBe(false);
        expect(validator.normalizeFormula(createRule({ formula1: '=A1', formula2: '=B1' }), 'unit-1', 'sheet-1')).toEqual({
            formula1: '=A1',
            formula2: '=B1',
        });
        expect(validator.validatorFormula(createRule({ formula1: '7', formula2: '9' }), 'unit-1', 'sheet-1')).toEqual({
            success: true,
            formula1: '7',
            formula2: '9',
        });

        await expect(validator.validator(createCellInfo(''), createRule({ allowBlank: false }))).resolves.toBe(false);

        validator.formulaResult = {
            formula1: 1,
            formula2: 5,
            isFormulaValid: false,
        };
        await expect(validator.validator(createCellInfo(3), createRule())).resolves.toBe(false);

        validator.formulaResult = {
            formula1: 1,
            formula2: 5,
            isFormulaValid: true,
        };
        validator.validType = false;
        await expect(validator.validator(createCellInfo(3), createRule())).resolves.toBe(false);

        validator.validType = true;
        await expect(validator.validator(createCellInfo(3), createRule({ operator: undefined }))).resolves.toBe(true);
        await expect(validator.validator(createCellInfo(3), createRule({ operator: DataValidationOperator.BETWEEN }))).resolves.toBe(true);
        await expect(validator.validator(createCellInfo(9), createRule({ operator: DataValidationOperator.NOT_BETWEEN }))).resolves.toBe(true);
        await expect(validator.validator(createCellInfo(5), createRule({ operator: DataValidationOperator.EQUAL, formula1: '5' }))).resolves.toBe(true);
        await expect(validator.validator(createCellInfo(5), createRule({ operator: DataValidationOperator.NOT_EQUAL, formula1: '6' }))).resolves.toBe(true);
        await expect(validator.validator(createCellInfo(6), createRule({ operator: DataValidationOperator.GREATER_THAN, formula1: '5' }))).resolves.toBe(true);
        await expect(validator.validator(createCellInfo(5), createRule({ operator: DataValidationOperator.GREATER_THAN_OR_EQUAL, formula1: '5' }))).resolves.toBe(true);
        await expect(validator.validator(createCellInfo(4), createRule({ operator: DataValidationOperator.LESS_THAN, formula1: '5' }))).resolves.toBe(true);
        await expect(validator.validator(createCellInfo(5), createRule({ operator: DataValidationOperator.LESS_THAN_OR_EQUAL, formula1: '5' }))).resolves.toBe(true);

        validator.formulaResult = {
            formula1: Number.NaN,
            formula2: Number.NaN,
            isFormulaValid: true,
        };
        await expect(validator.validator(createCellInfo(10), createRule({ operator: DataValidationOperator.BETWEEN, formula1: 'NaN', formula2: 'NaN' }))).resolves.toBe(true);
        await expect(validator.validator(createCellInfo(10), createRule({ operator: 'unexpected' as DataValidationOperator }))).rejects.toThrow('Unknown operator.');
    });
});

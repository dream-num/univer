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

import type { Injector, LocaleService } from '@univerjs/core';
import { CellValueType, DataValidationOperator, WrapStrategy } from '@univerjs/core';
import { LexerTreeBuilder } from '@univerjs/engine-formula';
import { describe, expect, it, vi } from 'vitest';
import { DataValidationCustomFormulaService } from '../../services/dv-custom-formula.service';
import { DataValidationFormulaService } from '../../services/dv-formula.service';
import { DataValidationListCacheService } from '../../services/dv-list-cache.service';
import { AnyValidator } from '../any-validator';
import { CheckboxValidator, transformCheckboxValue } from '../checkbox-validator';
import { CustomFormulaValidator } from '../custom-validator';
import { DateValidator } from '../date-validator';
import { DecimalValidator, getCellValueNumber } from '../decimal-validator';
import { ListMultipleValidator } from '../list-multiple-validator';
import { TextLengthValidator } from '../text-length-validator';
import { WholeValidator } from '../whole-validator';

function createContext() {
    const localeService = {
        t: vi.fn((key: string) => key),
    } as unknown as LocaleService;
    const customFormulaService = {
        getCellFormulaValue: vi.fn(async () => ({ v: '12' })),
        getCellFormula2Value: vi.fn(async () => ({ v: '34' })),
    };
    const formulaService = {
        getRuleFormulaResult: vi.fn(async () => ([{ result: [[[[{ v: true }]]]] }, { result: [[[[{ v: false }]]]] }])),
        getRuleFormulaResultSync: vi.fn(() => ([{ result: [[[[{ v: true }]]]] }, { result: [[[[{ v: false }]]]] }])),
    };
    const univerInstanceService = {
        getUnit: vi.fn(() => ({
            getSheetBySheetId: vi.fn(() => ({
                getName: () => 'sheet-1',
            })),
        })),
    };
    const listCacheService = {
        getOrCompute: vi.fn(() => ({ list: ['a', 'b'] })),
    };
    const lexerTreeBuilder = {
        moveFormulaRefOffset: vi.fn((formula: string, col: number, row: number) => `${formula}:${col},${row}`),
        checkIfAddBracket: vi.fn(() => 0),
        sequenceNodesBuilder: vi.fn(() => [{ nodeType: 'FUNCTION', token: 'IF' }]),
    };
    const injector = {
        get(token: unknown) {
            if (token === DataValidationCustomFormulaService) {
                return customFormulaService;
            }
            if (token === DataValidationFormulaService) {
                return formulaService;
            }
            if (token === DataValidationListCacheService) {
                return listCacheService;
            }
            if (token === LexerTreeBuilder) {
                return lexerTreeBuilder;
            }
            if (String(token) === 'univer.current') {
                return univerInstanceService;
            }

            throw new Error(`Unknown token: ${String(token)}`);
        },
    } as unknown as Injector;

    return {
        localeService,
        customFormulaService,
        formulaService,
        listCacheService,
        lexerTreeBuilder,
        injector,
    };
}

describe('validators', () => {
    it('covers decimal, whole, and text-length validation branches', async () => {
        const { localeService, injector, customFormulaService, lexerTreeBuilder } = createContext();
        const decimal = new DecimalValidator(localeService, injector);
        const whole = new WholeValidator(localeService, injector);
        const textLength = new TextLengthValidator(localeService, injector);

        customFormulaService.getCellFormulaValue.mockResolvedValueOnce({ v: '12.5' });
        customFormulaService.getCellFormula2Value.mockResolvedValueOnce({ v: '#VALUE!' });

        expect(getCellValueNumber('12.5')).toBe(12.5);
        expect(await decimal.isValidType({ value: '12.5' } as never, {} as never, {} as never)).toBe(true);
        expect(decimal.transform({ value: '12.5' } as never, {} as never, {} as never).value).toBe(12.5);
        await expect(decimal.parseFormula({ uid: 'rule-1', formula1: '=A1', formula2: '=B1' } as never, 'u', 's', 0, 0)).resolves.toEqual({
            formula1: 12.5,
            formula2: Number.NaN,
            isFormulaValid: false,
        });
        expect(decimal.validatorFormula({ operator: DataValidationOperator.BETWEEN, formula1: '1', formula2: 'x' } as never, 'u', 's')).toEqual({
            success: false,
            formula1: undefined,
            formula2: 'dataValidation.validFail.number',
        });
        expect(decimal.validatorFormula({ operator: DataValidationOperator.EQUAL, formula1: 'x' } as never, 'u', 's')).toEqual({
            success: false,
            formula1: 'dataValidation.validFail.number',
        });
        expect(decimal.generateRuleErrorMessage({ operator: DataValidationOperator.EQUAL, formula1: '=A1', ranges: [{ startRow: 0, endRow: 0, startColumn: 0, endColumn: 0 }] } as never, { row: 2, col: 3 } as never)).toBe('dataValidation.errorMsg.equal');

        expect(await whole.isValidType({ value: 3 } as never, {} as never, {} as never)).toBe(true);
        expect(await whole.isValidType({ value: 3.2 } as never, {} as never, {} as never)).toBe(false);
        expect(await whole.parseFormula({ uid: 'rule-2', formula1: '4', formula2: null } as never, 'u', 's', 0, 0)).toEqual({
            formula1: 4,
            formula2: Number.NaN,
            isFormulaValid: true,
        });
        expect(whole.validatorFormula({ operator: DataValidationOperator.BETWEEN, formula1: '1', formula2: '2' } as never, 'u', 's')).toEqual({
            success: true,
            formula1: undefined,
            formula2: undefined,
        });

        expect(textLength.validatorFormula({} as never, 'u', 's')).toEqual({ success: false });
        expect(await textLength.parseFormula({ uid: 'rule-3', formula1: '3', formula2: '4' } as never, 'u', 's', 0, 0)).toEqual({
            formula1: 3,
            formula2: 4,
            isFormulaValid: true,
        });
        expect(textLength.transform({ value: 1234 } as never, {} as never, {} as never).value).toBe(4);
        expect(await textLength.isValidType({ value: true } as never, {} as never, {} as never)).toBe(false);
        expect(await textLength.isValidType({ value: 'abcd' } as never, {} as never, {} as never)).toBe(true);
        expect(textLength.generateRuleErrorMessage({ operator: DataValidationOperator.EQUAL, formula1: '=A1', ranges: [{ startRow: 0, endRow: 0, startColumn: 0, endColumn: 0 }] } as never, { row: 1, col: 1 } as never)).toBe('dataValidation.textLength.errorMsg.equal');
        expect(lexerTreeBuilder.moveFormulaRefOffset).toHaveBeenCalled();
    });

    it('covers date validation parsing, normalization, and messages', async () => {
        const { localeService, injector, customFormulaService, lexerTreeBuilder } = createContext();
        const date = new DateValidator(localeService, injector);

        customFormulaService.getCellFormulaValue.mockResolvedValueOnce({ v: '2024-01-02' });
        customFormulaService.getCellFormula2Value.mockResolvedValueOnce({ v: '2024-01-05' });

        const parsed = await date.parseFormula({ uid: 'rule-1', formula1: '=A1', formula2: '=B1' } as never, 'u', 's', 0, 0);
        expect(parsed.formula1).toBeTypeOf('number');
        expect(parsed.formula2).toBeTypeOf('number');
        expect(parsed.isFormulaValid).toBe(true);

        expect(await date.isValidType({ value: 45293, interceptValue: '2024-01-02' } as never)).toBe(true);
        expect(await date.isValidType({ value: 'ignored', interceptValue: 'not-a-date' } as never)).toBe(false);
        expect(date.validatorFormula({ operator: DataValidationOperator.BETWEEN, formula1: '2024-01-01', formula2: '' } as never, 'u', 's')).toEqual({
            success: false,
            formula1: undefined,
            formula2: 'dataValidation.validFail.date',
        });
        expect(date.normalizeFormula({ formula1: '45293', formula2: 'invalid', bizInfo: { showTime: false } } as never, 'u', 's')).toEqual({
            formula1: '2024-01-02',
            formula2: '',
        });
        expect(date.transform({ value: '2024-01-02' } as never, {} as never, {} as never).value).toBeTypeOf('number');
        expect(date.generateRuleName({ operator: DataValidationOperator.EQUAL, formula1: '2024-01-02' } as never)).toContain('dataValidation.date.title');
        expect(date.generateRuleErrorMessage({ operator: DataValidationOperator.EQUAL, formula1: '=A1', ranges: [{ startRow: 0, endRow: 0, startColumn: 0, endColumn: 0 }] } as never, { row: 0, col: 0 } as never)).toBe('dataValidation.date.errorMsg.equal');
        expect(lexerTreeBuilder.moveFormulaRefOffset).toHaveBeenCalled();
    });

    it('covers checkbox, custom, any, and list-multiple behaviors', async () => {
        const { localeService, injector, formulaService, lexerTreeBuilder } = createContext();
        const checkbox = new CheckboxValidator(localeService, injector);
        const custom = new CustomFormulaValidator(localeService, injector);
        const any = new AnyValidator(localeService, injector);
        const listMultiple = new ListMultipleValidator(localeService, injector);

        expect(transformCheckboxValue(true)).toBe('1');
        expect(transformCheckboxValue(false)).toBe('0');
        expect(transformCheckboxValue('other')).toBe('other');

        expect(checkbox.validatorFormula({ formula1: '', formula2: '' } as never, 'u', 's')).toEqual({ success: true });
        expect(checkbox.validatorFormula({ formula1: '1', formula2: '1' } as never, 'u', 's')).toEqual({
            success: false,
            formula1: 'dataValidation.validFail.checkboxEqual',
            formula2: 'dataValidation.validFail.checkboxEqual',
        });
        expect(await checkbox.parseFormula({ uid: 'rule-1', formula1: '=A1', formula2: '=B1' } as never, 'u', 's')).toEqual({
            formula1: '1',
            formula2: '0',
            originFormula1: true,
            originFormula2: false,
            isFormulaValid: true,
        });
        expect(checkbox.parseFormulaSync({ uid: 'rule-1', formula1: '=A1', formula2: '=B1' } as never, 'u', 's')).toEqual({
            formula1: '1',
            formula2: '0',
            originFormula1: true,
            originFormula2: false,
            isFormulaValid: true,
        });
        expect(checkbox.skipDefaultFontRender!({ uid: 'rule-1', formula1: '=A1', formula2: '=B1' } as never, '0', { unitId: 'u', subUnitId: 's', row: 0, column: 0 })).toBe(true);
        expect(await checkbox.isValidType({ value: false, unitId: 'u', subUnitId: 's' } as never, {} as never, { uid: 'rule-1', formula1: '=A1', formula2: '=B1' } as never)).toBe(true);
        expect(checkbox.getExtraStyle({} as never, null)).toEqual({ tb: WrapStrategy.CLIP });
        expect(checkbox.generateRuleErrorMessage({} as never)).toBe('dataValidation.checkbox.error');

        lexerTreeBuilder.checkIfAddBracket.mockReturnValueOnce(1);
        expect(custom.validatorFormula({ formula1: 'A1' } as never, 'u', 's')).toEqual({
            success: false,
            formula1: 'dataValidation.validFail.formula',
        });
        lexerTreeBuilder.checkIfAddBracket.mockReturnValueOnce(0);
        expect(custom.validatorFormula({ formula1: '=A1' } as never, 'u', 's')).toEqual({
            success: true,
            formula1: '',
        });
        await expect(custom.parseFormula({} as never, 'u', 's')).resolves.toEqual({ formula1: undefined, formula2: undefined, isFormulaValid: true });
        (injector.get(DataValidationCustomFormulaService) as any).getCellFormulaValue.mockResolvedValueOnce({ v: true, t: CellValueType.BOOLEAN });
        expect(await custom.isValidType({ unitId: 'u', subUnitId: 's', row: 0, column: 0 } as never, {} as never, { uid: 'rule-2' } as never)).toBe(true);
        (injector.get(DataValidationCustomFormulaService) as any).getCellFormulaValue.mockResolvedValueOnce({ v: '#VALUE!' });
        expect(await custom.isValidType({ unitId: 'u', subUnitId: 's', row: 0, column: 0 } as never, {} as never, { uid: 'rule-2' } as never)).toBe(false);
        expect(custom.generateRuleName({ formula1: '=A1' } as never)).toBe('dataValidation.custom.ruleName');

        await expect(any.parseFormula({ formula1: '1', formula2: '2' } as never, 'u', 's')).resolves.toEqual({ formula1: '1', formula2: '2', isFormulaValid: true });
        expect(any.validatorFormula({} as never, 'u', 's')).toEqual({ success: true });
        expect(await any.isValidType({} as never, {} as never, {} as never)).toBe(true);
        expect(any.generateRuleErrorMessage({} as never)).toBe('dataValidation.any.error');

        expect(listMultiple.id).toBe('listMultiple');
        expect(listMultiple.title).toBe('dataValidation.listMultiple.title');
        expect(listMultiple.offsetFormulaByRange).toBe(false);
        expect(listMultiple.skipDefaultFontRender!()).toBe(true);
        expect(formulaService.getRuleFormulaResult).toHaveBeenCalled();
    });
});

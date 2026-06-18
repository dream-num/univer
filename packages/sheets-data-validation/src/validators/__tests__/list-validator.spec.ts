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

import type { ICellData, Injector, LocaleService } from '@univerjs/core';
import {
    CellValueType,
    DataValidationRenderMode,
    DataValidationType,
    UniverInstanceType,
    WrapStrategy,
} from '@univerjs/core';
import { LexerTreeBuilder } from '@univerjs/engine-formula';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { DataValidationFormulaService } from '../../services/dv-formula.service';
import { DataValidationListCacheService } from '../../services/dv-list-cache.service';
import { getRuleFormulaResultSet, isValidListFormula, ListValidator } from '../list-validator';
import { getDataValidationCellValue, getSheetRangeValueSet, getTransformedFormula } from '../util';

function createWorksheet() {
    return {
        getSheetId: () => 'sheet1',
        getName: () => 'Sheet1',
        getCellRaw: vi.fn((row: number, col: number) => {
            const cells: Record<string, any> = {
                '0,0': { v: 'Red' },
                '0,1': { v: 'Green,Blue' },
                '1,0': { v: '' },
                '1,1': { v: 10 },
            };
            return cells[`${row},${col}`];
        }),
    };
}

function createContext() {
    const worksheet = createWorksheet();
    const workbook = {
        getUnitId: () => 'unit1',
        getActiveSheet: () => worksheet,
        getSheetBySheetId: vi.fn((sheetId: string) => (sheetId === 'sheet1' ? worksheet : undefined)),
        getSheetBySheetName: vi.fn((sheetName: string) => (sheetName === 'Sheet1' ? worksheet : undefined)),
    };
    const localeService = {
        t: vi.fn((key: string) => key),
    } as unknown as LocaleService;
    const formulaService = {
        getRuleFormulaResult: vi.fn(async () => ([{
            result: [[[
                [{ v: 'Blue' }, { v: 7, t: CellValueType.NUMBER, s: { n: { pattern: '0.00' } } }],
                [{ v: null }, { v: 'Red' }],
            ]]],
        }])),
    };
    const listCacheService = {
        getOrCompute: vi.fn(() => ({
            list: ['Red', 'Green', 'Blue'],
            listWithColor: [{ label: 'Red', color: '#ff0000' }, { label: 'Green', color: '#00ff00' }],
            colorMap: { Red: '#ff0000', Green: '#00ff00' },
        })),
    };
    const lexerTreeBuilder = new LexerTreeBuilder();
    const univerInstanceService = {
        getUnit: vi.fn(() => workbook),
        getUniverSheetInstance: vi.fn(() => workbook),
        getCurrentUnitOfType: vi.fn((type: UniverInstanceType) => (type === UniverInstanceType.UNIVER_SHEET ? workbook : undefined)),
    };
    const injector = {
        get(token: unknown) {
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
        worksheet,
        workbook,
        localeService,
        formulaService,
        listCacheService,
        lexerTreeBuilder,
        univerInstanceService,
        injector,
        validator: new ListValidator(localeService, injector),
    };
}

describe('list-validator helpers', () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('collects formatted values and skips empty cells', () => {
        const result = getRuleFormulaResultSet([
            [
                {
                    v: 1234,
                    s: {
                        n: {
                            pattern: '#,##0.00',
                        },
                    },
                } as ICellData,
                {
                    v: 'Alpha',
                } as ICellData,
                null,
            ],
            [
                {
                    v: undefined,
                } as ICellData,
                {
                    v: false,
                } as ICellData,
            ],
        ]);

        expect(result).toEqual(['1,234.00', 'Alpha', '', 'false']);
    });

    it('accepts direct references and supported helper formulas only', () => {
        const lexer = new LexerTreeBuilder();

        expect(isValidListFormula('Red,Green,Blue', lexer)).toBe(true);
        expect(isValidListFormula('=A1:A3', lexer)).toBe(true);
        expect(isValidListFormula('=IF(A1>0,B1:B3,C1:C3)', lexer)).toBe(true);
        expect(isValidListFormula('=OFFSET(A1,0,0,2,1)', lexer)).toBe(true);
        expect(isValidListFormula('=SUM(A1:A3)', lexer)).toBe(false);

        lexer.dispose();
    });

    it('validates list formulas and rejects self-intersecting reference lists', () => {
        const { validator } = createContext();

        expect(validator.validatorFormula({ formula1: '' } as any, 'unit1', 'sheet1')).toEqual({
            success: false,
            formula1: 'sheets-data-validation.validFail.list',
        });
        expect(validator.validatorFormula({ formula1: '=SUM(A1:A2)' } as any, 'unit1', 'sheet1')).toEqual({
            success: false,
            formula1: 'sheets-data-validation.validFail.listInvalid',
        });
        expect(validator.validatorFormula({
            formula1: '=A1:A2',
            ranges: [{ startRow: 0, startColumn: 0, endRow: 1, endColumn: 0 }],
        } as any, 'unit1', 'sheet1')).toEqual({
            success: false,
            formula1: 'sheets-data-validation.validFail.listIntersects',
        });
        expect(validator.validatorFormula({
            formula1: '=Sheet2!A1:A2',
            ranges: [{ startRow: 0, startColumn: 0, endRow: 1, endColumn: 0 }],
        } as any, 'unit1', 'sheet1')).toEqual({
            success: true,
            formula1: undefined,
        });
    });

    it('applies list option colors and validates list/list-multiple selections', async () => {
        const { validator, listCacheService } = createContext();
        const rule = {
            uid: 'rule-list',
            type: DataValidationType.LIST,
            renderMode: DataValidationRenderMode.ARROW,
            formula1: 'Red,Green,Blue',
        } as any;

        expect(validator.skipDefaultFontRender(rule)).toBe(true);
        expect(validator.skipDefaultFontRender({ ...rule, renderMode: DataValidationRenderMode.TEXT })).toBe(false);
        expect(validator.getExtraStyle(rule, 'Red', { style: { tb: WrapStrategy.OVERFLOW } as any })).toEqual({
            bg: { rgb: '#ff0000' },
            tb: WrapStrategy.CLIP,
        });
        expect(validator.getExtraStyle({ ...rule, renderMode: undefined }, 'Missing', { style: {} as any })).toEqual({
            tb: WrapStrategy.WRAP,
        });
        expect(validator.parseCellValue('Red,Green,Blue')).toEqual(['Red', 'Green', 'Blue']);

        await expect(validator.isValidType(
            { value: 'Green', unitId: 'unit1', subUnitId: 'sheet1' } as any,
            {} as any,
            rule
        )).resolves.toBe(true);
        await expect(validator.isValidType(
            { value: 'Missing', unitId: 'unit1', subUnitId: 'sheet1' } as any,
            {} as any,
            rule
        )).resolves.toBe(false);
        await expect(validator.isValidType(
            { value: 'Red,Blue', unitId: 'unit1', subUnitId: 'sheet1' } as any,
            {} as any,
            { ...rule, type: DataValidationType.LIST_MULTIPLE }
        )).resolves.toBe(true);
        await expect(validator.isValidType(
            { value: undefined, unitId: 'unit1', subUnitId: 'sheet1' } as any,
            {} as any,
            rule
        )).resolves.toBe(true);

        expect(listCacheService.getOrCompute).toHaveBeenCalled();
    });

    it('reads cached and async list options for the active workbook', async () => {
        const { validator, formulaService, listCacheService } = createContext();
        const formulaRule = {
            uid: 'formula-list',
            type: DataValidationType.LIST,
            formula1: '=Sheet1!A1:B2',
        } as any;

        expect(validator.getList(formulaRule, 'unit1', 'sheet1')).toEqual(['Red', 'Green', 'Blue']);
        expect(validator.getListWithColor(formulaRule, 'unit1', 'sheet1')).toEqual([
            { label: 'Red', color: '#ff0000' },
            { label: 'Green', color: '#00ff00' },
        ]);
        expect(validator.getListWithColorMap(formulaRule, 'unit1', 'sheet1')).toEqual({
            Red: '#ff0000',
            Green: '#00ff00',
        });
        await expect(validator.getListAsync(formulaRule, 'unit1', 'sheet1')).resolves.toEqual(['Blue', '7.00', 'Red']);
        await expect(validator.getListAsync({ ...formulaRule, formula1: 'A,B' }, 'unit1', 'sheet1')).resolves.toEqual(['A', 'B']);
        await expect(validator.parseFormula(formulaRule, 'unit1', 'sheet1')).resolves.toEqual({
            formula1: undefined,
            formula2: undefined,
            isFormulaValid: true,
        });
        expect(validator.generateRuleName()).toBe('sheets-data-validation.list.name');
        expect(validator.generateRuleErrorMessage()).toBe('sheets-data-validation.list.error');
        expect(formulaService.getRuleFormulaResult).toHaveBeenCalled();
        expect(listCacheService.getOrCompute).toHaveBeenCalled();
    });

    it('returns empty lists when no workbook or worksheet can be resolved', async () => {
        const context = createContext();
        context.univerInstanceService.getUniverSheetInstance.mockReturnValueOnce(undefined as any);
        context.univerInstanceService.getCurrentUnitOfType.mockReturnValueOnce(undefined as any);

        expect(context.validator.getList({ formula1: 'A,B' } as any, 'missing', 'sheet1')).toEqual([]);
        context.univerInstanceService.getUniverSheetInstance.mockReturnValue({
            getSheetBySheetId: () => undefined,
            getActiveSheet: () => undefined,
        } as any);
        context.univerInstanceService.getCurrentUnitOfType.mockReturnValue(undefined as any);
        expect(context.validator.getListWithColor({ formula1: 'A,B' } as any, 'unit1', 'missing')).toEqual([]);
        expect(context.validator.getListWithColorMap({ formula1: 'A,B' } as any, 'unit1', 'missing')).toEqual({});
        await expect(context.validator.getListAsync({ formula1: 'A,B' } as any, 'unit1', 'missing')).resolves.toEqual([]);
    });

    it('extracts values from sheet ranges and single cells', () => {
        const { univerInstanceService } = createContext();

        expect(getSheetRangeValueSet({
            unitId: 'unit1',
            sheetName: 'Sheet1',
            range: { startRow: 0, startColumn: 0, endRow: 1, endColumn: 1 },
        }, univerInstanceService as any, 'unit1', 'sheet1')).toEqual(['Red', 'Green,Blue', '10']);

        expect(getDataValidationCellValue(null)).toBe('');
        expect(getDataValidationCellValue({ v: 12 })).toBe('12');
        expect(getDataValidationCellValue({ v: true })).toBe('true');
    });

    it('offsets formula references relative to the validated cell position', () => {
        const lexer = {
            moveFormulaRefOffset: vi.fn((formula: string, col: number, row: number) => `${formula}:${col}:${row}`),
        };

        expect(getTransformedFormula(lexer as any, {
            formula1: '=A1',
            formula2: 'B',
            ranges: [{ startRow: 2, startColumn: 3, endRow: 2, endColumn: 3 }],
        } as any, {
            row: 5,
            col: 7,
        } as any)).toEqual({
            transformedFormula1: '=A1:4:3',
            transformedFormula2: 'B',
        });
        expect(lexer.moveFormulaRefOffset).toHaveBeenCalledWith('=A1', 4, 3, true);
    });

    it('collects legal formula results from mixed formula result cells', () => {
        expect(getRuleFormulaResultSet([
            [{ v: '#VALUE!' }, { v: 'OK' }],
            [{ v: 3, s: { n: { pattern: '0.0' } } } as any],
        ] as any)).toEqual(['OK', '3.0']);
    });
});

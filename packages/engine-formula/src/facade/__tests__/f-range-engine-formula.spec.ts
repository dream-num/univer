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

import type { Injector, IWorkbookData } from '@univerjs/core';
import type { FUniver } from '@univerjs/core/facade';
import { ICommandService, LocaleType } from '@univerjs/core';
import { ErrorType } from '@univerjs/engine-formula';
import { SetRangeValuesCommand, SetRangeValuesMutation } from '@univerjs/sheets';
import { beforeEach, describe, expect, it } from 'vitest';
import { createFacadeTestBed } from './create-test-bed';

function getTestWorkbookDataWithFormulas(): IWorkbookData {
    return {
        id: 'test',
        appVersion: '3.0.0-alpha',
        sheets: {
            sheet1: {
                id: 'sheet1',
                name: 'sheet1',
                cellData: {
                    0: {
                        0: {
                            v: 1,
                        },
                        1: {
                            v: 2,
                        },
                        2: {
                            f: '=SUM(A1:B1)',
                            v: 3,
                        },
                        3: {
                            f: '=A1/0',
                            v: ErrorType.DIV_BY_ZERO,
                            t: 4,
                        },
                    },
                    1: {
                        0: {
                            f: '=UNKNOWN_FUNCTION()',
                            v: ErrorType.NAME,
                            t: 4,
                        },
                        1: {
                            f: '=SUM(A1,A2)',
                            v: 2,
                        },
                        2: {
                            f: '=SQRT(-1)',
                            v: ErrorType.NUM,
                            t: 4,
                        },
                    },
                    2: {
                        0: {
                            v: 'text',
                        },
                        1: {
                            f: '=A3+B2',
                            v: ErrorType.VALUE,
                            t: 4,
                        },
                        2: {
                            v: 'normal text',
                        },
                    },
                    3: {
                        0: {
                            v: 10,
                        },
                        1: {
                            v: 20,
                        },
                        2: {
                            f: '=A4+B4',
                            v: 30,
                        },
                    },
                },
                rowCount: 100,
                columnCount: 100,
            },
        },
        locale: LocaleType.ZH_CN,
        name: 'Test Workbook',
        sheetOrder: ['sheet1'],
        styles: {},
    };
}

describe('Test FRangeEngineFormulaMixin', () => {
    let get: Injector['get'];
    let commandService: ICommandService;
    let univerAPI: FUniver;

    beforeEach(() => {
        const testBed = createFacadeTestBed(getTestWorkbookDataWithFormulas());
        get = testBed.get;
        univerAPI = testBed.univerAPI;

        commandService = get(ICommandService);
        commandService.registerCommand(SetRangeValuesCommand);
        commandService.registerCommand(SetRangeValuesMutation);
    });

    it('should get formula errors in a specific range', () => {
        const workbook = univerAPI.getActiveWorkbook()!;
        const worksheet = workbook.getActiveSheet()!;

        // Test range that contains errors (A1:D2)
        const range = worksheet.getRange('A1:D2');
        const errors = range.getFormulaError();

        expect(errors).toBeDefined();
        expect(Array.isArray(errors)).toBe(true);
        expect(errors.length).toBeGreaterThan(0);

        // Check for specific error types in this range
        const divByZeroErrors = errors.filter((e) => e.errorType === ErrorType.DIV_BY_ZERO);
        const nameErrors = errors.filter((e) => e.errorType === ErrorType.NAME);
        const numErrors = errors.filter((e) => e.errorType === ErrorType.NUM);

        expect(divByZeroErrors.length).toBe(1);
        expect(nameErrors.length).toBe(1);
        expect(numErrors.length).toBe(1);

        // All errors should be within the specified range
        errors.forEach((error) => {
            expect(error.row >= 0).toBe(true);
            expect(error.row <= 1).toBe(true);
            expect(error.column >= 0).toBe(true);
            expect(error.column <= 3).toBe(true);
            expect(error.sheetName).toBe('sheet1');
        });
    });

    it('should return empty array for range with no formula errors', () => {
        const workbook = univerAPI.getActiveWorkbook()!;
        const worksheet = workbook.getActiveSheet()!;

        // Test range that contains no errors (A1:B1 - only regular values)
        const range = worksheet.getRange('A1:B1');
        const errors = range.getFormulaError();

        expect(errors).toBeDefined();
        expect(Array.isArray(errors)).toBe(true);
        expect(errors.length).toBe(0);
    });

    it('should get formula errors in a single cell range', () => {
        const workbook = univerAPI.getActiveWorkbook()!;
        const worksheet = workbook.getActiveSheet()!;

        // Test single cell with error (D1 contains DIV_BY_ZERO error)
        const range = worksheet.getRange('D1');
        const errors = range.getFormulaError();

        expect(errors).toBeDefined();
        expect(Array.isArray(errors)).toBe(true);
        expect(errors.length).toBe(1);

        const error = errors[0];
        expect(error.errorType).toBe(ErrorType.DIV_BY_ZERO);
        expect(error.row).toBe(0);
        expect(error.column).toBe(3);
        expect(error.formula).toBe('=A1/0');
        expect(error.sheetName).toBe('sheet1');
    });

    it('should handle range with mixed content (errors and normal values)', () => {
        const workbook = univerAPI.getActiveWorkbook()!;
        const worksheet = workbook.getActiveSheet()!;

        // Test range that contains both errors and normal values (A1:C3)
        const range = worksheet.getRange('A1:C3');
        const errors = range.getFormulaError();

        expect(errors).toBeDefined();
        expect(Array.isArray(errors)).toBe(true);
        expect(errors.length).toBe(3); // Should find VALUE and NUM errors

        const errorTypes = new Set(errors.map((e) => e.errorType));
        expect(errorTypes.has(ErrorType.NAME)).toBe(true);
        expect(errorTypes.has(ErrorType.VALUE)).toBe(true);
        expect(errorTypes.has(ErrorType.NUM)).toBe(true);
    });

    it('should validate error object properties', () => {
        const workbook = univerAPI.getActiveWorkbook()!;
        const worksheet = workbook.getActiveSheet()!;

        // Test range with known error
        const range = worksheet.getRange('A2:C2');
        const errors = range.getFormulaError();

        expect(errors.length).toBeGreaterThan(0);

        errors.forEach((error) => {
            expect(error).toHaveProperty('sheetName');
            expect(error).toHaveProperty('row');
            expect(error).toHaveProperty('column');
            expect(error).toHaveProperty('formula');
            expect(error).toHaveProperty('errorType');

            expect(typeof error.sheetName).toBe('string');
            expect(typeof error.row).toBe('number');
            expect(typeof error.column).toBe('number');
            expect(typeof error.formula).toBe('string');
            expect(typeof error.errorType).toBe('string');

            expect(error.sheetName).toBe('sheet1');
            expect(error.row >= 1).toBe(true);
            expect(error.row <= 1).toBe(true);
            expect(error.column >= 0).toBe(true);
            expect(error.column <= 2).toBe(true);
            expect(error.formula.startsWith('=')).toBe(true);
        });
    });

    it('should return empty array for range with only normal formulas', () => {
        const workbook = univerAPI.getActiveWorkbook()!;
        const worksheet = workbook.getActiveSheet()!;

        // Test range that contains normal formulas without errors (A4:C4)
        const range = worksheet.getRange('A4:C4');
        const errors = range.getFormulaError();

        expect(errors).toBeDefined();
        expect(Array.isArray(errors)).toBe(true);
        expect(errors.length).toBe(0);
    });

    it('should handle large range correctly', () => {
        const workbook = univerAPI.getActiveWorkbook()!;
        const worksheet = workbook.getActiveSheet()!;

        // Test large range that includes all test data
        const range = worksheet.getRange('A1:Z100');
        const errors = range.getFormulaError();

        expect(errors).toBeDefined();
        expect(Array.isArray(errors)).toBe(true);

        // Should find all the errors in the worksheet
        const errorTypes = new Set(errors.map((e) => e.errorType));
        expect(errorTypes.has(ErrorType.DIV_BY_ZERO)).toBe(true);
        expect(errorTypes.has(ErrorType.NAME)).toBe(true);
        expect(errorTypes.has(ErrorType.NUM)).toBe(true);
        expect(errorTypes.has(ErrorType.VALUE)).toBe(true);
    });

    it('should identify different error types correctly in range', () => {
        const workbook = univerAPI.getActiveWorkbook()!;
        const worksheet = workbook.getActiveSheet()!;

        // Test range containing different error types
        const range = worksheet.getRange('A1:D3');
        const errors = range.getFormulaError();

        const errorsByType: Partial<Record<ErrorType, number>> = {
            [ErrorType.DIV_BY_ZERO]: 0,
            [ErrorType.NAME]: 0,
            [ErrorType.NUM]: 0,
            [ErrorType.VALUE]: 0,
        };

        errors.forEach((error) => {
            if (error.errorType in errorsByType) {
                errorsByType[error.errorType] = (errorsByType[error.errorType] || 0) + 1;
            }
        });

        expect(errorsByType[ErrorType.DIV_BY_ZERO]).toBe(1);
        expect(errorsByType[ErrorType.NAME]).toBe(1);
        expect(errorsByType[ErrorType.NUM]).toBe(1);
        expect(errorsByType[ErrorType.VALUE]).toBe(1);
    });
});

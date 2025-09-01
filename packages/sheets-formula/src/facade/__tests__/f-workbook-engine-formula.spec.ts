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
                    },
                },
                rowCount: 100,
                columnCount: 100,
            },
            sheet2: {
                id: 'sheet2',
                name: 'sheet2',
                cellData: {
                    0: {
                        0: {
                            f: '=1/0',
                            v: ErrorType.DIV_BY_ZERO,
                            t: 4,
                        },
                    },
                },
                rowCount: 100,
                columnCount: 100,
            },
        },
        locale: LocaleType.ZH_CN,
        name: 'Test Workbook',
        sheetOrder: ['sheet1', 'sheet2'],
        styles: {},
    };
}

describe('Test FWorkbookEngineFormulaMixin', () => {
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

    it('should get all formula errors in the workbook', () => {
        const workbook = univerAPI.getActiveWorkbook()!;
        const errors = workbook.getAllFormulaError();

        expect(errors).toBeDefined();
        expect(Array.isArray(errors)).toBe(true);
        expect(errors.length).toBeGreaterThan(0);

        // Check for specific error types
        const divByZeroErrors = errors.filter((e) => e.errorType === ErrorType.DIV_BY_ZERO);
        const nameErrors = errors.filter((e) => e.errorType === ErrorType.NAME);
        const numErrors = errors.filter((e) => e.errorType === ErrorType.NUM);
        const valueErrors = errors.filter((e) => e.errorType === ErrorType.VALUE);

        expect(divByZeroErrors.length).toBeGreaterThan(0);
        expect(nameErrors.length).toBeGreaterThan(0);
        expect(numErrors.length).toBeGreaterThan(0);
        expect(valueErrors.length).toBeGreaterThan(0);

        // Check error details
        const firstError = errors[0];
        expect(firstError).toHaveProperty('sheetName');
        expect(firstError).toHaveProperty('row');
        expect(firstError).toHaveProperty('column');
        expect(firstError).toHaveProperty('formula');
        expect(firstError).toHaveProperty('errorType');
        expect(typeof firstError.sheetName).toBe('string');
        expect(typeof firstError.row).toBe('number');
        expect(typeof firstError.column).toBe('number');
        expect(typeof firstError.formula).toBe('string');
    });

    it('should identify different error types correctly', () => {
        const workbook = univerAPI.getActiveWorkbook()!;
        const errors = workbook.getAllFormulaError();

        const errorTypes = new Set(errors.map((e) => e.errorType));

        // Should contain multiple error types from our test data
        expect(errorTypes.has(ErrorType.DIV_BY_ZERO)).toBe(true);
        expect(errorTypes.has(ErrorType.NAME)).toBe(true);
        expect(errorTypes.has(ErrorType.NUM)).toBe(true);
        expect(errorTypes.has(ErrorType.VALUE)).toBe(true);
    });

    it('should include correct formula strings in error results', () => {
        const workbook = univerAPI.getActiveWorkbook()!;
        const errors = workbook.getAllFormulaError();

        // Find specific errors and check their formula strings
        const divByZeroError = errors.find((e) => e.errorType === ErrorType.DIV_BY_ZERO);
        const nameError = errors.find((e) => e.errorType === ErrorType.NAME);

        expect(divByZeroError).toBeDefined();
        expect(divByZeroError!.formula).toContain('=');

        expect(nameError).toBeDefined();
        expect(nameError!.formula).toContain('=');
    });

    it('should find errors across multiple sheets', () => {
        const workbook = univerAPI.getActiveWorkbook()!;
        const errors = workbook.getAllFormulaError();

        const sheetNames = new Set(errors.map((e) => e.sheetName));

        // Should find errors in both sheets
        expect(sheetNames.has('sheet1')).toBe(true);
        expect(sheetNames.has('sheet2')).toBe(true);
        expect(sheetNames.size).toBe(2);
    });
});

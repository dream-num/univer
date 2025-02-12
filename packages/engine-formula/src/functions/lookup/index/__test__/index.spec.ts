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
import type { LexerNode } from '../../../../engine/analysis/lexer-node';

import type { BaseAstNode } from '../../../../engine/ast-node/base-ast-node';
import { CellValueType, LocaleType } from '@univerjs/core';
import { beforeEach, describe, expect, it } from 'vitest';
import { ErrorType } from '../../../../basics/error-type';
import { Lexer } from '../../../../engine/analysis/lexer';
import { AstTreeBuilder } from '../../../../engine/analysis/parser';
import { Interpreter } from '../../../../engine/interpreter/interpreter';
import { generateExecuteAstNodeData } from '../../../../engine/utils/ast-node-tool';
import { IFormulaCurrentConfigService } from '../../../../services/current-data.service';
import { IFunctionService } from '../../../../services/function.service';
import { IFormulaRuntimeService } from '../../../../services/runtime.service';
import { createFunctionTestBed, getObjectValue } from '../../../__tests__/create-function-test-bed';
import { FUNCTION_NAMES_LOOKUP } from '../../function-names';
import { Index } from '../index';

const getTestWorkbookData = (): IWorkbookData => {
    return {
        id: 'test',
        appVersion: '3.0.0-alpha',
        sheets: {
            sheet1: {
                id: 'sheet1',
                cellData: {
                    0: {
                        0: {
                            v: 1,
                            t: CellValueType.NUMBER,
                        },
                        1: {
                            v: 2,
                            t: CellValueType.NUMBER,
                        },
                    },
                    1: {
                        0: {
                            v: 3,
                            t: CellValueType.NUMBER,
                        },
                        1: {
                            v: 4,
                            t: CellValueType.NUMBER,
                        },
                        2: {
                            v: 'B2',
                            t: CellValueType.STRING,
                        },
                        3: {
                            v: 'R2C2',
                            t: CellValueType.STRING,
                        },
                    },
                    2: {
                        0: {
                            v: 1,
                            t: CellValueType.NUMBER,
                        },
                        1: {
                            v: ' ',
                            t: CellValueType.STRING,
                        },
                        2: {
                            v: 1.23,
                            t: CellValueType.NUMBER,
                        },
                        3: {
                            v: true,
                            t: CellValueType.BOOLEAN,
                        },
                        4: {
                            v: false,
                            t: CellValueType.BOOLEAN,
                        },
                    },
                    3: {
                        0: {
                            v: 0,
                            t: CellValueType.NUMBER,
                        },
                        1: {
                            v: '100',
                        },
                        2: {
                            v: '2.34',
                        },
                        3: {
                            v: 'test',
                            t: CellValueType.STRING,
                        },
                        4: {
                            v: -3,
                            t: CellValueType.NUMBER,
                        },
                    },
                    5: {
                        0: {
                            v: 'Tom',
                            t: CellValueType.STRING,
                        },
                        1: {
                            v: 'Sarah',
                            t: CellValueType.STRING,
                        },
                    },
                    6: {
                        0: {
                            v: 'Alex',
                            t: CellValueType.STRING,
                        },
                        1: {
                            v: 'Mickey',
                            t: CellValueType.STRING,
                        },
                    },
                },
            },
        },
        locale: LocaleType.ZH_CN,
        name: '',
        sheetOrder: [],
        styles: {},
    };
};
describe('Test index', () => {
    let get: Injector['get'];
    let lexer: Lexer;
    let astTreeBuilder: AstTreeBuilder;
    let interpreter: Interpreter;
    let calculate: (formula: string) => (string | number | boolean | null)[][] | string | number | boolean;

    beforeEach(() => {
        const testBed = createFunctionTestBed(getTestWorkbookData());

        get = testBed.get;

        lexer = get(Lexer);
        astTreeBuilder = get(AstTreeBuilder);
        interpreter = get(Interpreter);

        const functionService = get(IFunctionService);

        const formulaCurrentConfigService = get(IFormulaCurrentConfigService);

        const formulaRuntimeService = get(IFormulaRuntimeService);

        formulaCurrentConfigService.load({
            formulaData: {},
            arrayFormulaCellData: {},
            arrayFormulaRange: {},
            forceCalculate: false,
            dirtyRanges: [],
            dirtyNameMap: {},
            dirtyDefinedNameMap: {},
            dirtyUnitFeatureMap: {},
            excludedCell: {},
            allUnitData: {
                [testBed.unitId]: testBed.sheetData,
            },
            dirtyUnitOtherFormulaMap: {},
        });

        const sheetItem = testBed.sheetData[testBed.sheetId];

        formulaRuntimeService.setCurrent(
            0,
            0,
            sheetItem.rowCount,
            sheetItem.columnCount,
            testBed.sheetId,
            testBed.unitId
        );

        functionService.registerExecutors(
            new Index(FUNCTION_NAMES_LOOKUP.INDEX)
        );

        calculate = (formula: string) => {
            const lexerNode = lexer.treeBuilder(formula);

            const astNode = astTreeBuilder.parse(lexerNode as LexerNode);

            const result = interpreter.execute(generateExecuteAstNodeData(astNode as BaseAstNode));

            return getObjectValue(result);
        };
    });

    describe('One row', () => {
        it('Column number null, different row parameters', async () => {
            // null
            const result = await calculate('=INDEX(A6:B6)');

            expect(result).toStrictEqual([['Tom', 'Sarah']]);
        });

        it('Column number blank cell, different row parameters', async () => {
           // null
            let result = await calculate('=INDEX(A6:B6,)');

            expect(result).toStrictEqual([['Tom', 'Sarah']]);

           // blank cell
            result = await calculate('=INDEX(A6:B6,,)');

            expect(result).toStrictEqual([['Tom', 'Sarah']]);

           // 0
            result = await calculate('=INDEX(A6:B6,0,)');

            expect(result).toStrictEqual([['Tom', 'Sarah']]);

           // Not exceed the maximum number of rows
            result = await calculate('=INDEX(A6:B6,1,)');

            expect(result).toStrictEqual([['Tom', 'Sarah']]);

           // Exceeds maximum number of rows
            result = await calculate('=INDEX(A6:B6,2,)');

            expect(result).toBe(ErrorType.REF);

           // Array
            result = await calculate('=INDEX(A6:B6,A3:F4,)');

            expect(result).toStrictEqual([['Tom', ErrorType.VALUE, 'Tom', 'Tom', 'Tom', 'Tom'], ['Tom', ErrorType.REF, ErrorType.REF, ErrorType.VALUE, ErrorType.VALUE, 'Tom']]);
        });

        it('Column number 0, different row parameters', async () => {
            // null
            let result = await calculate('=INDEX(A6:B6,0)');

            expect(result).toStrictEqual([['Tom', 'Sarah']]);

            // blank cell
            result = await calculate('=INDEX(A6:B6,,0)');

            expect(result).toStrictEqual([['Tom', 'Sarah']]);

            // 0
            result = await calculate('=INDEX(A6:B6,0,0)');

            expect(result).toStrictEqual([['Tom', 'Sarah']]);

            // Not exceed the maximum number of rows
            result = await calculate('=INDEX(A6:B6,1,0)');

            expect(result).toStrictEqual([['Tom', 'Sarah']]);

            // Exceeds maximum number of rows
            result = await calculate('=INDEX(A6:B6,2,0)');

            expect(result).toBe(ErrorType.REF);

            // Array
            result = await calculate('=INDEX(A6:B6,A3:F4,0)');

            expect(result).toStrictEqual([['Tom', ErrorType.VALUE, 'Tom', 'Tom', 'Tom', 'Tom'], ['Tom', ErrorType.REF, ErrorType.REF, ErrorType.VALUE, ErrorType.VALUE, 'Tom']]);
        });

        it('Column number does not exceed the maximum number of columns, different row parameters', async () => {
            // null
            let result = await calculate('=INDEX(A6:B6,2)');

            expect(result).toStrictEqual([['Sarah']]);

            // blank cell
            result = await calculate('=INDEX(A6:B6,,2)');

            expect(result).toStrictEqual([['Sarah']]);

            // 0
            result = await calculate('=INDEX(A6:B6,0,2)');

            expect(result).toStrictEqual([['Sarah']]);

            // Not exceed the maximum number of rows
            result = await calculate('=INDEX(A6:B6,1,2)');

            expect(result).toStrictEqual([['Sarah']]);

            // Exceeds maximum number of rows
            result = await calculate('=INDEX(A6:B6,2,2)');

            expect(result).toBe(ErrorType.REF);

            // Array
            result = await calculate('=INDEX(A6:B6,A3:F4,2)');

            expect(result).toStrictEqual([['Sarah', ErrorType.VALUE, 'Sarah', 'Sarah', 'Sarah', 'Sarah'], ['Sarah', ErrorType.REF, ErrorType.REF, ErrorType.VALUE, ErrorType.VALUE, 'Sarah']]);
        });

        it('Column number exceeds the maximum number of columns, different row parameters', async () => {
            // null
            let result = await calculate('=INDEX(A6:B6,3)');

            expect(result).toBe(ErrorType.REF);

            // blank cell
            result = await calculate('=INDEX(A6:B6,,3)');

            expect(result).toBe(ErrorType.REF);

            // 0
            result = await calculate('=INDEX(A6:B6,0,3)');

            expect(result).toBe(ErrorType.REF);

            // Not exceed the maximum number of rows
            result = await calculate('=INDEX(A6:B6,1,3)');

            expect(result).toBe(ErrorType.REF);

            // Exceeds maximum number of rows
            result = await calculate('=INDEX(A6:B6,2,3)');

            expect(result).toBe(ErrorType.REF);

            // Array
            result = await calculate('=INDEX(A6:B6,A3:F4,3)');

            expect(result).toStrictEqual([[ErrorType.REF, ErrorType.VALUE, ErrorType.REF, ErrorType.REF, ErrorType.REF, ErrorType.REF], [ErrorType.REF, ErrorType.REF, ErrorType.REF, ErrorType.VALUE, ErrorType.VALUE, ErrorType.REF]]);
        });

        it('Column number array, different row parameters', async () => {
            // null
            let result = await calculate('=INDEX(A6:B6,A3:A5)');

            expect(result).toStrictEqual([['Tom'], ['Tom'], ['Tom']]);

            // blank cell
            result = await calculate('=INDEX(A6:B6,,A3:A5)');

            expect(result).toStrictEqual([['Tom'], ['Tom'], ['Tom']]);

            // 0
            result = await calculate('=INDEX(A6:B6,0,A3:A5)');

            expect(result).toStrictEqual([['Tom'], ['Tom'], ['Tom']]);

            // Not exceed the maximum number of rows
            result = await calculate('=INDEX(A6:B6,1,A3:A5)');

            expect(result).toStrictEqual([['Tom'], ['Tom'], ['Tom']]);

            // Exceeds maximum number of rows
            result = await calculate('=INDEX(A6:B6,2,A3:A5)');

            expect(result).toStrictEqual([[ErrorType.REF], [ErrorType.REF], [ErrorType.REF]]);

            // Array
            result = await calculate('=INDEX(A6:B6,A3:F4,A3:A5)');

            expect(result).toStrictEqual([['Tom', ErrorType.VALUE, 'Tom', 'Tom', 'Tom', 'Tom'], ['Tom', ErrorType.REF, ErrorType.REF, ErrorType.VALUE, ErrorType.VALUE, 'Tom'], [ErrorType.NA, ErrorType.NA, ErrorType.NA, ErrorType.NA, ErrorType.NA, ErrorType.NA]]);
        });
    });

    describe('One column', () => {
        it('Row number null, different column parameters', async () => {
            // null
            const result = await calculate('=INDEX(A6:A7)');

            expect(result).toStrictEqual([['Tom'], ['Alex']]);
        });

        it('Row number blank cell, different column parameters', async () => {
           // null
            let result = await calculate('=INDEX(A6:A7,)');

            expect(result).toStrictEqual([['Tom'], ['Alex']]);

           // blank cell
            result = await calculate('=INDEX(A6:A7,,)');

            expect(result).toStrictEqual([['Tom'], ['Alex']]);

           // 0
            result = await calculate('=INDEX(A6:A7,,0)');

            expect(result).toStrictEqual([['Tom'], ['Alex']]);

           // Not exceed the maximum number of columns
            result = await calculate('=INDEX(A6:A7,,1)');

            expect(result).toStrictEqual([['Tom'], ['Alex']]);

           // Exceeds maximum number of columns
            result = await calculate('=INDEX(A6:A7,,2)');

            expect(result).toBe(ErrorType.REF);

           // Array
            result = await calculate('=INDEX(A6:A7,,A3:F4)');

            expect(result).toStrictEqual([['Tom', ErrorType.VALUE, 'Tom', 'Tom', 'Tom', 'Tom'], ['Tom', ErrorType.REF, ErrorType.REF, ErrorType.VALUE, ErrorType.VALUE, 'Tom']]);
        });

        it('Row number 0, different column parameters', async () => {
            // null
            let result = await calculate('=INDEX(A6:A7,0)');

            expect(result).toStrictEqual([['Tom'], ['Alex']]);

            // blank cell
            result = await calculate('=INDEX(A6:A7,0,)');

            expect(result).toStrictEqual([['Tom'], ['Alex']]);

            // 0
            result = await calculate('=INDEX(A6:A7,0,0)');

            expect(result).toStrictEqual([['Tom'], ['Alex']]);

            // Not exceed the maximum number of columns
            result = await calculate('=INDEX(A6:A7,0,1)');

            expect(result).toStrictEqual([['Tom'], ['Alex']]);

            // Exceeds maximum number of columns
            result = await calculate('=INDEX(A6:A7,0,2)');

            expect(result).toBe(ErrorType.REF);

            // Array
            result = await calculate('=INDEX(A6:A7,0,A3:F4)');

            expect(result).toStrictEqual([['Tom', ErrorType.VALUE, 'Tom', 'Tom', 'Tom', 'Tom'], ['Tom', ErrorType.REF, ErrorType.REF, ErrorType.VALUE, ErrorType.VALUE, 'Tom']]);
        });

        it('Row number does not exceed the maximum number of rows, different column parameters', async () => {
            // null
            let result = await calculate('=INDEX(A6:A7,2)');

            expect(result).toStrictEqual([['Alex']]);

            // blank cell
            result = await calculate('=INDEX(A6:A7,2,)');

            expect(result).toStrictEqual([['Alex']]);

            // 0
            result = await calculate('=INDEX(A6:A7,2,0)');

            expect(result).toStrictEqual([['Alex']]);

            // Not exceed the maximum number of columns
            result = await calculate('=INDEX(A6:A7,2,1)');

            expect(result).toStrictEqual([['Alex']]);

            // Exceeds maximum number of columns
            result = await calculate('=INDEX(A6:A7,2,2)');

            expect(result).toBe(ErrorType.REF);

            // Array
            result = await calculate('=INDEX(A6:A7,2,A3:F4)');

            expect(result).toStrictEqual([['Alex', ErrorType.VALUE, 'Alex', 'Alex', 'Alex', 'Alex'], ['Alex', ErrorType.REF, ErrorType.REF, ErrorType.VALUE, ErrorType.VALUE, 'Alex']]);
        });

        it('Row number exceeds the maximum number of rows, different column parameters', async () => {
            // null
            let result = await calculate('=INDEX(A6:A7,3)');

            expect(result).toBe(ErrorType.REF);

            // blank cell
            result = await calculate('=INDEX(A6:A7,3,)');

            expect(result).toBe(ErrorType.REF);

            // 0
            result = await calculate('=INDEX(A6:A7,3,0)');

            expect(result).toBe(ErrorType.REF);

            // Not exceed the maximum number of columns
            result = await calculate('=INDEX(A6:A7,3,1)');

            expect(result).toBe(ErrorType.REF);

            // Exceeds maximum number of columns
            result = await calculate('=INDEX(A6:A7,3,2)');

            expect(result).toBe(ErrorType.REF);

            // Array
            result = await calculate('=INDEX(A6:A7,3,A3:F4)');

            expect(result).toStrictEqual([[ErrorType.REF, ErrorType.VALUE, ErrorType.REF, ErrorType.REF, ErrorType.REF, ErrorType.REF], [ErrorType.REF, ErrorType.REF, ErrorType.REF, ErrorType.VALUE, ErrorType.VALUE, ErrorType.REF]]);
        });

        it('Row number array, different column parameters', async () => {
            // null
            let result = await calculate('=INDEX(A6:A7,A3:A5)');

            expect(result).toStrictEqual([['Tom'], ['Tom'], ['Tom']]);

            // blank cell
            result = await calculate('=INDEX(A6:A7,A3:A5,)');

            expect(result).toStrictEqual([['Tom'], ['Tom'], ['Tom']]);

            // 0
            result = await calculate('=INDEX(A6:A7,A3:A5,0)');

            expect(result).toStrictEqual([['Tom'], ['Tom'], ['Tom']]);

            // Not exceed the maximum number of columns
            result = await calculate('=INDEX(A6:A7,A3:A5,1)');

            expect(result).toStrictEqual([['Tom'], ['Tom'], ['Tom']]);

            // Exceeds maximum number of columns
            result = await calculate('=INDEX(A6:A7,A3:A5,2)');

            expect(result).toStrictEqual([[ErrorType.REF], [ErrorType.REF], [ErrorType.REF]]);

            // Array
            result = await calculate('=INDEX(A6:A7,A3:A5,A3:F4)');

            expect(result).toStrictEqual([['Tom', ErrorType.VALUE, 'Tom', 'Tom', 'Tom', 'Tom'], ['Tom', ErrorType.REF, ErrorType.REF, ErrorType.VALUE, ErrorType.VALUE, 'Tom'], [ErrorType.NA, ErrorType.NA, ErrorType.NA, ErrorType.NA, ErrorType.NA, ErrorType.NA]]);
        });

        it('The result of the INDEX function is a reference', async () => {
            const result = await calculate('=INDEX(A2:A5,2,1):A1');

            expect(result).toStrictEqual([[1], [3], [1]]);
        });
    });

    describe('Multi rows and columns', () => {
        it('Row number null, different column parameters', async () => {
            // null
            const result = await calculate('=INDEX(A6:B7)');

            // reference Google Sheets
            expect(result).toStrictEqual([['Tom', 'Sarah'], ['Alex', 'Mickey']]);
        });

        it('Row number blank cell, different column parameters', async () => {
           // null
            let result = await calculate('=INDEX(A6:B7,)');

            // reference Google Sheets
            expect(result).toStrictEqual([['Tom', 'Sarah'], ['Alex', 'Mickey']]);

           // blank cell
            result = await calculate('=INDEX(A6:B7,,)');

            expect(result).toStrictEqual([['Tom', 'Sarah'], ['Alex', 'Mickey']]);

           // 0
            result = await calculate('=INDEX(A6:B7,,0)');

            expect(result).toStrictEqual([['Tom', 'Sarah'], ['Alex', 'Mickey']]);

           // Not exceed the maximum number of columns
            result = await calculate('=INDEX(A6:B7,,1)');

            expect(result).toStrictEqual([['Tom'], ['Alex']]);

           // Exceeds maximum number of columns
            result = await calculate('=INDEX(A6:B7,,3)');

            expect(result).toBe(ErrorType.REF);

           // Array
            result = await calculate('=INDEX(A6:B7,,A3:F4)');

            expect(result).toStrictEqual([['Tom', ErrorType.VALUE, 'Tom', 'Tom', 'Tom', 'Tom'], ['Tom', ErrorType.REF, 'Sarah', ErrorType.VALUE, ErrorType.VALUE, 'Tom']]);
        });

        it('Row number 0, different column parameters', async () => {
            // null
            let result = await calculate('=INDEX(A6:B7,0)');

            // reference Google Sheets
            expect(result).toStrictEqual([['Tom', 'Sarah'], ['Alex', 'Mickey']]);

            // blank cell
            result = await calculate('=INDEX(A6:B7,0,)');

            expect(result).toStrictEqual([['Tom', 'Sarah'], ['Alex', 'Mickey']]);

            // 0
            result = await calculate('=INDEX(A6:B7,0,0)');

            expect(result).toStrictEqual([['Tom', 'Sarah'], ['Alex', 'Mickey']]);

            // Not exceed the maximum number of columns
            result = await calculate('=INDEX(A6:B7,0,1)');

            expect(result).toStrictEqual([['Tom'], ['Alex']]);

            // Exceeds maximum number of columns
            result = await calculate('=INDEX(A6:B7,0,3)');

            expect(result).toBe(ErrorType.REF);

            // Array
            result = await calculate('=INDEX(A6:B7,0,A3:F4)');

            expect(result).toStrictEqual([['Tom', ErrorType.VALUE, 'Tom', 'Tom', 'Tom', 'Tom'], ['Tom', ErrorType.REF, 'Sarah', ErrorType.VALUE, ErrorType.VALUE, 'Tom']]);
        });

        it('Row number does not exceed the maximum number of rows, different column parameters', async () => {
            // null
            let result = await calculate('=INDEX(A6:B7,2)');

            // reference Google Sheets
            expect(result).toStrictEqual([['Alex', 'Mickey']]);

            // blank cell
            result = await calculate('=INDEX(A6:B7,2,)');

            expect(result).toStrictEqual([['Alex', 'Mickey']]);

            // 0
            result = await calculate('=INDEX(A6:B7,2,0)');

            expect(result).toStrictEqual([['Alex', 'Mickey']]);

            // Not exceed the maximum number of columns
            result = await calculate('=INDEX(A6:B7,2,1)');

            expect(result).toStrictEqual([['Alex']]);

            // Exceeds maximum number of columns
            result = await calculate('=INDEX(A6:B7,2,3)');

            expect(result).toBe(ErrorType.REF);

            // Array
            result = await calculate('=INDEX(A6:B7,2,A3:F4)');

            expect(result).toStrictEqual([['Alex', ErrorType.VALUE, 'Alex', 'Alex', 'Alex', 'Alex'], ['Alex', ErrorType.REF, 'Mickey', ErrorType.VALUE, ErrorType.VALUE, 'Alex']]);
        });

        it('Row number exceeds the maximum number of rows, different column parameters', async () => {
            // null
            let result = await calculate('=INDEX(A6:B7,3)');

            expect(result).toBe(ErrorType.REF);

            // blank cell
            result = await calculate('=INDEX(A6:B7,3,)');

            expect(result).toBe(ErrorType.REF);

            // 0
            result = await calculate('=INDEX(A6:B7,3,0)');

            expect(result).toBe(ErrorType.REF);

            // Not exceed the maximum number of columns
            result = await calculate('=INDEX(A6:B7,3,1)');

            expect(result).toBe(ErrorType.REF);

            // Exceeds maximum number of columns
            result = await calculate('=INDEX(A6:B7,3,3)');

            expect(result).toBe(ErrorType.REF);

            // Array
            result = await calculate('=INDEX(A6:B7,3,A3:F4)');

            expect(result).toStrictEqual([[ErrorType.REF, ErrorType.VALUE, ErrorType.REF, ErrorType.REF, ErrorType.REF, ErrorType.REF], [ErrorType.REF, ErrorType.REF, ErrorType.REF, ErrorType.VALUE, ErrorType.VALUE, ErrorType.REF]]);
        });

        it('Row number array, different column parameters', async () => {
            // null
            let result = await calculate('=INDEX(A6:B7,A3:A5)');

            // reference Google Sheets
            expect(result).toStrictEqual([['Tom'], ['Tom'], ['Tom']]);

            // blank cell
            result = await calculate('=INDEX(A6:B7,A3:A5,)');

            expect(result).toStrictEqual([['Tom'], ['Tom'], ['Tom']]);

            // 0
            result = await calculate('=INDEX(A6:B7,A3:A5,0)');

            expect(result).toStrictEqual([['Tom'], ['Tom'], ['Tom']]);

            // Not exceed the maximum number of columns
            result = await calculate('=INDEX(A6:B7,A3:A5,1)');

            expect(result).toStrictEqual([['Tom'], ['Tom'], ['Tom']]);

            // Exceeds maximum number of columns
            result = await calculate('=INDEX(A6:B7,A3:A5,3)');

            expect(result).toStrictEqual([[ErrorType.REF], [ErrorType.REF], [ErrorType.REF]]);

            // Array
            result = await calculate('=INDEX(A6:B7,A3:A5,A3:F4)');

            expect(result).toStrictEqual([['Tom', ErrorType.VALUE, 'Tom', 'Tom', 'Tom', 'Tom'], ['Tom', ErrorType.REF, 'Sarah', ErrorType.VALUE, ErrorType.VALUE, 'Tom'], [ErrorType.NA, ErrorType.NA, ErrorType.NA, ErrorType.NA, ErrorType.NA, ErrorType.NA]]);
        });
    });
    describe('Single base value object as referenceObject', () => {
        it('Row number 1, column number 1', async () => {
           // number
            let result = await calculate('=INDEX(1,1,1)');

            expect(result).toBe(1);

          // boolean
            result = await calculate('=INDEX(TRUE,1,1)');

            expect(result).toBe(true);

          // string
            result = await calculate('=INDEX("Univer",1,1)');

            expect(result).toBe('Univer');
        });
    });
    // supports array string
});

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
import { FUNCTION_NAMES_COMPATIBILITY } from '../../function-names';
import { Rank } from '../index';

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
                        2: {
                            v: 'a',
                            t: CellValueType.STRING,
                        },
                        3: {
                            v: true,
                            t: CellValueType.BOOLEAN,
                        },
                        4: {
                            v: 0,
                            t: CellValueType.NUMBER,
                        },
                        5: {
                            v: 5,
                            t: CellValueType.NUMBER,
                        },
                        6: {
                            v: ErrorType.NAME,
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

describe('Test rank function', () => {
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
            dirtyUnitOtherFormulaMap: {},
            excludedCell: {},
            allUnitData: {
                [testBed.unitId]: testBed.sheetData,
            },
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
            new Rank(FUNCTION_NAMES_COMPATIBILITY.RANK)
        );

        calculate = (formula: string) => {
            const lexerNode = lexer.treeBuilder(formula);

            const astNode = astTreeBuilder.parse(lexerNode as LexerNode);

            const result = interpreter.execute(generateExecuteAstNodeData(astNode as BaseAstNode));

            return getObjectValue(result);
        };
    });

    describe('Rank', () => {
        it('Value is normal', async () => {
            const result = await calculate('=RANK(A1,A1:F1,0)');
            expect(result).toStrictEqual(3);
        });

        it('Number value test, string/true/false/blankCell/error/null', async () => {
            const result = await calculate('=RANK("test",A1:F1,0)');
            expect(result).toStrictEqual(ErrorType.VALUE);

            const result2 = await calculate('=RANK(true,A1:F1,0)');
            expect(result2).toStrictEqual(3);

            const result3 = await calculate('=RANK(false,A1:F1,0)');
            expect(result3).toStrictEqual(4);

            const result4 = await calculate('=RANK(A2,A1:F1,0)');
            expect(result4).toStrictEqual(4);

            const result5 = await calculate('=RANK(#NAME?,A1:F1,0)');
            expect(result5).toStrictEqual(ErrorType.NAME);

            const result6 = await calculate('=RANK(,A1:F1,0)');
            expect(result6).toStrictEqual(ErrorType.NA);
        });

        it('Ref value test, notReferenceObject/hasError', async () => {
            const result = await calculate('=RANK(A1,1,0)');
            expect(result).toStrictEqual(ErrorType.NA);

            const result2 = await calculate('=RANK(A1,{1,2,3},0)');
            expect(result2).toStrictEqual(ErrorType.NA);

            const result3 = await calculate('=RANK(A1,A1:G1,0)');
            expect(result3).toStrictEqual(ErrorType.NAME);
        });

        it('Order value test, string/true/false/blankCell/error/1', async () => {
            const result = await calculate('=RANK(A1,A1:F1,"test")');
            expect(result).toStrictEqual(ErrorType.VALUE);

            const result2 = await calculate('=RANK(A1,A1:F1,true)');
            expect(result2).toStrictEqual(2);

            const result3 = await calculate('=RANK(A1,A1:F1,false)');
            expect(result3).toStrictEqual(3);

            const result4 = await calculate('=RANK(A1,A1:F1,A2)');
            expect(result4).toStrictEqual(3);

            const result5 = await calculate('=RANK(A1,A1:F1,#NAME?)');
            expect(result5).toStrictEqual(ErrorType.NAME);

            const result6 = await calculate('=RANK(A1,A1:F1,1)');
            expect(result6).toStrictEqual(2);
        });

        it('Value is array', async () => {
            const result = await calculate('=RANK({1,2,121,#NAME?},A1:F1,0)');
            expect(result).toStrictEqual([
                [3, 2, ErrorType.NA, ErrorType.NAME],
            ]);
        });
    });
});

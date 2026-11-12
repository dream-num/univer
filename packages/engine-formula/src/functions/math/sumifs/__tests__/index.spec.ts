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

import type { ICellData, Injector, IWorkbookData } from '@univerjs/core';
import { CellValueType, LocaleType, ObjectMatrix } from '@univerjs/core';
import { beforeEach, describe, expect, it } from 'vitest';
import type { LexerNode } from '../../../../engine/analysis/lexer-node';
import type { BaseAstNode } from '../../../../engine/ast-node/base-ast-node';
import type { IAllRuntimeData } from '../../../../services/runtime.service';
import { createFunctionTestBed } from '../../../__tests__/create-function-test-bed';
import { ErrorType } from '../../../../basics/error-type';
import { Lexer } from '../../../../engine/analysis/lexer';
import { AstTreeBuilder } from '../../../../engine/analysis/parser';
import { Interpreter } from '../../../../engine/interpreter/interpreter';
import { generateExecuteAstNodeData } from '../../../../engine/utils/ast-node-tool';
import { ICalculateFormulaService } from '../../../../services/calculate-formula.service';
import { IFormulaCurrentConfigService } from '../../../../services/current-data.service';
import { DependencyManagerService, IDependencyManagerService } from '../../../../services/dependency-manager.service';
import { FeatureCalculationManagerService, IFeatureCalculationManagerService } from '../../../../services/feature-calculation-manager.service';
import { IFunctionService } from '../../../../services/function.service';
import { IFormulaRuntimeService } from '../../../../services/runtime.service';
import { Concatenate } from '../../../text/concatenate';
import { FUNCTION_NAMES_TEXT } from '../../../text/function-names';
import { getObjectValue } from '../../../util';
import { FUNCTION_NAMES_MATH } from '../../function-names';
import { Sumifs } from '../index';

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
                            v: 3,
                            t: CellValueType.NUMBER,
                        },
                        3: {
                            v: 4,
                            t: CellValueType.NUMBER,
                        },
                        4: {
                            v: 3,
                            t: CellValueType.NUMBER,
                        },
                        5: {
                            v: 4,
                            t: CellValueType.NUMBER,
                        },
                        6: {
                            v: '2025-01',
                            t: CellValueType.STRING,
                        },
                        7: {
                            v: '2025-03',
                            t: CellValueType.STRING,
                        },
                        8: {
                            v: '2025-01',
                            t: CellValueType.STRING,
                        },
                        9: {
                            v: 30,
                            t: CellValueType.NUMBER,
                        },
                        10: {
                            v: 0,
                            t: CellValueType.NUMBER,
                        },
                    },
                    1: {
                        0: {
                            v: 2,
                            t: CellValueType.NUMBER,
                        },
                        1: {
                            v: 3,
                            t: CellValueType.NUMBER,
                        },
                        2: {
                            v: 4,
                            t: CellValueType.NUMBER,
                        },
                        3: {
                            v: 5,
                            t: CellValueType.NUMBER,
                        },
                        4: {
                            v: 4,
                            t: CellValueType.NUMBER,
                        },
                        5: {
                            v: 5,
                            t: CellValueType.NUMBER,
                        },
                        8: {
                            v: '2025-02',
                            t: CellValueType.STRING,
                        },
                        9: {
                            v: 40,
                            t: CellValueType.NUMBER,
                        },
                        10: {
                            v: '0',
                            t: CellValueType.STRING,
                        },
                    },
                    2: {
                        0: {
                            v: 3,
                            t: CellValueType.NUMBER,
                        },
                        1: {
                            v: 4,
                            t: CellValueType.NUMBER,
                        },
                        2: {
                            v: 5,
                            t: CellValueType.NUMBER,
                        },
                        3: {
                            v: 6,
                            t: CellValueType.NUMBER,
                        },
                        8: {
                            v: '2025-03',
                            t: CellValueType.STRING,
                        },
                        9: {
                            v: 50,
                            t: CellValueType.NUMBER,
                        },
                        10: {
                            v: true,
                            t: CellValueType.BOOLEAN,
                        },
                    },
                    3: {
                        0: {
                            v: 4,
                            t: CellValueType.NUMBER,
                        },
                        1: {
                            v: 5,
                            t: CellValueType.NUMBER,
                        },
                        2: {
                            v: 6,
                            t: CellValueType.NUMBER,
                        },
                        3: {
                            v: 7,
                            t: CellValueType.NUMBER,
                        },
                        8: {
                            v: '2025-04',
                            t: CellValueType.STRING,
                        },
                        9: {
                            v: 60,
                            t: CellValueType.NUMBER,
                        },
                        10: {
                            v: 5,
                            t: CellValueType.NUMBER,
                        },
                    },
                    4: {
                        9: {
                            v: 70,
                            t: CellValueType.NUMBER,
                        },
                        10: {
                            v: '5',
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

describe('Test sumifs function', () => {
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
            new Sumifs(FUNCTION_NAMES_MATH.SUMIFS),
            new Concatenate(FUNCTION_NAMES_TEXT.CONCATENATE)
        );

        calculate = (formula: string) => {
            const lexerNode = lexer.treeBuilder(formula);

            const astNode = astTreeBuilder.parse(lexerNode as LexerNode);

            const result = interpreter.execute(generateExecuteAstNodeData(astNode as BaseAstNode));

            return getObjectValue(result);
        };
    });

    describe('Sumifs', () => {
        it('Value is normal', async () => {
            const result = await calculate('=SUMIFS(A1:A4,B1:B4,">3")');
            expect(result).toBe(7);
        });

        it('Value is array', async () => {
            const result = await calculate('=SUMIFS({1;2;3;4},B1:B4,">3")');
            expect(result).toBe(ErrorType.VALUE);
        });

        it('Range and criteria is not paired', async () => {
            const result = await calculate('=SUMIFS(A1:A4,B1:B4,">3",C1:C4)');
            expect(result).toBe(ErrorType.VALUE);
        });

        it('Range is different size', async () => {
            const result = await calculate('=SUMIFS(A1:A4,B1:B4,">3",C1:C3,{"=5","=6"})');
            expect(result).toStrictEqual([
                [ErrorType.VALUE, ErrorType.VALUE],
            ]);
        });

        it('Range and array criteria', async () => {
            const result = await calculate('=SUMIFS(A1:A4,B1:B4,{">1";">2"})');
            expect(result).toStrictEqual([
                [10],
                [9],
            ]);
        });

        it('Two ranges and criteria', async () => {
            const result = await calculate('=SUMIFS(A1:A4,B1:B4,">2",C1:C4,"=5")');
            expect(result).toBe(3);
        });

        it('Two ranges and criteria, criteria is array', async () => {
            const result = await calculate('=SUMIFS(A1:A4,B1:B4,">2",C1:C4,{">4";">5"})');
            expect(result).toStrictEqual([
                [7],
                [4],
            ]);
        });

        it('Supports numeric criteria concatenated from cells', async () => {
            const result = await calculate('=SUMIFS(A1:A4,B1:B4,">="&E1,B1:B4,"<="&F1)');
            expect(result).toBe(5);
        });

        it('Supports text dates with criteria concatenated from cells', async () => {
            const result = await calculate('=SUMIFS(A1:A4,I1:I4,">="&G1,I1:I4,"<="&H1)');
            expect(result).toBe(6);
        });

        it('does not coerce numeric text when matching a wildcard criterion', async () => {
            const result = await calculate('=SUMIFS(J1:J5,K1:K5,"<>",K1:K5,"<>*")');
            expect(result).toBe(140);
        });
    });

    it('calculates repeated whole-column SUMIFS formulas with trailing blanks without stalling', async () => {
        const dataRows = 2500;
        const summaryRows = 300;
        const dataCells: Record<number, Record<number, ICellData>> = { 0: { 0: { v: 'key' }, 1: { v: 'amount' } } };
        for (let i = 0; i < dataRows; i++) {
            dataCells[i + 1] = { 0: { v: `k${i % summaryRows}` }, 1: { v: i + 1 } };
        }

        const summaryCells: Record<number, Record<number, ICellData>> = { 0: { 0: { v: 'key' }, 1: { v: 'total' } } };
        const formulaMap: Record<number, Record<number, { f: string }>> = {};
        for (let i = 0; i < summaryRows; i++) {
            const formula = '=SUMIFS(Data!B:B,Data!A:A,$A:$A)';
            summaryCells[i + 1] = { 0: { v: `k${i}` }, 1: { f: formula } };
            formulaMap[i + 1] = { 1: { f: formula } };
        }
        summaryCells[0][2] = { f: '=SUMIFS(Data!B:B,Data!A:A,$A:$A)' };
        formulaMap[0] = { 2: { f: '=SUMIFS(Data!B:B,Data!A:A,$A:$A)' } };

        const testBed = createFunctionTestBed({
            id: 'test',
            name: 'test',
            appVersion: '3.0.0-alpha',
            locale: LocaleType.EN_US,
            sheetOrder: ['summary', 'data'],
            styles: {},
            sheets: {
                summary: { id: 'summary', name: 'Summary', rowCount: 1000, columnCount: 10, cellData: summaryCells },
                data: { id: 'data', name: 'Data', rowCount: dataRows + 100, columnCount: 10, cellData: dataCells },
            },
        }, [
            [IFeatureCalculationManagerService, { useClass: FeatureCalculationManagerService }],
            [IDependencyManagerService, { useClass: DependencyManagerService }],
        ]);

        try {
            testBed.get(IFunctionService).registerExecutors(new Sumifs(FUNCTION_NAMES_MATH.SUMIFS));
            const calculateService = testBed.get(ICalculateFormulaService);
            let runtimeData!: IAllRuntimeData;
            const completed = new Promise<void>((resolve) => {
                const sub = calculateService.executionCompleteListener$.subscribe((data) => {
                    runtimeData = data;
                    sub.unsubscribe();
                    resolve();
                });
            });

            await calculateService.execute({
                allUnitData: {
                    test: {
                        summary: { cellData: new ObjectMatrix(summaryCells), rowCount: 1000, columnCount: 10, rowData: {}, columnData: {} },
                        data: { cellData: new ObjectMatrix(dataCells), rowCount: dataRows + 100, columnCount: 10, rowData: {}, columnData: {} },
                    },
                },
                unitSheetNameMap: { test: { Summary: 'summary', Data: 'data' } },
                unitStylesData: {},
                formulaData: { test: { summary: formulaMap, data: {} } },
                arrayFormulaCellData: {},
                arrayFormulaRange: {},
                forceCalculate: true,
                dirtyRanges: [],
                dirtyNameMap: {},
                dirtyDefinedNameMap: {},
                dirtyUnitFeatureMap: {},
                dirtyUnitOtherFormulaMap: {},
            });
            await completed;

            expect(runtimeData.unitData.test?.summary?.getValue(1, 1)?.v).toBe(ErrorType.SPILL);
            expect(runtimeData.unitData.test?.summary?.getValue(summaryRows, 1)?.v).toBe(ErrorType.SPILL);
            expect(runtimeData.arrayFormulaCellData?.test?.summary?.getValue(1, 2)?.v).toBe(10809);
            expect(runtimeData.arrayFormulaCellData?.test?.summary?.getValue(summaryRows, 2)?.v).toBe(10800);
            expect(runtimeData.arrayFormulaCellData?.test?.summary?.getValue(summaryRows + 1, 2)?.v).toBe(0);
        } finally {
            testBed.univer.dispose();
        }
    });
});

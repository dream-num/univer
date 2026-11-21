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
import type { IFormulaDatasetConfig } from '../../../basics/common';
import type { IDefinedNameMapItem } from '../../../services/defined-names.service';
import type { IAllRuntimeData } from '../../../services/runtime.service';
import type { BaseAstNode } from '../../ast-node/base-ast-node';
import type { BaseReferenceObject } from '../../reference-object/base-reference-object';
import type { ArrayValueObject } from '../../value-object/array-value-object';
import type { BaseValueObject } from '../../value-object/base-value-object';
import type { LexerNode } from '../lexer-node';
import { CellValueType, FormulaType, ILogService, LocaleType, LogLevel, ObjectMatrix, Univer, UniverInstanceType } from '@univerjs/core';
import { beforeEach, describe, expect, it } from 'vitest';
import { ErrorType } from '../../../basics/error-type';
import { AsyncCustomFunction } from '../../../functions/custom-function';
import { FUNCTION_NAMES_INFORMATION } from '../../../functions/information/function-names';
import { Isblank } from '../../../functions/information/isblank';
import { FUNCTION_NAMES_LOGICAL } from '../../../functions/logical/function-names';
import { Groupby } from '../../../functions/logical/groupby';
import { If } from '../../../functions/logical/if';
import { Or } from '../../../functions/logical/or';
import { Percentof } from '../../../functions/logical/percentof';
import { FUNCTION_NAMES_LOOKUP } from '../../../functions/lookup/function-names';
import { Hstack } from '../../../functions/lookup/hstack';
import { Index } from '../../../functions/lookup/index';
import { Indirect } from '../../../functions/lookup/indirect';
import { Offset } from '../../../functions/lookup/offset';
import { FUNCTION_NAMES_MATH } from '../../../functions/math/function-names';
import { Pi } from '../../../functions/math/pi';
import { Subtotal } from '../../../functions/math/subtotal';
import { Sum } from '../../../functions/math/sum';
import { Compare } from '../../../functions/meta/compare';
import { Divided } from '../../../functions/meta/divided';
import { FUNCTION_NAMES_META } from '../../../functions/meta/function-names';
import { Minus } from '../../../functions/meta/minus';
import { Multiply } from '../../../functions/meta/multiply';
import { Plus } from '../../../functions/meta/plus';
import { Counta } from '../../../functions/statistical/counta';
import { Countif } from '../../../functions/statistical/countif';
import { FUNCTION_NAMES_STATISTICAL } from '../../../functions/statistical/function-names';
import { StdevP } from '../../../functions/statistical/stdev-p';
import { FUNCTION_NAMES_TEXT } from '../../../functions/text/function-names';
import { Regexmatch } from '../../../functions/text/regexmatch';
import { FormulaDataModel } from '../../../models/formula-data.model';
import { UniverFormulaEnginePlugin } from '../../../plugin';
import { ICalculateFormulaService } from '../../../services/calculate-formula.service';
import { IFormulaCurrentConfigService } from '../../../services/current-data.service';
import { IDefinedNamesService } from '../../../services/defined-names.service';
import { IFunctionService } from '../../../services/function.service';
import { IFormulaRuntimeService } from '../../../services/runtime.service';
import { ISuperTableService } from '../../../services/super-table.service';
import { IFormulaDependencyGenerator } from '../../dependency/formula-dependency';
import { Interpreter } from '../../interpreter/interpreter';
import { generateExecuteAstNodeData } from '../../utils/ast-node-tool';
import { Lexer } from '../lexer';
import { AstTreeBuilder } from '../parser';
import { createCommandTestBed } from './create-command-test-bed';

describe('Test indirect', () => {
    let get: Injector['get'];
    let lexer: Lexer;
    let astTreeBuilder: AstTreeBuilder;
    let interpreter: Interpreter;

    beforeEach(() => {
        const testBed = createCommandTestBed();

        get = testBed.get;

        lexer = get(Lexer);
        astTreeBuilder = get(AstTreeBuilder);
        interpreter = get(Interpreter);

        const functionService = get(IFunctionService);

        const formulaCurrentConfigService = get(IFormulaCurrentConfigService);

        const formulaRuntimeService = get(IFormulaRuntimeService);

        const superTableService = get(ISuperTableService);

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
        });
        formulaCurrentConfigService.registerUnitData({
            [testBed.unitId]: testBed.sheetData,
            'sales-source': {
                'source-sheet': {
                    cellData: new ObjectMatrix({
                        0: { 0: { v: 42 }, 1: { v: 'Other' } },
                        1: { 0: { v: 10 }, 1: { v: 20 } },
                    }),
                    rowCount: 2,
                    columnCount: 2,
                    rowData: {},
                    columnData: {},
                },
            },
            'base-source': {
                'base-table-sheet': {
                    cellData: new ObjectMatrix({
                        0: { 0: { v: 'Value' } },
                        1: { 0: { v: 7 } },
                    }),
                    rowCount: 2,
                    columnCount: 1,
                    rowData: {},
                    columnData: {},
                },
            },
        });
        formulaCurrentConfigService.registerUnitNameMap({
            [testBed.unitId]: {
                name: 'Host.xlsx',
                unitType: UniverInstanceType.UNIVER_SHEET,
            },
            'sales-source': {
                name: 'Sales',
                unitType: UniverInstanceType.UNIVER_SHEET,
            },
            'base-source': {
                name: 'BaseData',
                unitType: UniverInstanceType.UNIVER_BASE,
            },
        });
        formulaCurrentConfigService.registerSheetNameMap({
            [testBed.unitId]: {
                ...Object.fromEntries(testBed.sheet.getSheets().map((sheet) => [sheet.getName(), sheet.getSheetId()])),
                Sheet1: testBed.sheetId,
            },
            'sales-source': { Data: 'source-sheet' },
            'base-source': { Records: 'base-table-sheet' },
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
            new Sum(FUNCTION_NAMES_MATH.SUM),
            new Subtotal(FUNCTION_NAMES_MATH.SUBTOTAL),
            new Compare(FUNCTION_NAMES_META.COMPARE),
            new Plus(FUNCTION_NAMES_META.PLUS),
            new Minus(FUNCTION_NAMES_META.MINUS),
            new Multiply(FUNCTION_NAMES_META.MULTIPLY),
            new Divided(FUNCTION_NAMES_META.DIVIDED),
            new Pi(FUNCTION_NAMES_MATH.PI),
            new Countif(FUNCTION_NAMES_STATISTICAL.COUNTIF),
            new Counta(FUNCTION_NAMES_STATISTICAL.COUNTA),
            new StdevP(FUNCTION_NAMES_STATISTICAL.STDEV_P),
            new Regexmatch(FUNCTION_NAMES_TEXT.REGEXMATCH),
            new Hstack(FUNCTION_NAMES_LOOKUP.HSTACK),
            new Index(FUNCTION_NAMES_LOOKUP.INDEX),
            new Indirect(FUNCTION_NAMES_LOOKUP.INDIRECT),
            new Offset(FUNCTION_NAMES_LOOKUP.OFFSET),
            new Groupby(FUNCTION_NAMES_LOGICAL.GROUPBY),
            new If(FUNCTION_NAMES_LOGICAL.IF),
            new Or(FUNCTION_NAMES_LOGICAL.OR),
            new Percentof(FUNCTION_NAMES_LOGICAL.PERCENTOF),
            new Isblank(FUNCTION_NAMES_INFORMATION.ISBLANK)
        );

        superTableService.registerTable(testBed.unitId, 'Table1', {
            sheetId: testBed.sheetId,
            titleMap: new Map([
                ['col1', 0],
                ['col2', 1],
                ['col3', 2],
                ['col4', 3],
                ['CASH\nOUT', 0],
                ['CASH\nIN', 1],
                ['Blank\nColumn', 4],
                ['Deposit,\nCredit (+)', 0],
                ['Business Name:', 3],
                ['F\n(1-5)', 4],
                ['S\n(1-5)', 4],
                ['D\n(1-10)', 4],
            ]),
            range: {
                startRow: 0,
                endRow: 3,
                startColumn: 0,
                endColumn: 4,
            },
        });
        superTableService.registerTable(testBed.unitId, 'Table_FMEA', {
            sheetId: testBed.sheetId,
            titleMap: new Map([
                ['F\n(1-5)', 4],
                ['S\n(1-5)', 4],
                ['D\n(1-10)', 4],
            ]),
            range: {
                startRow: 0,
                endRow: 3,
                startColumn: 0,
                endColumn: 4,
            },
        });
        superTableService.registerTable('sales-source', 'SalesTable', {
            sheetId: 'source-sheet',
            titleMap: new Map([['Amount', 0]]),
            range: {
                startRow: 0,
                endRow: 1,
                startColumn: 0,
                endColumn: 1,
            },
        });
        superTableService.registerTable('base-source', 'BaseTable', {
            sheetId: 'base-table-sheet',
            titleMap: new Map([['Value', 0]]),
            range: {
                startRow: 0,
                endRow: 1,
                startColumn: 0,
                endColumn: 0,
            },
        });
    });

    describe('normal', () => {
        it('preserves xleta aggregator tokens inside GROUPBY', () => {
            const lexerNode = lexer.treeBuilder(
                '=_xlfn.GROUPBY(A1:A3,A1:A3,_xlfn.HSTACK(_xleta.COUNTA,_xleta.PERCENTOF),0)'
            );
            const astNode = astTreeBuilder.parse(lexerNode as LexerNode) as BaseAstNode;
            const groupbyNode = astNode.getChildren()[0];
            const hstackNode = groupbyNode.getChildren()[2];

            expect(groupbyNode.getToken()).toBe('GROUPBY');
            expect(hstackNode.getToken()).toBe('HSTACK');
            expect(hstackNode.getChildren().map((node) => node.getToken())).toEqual(['COUNTA', 'PERCENTOF']);
        });

        it('Ref error', async () => {
            const lexerNode = lexer.treeBuilder(`=sum(${ErrorType.REF} + 1)`);

            const astNode = astTreeBuilder.parse(lexerNode as LexerNode);

            const result = interpreter.execute(generateExecuteAstNodeData(astNode as BaseAstNode));

            expect((result as BaseValueObject).getValue()).toStrictEqual(ErrorType.REF);
        });

        it('resolves a cross-workbook A1 qualifier by display name', () => {
            const lexerNode = lexer.treeBuilder("=SUM('[sales.XLSX]Data'!A1)");
            const astNode = astTreeBuilder.parse(lexerNode as LexerNode);
            const result = interpreter.execute(generateExecuteAstNodeData(astNode as BaseAstNode));

            expect((result as BaseValueObject).getValue()).toBe(42);
        });

        it('stores the resolved source unit id in dependency ranges', async () => {
            get(IFormulaCurrentConfigService).registerFormulaData({
                test: {
                    sheet1: {
                        0: {
                            0: { f: "='[Sales.xlsx]Data'!A1" },
                        },
                    },
                },
            });

            const dependencyGenerator = get(IFormulaDependencyGenerator);
            await dependencyGenerator.generate();
            const trees = await dependencyGenerator.getAllDependencyJson();

            expect(trees[0]?.rangeList).toContainEqual({
                unitId: 'sales-source',
                sheetId: 'source-sheet',
                range: expect.objectContaining({
                    startRow: 0,
                    endRow: 0,
                    startColumn: 0,
                    endColumn: 0,
                }),
            });
        });

        it('resolves display-name and legacy-id external Table references', () => {
            for (const formula of [
                '=SUM(Sales.xlsx!SalesTable[Amount])',
                '=SUM(Sales.xlsx!SalesTable[[#Data],[Amount]])',
                "=SUM('Sales.xlsx'!SalesTable[Amount])",
                '=SUM([sales-source]SalesTable[Amount])',
            ]) {
                const lexerNode = lexer.treeBuilder(formula);
                const astNode = astTreeBuilder.parse(lexerNode as LexerNode);
                const result = interpreter.execute(generateExecuteAstNodeData(astNode as BaseAstNode));

                expect((result as BaseValueObject).getValue()).toBe(10);
            }

            const sectionLexerNode = lexer.treeBuilder('=SUM(Sales.xlsx!SalesTable[#Data])');
            const sectionAstNode = astTreeBuilder.parse(sectionLexerNode as LexerNode);
            const sectionResult = interpreter.execute(generateExecuteAstNodeData(sectionAstNode as BaseAstNode));
            expect((sectionResult as BaseValueObject).getValue()).toBe(30);
        });

        it('keeps external Table source data when INDEX returns a selected cell reference', () => {
            const lexerNode = lexer.treeBuilder('=INDEX(Sales.xlsx!SalesTable[Amount],1)');
            const astNode = astTreeBuilder.parse(lexerNode as LexerNode);
            const result = interpreter.execute(generateExecuteAstNodeData(astNode as BaseAstNode));

            const reference = result as BaseReferenceObject;
            expect({
                unitId: reference.getUnitId(),
                sheetId: reference.getSheetId(),
                forcedUnitId: reference.getForcedUnitId(),
                forcedSheetId: reference.getForcedSheetId(),
                forcedSheetName: reference.getForcedSheetName(),
            }).toEqual({
                unitId: 'sales-source',
                sheetId: 'source-sheet',
                forcedUnitId: 'sales-source',
                forcedSheetId: 'source-sheet',
                forcedSheetName: '',
            });
            expect(reference.getCellByPosition().getValue()).toBe(10);
        });

        it('stores the resolved source Unit in external Table dependency ranges', async () => {
            get(IFormulaCurrentConfigService).registerFormulaData({
                test: {
                    sheet1: {
                        0: {
                            0: { f: '=SUM(Sales.xlsx!SalesTable[Amount])' },
                        },
                    },
                },
            });

            const dependencyGenerator = get(IFormulaDependencyGenerator);
            await dependencyGenerator.generate();
            const trees = await dependencyGenerator.getAllDependencyJson();

            expect(trees[0]?.rangeList).toContainEqual({
                unitId: 'sales-source',
                sheetId: 'source-sheet',
                range: expect.objectContaining({
                    startRow: 1,
                    endRow: 1,
                    startColumn: 0,
                    endColumn: 0,
                }),
            });
        });

        it('reads current target Table metadata when the AST executes', () => {
            const lexerNode = lexer.treeBuilder('=SUM(Sales.xlsx!SalesTable[Amount])');
            const astNode = astTreeBuilder.parse(lexerNode as LexerNode);

            get(ISuperTableService).registerTable('sales-source', 'SalesTable', {
                sheetId: 'source-sheet',
                titleMap: new Map([['Amount', 1]]),
                range: {
                    startRow: 0,
                    endRow: 1,
                    startColumn: 0,
                    endColumn: 1,
                },
            });
            const result = interpreter.execute(generateExecuteAstNodeData(astNode as BaseAstNode));

            expect((result as BaseValueObject).getValue()).toBe(20);
        });

        it('uses one structured-reference path for Base and Sheet host/source combinations', () => {
            const currentConfig = get(IFormulaCurrentConfigService);
            const tableService = get(ISuperTableService);
            currentConfig.registerUnitNameMap({
                test: { name: 'Host Base', unitType: UniverInstanceType.UNIVER_BASE },
                'sales-source': { name: 'Sales.xlsx', unitType: UniverInstanceType.UNIVER_SHEET },
                'base-source': { name: 'BaseData', unitType: UniverInstanceType.UNIVER_BASE },
            });

            for (const formula of ['=SUM(BaseData!BaseTable[Value])', '=SUM(Sales.xlsx!SalesTable[Amount])']) {
                const result = interpreter.execute(
                    generateExecuteAstNodeData(
                        astTreeBuilder.parse(lexer.treeBuilder(formula) as LexerNode) as BaseAstNode
                    )
                );
                expect((result as BaseValueObject).getValue()).toBe(formula.includes('BaseTable') ? 7 : 10);
            }

            for (const formula of ["=SUM('[Sales]Data'!A1:A2)", '=SUM([Sales]Data!A1:A2)']) {
                const baseToSheetA1 = interpreter.execute(
                    generateExecuteAstNodeData(
                        astTreeBuilder.parse(lexer.treeBuilder(formula) as LexerNode) as BaseAstNode
                    )
                );
                expect((baseToSheetA1 as BaseValueObject).getValue()).toBe(52);
            }

            currentConfig.registerUnitNameMap({
                test: { name: 'Host Sheet', unitType: UniverInstanceType.UNIVER_SHEET },
                'sales-source': { name: 'Sales.xlsx', unitType: UniverInstanceType.UNIVER_SHEET },
                'base-source': { name: 'BaseData', unitType: UniverInstanceType.UNIVER_BASE },
            });
            const sheetToBase = interpreter.execute(
                generateExecuteAstNodeData(
                    astTreeBuilder.parse(
                        lexer.treeBuilder('=SUM(BaseData!BaseTable[Value])') as LexerNode
                    ) as BaseAstNode
                )
            );
            expect((sheetToBase as BaseValueObject).getValue()).toBe(7);

            const oldAst = astTreeBuilder.parse(
                lexer.treeBuilder('=SUM(BaseData!BaseTable[Value])') as LexerNode
            ) as BaseAstNode;
            tableService.remove('base-source', 'BaseTable');
            tableService.registerTable('base-source', 'RenamedTable', {
                sheetId: 'base-table-sheet',
                titleMap: new Map([['RenamedValue', 0]]),
                range: { startRow: 0, endRow: 1, startColumn: 0, endColumn: 0 },
            });
            expect((interpreter.execute(generateExecuteAstNodeData(oldAst)) as BaseValueObject).getValue()).toBe(
                ErrorType.REF
            );
            const renamed = interpreter.execute(
                generateExecuteAstNodeData(
                    astTreeBuilder.parse(
                        lexer.treeBuilder('=SUM(BaseData!RenamedTable[RenamedValue])') as LexerNode
                    ) as BaseAstNode
                )
            );
            expect((renamed as BaseValueObject).getValue()).toBe(7);
        });

        it('does not parse an external Table-looking string literal as a reference', () => {
            const lexerNode = lexer.treeBuilder('="Sales.xlsx!SalesTable[Amount]"');
            const astNode = astTreeBuilder.parse(lexerNode as LexerNode);
            const result = interpreter.execute(generateExecuteAstNodeData(astNode as BaseAstNode));

            expect((result as BaseValueObject).getValue()).toBe('Sales.xlsx!SalesTable[Amount]');
        });

        it('uses the shared qualifier resolver for INDIRECT and preserves the target through OFFSET', () => {
            for (const formula of [
                '=SUM(INDIRECT("\'[Sales.xlsx]Data\'!A2"))',
                '=SUM(OFFSET(INDIRECT("\'[Sales.xlsx]Data\'!A1"),1,0))',
                "=SUM(OFFSET('[Sales.xlsx]Data'!A1,1,0))",
            ]) {
                const lexerNode = lexer.treeBuilder(formula);
                const astNode = astTreeBuilder.parse(lexerNode as LexerNode);
                const result = interpreter.execute(generateExecuteAstNodeData(astNode as BaseAstNode));

                expect((result as BaseValueObject).getValue()).toBe(10);
            }
        });

        it('second-schedules a dynamic INDIRECT formula when the resolved source range is dirty', async () => {
            const currentConfigService = get(IFormulaCurrentConfigService);
            currentConfigService.registerFormulaData({
                test: {
                    sheet1: {
                        0: {
                            0: { f: '=INDIRECT("\'[Sales.xlsx]Data\'!A2")' },
                        },
                    },
                },
            });
            currentConfigService.loadDirtyRangesAndExcludedCell(
                [
                    {
                        unitId: 'sales-source',
                        sheetId: 'source-sheet',
                        range: {
                            startRow: 1,
                            endRow: 1,
                            startColumn: 0,
                            endColumn: 0,
                        },
                    },
                ],
                {}
            );

            const trees = await get(IFormulaDependencyGenerator).generate();

            expect(trees).toHaveLength(1);
            expect(trees[0]).toMatchObject({
                unitId: 'test',
                subUnitId: 'sheet1',
                formula: '=INDIRECT("\'[Sales.xlsx]Data\'!A2")',
            });
        });

        it('returns REF for missing or ambiguous cross-workbook qualifiers', () => {
            const missingLexerNode = lexer.treeBuilder("='[Missing.xlsx]Data'!A1");
            const missingAstNode = astTreeBuilder.parse(missingLexerNode as LexerNode);
            const missingResult = interpreter.execute(generateExecuteAstNodeData(missingAstNode as BaseAstNode));

            expect((missingResult as BaseValueObject).getValue()).toBe(ErrorType.REF);

            get(IFormulaCurrentConfigService).registerUnitNameMap({
                first: { name: 'Duplicate.xlsx', unitType: UniverInstanceType.UNIVER_SHEET },
                second: { name: 'DUPLICATE.XLSX', unitType: UniverInstanceType.UNIVER_SHEET },
            });
            const duplicateLexerNode = lexer.treeBuilder("='[Duplicate.xlsx]Data'!A1");
            const duplicateAstNode = astTreeBuilder.parse(duplicateLexerNode as LexerNode);
            const duplicateResult = interpreter.execute(generateExecuteAstNodeData(duplicateAstNode as BaseAstNode));

            expect((duplicateResult as BaseValueObject).getValue()).toBe(ErrorType.REF);
        });

        it('Name error', async () => {
            const lexerNode = lexer.treeBuilder(`=sum(${ErrorType.NAME} + 1, sum(${ErrorType.REF} + 1))`);

            const astNode = astTreeBuilder.parse(lexerNode as LexerNode);

            const result = interpreter.execute(generateExecuteAstNodeData(astNode as BaseAstNode));

            expect((result as BaseValueObject).getValue()).toStrictEqual(ErrorType.NAME);
        });

        it('Minus Minus one', async () => {
            const lexerNode = lexer.treeBuilder('=--1');

            const astNode = astTreeBuilder.parse(lexerNode as LexerNode);

            const result = interpreter.execute(generateExecuteAstNodeData(astNode as BaseAstNode));

            expect((result as BaseValueObject).getValue()).toStrictEqual(1);
        });

        it('Minus Minus Minus one', async () => {
            const lexerNode = lexer.treeBuilder('=---1');

            const astNode = astTreeBuilder.parse(lexerNode as LexerNode);

            const result = interpreter.execute(generateExecuteAstNodeData(astNode as BaseAstNode));

            expect((result as BaseValueObject).getValue()).toStrictEqual(-1);
        });

        it('Plus Plus Plus Plus Plus Plus one', async () => {
            const lexerNode = lexer.treeBuilder('=++++++1');

            const astNode = astTreeBuilder.parse(lexerNode as LexerNode);

            const result = interpreter.execute(generateExecuteAstNodeData(astNode as BaseAstNode));

            expect((result as BaseValueObject).getValue()).toStrictEqual(1);
        });

        it('Plus Plus Plus ref', async () => {
            const lexerNode = lexer.treeBuilder('=+++++++A1');

            const astNode = astTreeBuilder.parse(lexerNode as LexerNode);

            const result = interpreter.execute(generateExecuteAstNodeData(astNode as BaseAstNode));

            expect((result as BaseValueObject).getValue()).toStrictEqual(1);
        });

        it('normalizes xlfn REGEXTEST to REGEXMATCH during formula execution', async () => {
            const lexerNode = lexer.treeBuilder('=_xlfn.REGEXTEST(D4,"^(?=.*e)test$")');

            const astNode = astTreeBuilder.parse(lexerNode as LexerNode);

            const result = interpreter.execute(generateExecuteAstNodeData(astNode as BaseAstNode));

            expect((result as BaseValueObject).getValue()).toStrictEqual(true);
        });

        it('normalizes xlfn STDEV.P to registered statistical function during formula execution', async () => {
            const lexerNode = lexer.treeBuilder('=_xlfn.STDEV.P(0,0,0)');

            const astNode = astTreeBuilder.parse(lexerNode as LexerNode);

            const result = interpreter.execute(generateExecuteAstNodeData(astNode as BaseAstNode));

            expect((result as BaseValueObject).getValue()).toStrictEqual(0);
        });

        it('treats a numeric zero cell as non-blank in IF comparisons', async () => {
            const lexerNode = lexer.treeBuilder('=IF(A4="","blank","not blank")');

            const astNode = astTreeBuilder.parse(lexerNode as LexerNode);

            const result = interpreter.execute(generateExecuteAstNodeData(astNode as BaseAstNode));

            expect((result as BaseValueObject).getValue()).toStrictEqual('not blank');
        });

        it('parses xlfn LAMBDA parameters with xlpm prefixes', async () => {
            const lexerNode = lexer.treeBuilder('=_xlfn.LAMBDA(_xlpm.a,_xlpm.i,_xlpm.a)(1,2)');

            expect(() => astTreeBuilder.parse(lexerNode as LexerNode)).not.toThrow();
        });

        it('Minus Minus Minus ref', async () => {
            const lexerNode = lexer.treeBuilder('=---A1');

            const astNode = astTreeBuilder.parse(lexerNode as LexerNode);

            const result = interpreter.execute(generateExecuteAstNodeData(astNode as BaseAstNode));

            expect((result as BaseValueObject).getValue()).toStrictEqual(-1);
        });

        it('Minus Minus Minus Minus sum', async () => {
            const lexerNode = lexer.treeBuilder('=----sum(A1:A2)');

            const astNode = astTreeBuilder.parse(lexerNode as LexerNode);

            const result = interpreter.execute(generateExecuteAstNodeData(astNode as BaseAstNode));

            expect((result as BaseValueObject).getValue()).toStrictEqual(4);
        });

        it('Cross tab sum', async () => {
            const lexerNode = lexer.treeBuilder('=----sum(Tool!A1:A2)');

            const astNode = astTreeBuilder.parse(lexerNode as LexerNode);

            const result = interpreter.execute(generateExecuteAstNodeData(astNode as BaseAstNode));

            expect((result as BaseValueObject).getValue()).toStrictEqual(4);
        });

        it('does not reuse a valid range cache for an unresolved sheet, or poison the valid range', () => {
            for (const [formula, expected] of [
                ['=SUM(A1:A2)', 4],
                ['=SUM(Missing!A1:A2)', ErrorType.REF],
                ['=SUM(A1:A2)', 4],
            ] as const) {
                const node = astTreeBuilder.parse(lexer.treeBuilder(formula) as LexerNode)!;
                const result = interpreter.execute(generateExecuteAstNodeData(node));
                expect((result as BaseValueObject).getValue()).toBe(expected);
            }
        });

        it('Reference column', async () => {
            const lexerNode = lexer.treeBuilder('=sum(A:A)');

            const astNode = astTreeBuilder.parse(lexerNode as LexerNode);

            const result = interpreter.execute(generateExecuteAstNodeData(astNode as BaseAstNode));

            expect((result as BaseValueObject).getValue()).toStrictEqual(5);
        });

        it('Not exist formula', async () => {
            const lexerNode = lexer.treeBuilder('=notExistFormula(A:A)');

            const astNode = astTreeBuilder.parse(lexerNode as LexerNode);

            const result = interpreter.execute(generateExecuteAstNodeData(astNode as BaseAstNode));

            expect((result as BaseValueObject).getValue()).toStrictEqual(ErrorType.NAME);
        });

        it('Reference row', async () => {
            const lexerNode = lexer.treeBuilder('=SUM(1:1)');

            const astNode = astTreeBuilder.parse(lexerNode as LexerNode);

            const result = interpreter.execute(generateExecuteAstNodeData(astNode as BaseAstNode));

            expect((result as BaseValueObject).getValue()).toStrictEqual(3);
        });

        it('Error #NAME?', async () => {
            const lexerNode = lexer.treeBuilder('=A1:A');

            const astNode = astTreeBuilder.parse(lexerNode as LexerNode);

            const result = interpreter.execute(generateExecuteAstNodeData(astNode as BaseAstNode));

            expect((result as BaseValueObject).getValue()).toStrictEqual(ErrorType.NAME);
        });

        it('Root node has multiple parameter!', async () => {
            const lexerNode = lexer.treeBuilder('=PI()/1.570796327,M54');

            const astNode = astTreeBuilder.parse(lexerNode as LexerNode);

            const result = interpreter.execute(generateExecuteAstNodeData(astNode as BaseAstNode));

            expect((result as BaseValueObject).getValue()).toStrictEqual(ErrorType.VALUE);
        });

        it('error as return #NUM!', async () => {
            const lexerNode = lexer.treeBuilder('=SUM(#NUM! + #VALUE!) + #SPILL! - (#CALC!)');

            const astNode = astTreeBuilder.parse(lexerNode as LexerNode);

            const result = interpreter.execute(generateExecuteAstNodeData(astNode as BaseAstNode));

            expect((result as BaseValueObject).getValue()).toStrictEqual(ErrorType.NUM);
        });

        it('LET formula as parameter nest', async () => {
            const lexerNode = lexer.treeBuilder('=LET(x,2,y,x+3,x+y+3)');

            const astNode = astTreeBuilder.parse(lexerNode as LexerNode);

            const result = interpreter.execute(generateExecuteAstNodeData(astNode as BaseAstNode));

            expect((result as BaseValueObject).getValue()).toStrictEqual(10);
        });

        it('test missing formula input handles gracefully', async () => {
            const lexerNode = lexer.treeBuilder('=1/3+');

            expect(lexerNode).toStrictEqual(ErrorType.VALUE);
        });

        it('test incomplete formula input', async () => {
            const lexerNode = lexer.treeBuilder('=+');

            expect(lexerNode).toStrictEqual(ErrorType.VALUE);
        });

        it('test formula input validation with function', async () => {
            const lexerNode = lexer.treeBuilder('=sum(A1+)');

            expect(lexerNode).toStrictEqual(ErrorType.VALUE);
        });

        it('test formula input suffix', async () => {
            const lexerNode = lexer.treeBuilder('=%');

            expect(lexerNode).toStrictEqual(ErrorType.VALUE);
        });

        it('test formula input suffix correctly', async () => {
            const lexerNode = lexer.treeBuilder('=10%');

            const astNode = astTreeBuilder.parse(lexerNode as LexerNode);

            const result = interpreter.execute(generateExecuteAstNodeData(astNode as BaseAstNode));

            expect((result as BaseValueObject).getValue()).toStrictEqual(0.1);
        });

        it('test formula function has operator parameter', async () => {
            const lexerNode = lexer.treeBuilder('=sum(-)');

            expect(lexerNode).toStrictEqual(ErrorType.VALUE);
        });

        it('test formula no parameter', async () => {
            const lexerNode = lexer.treeBuilder('=sum(,,-)');

            expect(lexerNode).toStrictEqual(ErrorType.VALUE);
        });

        it('test array string error', async () => {
            const lexerNode = lexer.treeBuilder('="{1,2,3;4,5,6}"');

            const astNode = astTreeBuilder.parse(lexerNode as LexerNode);

            const result = interpreter.execute(generateExecuteAstNodeData(astNode as BaseAstNode));

            expect((result as BaseValueObject).getValue()).toStrictEqual('{1,2,3;4,5,6}');
        });

        it('test array formula correctly', async () => {
            const lexerNode = lexer.treeBuilder('={10,2,3;4,5,6}');

            const astNode = astTreeBuilder.parse(lexerNode as LexerNode);

            const result = interpreter.execute(generateExecuteAstNodeData(astNode as BaseAstNode));

            expect((result as ArrayValueObject).getFirstCell().getValue()).toStrictEqual(10);
        });
    });

    describe('Structured references — Table1 (Main)', () => {
        it('test super formula correctly', async () => {
            const lexerNode = lexer.treeBuilder('=SUM(Table1[[col1]:[col4]])');

            const astNode = astTreeBuilder.parse(lexerNode as LexerNode);

            const result = interpreter.execute(generateExecuteAstNodeData(astNode as BaseAstNode));

            expect((result as BaseValueObject).getValue()).toStrictEqual(9.23);
        });

        it('sums a single column: Table1[col1] => 3 + 1 + 0 = 4', async () => {
            const lexerNode = lexer.treeBuilder('=SUM(Table1[col1])') as LexerNode;
            const astNode = astTreeBuilder.parse(lexerNode) as BaseAstNode;
            const result = interpreter.execute(generateExecuteAstNodeData(astNode));
            expect((result as BaseValueObject).getValue()).toStrictEqual(4);
        });

        it('sums a 2-column data range: Table1[[#Data],[col1]:[col2]] => (3+1+0) + (4) = 8', async () => {
            const lexerNode = lexer.treeBuilder('=SUM(Table1[[#Data],[col1]:[col2]])') as LexerNode;
            const astNode = astTreeBuilder.parse(lexerNode) as BaseAstNode;
            const result = interpreter.execute(generateExecuteAstNodeData(astNode));
            expect((result as BaseValueObject).getValue()).toStrictEqual(8);
        });

        it('sums headers only: Table1[[#Headers],[col1]:[col4]] => 1 + 2 = 3 (text ignored)', async () => {
            const lexerNode = lexer.treeBuilder('=SUM(Table1[[#Headers],[col1]:[col4]])') as LexerNode;
            const astNode = astTreeBuilder.parse(lexerNode) as BaseAstNode;
            const result = interpreter.execute(generateExecuteAstNodeData(astNode));
            expect((result as BaseValueObject).getValue()).toStrictEqual(3);
        });

        it('sums a single column across #All: Table1[[#All],[col3]] => 1.23', async () => {
            const lexerNode = lexer.treeBuilder('=SUM(Table1[[#All],[col3]])') as LexerNode;
            const astNode = astTreeBuilder.parse(lexerNode) as BaseAstNode;
            const result = interpreter.execute(generateExecuteAstNodeData(astNode));
            expect((result as BaseValueObject).getValue()).toStrictEqual(1.23);
        });

        it('counts numbers in data column: SUM(Table1[[#Data],[col2]]) => 1', async () => {
            const lexerNode = lexer.treeBuilder('=SUM(Table1[[#Data],[col2]])') as LexerNode;
            const astNode = astTreeBuilder.parse(lexerNode) as BaseAstNode;
            const result = interpreter.execute(generateExecuteAstNodeData(astNode));
            expect((result as BaseValueObject).getValue()).toStrictEqual(4);
        });

        it('sums a multi-column range: Table1[[col1]:[col4]] => 9.23 (baseline)', async () => {
            const lexerNode = lexer.treeBuilder('=SUM(Table1[[col1]:[col4]])') as LexerNode;
            const astNode = astTreeBuilder.parse(lexerNode) as BaseAstNode;
            const result = interpreter.execute(generateExecuteAstNodeData(astNode));
            expect((result as BaseValueObject).getValue()).toStrictEqual(9.23);
        });

        it('sums all data across the table: SUM(Table1[#Data]) => 9.23', async () => {
            const lexerNode = lexer.treeBuilder('=SUM(Table1[#Data])') as LexerNode;
            const astNode = astTreeBuilder.parse(lexerNode) as BaseAstNode;
            const result = interpreter.execute(generateExecuteAstNodeData(astNode));
            expect((result as BaseValueObject).getValue()).toStrictEqual(6.23);
        });

        it('totals row behavior: SUM(Table1[[#Totals],[col1]]) => 0 when no totals row is configured', async () => {
            const lexerNode = lexer.treeBuilder('=SUM(Table1[[#Totals],[col1]])') as LexerNode;
            const astNode = astTreeBuilder.parse(lexerNode) as BaseAstNode;
            const result = interpreter.execute(generateExecuteAstNodeData(astNode));
            expect((result as BaseValueObject).getValue()).toStrictEqual(0);
        });

        it('unions two columns: SUM(Table1[col1], Table1[col3]) => (3+1+0) + (1.23) = 5.23', async () => {
            const lexerNode = lexer.treeBuilder('=SUM(Table1[col1], Table1[col3])') as LexerNode;
            const astNode = astTreeBuilder.parse(lexerNode) as BaseAstNode;
            const result = interpreter.execute(generateExecuteAstNodeData(astNode));
            expect((result as BaseValueObject).getValue()).toStrictEqual(5.23);
        });

        it('mixed qualifier order is supported: Table1[[col1]:[col2],[#Data]] => 8', async () => {
            const lexerNode = lexer.treeBuilder('=SUM(Table1[[col1]:[col2],[#Data]])') as LexerNode;
            const astNode = astTreeBuilder.parse(lexerNode) as BaseAstNode;
            const result = interpreter.execute(generateExecuteAstNodeData(astNode));
            expect((result as BaseValueObject).getValue()).toStrictEqual('#NAME?');
        });

        it('single-column double-bracket form: Table1[[#Data],[col1]] => 3+1+0 = 4', async () => {
            const lexerNode = lexer.treeBuilder('=SUM(Table1[[#Data],[col1]])') as LexerNode;
            const astNode = astTreeBuilder.parse(lexerNode) as BaseAstNode;
            const result = interpreter.execute(generateExecuteAstNodeData(astNode));
            expect((result as BaseValueObject).getValue()).toStrictEqual(4);
        });

        it('supports line-break column names in structured references', async () => {
            const lexerNode = lexer.treeBuilder('=SUM(Table1[CASH\r\nOUT])') as LexerNode;
            const astNode = astTreeBuilder.parse(lexerNode) as BaseAstNode;
            const result = interpreter.execute(generateExecuteAstNodeData(astNode));
            expect((result as BaseValueObject).getValue()).toStrictEqual(4);
        });

        it('supports commas and line breaks in structured-reference column names', () => {
            const lexerNode = lexer.treeBuilder('=SUM(Table1[Deposit,\r\nCredit (+)])') as LexerNode;
            const astNode = astTreeBuilder.parse(lexerNode) as BaseAstNode;
            const result = interpreter.execute(generateExecuteAstNodeData(astNode));

            expect((result as BaseValueObject).getValue()).toStrictEqual(4);
        });

        it('supports trailing colons in structured-reference column names', () => {
            const lexerNode = lexer.treeBuilder('=SUBTOTAL(103,Table1[Business Name:])') as LexerNode;
            const astNode = astTreeBuilder.parse(lexerNode) as BaseAstNode;
            const result = interpreter.execute(generateExecuteAstNodeData(astNode));

            expect((result as BaseValueObject).getValue()).toStrictEqual(3);
        });

        it.each([[0, false], [1, true]])('checks a blank current-row cell with a line-break header on row %i', (row, expected) => {
            const runtime = get(IFormulaRuntimeService);
            runtime.setCurrent(row, 5, runtime.currentRowCount, runtime.currentColumnCount, runtime.currentSubUnitId, runtime.currentUnitId);
            const lexerNode = lexer.treeBuilder('=ISBLANK(Table1[[#This Row],[Blank\r\nColumn]])') as LexerNode;
            const astNode = astTreeBuilder.parse(lexerNode) as BaseAstNode;
            const result = interpreter.execute(generateExecuteAstNodeData(astNode));
            expect((result as BaseValueObject).getValue()).toBe(expected);
        });

        it('calculates FMEA current-row formulas with parenthesized column names', () => {
            const runtime = get(IFormulaRuntimeService);
            runtime.setCurrent(1, 5, runtime.currentRowCount, runtime.currentColumnCount, runtime.currentSubUnitId, runtime.currentUnitId);
            const lexerNode = lexer.treeBuilder(
                '=IF(OR(ISBLANK(Table_FMEA[[#This Row],[F\r\n(1-5)]]),ISBLANK(Table_FMEA[[#This Row],[S\r\n(1-5)]]))," - ",Table_FMEA[[#This Row],[F\r\n(1-5)]]*Table_FMEA[[#This Row],[S\r\n(1-5)]])'
            ) as LexerNode;
            const astNode = astTreeBuilder.parse(lexerNode) as BaseAstNode;
            const result = interpreter.execute(generateExecuteAstNodeData(astNode));

            expect((result as BaseValueObject).getValue()).toBe(' - ');
        });

        it('supports line-break column names in SUBTOTAL structured references', async () => {
            const lexerNode = lexer.treeBuilder('=SUBTOTAL(109,Table1[CASH\r\nOUT])') as LexerNode;
            const astNode = astTreeBuilder.parse(lexerNode) as BaseAstNode;
            const result = interpreter.execute(generateExecuteAstNodeData(astNode));
            expect((result as BaseValueObject).getValue()).toStrictEqual(4);
        });

        it('supports totals row arithmetic with line-break column names', async () => {
            const lexerNode = lexer.treeBuilder(
                '=Table1[[#Totals],[CASH\r\nIN]]-Table1[[#Totals],[CASH\r\nOUT]]+A1'
            ) as LexerNode;
            const astNode = astTreeBuilder.parse(lexerNode) as BaseAstNode;
            const result = interpreter.execute(generateExecuteAstNodeData(astNode));
            expect((result as BaseValueObject).getValue()).toStrictEqual(101);
        });

        it('ignores text in numeric aggregations: SUM(Table1[col2]) => 4', async () => {
            const lexerNode = lexer.treeBuilder('=SUM(Table1[col2])') as LexerNode;
            const astNode = astTreeBuilder.parse(lexerNode) as BaseAstNode;
            const result = interpreter.execute(generateExecuteAstNodeData(astNode));
            expect((result as BaseValueObject).getValue()).toStrictEqual(4);
        });

        it('COUNTIF on a column with mixed types: COUNTIF(Table1[col2], ">0") => 1', async () => {
            const lexerNode = lexer.treeBuilder('=COUNTIF(Table1[col2], ">0")') as LexerNode;
            const astNode = astTreeBuilder.parse(lexerNode) as BaseAstNode;
            const result = interpreter.execute(generateExecuteAstNodeData(astNode));
            expect((result as BaseValueObject).getValue()).toStrictEqual(1);
        });
    });
});

function createNamedLambdaTestBed(definedNames: IDefinedNameMapItem, singleCellArray = false) {
    const data: IWorkbookData = {
        id: 'named-lambda',
        name: 'Named lambdas',
        appVersion: '1.0.0',
        locale: LocaleType.EN_US,
        styles: {},
        sheetOrder: ['sheet'],
        sheets: { sheet: { id: 'sheet', name: 'Sheet1', rowCount: 100, columnCount: 10, cellData: {} } },
    };
    if (singleCellArray) {
        data.sheets.sheet.cellData = { 0: { 0: { f: '=SUM(IF(B1:B4,1,8))', ref: 'A1', ft: FormulaType.ARRAY } } };
    }
    const univer = new Univer();
    univer.registerPlugin(UniverFormulaEnginePlugin);
    univer.createUnit(UniverInstanceType.UNIVER_SHEET, data);
    const injector = univer.__getInjector();
    injector.get(ILogService).setLogLevel(LogLevel.SILENT);
    const names = injector.get(IDefinedNamesService);
    names.registerDefinedNames(data.id, definedNames);
    const service = injector.get(ICalculateFormulaService);
    return {
        univer,
        names,
        injector,
        async calculate(formula: string, options: {
            dirtyDefinedNameMap?: IFormulaDatasetConfig['dirtyDefinedNameMap'];
            forceCalculate?: boolean;
            input?: number | string;
            arrayFormula?: boolean;
        } = {}) {
            let complete!: (result: IAllRuntimeData) => void;
            const completed = new Promise<IAllRuntimeData>((resolve) => {
                complete = resolve;
            });
            const listener = service.executionCompleteListener$.subscribe(complete);
            try {
                await service.execute({
                    formulaData: { [data.id]: { sheet: { 0: { 0: { f: formula } } } } },
                    arrayFormulaCellData: {},
                    arrayFormulaRange: options.arrayFormula
                        ? {
                            [data.id]: { sheet: { 0: { 0: { startRow: 0, endRow: 0, startColumn: 0, endColumn: 0 } } } },
                        }
                        : {},
                    forceCalculate: options.forceCalculate ?? true,
                    dirtyRanges: [{ unitId: data.id, sheetId: 'sheet', range: { startRow: 0, endRow: 0, startColumn: 1, endColumn: 1 } }],
                    dirtyNameMap: {},
                    dirtyDefinedNameMap: options.dirtyDefinedNameMap ?? {},
                    dirtySuperTableMap: {},
                    dirtyUnitFeatureMap: {},
                    dirtyUnitOtherFormulaMap: {},
                    clearDependencyTreeCache: {},
                    excludedCell: {},
                    allUnitData: { [data.id]: { sheet: { cellData: new ObjectMatrix<ICellData>({ 0: { 0: { f: formula }, 1: { v: options.input ?? 1 } } }), rowCount: 100, columnCount: 10, rowData: {}, columnData: {} } } },
                    unitSheetNameMap: { [data.id]: { Sheet1: 'sheet' } },
                    unitStylesData: {},
                    unitNameMap: { [data.id]: { name: data.name, unitType: UniverInstanceType.UNIVER_SHEET } },
                    calculationSettings: { [data.id]: { iterativeCalculation: false, maxIterations: 100, maxChange: 0.001 } },
                });
                const result = await completed;
                return result.unitData[data.id]?.sheet?.getValue(0, 0);
            } finally {
                listener.unsubscribe();
            }
        },
    };
}

describe('Worksheet trigonometric range', () => {
    it.each(['SIN', 'COS', 'TAN', 'COT', 'SEC', 'CSC'])('checks the Excel limit for %s', async (name) => {
        const bed = createNamedLambdaTestBed({});
        try {
            expect((await bed.calculate(`=${name}(134217727)`))?.t).toBe(CellValueType.NUMBER);
            expect((await bed.calculate(`=${name}(-134217728)`))?.v).toBe(ErrorType.NUM);
            expect((await bed.calculate(`=${name}(134217728)`))?.v).toBe(ErrorType.NUM);
        } finally {
            bed.univer.dispose();
        }
    });
});

describe('Database field arguments', () => {
    it.each([
        ['=DCOUNT({"Tree","Yield";"Apple",7;"Apple","9";"Pear",2},,{"Tree";"Apple"})', 2],
        ['=DCOUNT({"Tree","Yield";"Apple",7;"Apple","9";"Pear",2},2,{"Tree";"Apple"})', 1],
        ['=DCOUNTA({"Tree","Yield";"Apple",7;"Apple","9";"Pear",2},,{"Tree";"Apple"})', 2],
        ['=DCOUNT({"Tree","Yield";"Apple",7},C1,{"Tree";"Apple"})', ErrorType.VALUE],
        ['=DSUM({"Tree","Yield";"Apple",7},"2",{"Tree";"Apple"})', ErrorType.VALUE],
        ['=DSUM({"Tree","Yield";"Apple",7;"Apple",#N/A},2,{"Tree";"Apple"})', ErrorType.NA],
    ])('calculates %s', async (formula, expected) => {
        const bed = createNamedLambdaTestBed({});
        try {
            expect((await bed.calculate(formula as string))?.v).toBe(expected);
        } finally {
            bed.univer.dispose();
        }
    });
});

describe('ETS dependency recalculation', () => {
    it('recalculates the forecast after changing and restoring an observation', async () => {
        const bed = createNamedLambdaTestBed({});
        const formula = '=FORECAST.ETS(5,HSTACK(B1,14,11,20),{1,2,3,4},0)';
        try {
            expect((await bed.calculate(formula, { input: 8 }))?.v).toBeCloseTo(21.716830212285714, 10);
            expect((await bed.calculate(formula, { input: 9, forceCalculate: false }))?.v).toBeCloseTo(21.56827976442857, 10);
            expect((await bed.calculate(formula, { input: 8, forceCalculate: false }))?.v).toBeCloseTo(21.716830212285714, 10);
        } finally {
            bed.univer.dispose();
        }
    });
});

describe('Linear forecasts and scalar arguments', () => {
    it.each([
        ['=ADDRESS(2,3,1,TRUE,"[Book.xlsx]Sheet1")', '[Book.xlsx]Sheet1!$C$2'],
        ['=ADDRESS(2,3,1,TRUE,"")', '!$C$2'],
        ['=ADDRESS(0,0,4,FALSE)', 'RC'],
        ['=ADDRESS(-1,-2,4,FALSE)', 'R[-1]C[-2]'],
        ['=ADDRESS(1048577,1)', ErrorType.VALUE],
        ['=ADDRESS(2,3,1,"abc")', ErrorType.VALUE],
        ['=PROB({0,1,2,3,4},{0.1,0.2,0.4,0.2,0.1},2)', 0.4],
        ['=PROB({0,1},{1.5,-0.5},1)', -0.5],
        ['=PROB({0,1},{0.5,0.500000000001},1)', ErrorType.NUM],
        ['=PROB({0,1},{0.2,0.3,0.5},1)', ErrorType.NA],
        ['=PROB({0,1,TRUE},{0.2,0.3,0.5},1)', ErrorType.NUM],
        ['=SUM(PROB({0,1,2},{0.2,0.3,0.5},0,{0,1,2}))', 1.7],
        ['=ACCRINT(DATE(2023,11,15),DATE(2024,5,15),DATE(2024,3,15),0.0575,1000,2,2)', 19.32638888888889],
        ['=ACCRINT(DATE(2023,11,15),DATE(2024,5,15),DATE(2025,2,1),0.0575,1000,2,1,FALSE)', 70.13736263736264],
        ['=XNPV(0.09,{-10000,11000},{44927.9,45292.1})', 91.74311926605515],
        ['=XNPV(0,{-1000,1100},{44927,45292})', ErrorType.NUM],
        ['=XIRR({-1000,900},{44927,45292})', -0.10000000335276127],
        ['=XIRR({-1000,1100},{44927,45292},0)', 0.0999999951171875],
        ['=DECIMAL("  FF",16)', 255],
        ['=DECIMAL("FF  ",16)', ErrorType.NUM],
        ['=VDB(2400,300,10,2.25,7.75)', 1028.8644096],
        ['=VDB(2400,300,10,0,5,,TRUE)', 0],
        ['=VDB(2400,300,10,0,5,,FALSE)', 1050],
        ['=DECIMAL(REPT("0",256),16)', ErrorType.VALUE],
        ['=VDB(2400,300,10,0,5,0)', 1050],
        ['=VDB(2400,300,10,8,10,2,"TRUE")', 102.653184],
        ['=FORECAST.ETS(5,{8,14,11,20},{1,2,3,4},0)', 21.716830212285714],
        ['=FORECAST.ETS.STAT({8,14,11,20},{1,2,3,4},2,0)', 0.001],
        ['=FORECAST.ETS(200,{1.5,2,3.25,4,5.5,8,13,21,34,55},{12,18,24,30,36,42,7,5,9,60},0,0)', 51.65917288045224],
        ['=FORECAST.ETS.STAT({1.5,2,3.25,4,5.5,8,13,21,34,55},{12,18,24,30,36,42,7,5,9,60},1,0)', 0.998],
        ['=FORECAST.ETS.SEASONALITY({18,7,12,6,18,7,12,6},{1,2,3,4,5,6,7,8})', 2],
        ['=FORECAST.ETS.CONFINT(9,{18,7,12,6,18,7,12,6},{1,2,3,4,5,6,7,8},0.95,4)', 0],
        ['=FORECAST.ETS(NA(),{8,14,11,20},{1,2,3,4})', ErrorType.NA],
        ['=FORECAST(5,{2,4,"100",8},{1,2,3,4})', 10],
        ['=SUM(COUPDAYS(DATE(2024,3,15),DATE(2030,11,15),2,{0,1,2,3,4}))', 904.5],
        ['=COUPDAYBS(DATE(2024,3,15)+0.99,DATE(2030,11,15)+0.9,2,1)', 121],
        ['=COUPNUM(DATE(2024,3,15),DATE(2030,11,15),2,5)', ErrorType.NUM],
        ['=FORECAST.LINEAR(5,{2,4,"100",8},{1,2,3,4})', 10],
        ['=FORECAST(5,{"2","4","8"},{1,2,4})', ErrorType.DIV_BY_ZERO],
        ['=DOLLAR(1234.567,)', '¥1,235'],
        ['=DOLLAR(-0.00001,2)', '(¥0.00)'],
        ['=XMATCH(20,{30;20;10},0,-2)', 2],
        ['=XMATCH("a*",{"a","b","c"},2,2)', ErrorType.VALUE],
        ['=OFFSET(A1,0.9,1.9)', 2],
        ['=OFFSET(B1,0,0,C1,1)', ErrorType.REF],
        ['=OFFSET(B1,0,0,NA(),1)', ErrorType.NA],
    ])('calculates %s', async (formula, expected) => {
        const bed = createNamedLambdaTestBed({});
        try {
            const actual = (await bed.calculate(formula as string, { input: 2 }))?.v;
            if (typeof expected === 'number' && !Number.isInteger(expected)) {
                expect(actual).toBeCloseTo(expected, 10);
            } else {
                expect(actual).toBe(expected);
            }
        } finally {
            bed.univer.dispose();
        }
    });
});

describe('Excel array arguments and sheet references', () => {
    it.each([
        ['=TEXTJOIN("|",FALSE,FREQUENCY({-1,0,"2",8,11,TRUE},{10,0,10,0}))', '1|2|0|0|1'],
        ['=TEXTJOIN("|",FALSE,FREQUENCY({-1,0,2,8,11},C1))', '2|3'],
        ['=FREQUENCY(1/0,NA())', ErrorType.DIV_BY_ZERO],
        ['=EXPAND({1,2},2,3,{8,9})', ErrorType.VALUE],
        ['=ARRAYTOTEXT(EXPAND({1,2},2,3,),1)', '{1,2,0;0,0,0}'],
        ['=EXPAND({1,2},-2,3,9)', ErrorType.VALUE],
        ['=ARRAYTOTEXT(SORT({2,9;1,8;2,7},{1,2}),1)', '{1,8;2,7;2,9}'],
        ['=SORT(1,2,1)', ErrorType.VALUE],
        ['=SHEETS(B1)', 1],
        ['=SHEETS(INDIRECT("nope"))', ErrorType.REF],
    ])('calculates %s', async (formula, expected) => {
        const bed = createNamedLambdaTestBed({});
        try {
            expect((await bed.calculate(formula as string))?.v).toBe(expected);
        } finally {
            bed.univer.dispose();
        }
    });
});

const RECURSIVE_DEFINED_NAMES: IDefinedNameMapItem = {
    fact: { id: 'fact', name: 'FACTREC', formulaOrRefString: '=LAMBDA(n,IF(n<=1,1,n*FACTREC(n-1)))' },
    fib: { id: 'fib', name: 'FIB', formulaOrRefString: '=LAMBDA(n,IF(n<2,n,FIB(n-1)+FIB(n-2)))' },
    even: { id: 'even', name: 'EVEN_N', formulaOrRefString: '=LAMBDA(n,IF(n=0,TRUE,ODD_N(n-1)))' },
    odd: { id: 'odd', name: 'ODD_N', formulaOrRefString: '=LAMBDA(n,IF(n=0,FALSE,EVEN_N(n-1)))' },
};

describe('Recursive named lambda calculation', () => {
    it.each([
        ['=FACTREC(1)', 1],
        ['=FACTREC(10)', 3628800],
        ['=factrec(5)', 120],
        ['=FACTREC(100000)', ErrorType.NUM],
        ['=FACTREC(3,4)', ErrorType.VALUE],
        ['=FACTREC(NA())', ErrorType.NA],
        ['=IF(TRUE,7,FACTREC(100000))', 7],
        ['=FACTREC(4)+FACTREC(5)', 144],
        ['=SUM(MAP({1;2;3;4},LAMBDA(v,FACTREC(v))))', 33],
        ['=SUM(MAP({1;2;3;4},FACTREC))', 33],
        ['=FIB(10)', 55],
        ['=IF(EVEN_N(10),7,9)', 7],
        ['=IF(ODD_N(10),7,9)', 9],
    ])('calculates %s without expanding recursive names indefinitely', async (formula, expected) => {
        const bed = createNamedLambdaTestBed({ ...RECURSIVE_DEFINED_NAMES });
        try {
            expect(await bed.calculate(formula as string)).toMatchObject({
                v: expected,
                t: typeof expected === 'number' ? CellValueType.NUMBER : CellValueType.STRING,
            });
        } finally {
            bed.univer.dispose();
        }
    });

    it('uses independent parameter bindings after a recursion error and after a definition changes', async () => {
        const bed = createNamedLambdaTestBed({ ...RECURSIVE_DEFINED_NAMES });
        try {
            expect((await bed.calculate('=FACTREC(100000)'))?.v).toBe(ErrorType.NUM);
            expect((await bed.calculate('=FACTREC(5)'))?.v).toBe(120);
            const formula = '=LAMBDA(n,IF(n<=1,2,n*FACTREC(n-1)))';
            bed.names.registerDefinedName('named-lambda', { id: 'fact', name: 'FACTREC', formulaOrRefString: formula });
            expect((await bed.calculate('=FACTREC(5)', { dirtyDefinedNameMap: { 'named-lambda': { [formula]: 'FACTREC' } } }))?.v).toBe(240);
        } finally {
            bed.univer.dispose();
        }
    });

    it.each([
        '=_xlfn.LAMBDA(_xlpm.n,IF(_xlpm.n<=1,1,_xlpm.n*FACTREC(_xlpm.n-1)))',
        '_xlfn.LAMBDA(_xlpm.n,IF(_xlpm.n<=1,1,_xlpm.n*FACTREC(_xlpm.n-1)))',
        'LAMBDA(n,IF(n<=1,1,n*FACTREC(n-1)))',
    ])('handles imported recursive definitions %s and preserves ordinary names', async (formulaOrRefString) => {
        const bed = createNamedLambdaTestBed({
            fact: { id: 'fact', name: 'FACTREC', localSheetId: 'AllDefaultWorkbook', formulaOrRefString },
            rate: { id: 'rate', name: 'Rate', formulaOrRefString: '=4' },
            alias: { id: 'alias', name: 'Multiplier', formulaOrRefString: '=Rate' },
        });
        try {
            expect((await bed.calculate('=FACTREC(5)*Multiplier'))?.v).toBe(480);
        } finally {
            bed.univer.dispose();
        }
    });

    it('reports a circular non-lambda name without aborting subsequent calculations', async () => {
        const bed = createNamedLambdaTestBed({
            first: { id: 'first', name: 'FirstName', formulaOrRefString: '=SecondName' },
            second: { id: 'second', name: 'SecondName', formulaOrRefString: '=FirstName' },
        });
        try {
            expect((await bed.calculate('=FirstName'))?.v).toBe(ErrorType.NAME);
            expect((await bed.calculate('=1+1'))?.v).toBe(2);
        } finally {
            bed.univer.dispose();
        }
    });

    it('tracks recursive body references for incremental recalculation', async () => {
        const bed = createNamedLambdaTestBed({
            sum: { id: 'sum', name: 'RECURSUM', formulaOrRefString: '=LAMBDA(n,IF(n<=0,0,B1+RECURSUM(n-1)))' },
        });
        try {
            expect((await bed.calculate('=B1', { input: 2 }))?.v).toBe(2);
            expect((await bed.calculate('=RECURSUM(3)', { input: 2 }))?.v).toBe(6);
            expect((await bed.calculate('=RECURSUM(3)', { input: 4, forceCalculate: false }))?.v).toBe(12);
        } finally {
            bed.univer.dispose();
        }
    });

    it('uses sheet-local definitions and preserves registered function precedence', async () => {
        const bed = createNamedLambdaTestBed({
            ...RECURSIVE_DEFINED_NAMES,
            local: { id: 'local', name: 'FACTREC', localSheetId: 'sheet', formulaOrRefString: '=LAMBDA(n,IF(n<=1,2,n*FACTREC(n-1)))' },
            sum: { id: 'sum', name: 'SUM', formulaOrRefString: '=LAMBDA(n,SUM(n))' },
        });
        try {
            expect((await bed.calculate('=FACTREC(5)+SUM(1,2)'))?.v).toBe(243);
        } finally {
            bed.univer.dispose();
        }
    });

    it('limits non-terminating recursion and releases the call depth', async () => {
        const bed = createNamedLambdaTestBed({
            spin: { id: 'spin', name: 'SPIN', formulaOrRefString: '=LAMBDA(n,SPIN(n))' },
            ...RECURSIVE_DEFINED_NAMES,
        });
        try {
            expect((await bed.calculate('=SPIN(1)'))?.v).toBe(ErrorType.NUM);
            expect((await bed.calculate('=FACTREC(10)'))?.v).toBe(3628800);
        } finally {
            bed.univer.dispose();
        }
    });

    it('awaits asynchronous recursive bodies and releases their call depth', async () => {
        class AsyncIdentity extends AsyncCustomFunction {
            constructor() {
                super('ASYNC_IDENTITY');
            }

            override async calculateCustom(...variants: Parameters<AsyncCustomFunction['calculateCustom']>): Promise<number> {
                return Number(variants[0]);
            }
        }
        const bed = createNamedLambdaTestBed({
            fact: { id: 'fact', name: 'FACTASYNC', formulaOrRefString: '=LAMBDA(n,IF(n<=1,ASYNC_IDENTITY(1),n*FACTASYNC(n-1)))' },
        });
        try {
            bed.injector.add([AsyncIdentity]);
            bed.injector.get(IFunctionService).registerExecutors(bed.injector.get(AsyncIdentity));
            expect((await bed.calculate('=ASYNC_IDENTITY(1)'))?.v).toBe(1);
            expect((await bed.calculate('=FACTASYNC(1)'))?.v).toBe(1);
            expect((await bed.calculate('=FACTASYNC(2)'))?.v).toBe(2);
            expect((await bed.calculate('=FACTASYNC(5)'))?.v).toBe(120);
            expect((await bed.calculate('=FACTASYNC(100000)'))?.v).toBe(ErrorType.NUM);
            expect((await bed.calculate('=FACTASYNC(5)'))?.v).toBe(120);
        } finally {
            bed.univer.dispose();
        }
    });
});

describe('INDIRECT reference validation', () => {
    it.each([
        '=SUM(INDIRECT("Sheet1!B4:B5,Sheet1!B7"))',
        '=SUM(INDIRECT("Sheet1!B1:B2,Sheet1!B1"))',
        '=INDIRECT("XFE1")',
        '=INDIRECT("A1048577")',
    ])('rejects malformed or out-of-bounds cell addresses in %s', async (formula) => {
        const bed = createNamedLambdaTestBed({});
        try {
            expect((await bed.calculate(formula))?.v).toBe(ErrorType.REF);
        } finally {
            bed.univer.dispose();
        }
    });

    it.each(['=SUM(INDIRECT("Sheet1!B1"))', '=SUM(INDIRECT("Sheet1!B1:B2"))', '=SUM(INDIRECT("Sheet1!B:B"))'])('preserves valid references in %s', async (formula) => {
        const bed = createNamedLambdaTestBed({});
        try {
            expect((await bed.calculate(formula, { input: 2 }))?.v).toBe(2);
        } finally {
            bed.univer.dispose();
        }
    });
});

describe('Quoted array constants in formulas', () => {
    it.each([
        ['=TEXTBEFORE("a,b;c",{",",";"})', 'a'],
        ['=TEXTBEFORE("a,b;c",{",",";"},2)', 'a,b'],
        ['=TEXTAFTER("a,b;c",{",",";"})', 'b;c'],
        ['=TEXTJOIN("|",FALSE,{"a,b","c;d";"e""f",""})', 'a,b|c;d|e"f|'],
        ['=TEXTJOIN("|",FALSE,{"e""f";"g"},FACTREC(1))', 'e"f|g|1'],
        ['=ROWS({"a;b","c,d"})', 1],
        ['=COLUMNS({"a;b","c,d"})', 2],
        ['=ARRAYTOTEXT(TEXTSPLIT("a,b;c",{",",";"}),1)', '{"a","b","c"}'],
    ])('keeps quoted separators as data in %s', async (formula, expected) => {
        const bed = createNamedLambdaTestBed({ ...RECURSIVE_DEFINED_NAMES });
        try {
            expect((await bed.calculate(formula as string))?.v).toBe(expected);
        } finally {
            bed.univer.dispose();
        }
    });
});

describe('Supported formula Excel compatibility', () => {
    it.each([
        '=FACTDOUBLE(INDIRECT("Missing!B1:B4"))',
        '=MROUND(INDIRECT("Missing!B1:B4"),5)',
        '=QUOTIENT(INDIRECT("Missing!B1:B4"),2)',
        '=SQRTPI(INDIRECT("Missing!B1:B4"))',
    ])('preserves missing-sheet errors in %s', async (formula) => {
        const bed = createNamedLambdaTestBed({});
        try {
            expect((await bed.calculate(formula))?.v).toBe(ErrorType.REF);
        } finally {
            bed.univer.dispose();
        }
    });

    it.each([
        '=FACTDOUBLE(B1:B4)',
        '=MROUND(B1:B4,5)',
        '=QUOTIENT(B1:B4,2)',
        '=SQRTPI(B1:B4)',
    ])('rejects valid multi-cell references with first-cell errors in %s', async (formula) => {
        const bed = createNamedLambdaTestBed({});
        try {
            expect((await bed.calculate(formula, { input: ErrorType.NA }))?.v).toBe(ErrorType.VALUE);
        } finally {
            bed.univer.dispose();
        }
    });

    it.each([true, false])('preserves one-cell array formula context: %s', async (arrayFormula) => {
        const bed = createNamedLambdaTestBed({}, arrayFormula);
        try {
            const model = bed.injector.get(FormulaDataModel);
            model.getFormulaData();
            expect(model.getArrayFormulaRange()['named-lambda']?.sheet?.[0]?.[0] != null).toBe(arrayFormula);
            await bed.calculate('=1', { arrayFormula });
            const runtime = bed.injector.get(IFormulaRuntimeService);
            runtime.setCurrent(0, 0, 1, 1, 'sheet', 'named-lambda');
            const lexer = bed.injector.get(Lexer);
            const ast = bed.injector.get(AstTreeBuilder).parse(lexer.treeBuilder('=SUM(IF(B1:B4,1,8))', true, 'named-lambda') as LexerNode);
            const result = bed.injector.get(Interpreter).execute(generateExecuteAstNodeData(ast as BaseAstNode));
            expect((result as BaseValueObject).getValue()).toBe(arrayFormula ? 25 : 1);
        } finally {
            bed.univer.dispose();
        }
    });

    it.each([
        ['=BASE(1,2,255)', `${'0'.repeat(254)}1`],
        ['=SUM(FACTDOUBLE({4,5,6}))', 71],
        ['=SUM(FACTDOUBLE(B1:B4))', ErrorType.VALUE],
        ['=SUM(FACTDOUBLE(B1:B4+4))', 39],
        ['=SUM(MROUND(B1:B4,5))', ErrorType.VALUE],
        ['=SUM(MROUND(B1:B4+7,5))', 25],
        ['=SUM(QUOTIENT(B1:B4,2))', ErrorType.VALUE],
        ['=SUM(QUOTIENT(B1:B4+7,2))', 13],
        ['=SUM(SQRTPI(B1:B4))', ErrorType.VALUE],
        ['=ROUND(SUM(SQRTPI(B1:B4+0)),6)', 1.772454],
        ['=SUM(MROUND({7,8,13},5))', 30],
        ['=ARRAYTOTEXT(MROUND({7,8,13},{5;10}),1)', '{5,10,15;10,10,10}'],
        ['=SUM(QUOTIENT({5,7,9},2))', 9],
        ['=ARRAYTOTEXT(QUOTIENT({5,7,9},{2;0}),1)', '{2,3,4;#DIV/0!,#DIV/0!,#DIV/0!}'],
        ['=ROUND(SUM(SQRTPI({1,2,3})),6)', 7.349062],
        ['=ARRAYTOTEXT(CHOOSECOLS({1,2,3;4,5,6},{1,3}),1)', '{1,3;4,6}'],
        ['=ARRAYTOTEXT(CHOOSECOLS({1,2,3;4,5,6},{1;3}),1)', '{1,3;4,6}'],
        ['=ARRAYTOTEXT(CHOOSECOLS({1,2,3;4,5,6},{-1,1},2),1)', '{3,1,2;6,4,5}'],
        ['=CHOOSECOLS({1,2,3;4,5,6},{1,0})', ErrorType.VALUE],
        ['=ARRAYTOTEXT(CHOOSEROWS({1,2;3,4;5,6},{1,3}),1)', '{1,2;5,6}'],
        ['=ARRAYTOTEXT(CHOOSEROWS({1,2;3,4;5,6},{1;3}),1)', '{1,2;5,6}'],
        ['=ARRAYTOTEXT(CHOOSEROWS({1,2;3,4;5,6},{-1,1},2),1)', '{5,6;1,2;3,4}'],
        ['=CHOOSEROWS({1,2;3,4;5,6},{1,0})', ErrorType.VALUE],
        ['=BASE(1,2,256)', ErrorType.NUM],
        ['=BASE(1,2,255.9)', `${'0'.repeat(254)}1`],
        ['=BASE(1,2,256.1)', ErrorType.NUM],
        ['=MAKEARRAY(0,2,LAMBDA(r,c,1))', ErrorType.VALUE],
        ['=MAKEARRAY(2,0,LAMBDA(r,c,1))', ErrorType.VALUE],
        ['=MAKEARRAY(-1,2,LAMBDA(r,c,1))', ErrorType.VALUE],
        ['=MAKEARRAY("a",2,LAMBDA(r,c,1))', ErrorType.VALUE],
        ['=MAKEARRAY(NA(),2,LAMBDA(r,c,1))', ErrorType.NA],
        ['=SUM(MAKEARRAY(2.9,2,LAMBDA(r,c,r*c)))', 9],
        ['=CEILING.MATH(-5.5,,1)', -6],
        ['=FLOOR.MATH(-5.5,,1)', -5],
        ['=CEILING.MATH(-5.5,0,1)', 0],
        ['=CEILING.MATH(-5.5,B10,1)', 0],
        ['=CEILING.MATH(-5.5,CHOOSE(1,,99),1)', -6],
        ['=TEXTJOIN("|",FALSE,ROUND(LINEST({3;5;7},{1;2;3},),6))', '2|1'],
        ['=TEXTJOIN("|",FALSE,ROUND(LINEST({3;5;7},{1;2;3},FALSE),6))', '2.428571|0'],
        ['=TEXTJOIN("|",FALSE,ROUND(LINEST({3;5;7},{1;2;3},CHOOSE(1,,99)),6))', '2|1'],
        ['=TEXTJOIN("|",FALSE,ROUND(LOGEST({3;6;12},{1;2;3},),6))', '2|1.5'],
        ['=ARRAYTOTEXT(UNIQUE({1;"1";1}),1)', '{1;"1"}'],
        ['=ARRAYTOTEXT({1,2},2)', ErrorType.VALUE],
        ['=ARRAYTOTEXT({1,2},-1)', ErrorType.VALUE],
        ['=ARRAYTOTEXT({1,2},0.5)', ErrorType.VALUE],
        ['=ARRAYTOTEXT(UNIQUE({"a";"A";"b"}),1)', '{"a";"b"}'],
        ['=ARRAYTOTEXT(UNIQUE({1,"1",TRUE,"TRUE"},TRUE),1)', '{1,"1",TRUE,"TRUE"}'],
    ])('calculates %s through the real formula service', async (formula, expected) => {
        const bed = createNamedLambdaTestBed({});
        try {
            expect((await bed.calculate(formula as string))?.v).toBe(expected);
        } finally {
            bed.univer.dispose();
        }
    });
});

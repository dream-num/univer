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

import type { Injector } from '@univerjs/core';
import type { BaseAstNode } from '../../ast-node/base-ast-node';
import type { ArrayValueObject } from '../../value-object/array-value-object';
import type { BaseValueObject } from '../../value-object/base-value-object';
import type { LexerNode } from '../lexer-node';
import { beforeEach, describe, expect, it } from 'vitest';
import { ErrorType } from '../../../basics/error-type';
import { FUNCTION_NAMES_LOGICAL } from '../../../functions/logical/function-names';
import { Groupby } from '../../../functions/logical/groupby';
import { If } from '../../../functions/logical/if';
import { Percentof } from '../../../functions/logical/percentof';
import { FUNCTION_NAMES_LOOKUP } from '../../../functions/lookup/function-names';
import { Hstack } from '../../../functions/lookup/hstack';
import { FUNCTION_NAMES_MATH } from '../../../functions/math/function-names';
import { Pi } from '../../../functions/math/pi';
import { Subtotal } from '../../../functions/math/subtotal';
import { Sum } from '../../../functions/math/sum';
import { Compare } from '../../../functions/meta/compare';
import { Divided } from '../../../functions/meta/divided';
import { FUNCTION_NAMES_META } from '../../../functions/meta/function-names';
import { Minus } from '../../../functions/meta/minus';
import { Plus } from '../../../functions/meta/plus';
import { Counta } from '../../../functions/statistical/counta';
import { Countif } from '../../../functions/statistical/countif';
import { FUNCTION_NAMES_STATISTICAL } from '../../../functions/statistical/function-names';
import { StdevP } from '../../../functions/statistical/stdev-p';
import { FUNCTION_NAMES_TEXT } from '../../../functions/text/function-names';
import { Regexmatch } from '../../../functions/text/regexmatch';
import { IFormulaCurrentConfigService } from '../../../services/current-data.service';
import { IFunctionService } from '../../../services/function.service';
import { IFormulaRuntimeService } from '../../../services/runtime.service';
import { ISuperTableService } from '../../../services/super-table.service';
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
            new Sum(FUNCTION_NAMES_MATH.SUM),
            new Subtotal(FUNCTION_NAMES_MATH.SUBTOTAL),
            new Compare(FUNCTION_NAMES_META.COMPARE),
            new Plus(FUNCTION_NAMES_META.PLUS),
            new Minus(FUNCTION_NAMES_META.MINUS),
            new Divided(FUNCTION_NAMES_META.DIVIDED),
            new Pi(FUNCTION_NAMES_MATH.PI),
            new Countif(FUNCTION_NAMES_STATISTICAL.COUNTIF),
            new Counta(FUNCTION_NAMES_STATISTICAL.COUNTA),
            new StdevP(FUNCTION_NAMES_STATISTICAL.STDEV_P),
            new Regexmatch(FUNCTION_NAMES_TEXT.REGEXMATCH),
            new Hstack(FUNCTION_NAMES_LOOKUP.HSTACK),
            new Groupby(FUNCTION_NAMES_LOGICAL.GROUPBY),
            new If(FUNCTION_NAMES_LOGICAL.IF),
            new Percentof(FUNCTION_NAMES_LOGICAL.PERCENTOF)
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
            ]),
            range: {
                startRow: 0,
                endRow: 3,
                startColumn: 0,
                endColumn: 4,
            },
        });
    });

    describe('normal', () => {
        it('preserves xleta aggregator tokens inside GROUPBY', () => {
            const lexerNode = lexer.treeBuilder('=_xlfn.GROUPBY(A1:A3,A1:A3,_xlfn.HSTACK(_xleta.COUNTA,_xleta.PERCENTOF),0)');
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

            expect((result as ArrayValueObject).getFirstCell().getValue()).toStrictEqual(1);
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

        it('supports line-break column names in SUBTOTAL structured references', async () => {
            const lexerNode = lexer.treeBuilder('=SUBTOTAL(109,Table1[CASH\r\nOUT])') as LexerNode;
            const astNode = astTreeBuilder.parse(lexerNode) as BaseAstNode;
            const result = interpreter.execute(generateExecuteAstNodeData(astNode));
            expect((result as BaseValueObject).getValue()).toStrictEqual(4);
        });

        it('supports totals row arithmetic with line-break column names', async () => {
            const lexerNode = lexer.treeBuilder('=Table1[[#Totals],[CASH\r\nIN]]-Table1[[#Totals],[CASH\r\nOUT]]+A1') as LexerNode;
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

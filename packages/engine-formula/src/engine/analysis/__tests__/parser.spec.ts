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
import { FUNCTION_NAMES_MATH } from '../../../functions/math/function-names';
import { Pi } from '../../../functions/math/pi';
import { Sum } from '../../../functions/math/sum';
import { Divided } from '../../../functions/meta/divided';
import { FUNCTION_NAMES_META } from '../../../functions/meta/function-names';
import { Minus } from '../../../functions/meta/minus';
import { Plus } from '../../../functions/meta/plus';
import { IFormulaCurrentConfigService } from '../../../services/current-data.service';
import { IFunctionService } from '../../../services/function.service';
import { IFormulaRuntimeService } from '../../../services/runtime.service';
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
            new Plus(FUNCTION_NAMES_META.PLUS),
            new Minus(FUNCTION_NAMES_META.MINUS),
            new Divided(FUNCTION_NAMES_META.DIVIDED),
            new Pi(FUNCTION_NAMES_MATH.PI)
        );
    });

    describe('normal', () => {
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

        it('Minus Minus Minus ref', async () => {
            const lexerNode = lexer.treeBuilder('=---A1');

            const astNode = astTreeBuilder.parse(lexerNode as LexerNode);

            const result = interpreter.execute(generateExecuteAstNodeData(astNode as BaseAstNode));

            expect((result as ArrayValueObject).getFirstCell().getValue()).toStrictEqual(-1);
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
});

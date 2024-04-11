/**
 * Copyright 2023-present DreamNum Inc.
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

import type { Injector } from '@wendellhu/redi';
import { beforeEach, describe, expect, it } from 'vitest';

import { ErrorType } from '../../../basics/error-type';
import { FUNCTION_NAMES_MATH } from '../../../functions/math/function-names';
import { Sum } from '../../../functions/math/sum';
import { FUNCTION_NAMES_META } from '../../../functions/meta/function-names';
import { Plus } from '../../../functions/meta/plus';
import { IFormulaCurrentConfigService } from '../../../services/current-data.service';
import { IFunctionService } from '../../../services/function.service';
import { IFormulaRuntimeService } from '../../../services/runtime.service';
import type { BaseAstNode } from '../../ast-node/base-ast-node';
import { Interpreter } from '../../interpreter/interpreter';
import type { BaseValueObject } from '../../value-object/base-value-object';
import { Lexer } from '../lexer';
import type { LexerNode } from '../lexer-node';
import { AstTreeBuilder } from '../parser';
import type { ArrayValueObject } from '../../value-object/array-value-object';
import { Minus } from '../../../functions/meta/minus';
import { createCommandTestBed } from './create-command-test-bed';

describe('Test indirect', () => {
    // const textFunction = new Makearray(FUNCTION_NAMES_LOGICAL.MAKEARRAY);
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

        functionService.registerExecutors(new Sum(FUNCTION_NAMES_MATH.SUM), new Plus(FUNCTION_NAMES_META.PLUS), new Minus(FUNCTION_NAMES_META.MINUS));
    });

    describe('normal', () => {
        it('Ref error', async () => {
            const lexerNode = lexer.treeBuilder(`=sum(${ErrorType.REF} + 1)`);

            const astNode = astTreeBuilder.parse(lexerNode as LexerNode);

            const result = interpreter.execute(astNode as BaseAstNode);

            expect((result as BaseValueObject).getValue()).toStrictEqual(ErrorType.REF);
        });

        it('Name error', async () => {
            const lexerNode = lexer.treeBuilder(`=sum(${ErrorType.NAME} + 1, sum(${ErrorType.REF} + 1))`);

            const astNode = astTreeBuilder.parse(lexerNode as LexerNode);

            const result = interpreter.execute(astNode as BaseAstNode);

            expect((result as BaseValueObject).getValue()).toStrictEqual(ErrorType.NAME);
        });

        it('Minus Minus one', async () => {
            const lexerNode = lexer.treeBuilder('=--1');

            const astNode = astTreeBuilder.parse(lexerNode as LexerNode);

            const result = interpreter.execute(astNode as BaseAstNode);

            expect((result as BaseValueObject).getValue()).toStrictEqual(1);
        });

        it('Minus Minus Minus one', async () => {
            const lexerNode = lexer.treeBuilder('=---1');

            const astNode = astTreeBuilder.parse(lexerNode as LexerNode);

            const result = interpreter.execute(astNode as BaseAstNode);

            expect((result as BaseValueObject).getValue()).toStrictEqual(-1);
        });

        it('Plus Plus Plus Plus Plus Plus one', async () => {
            const lexerNode = lexer.treeBuilder('=++++++1');

            const astNode = astTreeBuilder.parse(lexerNode as LexerNode);

            const result = interpreter.execute(astNode as BaseAstNode);

            expect((result as BaseValueObject).getValue()).toStrictEqual(1);
        });

        it('Plus Plus Plus ref', async () => {
            const lexerNode = lexer.treeBuilder('=+++++++A1');

            const astNode = astTreeBuilder.parse(lexerNode as LexerNode);

            const result = interpreter.execute(astNode as BaseAstNode);

            expect((result as ArrayValueObject).getFirstCell().getValue()).toStrictEqual(1);
        });

        it('Minus Minus Minus ref', async () => {
            const lexerNode = lexer.treeBuilder('=---A1');

            const astNode = astTreeBuilder.parse(lexerNode as LexerNode);

            const result = interpreter.execute(astNode as BaseAstNode);

            expect((result as ArrayValueObject).getFirstCell().getValue()).toStrictEqual(-1);
        });

        it('Minus Minus Minus Minus sum', async () => {
            const lexerNode = lexer.treeBuilder('=----sum(A1:A2)');

            const astNode = astTreeBuilder.parse(lexerNode as LexerNode);

            const result = interpreter.execute(astNode as BaseAstNode);

            expect((result as BaseValueObject).getValue()).toStrictEqual(4);
        });

        it('Cross tab sum', async () => {
            const lexerNode = lexer.treeBuilder('=----sum(Tool!A1:A2)');

            const astNode = astTreeBuilder.parse(lexerNode as LexerNode);

            const result = interpreter.execute(astNode as BaseAstNode);

            expect((result as BaseValueObject).getValue()).toStrictEqual(4);
        });

        it('Reference column', async () => {
            const lexerNode = lexer.treeBuilder('=sum(A:A)');

            const astNode = astTreeBuilder.parse(lexerNode as LexerNode);

            const result = interpreter.execute(astNode as BaseAstNode);

            expect((result as BaseValueObject).getValue()).toStrictEqual(5);
        });

        it('Not exist formula', async () => {
            const lexerNode = lexer.treeBuilder('=notExistFormula(A:A)');

            const astNode = astTreeBuilder.parse(lexerNode as LexerNode);

            const result = interpreter.execute(astNode as BaseAstNode);

            expect((result as BaseValueObject).getValue()).toStrictEqual(ErrorType.NAME);
        });
    });
});

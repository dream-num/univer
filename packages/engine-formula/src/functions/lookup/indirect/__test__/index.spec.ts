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

import { ErrorType } from '../../../../basics/error-type';
import { Lexer } from '../../../../engine/analysis/lexer';
import type { LexerNode } from '../../../../engine/analysis/lexer-node';
import { AstTreeBuilder } from '../../../../engine/analysis/parser';
import type { BaseAstNode } from '../../../../engine/ast-node/base-ast-node';
import { Interpreter } from '../../../../engine/interpreter/interpreter';
import type { BaseReferenceObject } from '../../../../engine/reference-object/base-reference-object';
import type { ArrayValueObject } from '../../../../engine/value-object/array-value-object';
import { IFormulaCurrentConfigService } from '../../../../services/current-data.service';
import { IFunctionService } from '../../../../services/function.service';
import { IFormulaRuntimeService } from '../../../../services/runtime.service';
import { createFunctionTestBed } from '../../../__tests__/create-function-test-bed';
import { FUNCTION_NAMES_META } from '../../../meta/function-names';
import { Multiply } from '../../../meta/multiply';
import { FUNCTION_NAMES_LOOKUP } from '../../function-names';
import { Indirect } from '../index';

describe('Test indirect', () => {
    // const textFunction = new Makearray(FUNCTION_NAMES_LOGICAL.MAKEARRAY);
    let get: Injector['get'];
    let lexer: Lexer;
    let astTreeBuilder: AstTreeBuilder;
    let interpreter: Interpreter;

    beforeEach(() => {
        const testBed = createFunctionTestBed();

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

        functionService.registerExecutors(
            new Indirect(FUNCTION_NAMES_LOOKUP.INDIRECT),
            new Multiply(FUNCTION_NAMES_META.MULTIPLY)
        );
    });

    describe('normal', () => {
        it('string', async () => {
            const lexerNode = lexer.treeBuilder('=Indirect("B2")');

            const astNode = astTreeBuilder.parse(lexerNode as LexerNode);

            const result = await interpreter.executeAsync(astNode as BaseAstNode);

            expect((result as BaseReferenceObject).toArrayValueObject().toValue()).toStrictEqual([[4]]);
        });

        it('ref', async () => {
            const lexerNode = lexer.treeBuilder('=Indirect(C2)');

            const astNode = astTreeBuilder.parse(lexerNode as LexerNode);

            const result = await interpreter.executeAsync(astNode as BaseAstNode);

            expect((result as BaseReferenceObject).toArrayValueObject().toValue()).toStrictEqual([[4]]);
        });

        it('array', async () => {
            const lexerNode = lexer.treeBuilder('=Indirect(A1:D3)');

            const astNode = astTreeBuilder.parse(lexerNode as LexerNode);

            const result = await interpreter.executeAsync(astNode as BaseAstNode);

            expect((result as ArrayValueObject).toValue()).toStrictEqual([
                [ErrorType.VALUE, ErrorType.VALUE, ErrorType.VALUE, ErrorType.VALUE],
                [ErrorType.VALUE, ErrorType.VALUE, ErrorType.VALUE, ErrorType.VALUE],
                [ErrorType.VALUE, ErrorType.VALUE, ErrorType.VALUE, ErrorType.VALUE],
            ]);
        });
    });

    describe('r1c1', () => {
        it('r1c1 string', async () => {
            const lexerNode = lexer.treeBuilder('=Indirect("R2C2", 0)');

            const astNode = astTreeBuilder.parse(lexerNode as LexerNode);

            const result = await interpreter.executeAsync(astNode as BaseAstNode);

            expect((result as BaseReferenceObject).toArrayValueObject().toValue()).toStrictEqual([[4]]);
        });

        it('r1c1 ref', async () => {
            const lexerNode = lexer.treeBuilder('=Indirect(D2, 0)');

            const astNode = astTreeBuilder.parse(lexerNode as LexerNode);

            const result = await interpreter.executeAsync(astNode as BaseAstNode);

            expect((result as BaseReferenceObject).toArrayValueObject().toValue()).toStrictEqual([[4]]);
        });
    });
});

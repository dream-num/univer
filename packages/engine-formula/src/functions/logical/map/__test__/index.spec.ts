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
import type { LexerNode } from '../../../../engine/analysis/lexer-node';

import type { BaseAstNode } from '../../../../engine/ast-node/base-ast-node';
import { beforeEach, describe, expect, it } from 'vitest';
import { ErrorType } from '../../../../basics/error-type';
import { Lexer } from '../../../../engine/analysis/lexer';
import { AstTreeBuilder } from '../../../../engine/analysis/parser';
import { Interpreter } from '../../../../engine/interpreter/interpreter';
import { generateExecuteAstNodeData } from '../../../../engine/utils/ast-node-tool';
import { IFunctionService } from '../../../../services/function.service';
import { createFunctionTestBed, getObjectValue } from '../../../__tests__/create-function-test-bed';
import { FUNCTION_NAMES_META } from '../../../meta/function-names';
import { Multiply } from '../../../meta/multiply';
import { FUNCTION_NAMES_LOGICAL } from '../../function-names';
import { Lambda } from '../../lambda';
import { Map } from '../index';

describe('Test map', () => {
    // const testFunction = new Map(FUNCTION_NAMES_LOGICAL.MAP);
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

        functionService.registerExecutors(
            new Map(FUNCTION_NAMES_LOGICAL.MAP),
            new Lambda(FUNCTION_NAMES_LOGICAL.LAMBDA),
            new Multiply(FUNCTION_NAMES_META.MULTIPLY)
        );
    });

    describe('normal', () => {
        it('multiply', async () => {
            let lexerNode = lexer.treeBuilder('=MAP({1;2;3},LAMBDA(x,x*2))');
            let astNode = astTreeBuilder.parse(lexerNode as LexerNode);
            let result = await interpreter.executeAsync(generateExecuteAstNodeData(astNode as BaseAstNode));
            expect(getObjectValue(result)).toStrictEqual([
                [2],
                [4],
                [6],
            ]);

            lexerNode = lexer.treeBuilder('=MAP(1,LAMBDA(x,x*2))');
            astNode = astTreeBuilder.parse(lexerNode as LexerNode);
            result = await interpreter.executeAsync(generateExecuteAstNodeData(astNode as BaseAstNode));
            expect(getObjectValue(result)).toStrictEqual(2);

            lexerNode = lexer.treeBuilder('=MAP({1,2,3;4,5,6},LAMBDA(x,x*2))');
            astNode = astTreeBuilder.parse(lexerNode as LexerNode);
            result = await interpreter.executeAsync(generateExecuteAstNodeData(astNode as BaseAstNode));
            expect(getObjectValue(result)).toStrictEqual([
                [2, 4, 6],
                [8, 10, 12],
            ]);

            lexerNode = lexer.treeBuilder('=MAP({1,2,3;4,5,6},1,LAMBDA(x,y,x*y))');
            astNode = astTreeBuilder.parse(lexerNode as LexerNode);
            result = await interpreter.executeAsync(generateExecuteAstNodeData(astNode as BaseAstNode));
            expect(getObjectValue(result)).toStrictEqual([
                [1, ErrorType.NA, ErrorType.NA],
                [ErrorType.NA, ErrorType.NA, ErrorType.NA],
            ]);

            lexerNode = lexer.treeBuilder('=MAP({1,2,3;4,5,6},{1,2},LAMBDA(x,y,x*y))');
            astNode = astTreeBuilder.parse(lexerNode as LexerNode);
            result = await interpreter.executeAsync(generateExecuteAstNodeData(astNode as BaseAstNode));
            expect(getObjectValue(result)).toStrictEqual([
                [1, 4, ErrorType.NA],
                [ErrorType.NA, ErrorType.NA, ErrorType.NA],
            ]);
        });

        it('value is error', async () => {
            let lexerNode = lexer.treeBuilder('=MAP(#NAME?,LAMBDA(x,x*2))');
            let astNode = astTreeBuilder.parse(lexerNode as LexerNode);
            let result = await interpreter.executeAsync(generateExecuteAstNodeData(astNode as BaseAstNode));
            expect(getObjectValue(result)).toStrictEqual(ErrorType.NAME);

            lexerNode = lexer.treeBuilder('=MAP({1;2;3},#NAME?)');
            astNode = astTreeBuilder.parse(lexerNode as LexerNode);
            result = await interpreter.executeAsync(generateExecuteAstNodeData(astNode as BaseAstNode));
            expect(getObjectValue(result)).toStrictEqual(ErrorType.NAME);

            lexerNode = lexer.treeBuilder('=MAP({1;2;3},1)');
            astNode = astTreeBuilder.parse(lexerNode as LexerNode);
            result = await interpreter.executeAsync(generateExecuteAstNodeData(astNode as BaseAstNode));
            expect(getObjectValue(result)).toStrictEqual(ErrorType.VALUE);
        });
    });
});

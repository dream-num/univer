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
import type { ArrayValueObject } from '../../../../engine/value-object/array-value-object';
import type { BaseValueObject } from '../../../../engine/value-object/base-value-object';
import { beforeEach, describe, expect, it } from 'vitest';
import { Lexer } from '../../../../engine/analysis/lexer';
import { AstTreeBuilder } from '../../../../engine/analysis/parser';
import { Interpreter } from '../../../../engine/interpreter/interpreter';
import { generateExecuteAstNodeData } from '../../../../engine/utils/ast-node-tool';
import { IFunctionService } from '../../../../services/function.service';
import { createFunctionTestBed } from '../../../__tests__/create-function-test-bed';
import { FUNCTION_NAMES_META } from '../../../meta/function-names';
import { Multiply } from '../../../meta/multiply';
import { FUNCTION_NAMES_LOGICAL } from '../../function-names';
import { Lambda } from '../../lambda';
import { Makearray } from '../index';

describe('Test makearray', () => {
    // const testFunction = new Makearray(FUNCTION_NAMES_LOGICAL.MAKEARRAY);
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
            new Makearray(FUNCTION_NAMES_LOGICAL.MAKEARRAY),
            new Lambda(FUNCTION_NAMES_LOGICAL.LAMBDA),
            new Multiply(FUNCTION_NAMES_META.MULTIPLY)
        );
    });

    describe('normal', () => {
        it('multiply', async () => {
            const lexerNode = lexer.treeBuilder('=MAKEARRAY(4, 4,LAMBDA(x,y,x*y))');

            const astNode = astTreeBuilder.parse(lexerNode as LexerNode);

            const result = await interpreter.executeAsync(generateExecuteAstNodeData(astNode as BaseAstNode));

            expect((result as ArrayValueObject).toValue()).toStrictEqual([
                [1, 2, 3, 4],
                [2, 4, 6, 8],
                [3, 6, 9, 12],
                [4, 8, 12, 16],
            ]);
        });

        it('multiply lambda nest', async () => {
            const lexerNode = lexer.treeBuilder('=LAMBDA(x,y,LAMBDA(a,b,a*b)(x, y))(3,5)');

            const astNode = astTreeBuilder.parse(lexerNode as LexerNode);

            const result = await interpreter.executeAsync(generateExecuteAstNodeData(astNode as BaseAstNode));

            expect((result as BaseValueObject).getValue()).toStrictEqual(15);
        });

        it('multiply nest', async () => {
            const lexerNode = lexer.treeBuilder('=MAKEARRAY(4, 4,LAMBDA(x,y,LAMBDA(a,b,LAMBDA(i,j,i*j)(a, b))(x, y)))');

            const astNode = astTreeBuilder.parse(lexerNode as LexerNode);

            const result = await interpreter.executeAsync(generateExecuteAstNodeData(astNode as BaseAstNode));

            expect((result as ArrayValueObject).toValue()).toStrictEqual([
                [1, 2, 3, 4],
                [2, 4, 6, 8],
                [3, 6, 9, 12],
                [4, 8, 12, 16],
            ]);
        });
    });
});

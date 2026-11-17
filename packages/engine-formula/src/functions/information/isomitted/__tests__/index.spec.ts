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
import { beforeEach, describe, expect, it } from 'vitest';
import type { LexerNode } from '../../../../engine/analysis/lexer-node';
import type { BaseAstNode } from '../../../../engine/ast-node/base-ast-node';
import { createFunctionTestBed } from '../../../__tests__/create-function-test-bed';
import { ErrorType } from '../../../../basics/error-type';
import { Lexer } from '../../../../engine/analysis/lexer';
import { AstTreeBuilder } from '../../../../engine/analysis/parser';
import { Interpreter } from '../../../../engine/interpreter/interpreter';
import { generateExecuteAstNodeData } from '../../../../engine/utils/ast-node-tool';
import { IFunctionService } from '../../../../services/function.service';
import { FUNCTION_NAMES_LOGICAL } from '../../../logical/function-names';
import { If } from '../../../logical/if';
import { Lambda } from '../../../logical/lambda';
import { Map } from '../../../logical/map';
import { FUNCTION_NAMES_META } from '../../../meta/function-names';
import { Plus } from '../../../meta/plus';
import { getObjectValue } from '../../../util';
import { FUNCTION_NAMES_INFORMATION } from '../../function-names';
import { Isblank } from '../../isblank';
import { Isomitted } from '../index';

describe('Test isomitted function', () => {
    let get: Injector['get'];
    let lexer: Lexer;
    let astTreeBuilder: AstTreeBuilder;
    let interpreter: Interpreter;

    const calculate = async (formula: string) => {
        const lexerNode = lexer.treeBuilder(formula);
        const astNode = astTreeBuilder.parse(lexerNode as LexerNode);
        const result = await interpreter.executeAsync(generateExecuteAstNodeData(astNode as BaseAstNode));
        return getObjectValue(result);
    };

    beforeEach(() => {
        const testBed = createFunctionTestBed();
        get = testBed.get;

        lexer = get(Lexer);
        astTreeBuilder = get(AstTreeBuilder);
        interpreter = get(Interpreter);

        get(IFunctionService).registerExecutors(
            new Isomitted(FUNCTION_NAMES_INFORMATION.ISOMITTED),
            new Isblank(FUNCTION_NAMES_INFORMATION.ISBLANK),
            new Lambda(FUNCTION_NAMES_LOGICAL.LAMBDA),
            new If(FUNCTION_NAMES_LOGICAL.IF),
            new Map(FUNCTION_NAMES_LOGICAL.MAP),
            new Plus(FUNCTION_NAMES_META.PLUS)
        );
    });

    describe('Isomitted', () => {
        it('returns TRUE for a LAMBDA argument left empty', async () => {
            expect(await calculate('=LAMBDA(x,y,ISOMITTED(y))(1,)')).toBe(true);
            expect(await calculate('=LAMBDA(x,y,ISOMITTED(x))(,2)')).toBe(true);
        });

        it('returns FALSE for a LAMBDA argument that is supplied', async () => {
            expect(await calculate('=LAMBDA(x,y,ISOMITTED(y))(1,2)')).toBe(false);
            expect(await calculate('=LAMBDA(x,y,ISOMITTED(x))(1,)')).toBe(false);
            expect(await calculate('=LAMBDA(x,ISOMITTED(x))("")')).toBe(false);
        });

        it('returns FALSE for a blank cell, not only for an omitted argument', async () => {
            // C1 is blank in the test bed workbook.
            expect(await calculate('=LAMBDA(x,ISOMITTED(x))(C1)')).toBe(false);
            expect(await calculate('=MAP(A1:C1,LAMBDA(x,ISOMITTED(x)))')).toStrictEqual([[false, false, false]]);
        });

        it('matches the Microsoft documentation example', async () => {
            expect(await calculate('=LAMBDA(x,y,IF(ISOMITTED(y),"Missing second argument",x+y))(1,)')).toBe('Missing second argument');
            expect(await calculate('=LAMBDA(x,y,IF(ISOMITTED(y),"Missing second argument",x+y))(1,2)')).toBe(3);
        });

        it('passes an omitted argument through a nested LAMBDA call', async () => {
            expect(await calculate('=LAMBDA(a,b,LAMBDA(c,ISOMITTED(c))(b))(1,)')).toBe(true);
            expect(await calculate('=LAMBDA(a,b,LAMBDA(c,ISOMITTED(c))(a))(1,)')).toBe(false);
        });

        it('keeps blank semantics for an omitted argument used by other functions', async () => {
            expect(await calculate('=LAMBDA(x,y,ISBLANK(y))(1,)')).toBe(true);
            expect(await calculate('=LAMBDA(x,y,x+y)(1,)')).toBe(1);
        });

        it('returns FALSE outside LAMBDA', async () => {
            expect(await calculate('=ISOMITTED(1)')).toBe(false);
            expect(await calculate('=ISOMITTED(C1)')).toBe(false);
        });

        it('keeps the #VALUE! error for a wrong argument count', async () => {
            expect(await calculate('=LAMBDA(x,y,ISOMITTED(y))(1)')).toBe(ErrorType.VALUE);
        });
    });
});

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

import { describe, expect, it } from 'vitest';
import type { LexerNode } from '../../../../engine/analysis/lexer-node';
import type { BaseAstNode } from '../../../../engine/ast-node/base-ast-node';
import type { BaseValueObject } from '../../../../engine/value-object/base-value-object';
import type { LambdaValueObjectObject } from '../../../../engine/value-object/lambda-value-object';
import { createFunctionTestBed } from '../../../__tests__/create-function-test-bed';
import { Lexer } from '../../../../engine/analysis/lexer';
import { AstTreeBuilder } from '../../../../engine/analysis/parser';
import { Interpreter } from '../../../../engine/interpreter/interpreter';
import { generateExecuteAstNodeData } from '../../../../engine/utils/ast-node-tool';
import { NullValueObject, NumberValueObject } from '../../../../engine/value-object/primitive-object';
import { IFunctionService } from '../../../../services/function.service';
import { FUNCTION_NAMES_LOGICAL } from '../../../logical/function-names';
import { If } from '../../../logical/if';
import { Lambda } from '../../../logical/lambda';
import { FUNCTION_NAMES_META } from '../../../meta/function-names';
import { Plus } from '../../../meta/plus';
import { functionInformation } from '../../function-map';
import { FUNCTION_NAMES_INFORMATION } from '../../function-names';
import { Isomitted } from '../index';

describe('ISOMITTED formulas', () => {
    const bed = createFunctionTestBed();
    const service = bed.get(IFunctionService);
    service.registerExecutors(
        new Isomitted(FUNCTION_NAMES_INFORMATION.ISOMITTED),
        new Lambda(FUNCTION_NAMES_LOGICAL.LAMBDA),
        new If(FUNCTION_NAMES_LOGICAL.IF),
        new Plus(FUNCTION_NAMES_META.PLUS)
    );

    function calculate(formula: string) {
        const lexerNode = bed.get(Lexer).treeBuilder(formula) as LexerNode;
        const astNode = bed.get(AstTreeBuilder).parse(lexerNode) as BaseAstNode;
        return (bed.get(Interpreter).execute(generateExecuteAstNodeData(astNode)) as BaseValueObject).getValue();
    }

    it.each([
        ['=LAMBDA(x,ISOMITTED(x))(1)', false],
        ['=LAMBDA(x,ISOMITTED(x))("")', false],
        ['=LAMBDA(x,ISOMITTED(x))(FALSE)', false],
        ['=LAMBDA(x,y,ISOMITTED(x))(,2)', true],
        ['=LAMBDA(x,y,ISOMITTED(y))(1,)', true],
        ['=LAMBDA(x,y,LAMBDA(z,ISOMITTED(z))(x))(,2)', true],
        ['=LAMBDA(x,y,ISOMITTED((x)))(,2)', true],
        ['=LAMBDA(x,y,LAMBDA(z,ISOMITTED(z))((x)))(,2)', true],
        ['=LAMBDA(x,y,ISOMITTED((x)))(1,2)', false],
        ['=LAMBDA(x,LAMBDA(y,ISOMITTED(y))(x))(1)', false],
        ['=ISOMITTED(1)', false],
        ['=ISOMITTED("")', false],
        ['=ISOMITTED(A1)', false],
        ['=LAMBDA(x,ISOMITTED(x))(A1)', false],
        ['=LAMBDA(x,y,IF(ISOMITTED(y),x+1,x+y))(1,)', 2],
    ] as const)('%s returns %s', (formula, expected) => {
        expect(calculate(formula)).toBe(expected);
    });

    it('is registered in the information function map', () => {
        expect(functionInformation.some(([executor, name]) => executor === Isomitted && name === FUNCTION_NAMES_INFORMATION.ISOMITTED)).toBe(true);
    });

    it('does not inherit omission from a previous runtime invocation', () => {
        const lexerNode = bed.get(Lexer).treeBuilder('=LAMBDA(x,ISOMITTED(x))') as LexerNode;
        const astNode = bed.get(AstTreeBuilder).parse(lexerNode) as BaseAstNode;
        const lambda = bed.get(Interpreter).execute(generateExecuteAstNodeData(astNode)) as LambdaValueObjectObject;
        expect(lambda.execute(NullValueObject.create()).getValue()).toBe(false);
        expect(lambda.execute(NumberValueObject.create(1)).getValue()).toBe(false);
        expect(lambda.execute(NullValueObject.create()).getValue()).toBe(false);
    });

    it('does not treat a runtime value forwarded through a parameter as omitted', () => {
        const lexerNode = bed.get(Lexer).treeBuilder('=LAMBDA(x,y,LAMBDA(z,ISOMITTED(z))(x))') as LexerNode;
        const astNode = bed.get(AstTreeBuilder).parse(lexerNode) as BaseAstNode;
        const lambda = bed.get(Interpreter).execute(generateExecuteAstNodeData(astNode)) as LambdaValueObjectObject;
        expect(lambda.execute(NullValueObject.create(), NumberValueObject.create(2)).getValue()).toBe(false);
        expect(lambda.execute(NumberValueObject.create(1), NumberValueObject.create(2)).getValue()).toBe(false);
    });
});

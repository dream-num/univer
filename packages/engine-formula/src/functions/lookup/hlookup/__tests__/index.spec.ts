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

import { ErrorType } from '../../../../basics/error-type';
import { ArrayValueObject } from '../../../../engine/value-object/array-value-object';
import { NumberValueObject } from '../../../../engine/value-object/primitive-object';
import { FUNCTION_NAMES_LOOKUP } from '../../function-names';
import { Hlookup } from '../index';
import type { BaseValueObject } from '../../../../engine/value-object/base-value-object';

const arrayValueObject1 = ArrayValueObject.create(/*ts*/ `{
    1,2,3,4,5,6,7,8;
    "First","Second","Third","Fourth","Fifth","Sixth","Seventh","Eighth"
}`);

const arrayValueObject2 = ArrayValueObject.create(/*ts*/ `{
    4,5,6,7,8,1,2,3;
    "Fourth","Fifth","Sixth","Seventh","Eighth","First","Second","Third"
}`);

const matchArrayValueObject = ArrayValueObject.create(/*ts*/ `{
    1,2,8;
    3,6,7
}`);

describe('Test hlookup', () => {
    const testFunction = new Hlookup(FUNCTION_NAMES_LOOKUP.HLOOKUP);

    describe('Exact match', () => {
        it('Search two', async () => {
            const resultObject = testFunction.calculate(
                NumberValueObject.create(2),
                arrayValueObject1.clone(),
                NumberValueObject.create(2),
                NumberValueObject.create(0)
            ) as BaseValueObject;
            expect(resultObject.getValue().toString()).toBe('Second');
        });

        it('Search eight', async () => {
            const resultObject = testFunction.calculate(
                NumberValueObject.create(8),
                arrayValueObject1.clone(),
                NumberValueObject.create(2),
                NumberValueObject.create(0)
            ) as BaseValueObject;
            expect(resultObject.getValue().toString()).toBe('Eighth');
        });

        it('Exceeding columns', async () => {
            const resultObject = testFunction.calculate(
                NumberValueObject.create(8),
                arrayValueObject1.clone(),
                NumberValueObject.create(3),
                NumberValueObject.create(0)
            ) as BaseValueObject;
            expect(resultObject.getValue().toString()).toBe(ErrorType.REF);
        });

        it('Not match', async () => {
            const resultObject = testFunction.calculate(
                NumberValueObject.create(100),
                arrayValueObject1.clone(),
                NumberValueObject.create(2),
                NumberValueObject.create(0)
            ) as BaseValueObject;
            expect(resultObject.getValue().toString()).toBe(ErrorType.NA);
        });

        it('array', async () => {
            const resultObject = testFunction.calculate(
                matchArrayValueObject.clone(),
                arrayValueObject1.clone(),
                NumberValueObject.create(2),
                NumberValueObject.create(0)
            ) as BaseValueObject;
            expect((resultObject as ArrayValueObject).toValue()).toStrictEqual([
                ['First', 'Second', 'Eighth'],
                ['Third', 'Sixth', 'Seventh'],
            ]);
        });
    });

    describe('Approximate match', () => {
        it('Approximate search two', async () => {
            const resultObject = testFunction.calculate(
                NumberValueObject.create(2),
                arrayValueObject1.clone(),
                NumberValueObject.create(2),
                NumberValueObject.create(1)
            ) as BaseValueObject;
            expect(resultObject.getValue().toString()).toBe('Second');
        });

        it('Approximate search eight', async () => {
            const resultObject = testFunction.calculate(
                NumberValueObject.create(8),
                arrayValueObject1.clone(),
                NumberValueObject.create(2)
            ) as BaseValueObject;
            expect(resultObject.getValue().toString()).toBe('Eighth');
        });

        it('Approximate exceeding columns', async () => {
            const resultObject = testFunction.calculate(
                NumberValueObject.create(8),
                arrayValueObject1.clone(),
                NumberValueObject.create(3)
            ) as BaseValueObject;
            expect(resultObject.getValue().toString()).toBe(ErrorType.REF);
        });

        it('Approximate not match', async () => {
            const resultObject = testFunction.calculate(
                NumberValueObject.create(100),
                arrayValueObject1.clone(),
                NumberValueObject.create(2),
                NumberValueObject.create(1)
            ) as BaseValueObject;
            expect(resultObject.getValue().toString()).toBe('Eighth');
        });

        it('Approximate not order data', async () => {
            const resultObject = testFunction.calculate(
                NumberValueObject.create(2),
                arrayValueObject2.clone(),
                NumberValueObject.create(2),
                NumberValueObject.create(1)
            ) as BaseValueObject;
            expect(resultObject.getValue().toString()).toBe(ErrorType.NA);
        });

        it('Approximate not order data match', async () => {
            const resultObject = testFunction.calculate(
                NumberValueObject.create(8),
                arrayValueObject2.clone(),
                NumberValueObject.create(2)
            ) as BaseValueObject;
            expect(resultObject.getValue().toString()).toBe('Third');
        });
    });
    describe('Error', () => {
        it('TableArray is number', () => {
            const result = testFunction.calculate(
                NumberValueObject.create(1),
                NumberValueObject.create(1),
                NumberValueObject.create(1)
            );
            expect(result.getValue()).toBe(ErrorType.NA);
        });
    });
});

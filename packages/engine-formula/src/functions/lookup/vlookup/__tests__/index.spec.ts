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

/* eslint-disable no-magic-numbers */
import { describe, expect, it } from 'vitest';

import { ErrorType } from '../../../../basics/error-type';
import { ArrayValueObject } from '../../../../engine/value-object/array-value-object';
import type { BaseValueObject } from '../../../../engine/value-object/base-value-object';
import { NumberValueObject } from '../../../../engine/value-object/primitive-object';
import { FUNCTION_NAMES_LOOKUP } from '../../function-names';
import { Vlookup } from '..';

const arrayValueObject1 = new ArrayValueObject(/*ts*/ `{
    1, "First";
    2, "Second";
    3, "Third";
    4, "Fourth";
    5, "Fifth";
    6, "Sixth";
    7, "Seventh";
    8, "Eighth"
}`);

const arrayValueObject2 = new ArrayValueObject(/*ts*/ `{
        4, "Fourth";
        5, "Fifth";
        6, "Sixth";
        7, "Seventh";
        8, "Eighth";
        1, "First";
        2, "Second";
        3, "Third"
}`);

const matchArrayValueObject = new ArrayValueObject(/*ts*/ `{
    1, 3;
    4, 6;
    8, 7
}`);

describe('Test vlookup', () => {
    const textFunction = new Vlookup(FUNCTION_NAMES_LOOKUP.VLOOKUP);

    describe('Exact match', () => {
        it('Search two', async () => {
            const resultObject = textFunction.calculate(
                new NumberValueObject(2),
                arrayValueObject1,
                new NumberValueObject(2),
                new NumberValueObject(0)
            ) as BaseValueObject;
            expect(resultObject.getValue().toString()).toBe('Second');
        });

        it('Search eight', async () => {
            const resultObject = textFunction.calculate(
                new NumberValueObject(8),
                arrayValueObject1,
                new NumberValueObject(2),
                new NumberValueObject(0)
            ) as BaseValueObject;
            expect(resultObject.getValue().toString()).toBe('Eighth');
        });

        it('Exceeding columns', async () => {
            const resultObject = textFunction.calculate(
                new NumberValueObject(8),
                arrayValueObject1,
                new NumberValueObject(3),
                new NumberValueObject(0)
            ) as BaseValueObject;
            expect(resultObject.getValue().toString()).toBe(ErrorType.VALUE);
        });

        it('Not match', async () => {
            const resultObject = textFunction.calculate(
                new NumberValueObject(100),
                arrayValueObject1,
                new NumberValueObject(2),
                new NumberValueObject(0)
            ) as BaseValueObject;
            expect(resultObject.getValue().toString()).toBe(ErrorType.NA);
        });

        it('array', async () => {
            const resultObject = textFunction.calculate(
                matchArrayValueObject,
                arrayValueObject1,
                new NumberValueObject(2),
                new NumberValueObject(0)
            ) as BaseValueObject;
            expect((resultObject as ArrayValueObject).toValue()).toStrictEqual([
                ['First', 'Third'],
                ['Fourth', 'Sixth'],
                ['Eighth', 'Seventh'],
            ]);
        });
    });

    describe('Approximate match', () => {
        it('Approximate search two', async () => {
            const resultObject = textFunction.calculate(
                new NumberValueObject(2),
                arrayValueObject1,
                new NumberValueObject(2),
                new NumberValueObject(1)
            ) as BaseValueObject;
            expect(resultObject.getValue().toString()).toBe('Second');
        });

        it('Approximate search eight', async () => {
            const resultObject = textFunction.calculate(
                new NumberValueObject(8),
                arrayValueObject1,
                new NumberValueObject(2)
            ) as BaseValueObject;
            expect(resultObject.getValue().toString()).toBe('Eighth');
        });

        it('Approximate exceeding columns', async () => {
            const resultObject = textFunction.calculate(
                new NumberValueObject(8),
                arrayValueObject1,
                new NumberValueObject(3)
            ) as BaseValueObject;
            expect(resultObject.getValue().toString()).toBe(ErrorType.VALUE);
        });

        it('Approximate not match', async () => {
            const resultObject = textFunction.calculate(
                new NumberValueObject(100),
                arrayValueObject1,
                new NumberValueObject(2),
                new NumberValueObject(1)
            ) as BaseValueObject;
            expect(resultObject.getValue().toString()).toBe('Eighth');
        });

        it('Approximate not order data', async () => {
            const resultObject = textFunction.calculate(
                new NumberValueObject(2),
                arrayValueObject2,
                new NumberValueObject(2),
                new NumberValueObject(1)
            ) as BaseValueObject;
            expect(resultObject.getValue().toString()).toBe(ErrorType.NA);
        });

        it('Approximate not order data match', async () => {
            const resultObject = textFunction.calculate(
                new NumberValueObject(8),
                arrayValueObject2,
                new NumberValueObject(2)
            ) as BaseValueObject;
            expect(resultObject.getValue().toString()).toBe('Third');
        });
    });
});

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
import { type BaseValueObject, ErrorValueObject } from '../../../../engine/value-object/base-value-object';
import { NumberValueObject, StringValueObject } from '../../../../engine/value-object/primitive-object';
import { getObjectValue } from '../../../__tests__/create-function-test-bed';
import { FUNCTION_NAMES_LOOKUP } from '../../function-names';
import { Vlookup } from '../index';

const arrayValueObject1 = ArrayValueObject.create(/*ts*/ `{
    1, "First";
    2, "Second";
    3, "Third";
    4, "Fourth";
    5, "Fifth";
    6, "Sixth";
    7, "Seventh";
    8, "Eighth"
}`);

const arrayValueObject2 = ArrayValueObject.create(/*ts*/ `{
        4, "Fourth";
        5, "Fifth";
        6, "Sixth";
        7, "Seventh";
        8, "Eighth";
        1, "First";
        2, "Second";
        3, "Third"
}`);

const arrayValueObject3 = ArrayValueObject.create(/*ts*/ `{
    "First",1;
    "Second",2;
}`);

const matchArrayValueObject = ArrayValueObject.create(/*ts*/ `{
    1, 3;
    4, 6;
    8, 7
}`);

const matchArrayValueObject2 = ArrayValueObject.create(/*ts*/ `{
    1;
    4;
    8
}`);

const colIndexNumArrayValueObject = ArrayValueObject.create(/*ts*/ `{
    1, 2
}`);

const colIndexNumArrayValueObject2 = ArrayValueObject.create(/*ts*/ `{
    1, 2;
    3, 4
}`);

const colIndexNumArrayValueObject3 = ArrayValueObject.create(/*ts*/ `{
    2, 1
}`);

const rangeLookupArrayValueObject = ArrayValueObject.create(/*ts*/ `{
    0, 1, 0, 1
}`);

describe('Test vlookup', () => {
    const testFunction = new Vlookup(FUNCTION_NAMES_LOOKUP.VLOOKUP);

    describe('Exact match', () => {
        it('Search two', async () => {
            const resultObject = testFunction.calculate(
                NumberValueObject.create(2),
                arrayValueObject1.clone(),
                NumberValueObject.create(2),
                NumberValueObject.create(0)
            ) as BaseValueObject;
            expect(getObjectValue(resultObject)).toStrictEqual([['Second']]);
        });

        it('Search eight', async () => {
            const resultObject = testFunction.calculate(
                NumberValueObject.create(8),
                arrayValueObject1.clone(),
                NumberValueObject.create(2),
                NumberValueObject.create(0)
            ) as BaseValueObject;
            expect(getObjectValue(resultObject)).toStrictEqual([['Eighth']]);
        });

        it('Exceeding columns', async () => {
            const resultObject = testFunction.calculate(
                NumberValueObject.create(8),
                arrayValueObject1.clone(),
                NumberValueObject.create(3),
                NumberValueObject.create(0)
            ) as BaseValueObject;
            expect(getObjectValue(resultObject)).toStrictEqual([[ErrorType.REF]]);
        });

        it('Not match', async () => {
            const resultObject = testFunction.calculate(
                NumberValueObject.create(100),
                arrayValueObject1.clone(),
                NumberValueObject.create(2),
                NumberValueObject.create(0)
            ) as BaseValueObject;
            expect(getObjectValue(resultObject)).toStrictEqual([[ErrorType.NA]]);
        });

        it('LookupValue is array, colIndexNum is single cell', async () => {
            const resultObject = testFunction.calculate(
                matchArrayValueObject.clone(),
                arrayValueObject1.clone(),
                NumberValueObject.create(2),
                NumberValueObject.create(0)
            ) as BaseValueObject;
            expect(getObjectValue(resultObject)).toStrictEqual([
                ['First', 'Third'],
                ['Fourth', 'Sixth'],
                ['Eighth', 'Seventh'],
            ]);
        });

        it('LookupValue is single cell, colIndexNum is array', async () => {
            const resultObject = testFunction.calculate(
                NumberValueObject.create(2),
                arrayValueObject1.clone(),
                colIndexNumArrayValueObject.clone(),
                NumberValueObject.create(0)
            ) as BaseValueObject;
            expect(getObjectValue(resultObject)).toStrictEqual([
                [2, 'Second'],
            ]);
        });

        it('LookupValue is single cell, colIndexNum is array and gets colIndexNum error', async () => {
            const resultObject = testFunction.calculate(
                NumberValueObject.create(2),
                arrayValueObject1.clone(),
                colIndexNumArrayValueObject2.clone(),
                NumberValueObject.create(0)
            ) as BaseValueObject;
            expect(getObjectValue(resultObject)).toStrictEqual(ErrorType.REF);
        });

        it('LookupValue is single cell, colIndexNum is array and gets lookupValue error', async () => {
            const resultObject = testFunction.calculate(
                StringValueObject.create('lookupValue'),
                arrayValueObject1.clone(),
                ArrayValueObject.create(/*ts*/ `{
                    3, 4;
                }`),
                NumberValueObject.create(0)
            ) as BaseValueObject;
            expect(getObjectValue(resultObject)).toStrictEqual(ErrorType.REF); // Excel reports #N/A
        });

        it('LookupValue is single cell, colIndexNum is array and gets rangeLookup error', async () => {
            const resultObject = testFunction.calculate(
                StringValueObject.create('lookupValue'),
                arrayValueObject1.clone(),
                colIndexNumArrayValueObject2.clone(),
                StringValueObject.create('rangeLookup')
            ) as BaseValueObject;
            expect(getObjectValue(resultObject)).toStrictEqual(ErrorType.VALUE);
        });

        it('LookupValue is array, colIndexNum is array', async () => {
            const resultObject = testFunction.calculate(
                matchArrayValueObject.clone(),
                arrayValueObject1.clone(),
                colIndexNumArrayValueObject.clone(),
                NumberValueObject.create(0)
            ) as BaseValueObject;
            expect(getObjectValue(resultObject)).toStrictEqual([
                [1, 3],
                [4, 6],
                [8, 7],
            ]);
        });

        it('LookupValue is array and gets error, colIndexNum is array and gets error', async () => {
            const resultObject = testFunction.calculate(
                ArrayValueObject.create(/*ts*/ `{
                    "Univer";
                    2
                }`),
                arrayValueObject1.clone(),
                ArrayValueObject.create(/*ts*/ `{
                    3, 1
                }`)
            ) as BaseValueObject;
            expect(getObjectValue(resultObject)).toStrictEqual([
                [ErrorType.REF],
                [ErrorType.REF],
            ]); // Excel reports [[ErrorType.NA], [ErrorType.REF]]
        });

        it('LookupValue is array and gets error, colIndexNum is array and gets error,rangeLookup gets error', async () => {
            const resultObject = testFunction.calculate(
                ArrayValueObject.create(/*ts*/ `{
                    "Univer";
                    2
                }`),
                arrayValueObject1.clone(),
                ArrayValueObject.create(/*ts*/ `{
                    3, 1
                }`),
                StringValueObject.create('rangeLookup')
            ) as BaseValueObject;
            expect(getObjectValue(resultObject)).toStrictEqual([
                [ErrorType.VALUE],
                [ErrorType.VALUE],
            ]);
        });

        it('LookupValue is array, tableArray is error', async () => {
            const resultObject = testFunction.calculate(
                ArrayValueObject.create(/*ts*/ `{
                    "Univer";
                    2
                }`),
                ErrorValueObject.create(ErrorType.NAME),
                NumberValueObject.create(2)
            ) as BaseValueObject;
            expect(getObjectValue(resultObject)).toStrictEqual(ErrorType.NAME); // Excel reports [[ErrorType.NA], [ErrorType.NA]]
        });

        it('LookupValue is array, colIndexNum is array, rangeLookup is array', async () => {
            const resultObject = testFunction.calculate(
                matchArrayValueObject2.clone(),
                arrayValueObject1.clone(),
                colIndexNumArrayValueObject3.clone(),
                rangeLookupArrayValueObject.clone()
            ) as BaseValueObject;
            expect(getObjectValue(resultObject)).toStrictEqual([
                ['First', 'First', 'First', 'First'],
                ['Fourth', 'Fourth', 'Fourth', 'Fourth'],
                ['Eighth', 'Eighth', 'Eighth', 'Eighth'],
            ]);
        });

        it('LookupValue is string, case sensitive', async () => {
            const resultObject = testFunction.calculate(
                StringValueObject.create('second'),
                arrayValueObject3.clone(),
                NumberValueObject.create(2),
                NumberValueObject.create(0)
            ) as BaseValueObject;
            expect(getObjectValue(resultObject)).toStrictEqual([
                [2],
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
            expect(getObjectValue(resultObject)).toStrictEqual([
                ['Second'],
            ]);
        });

        it('Approximate search eight', async () => {
            const resultObject = testFunction.calculate(
                NumberValueObject.create(8),
                arrayValueObject1.clone(),
                NumberValueObject.create(2)
            ) as BaseValueObject;
            expect(getObjectValue(resultObject)).toStrictEqual([
                ['Eighth'],
            ]);
        });

        it('Approximate exceeding columns', async () => {
            const resultObject = testFunction.calculate(
                NumberValueObject.create(8),
                arrayValueObject1.clone(),
                NumberValueObject.create(3)
            ) as BaseValueObject;
            expect(getObjectValue(resultObject)).toStrictEqual([
                [ErrorType.REF],
            ]);
        });

        it('Approximate not match', async () => {
            const resultObject = testFunction.calculate(
                NumberValueObject.create(100),
                arrayValueObject1.clone(),
                NumberValueObject.create(2),
                NumberValueObject.create(1)
            ) as BaseValueObject;
            expect(getObjectValue(resultObject)).toStrictEqual([
                ['Eighth'],
            ]);
        });

        it('Approximate not order data', async () => {
            const resultObject = testFunction.calculate(
                NumberValueObject.create(2),
                arrayValueObject2.clone(),
                NumberValueObject.create(2),
                NumberValueObject.create(1)
            ) as BaseValueObject;
            expect(getObjectValue(resultObject)).toStrictEqual([
                [ErrorType.NA],
            ]);
        });

        it('Approximate not order data match', async () => {
            const resultObject = testFunction.calculate(
                NumberValueObject.create(8),
                arrayValueObject2.clone(),
                NumberValueObject.create(2)
            ) as BaseValueObject;
            expect(getObjectValue(resultObject)).toStrictEqual([
                ['Third'],
            ]);
        });

        it('Approximate order data match', async () => {
            let resultObject = testFunction.calculate(
                NumberValueObject.create(100),
                ArrayValueObject.create(/*ts*/ `{
                    -1;
                    0;
                    2
            }`),
                NumberValueObject.create(1)
            ) as BaseValueObject;
            expect(getObjectValue(resultObject)).toStrictEqual([
                [2],
            ]);

            resultObject = testFunction.calculate(
                NumberValueObject.create(3),
                ArrayValueObject.create(/*ts*/ `{
                    -1;
                    0;
                    2
            }`),
                NumberValueObject.create(1)
            ) as BaseValueObject;
            expect(getObjectValue(resultObject)).toStrictEqual([
                [2],
            ]);
        });
    });
});

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
import { FUNCTION_NAMES_STATISTICAL } from '../../function-names';
import { Minifs } from '../index';
import { ArrayValueObject, transformToValue } from '../../../../engine/value-object/array-value-object';
import { NumberValueObject, StringValueObject } from '../../../../engine/value-object/primitive-object';

describe('Test minifs function', () => {
    const testFunction = new Minifs(FUNCTION_NAMES_STATISTICAL.MINIFS);

    describe('Minifs', () => {
        it('Range and criteria', async () => {
            const minRange = ArrayValueObject.create(`{
                1;
                2;
                3
            }`);
            const range = ArrayValueObject.create(`{
                2;
                3;
                4
            }`);

            const criteria = StringValueObject.create('>2');
            const resultObject = testFunction.calculate(minRange, range, criteria);
            expect(transformToValue(resultObject.getArrayValue())).toStrictEqual([[2]]);
        });

        it('Range and criteria, compare string', async () => {
            const minRange = ArrayValueObject.create(`{
                1;
                2;
                3
            }`);
            const range = ArrayValueObject.create(`{
                a;
                b;
                c
            }`);

            const criteria = StringValueObject.create('>2');
            const resultObject = testFunction.calculate(minRange, range, criteria);
            expect(transformToValue(resultObject.getArrayValue())).toStrictEqual([[0]]);
        });

        it('Range and array criteria', async () => {
            const minRange = ArrayValueObject.create(`{
                1;
                2;
                3
            }`);

            const range = ArrayValueObject.create(`{
                2;
                3;
                4
            }`);

            const criteria = ArrayValueObject.create(`{
                >2;
                >3;
                >4
            }`);

            const resultObject = testFunction.calculate(minRange, range, criteria);
            expect(transformToValue(resultObject.getArrayValue())).toStrictEqual([[2], [3], [0]]);
        });

        it('2 ranges and criteria', async () => {
            const minRange = ArrayValueObject.create(`{
                1;
                2;
                3
            }`);

            const range1 = ArrayValueObject.create(`{
                2;
                3;
                4
            }`);

            const criteria1 = StringValueObject.create('>2');

            const range2 = ArrayValueObject.create(`{
                3;
                4;
                5
            }`);

            const criteria2 = StringValueObject.create('<5');

            const resultObject = testFunction.calculate(minRange, range1, criteria1, range2, criteria2);
            expect(transformToValue(resultObject.getArrayValue())).toStrictEqual([[2]]);
        });

        it('2 ranges and criteria, 1 array criteria', async () => {
            const minRange = ArrayValueObject.create(`{
                1;
                2;
                3
            }`);

            const range1 = ArrayValueObject.create(`{
                2;
                3;
                4
            }`);

            const criteria1 = ArrayValueObject.create(`{
                >2;
                >3;
                >4
            }`);

            const range2 = ArrayValueObject.create(`{
                3;
                4;
                5
            }`);

            const criteria2 = NumberValueObject.create(5);

            const resultObject = testFunction.calculate(minRange, range1, criteria1, range2, criteria2);
            expect(transformToValue(resultObject.getArrayValue())).toStrictEqual([[3], [3], [0]]);
        });

        it('2 ranges and criteria, 2 array criteria', async () => {
            const minRange = ArrayValueObject.create(`{
                1;
                2;
                3
            }`);

            const range1 = ArrayValueObject.create(`{
                2;
                3;
                4
            }`);

            const criteria1 = ArrayValueObject.create(`{
                >2;
                >3;
                >4
            }`);

            const range2 = ArrayValueObject.create(`{
                3;
                4;
                5
            }`);

            const criteria2 = ArrayValueObject.create(`{
                4;
                4;
                4;
                4
            }`);

            const resultObject = testFunction.calculate(minRange, range1, criteria1, range2, criteria2);
            expect(transformToValue(resultObject.getArrayValue())).toStrictEqual([[2], [0], [0], [0]]);
        });
    });
});

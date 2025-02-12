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
import { ArrayValueObject, transformToValue } from '../../../../engine/value-object/array-value-object';
import { NumberValueObject, StringValueObject } from '../../../../engine/value-object/primitive-object';
import { FUNCTION_NAMES_STATISTICAL } from '../../function-names';
import { Countifs } from '../index';

describe('Test countifs function', () => {
    const testFunction = new Countifs(FUNCTION_NAMES_STATISTICAL.COUNTIFS);

    describe('Countifs', () => {
        it('Array criteria with number and string', async () => {
            const range1 = ArrayValueObject.create(`{
                2;
                3;
                4;
                test1;
                test12
            }`);

            const criteria1 = ArrayValueObject.create(`{
                >2;
                >3;
                >4;
                test*
            }`);

            const resultObject = testFunction.calculate(range1, criteria1);
            expect(transformToValue(resultObject.getArrayValue())).toStrictEqual([[2], [1], [0], [2]]);
        });

        it('Range and criteria, compare string', async () => {
            const range = ArrayValueObject.create(`{
                a;
                b;
                c
            }`);

            const criteria = StringValueObject.create('>2');
            const resultObject = testFunction.calculate(range, criteria);
            expect(transformToValue(resultObject.getArrayValue())).toStrictEqual([[0]]);
        });

        it('Different ranges, error reporting', async () => {
            const range1 = ArrayValueObject.create(`{
                1;
                2;
                3
            }`);

            const criteria1 = StringValueObject.create('>2');

            const rang2 = ArrayValueObject.create(`{
                2;
                3;
                4;
                5
            }`);

            const criteria2 = StringValueObject.create('>3');
            const resultObject = testFunction.calculate(range1, criteria1, rang2, criteria2);
            expect(transformToValue(resultObject.getArrayValue())).toStrictEqual([[ErrorType.VALUE]]);
        });

        it('Range and criteria, count number', async () => {
            const range = ArrayValueObject.create(`{
                2;
                3;
                4;
                Univer
            }`);

            const criteria = StringValueObject.create('>2');
            const resultObject = testFunction.calculate(range, criteria);
            expect(transformToValue(resultObject.getArrayValue())).toStrictEqual([[2]]);
        });

        it('Range and array criteria', async () => {
            const range = ArrayValueObject.create(`{
                2;
                3;
                4
            }`);

            const criteria = ArrayValueObject.create(`{
                >2;
                >3;
                >4;
                >5
            }`);

            const resultObject = testFunction.calculate(range, criteria);
            expect(transformToValue(resultObject.getArrayValue())).toStrictEqual([[2], [1], [0], [0]]);
        });

        it('2 ranges and criteria', async () => {
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

            const resultObject = testFunction.calculate(range1, criteria1, range2, criteria2);
            expect(transformToValue(resultObject.getArrayValue())).toStrictEqual([[1]]);
        });

        it('2 ranges and criteria, 1 array criteria with number', async () => {
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

            const resultObject = testFunction.calculate(range1, criteria1, range2, criteria2);
            expect(transformToValue(resultObject.getArrayValue())).toStrictEqual([[1], [1], [0]]);
        });

        it('2 ranges and criteria, 1 array criteria with string', async () => {
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
                test1;
                test12;
                Univer123
            }`);

            const criteria2 = StringValueObject.create('test*');

            const resultObject = testFunction.calculate(range1, criteria1, range2, criteria2);
            expect(transformToValue(resultObject.getArrayValue())).toStrictEqual([[1], [0], [0]]);
        });

        it('2 ranges and criteria, 2 array criteria', async () => {
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

            const resultObject = testFunction.calculate(range1, criteria1, range2, criteria2);
            expect(transformToValue(resultObject.getArrayValue())).toStrictEqual([[1], [0], [0], [0]]);
        });

        it('2 ranges and criteria, 2 array criteria, compare string', async () => {
            const range1 = ArrayValueObject.create(`{
                1;
                2;
                3;
                4;
                5;
                6
            }`);

            const criteria1 = StringValueObject.create('<5');

            const range2 = ArrayValueObject.create(`{
                40664;
                40665;
                40666;
                40667;
                40668;
                40669
            }`);

            const criteria2 = StringValueObject.create('<5/3/2011');

            const resultObject = testFunction.calculate(range1, criteria1, range2, criteria2);
            expect(transformToValue(resultObject.getArrayValue())).toStrictEqual([[2]]);
        });
    });
});

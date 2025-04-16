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
import { Averageifs } from '../index';
import { ArrayValueObject, transformToValue } from '../../../../engine/value-object/array-value-object';
import { NumberValueObject, StringValueObject } from '../../../../engine/value-object/primitive-object';
import { ErrorType } from '../../../../basics/error-type';

describe('Test averageifs function', () => {
    const testFunction = new Averageifs(FUNCTION_NAMES_STATISTICAL.AVERAGEIFS);

    describe('Averageifs', () => {
        it('Range and criteria', async () => {
            const averageRange = ArrayValueObject.create(`{
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
            const resultObject = testFunction.calculate(averageRange, range, criteria);
            expect(transformToValue(resultObject.getArrayValue())).toStrictEqual([[2.5]]);
        });

        it('Range and criteria, compare string', async () => {
            const averageRange = ArrayValueObject.create(`{
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
            const resultObject = testFunction.calculate(averageRange, range, criteria);
            expect(transformToValue(resultObject.getArrayValue())).toStrictEqual([[ErrorType.DIV_BY_ZERO]]);
        });

        it('Range and array criteria', async () => {
            const averageRange = ArrayValueObject.create(`{
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

            const resultObject = testFunction.calculate(averageRange, range, criteria);
            expect(transformToValue(resultObject.getArrayValue())).toStrictEqual([[2.5], [3], [ErrorType.DIV_BY_ZERO]]);
        });

        it('2 ranges and criteria', async () => {
            const averageRange = ArrayValueObject.create(`{
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

            const resultObject = testFunction.calculate(averageRange, range1, criteria1, range2, criteria2);
            expect(transformToValue(resultObject.getArrayValue())).toStrictEqual([[2]]);
        });

        it('2 ranges and criteria, 1 array criteria', async () => {
            const averageRange = ArrayValueObject.create(`{
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

            const resultObject = testFunction.calculate(averageRange, range1, criteria1, range2, criteria2);
            expect(transformToValue(resultObject.getArrayValue())).toStrictEqual([[3], [3], [ErrorType.DIV_BY_ZERO]]);
        });

        it('2 ranges and criteria, 2 array criteria', async () => {
            const averageRange = ArrayValueObject.create(`{
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

            const resultObject = testFunction.calculate(averageRange, range1, criteria1, range2, criteria2);
            expect(transformToValue(resultObject.getArrayValue())).toStrictEqual([[2], [ErrorType.DIV_BY_ZERO], [ErrorType.DIV_BY_ZERO], [ErrorType.DIV_BY_ZERO]]);
        });
    });
});

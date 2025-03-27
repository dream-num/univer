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
import { ArrayValueObject, transformToValueObject } from '../../../../engine/value-object/array-value-object';
import { ErrorValueObject } from '../../../../engine/value-object/base-value-object';
import { BooleanValueObject, NullValueObject, NumberValueObject, StringValueObject } from '../../../../engine/value-object/primitive-object';
import { getObjectValue } from '../../../__tests__/create-function-test-bed';
import { FUNCTION_NAMES_STATISTICAL } from '../../function-names';
import { BinomDist } from '../index';

describe('Test binomDist function', () => {
    const testFunction = new BinomDist(FUNCTION_NAMES_STATISTICAL.BINOM_DIST);

    describe('BinomDist', () => {
        it('Value is normal', () => {
            const numberS = NumberValueObject.create(6);
            const trials = NumberValueObject.create(10);
            const probabilityS = NumberValueObject.create(0.5);
            const cumulative = BooleanValueObject.create(true);
            const result = testFunction.calculate(numberS, trials, probabilityS, cumulative);
            expect(getObjectValue(result)).toBe(0.828125);
        });

        it('NumberS and trials value test', () => {
            const numberS = NumberValueObject.create(-6);
            const trials = NumberValueObject.create(10);
            const probabilityS = NumberValueObject.create(0.5);
            const cumulative = BooleanValueObject.create(true);
            const result = testFunction.calculate(numberS, trials, probabilityS, cumulative);
            expect(getObjectValue(result)).toBe(ErrorType.NUM);

            const numberS2 = NumberValueObject.create(11);
            const trials2 = NumberValueObject.create(10);
            const result2 = testFunction.calculate(numberS2, trials2, probabilityS, cumulative);
            expect(getObjectValue(result2)).toBe(ErrorType.NUM);
        });

        it('ProbabilityS value test', () => {
            const numberS = NumberValueObject.create(6);
            const trials = NumberValueObject.create(10);
            const probabilityS = NumberValueObject.create(-0.5);
            const cumulative = BooleanValueObject.create(true);
            const result = testFunction.calculate(numberS, trials, probabilityS, cumulative);
            expect(getObjectValue(result)).toBe(ErrorType.NUM);

            const probabilityS2 = NumberValueObject.create(1.5);
            const result2 = testFunction.calculate(numberS, trials, probabilityS2, cumulative);
            expect(getObjectValue(result2)).toBe(ErrorType.NUM);
        });

        it('Cumulative value test', () => {
            const numberS = NumberValueObject.create(6);
            const trials = NumberValueObject.create(10);
            const probabilityS = NumberValueObject.create(0.5);
            const cumulative = BooleanValueObject.create(false);
            const result = testFunction.calculate(numberS, trials, probabilityS, cumulative);
            expect(getObjectValue(result)).toBe(0.205078125);

            const numberS2 = NumberValueObject.create(0);
            const trials2 = NumberValueObject.create(0);
            const probabilityS2 = NumberValueObject.create(0);
            const result2 = testFunction.calculate(numberS2, trials2, probabilityS2, cumulative);
            expect(getObjectValue(result2)).toBe(1);

            const numberS3 = NumberValueObject.create(1);
            const trials3 = NumberValueObject.create(1);
            const result3 = testFunction.calculate(numberS3, trials3, probabilityS2, cumulative);
            expect(getObjectValue(result3)).toBe(0);
        });

        it('Value is normal string', () => {
            const numberS = StringValueObject.create('test');
            const trials = NumberValueObject.create(10);
            const probabilityS = NumberValueObject.create(0.5);
            const cumulative = BooleanValueObject.create(true);
            const result = testFunction.calculate(numberS, trials, probabilityS, cumulative);
            expect(getObjectValue(result)).toBe(ErrorType.VALUE);
        });

        it('Value is boolean', () => {
            const numberS = BooleanValueObject.create(true);
            const trials = NumberValueObject.create(10);
            const probabilityS = NumberValueObject.create(0.5);
            const cumulative = BooleanValueObject.create(true);
            const result = testFunction.calculate(numberS, trials, probabilityS, cumulative);
            expect(getObjectValue(result)).toBe(0.0107421875);
        });

        it('Value is null', () => {
            const numberS = NullValueObject.create();
            const trials = NumberValueObject.create(10);
            const probabilityS = NumberValueObject.create(0.5);
            const cumulative = BooleanValueObject.create(true);
            const result = testFunction.calculate(numberS, trials, probabilityS, cumulative);
            expect(getObjectValue(result)).toBe(0.0009765625);
        });

        it('Value is error', () => {
            const numberS = ErrorValueObject.create(ErrorType.NAME);
            const trials = NumberValueObject.create(10);
            const probabilityS = NumberValueObject.create(0.5);
            const cumulative = BooleanValueObject.create(true);
            const result = testFunction.calculate(numberS, trials, probabilityS, cumulative);
            expect(getObjectValue(result)).toBe(ErrorType.NAME);

            const numberS2 = NumberValueObject.create(6);
            const trials2 = ErrorValueObject.create(ErrorType.NAME);
            const result2 = testFunction.calculate(numberS2, trials2, probabilityS, cumulative);
            expect(getObjectValue(result2)).toBe(ErrorType.NAME);

            const probabilityS2 = ErrorValueObject.create(ErrorType.NAME);
            const result3 = testFunction.calculate(numberS2, trials, probabilityS2, cumulative);
            expect(getObjectValue(result3)).toBe(ErrorType.NAME);

            const cumulative2 = ErrorValueObject.create(ErrorType.NAME);
            const result4 = testFunction.calculate(numberS2, trials, probabilityS, cumulative2);
            expect(getObjectValue(result4)).toBe(ErrorType.NAME);
        });

        it('Value is array', () => {
            const numberS = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [1, ' ', 1.23, true, false, null],
                    [0, '100', '2.34', 'test', -3, null],
                ]),
                rowCount: 2,
                columnCount: 6,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const trials = NumberValueObject.create(10);
            const probabilityS = NumberValueObject.create(0.5);
            const cumulative = BooleanValueObject.create(true);
            const result = testFunction.calculate(numberS, trials, probabilityS, cumulative);
            expect(getObjectValue(result)).toStrictEqual([
                [0.0107421875, ErrorType.VALUE, 0.0107421875, 0.0107421875, 0.0009765625, 0.0009765625],
                [0.0009765625, ErrorType.NUM, 0.0546875, ErrorType.VALUE, ErrorType.NUM, 0.0009765625],
            ]);
        });
    });
});

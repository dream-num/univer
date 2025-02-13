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
import { BinomInv } from '../index';

describe('Test binomInv function', () => {
    const testFunction = new BinomInv(FUNCTION_NAMES_STATISTICAL.BINOM_INV);

    describe('BinomInv', () => {
        it('Value is normal', () => {
            const trials = NumberValueObject.create(6);
            const probabilityS = NumberValueObject.create(0.5);
            const alpha = NumberValueObject.create(0.75);
            const result = testFunction.calculate(trials, probabilityS, alpha);
            expect(getObjectValue(result)).toBe(4);
        });

        it('Trials value test', () => {
            const trials = NumberValueObject.create(-6);
            const probabilityS = NumberValueObject.create(0.5);
            const alpha = NumberValueObject.create(0.75);
            const result = testFunction.calculate(trials, probabilityS, alpha);
            expect(getObjectValue(result)).toBe(ErrorType.NUM);
        });

        it('ProbabilityS value test', () => {
            const trials = NumberValueObject.create(6);
            const probabilityS = NumberValueObject.create(-0.5);
            const alpha = NumberValueObject.create(0.75);
            const result = testFunction.calculate(trials, probabilityS, alpha);
            expect(getObjectValue(result)).toBe(ErrorType.NUM);

            const probabilityS2 = NumberValueObject.create(1.5);
            const result2 = testFunction.calculate(trials, probabilityS2, alpha);
            expect(getObjectValue(result2)).toBe(ErrorType.NUM);
        });

        it('Value is normal string', () => {
            const trials = StringValueObject.create('test');
            const probabilityS = NumberValueObject.create(0.5);
            const alpha = NumberValueObject.create(0.75);
            const result = testFunction.calculate(trials, probabilityS, alpha);
            expect(getObjectValue(result)).toBe(ErrorType.VALUE);
        });

        it('Value is boolean', () => {
            const trials = BooleanValueObject.create(true);
            const probabilityS = NumberValueObject.create(0.5);
            const alpha = NumberValueObject.create(0.75);
            const result = testFunction.calculate(trials, probabilityS, alpha);
            expect(getObjectValue(result)).toBe(1);
        });

        it('Value is null', () => {
            const trials = NullValueObject.create();
            const probabilityS = NumberValueObject.create(0.5);
            const alpha = NumberValueObject.create(0.75);
            const result = testFunction.calculate(trials, probabilityS, alpha);
            expect(getObjectValue(result)).toBe(0);
        });

        it('Value is error', () => {
            const trials = ErrorValueObject.create(ErrorType.NAME);
            const probabilityS = NumberValueObject.create(0.5);
            const alpha = NumberValueObject.create(0.75);
            const result = testFunction.calculate(trials, probabilityS, alpha);
            expect(getObjectValue(result)).toBe(ErrorType.NAME);

            const trials2 = NumberValueObject.create(6);
            const probabilityS2 = ErrorValueObject.create(ErrorType.NAME);
            const result2 = testFunction.calculate(trials2, probabilityS2, alpha);
            expect(getObjectValue(result2)).toBe(ErrorType.NAME);

            const alpha2 = ErrorValueObject.create(ErrorType.NAME);
            const result3 = testFunction.calculate(trials2, probabilityS, alpha2);
            expect(getObjectValue(result3)).toBe(ErrorType.NAME);
        });

        it('Value is array', () => {
            const trials = ArrayValueObject.create({
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
            const probabilityS = NumberValueObject.create(0.5);
            const alpha = NumberValueObject.create(0.75);
            const result = testFunction.calculate(trials, probabilityS, alpha);
            expect(getObjectValue(result)).toStrictEqual([
                [1, ErrorType.VALUE, 1, 1, 0, 0],
                [0, 53, 1, ErrorType.VALUE, ErrorType.NUM, 0],
            ]);
        });
    });
});

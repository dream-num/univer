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
import { NormInv } from '../index';

describe('Test normInv function', () => {
    const testFunction = new NormInv(FUNCTION_NAMES_STATISTICAL.NORM_INV);

    describe('NormInv', () => {
        it('Value is normal', () => {
            const probability = NumberValueObject.create(0.2069);
            const mean = NumberValueObject.create(6);
            const standardDev = NumberValueObject.create(4);
            const result = testFunction.calculate(probability, mean, standardDev);
            expect(getObjectValue(result)).toBe(2.7311009929896484);
        });

        it('StandardDev value test', () => {
            const probability = NumberValueObject.create(0.2069);
            const mean = NumberValueObject.create(6);
            const standardDev = NumberValueObject.create(0);
            const result = testFunction.calculate(probability, mean, standardDev);
            expect(getObjectValue(result)).toBe(ErrorType.NUM);
        });

        it('Value is normal string', () => {
            const probability = StringValueObject.create('test');
            const mean = NumberValueObject.create(6);
            const standardDev = NumberValueObject.create(4);
            const result = testFunction.calculate(probability, mean, standardDev);
            expect(getObjectValue(result)).toBe(ErrorType.VALUE);
        });

        it('Value is boolean', () => {
            const probability = BooleanValueObject.create(true);
            const mean = NumberValueObject.create(6);
            const standardDev = NumberValueObject.create(4);
            const result = testFunction.calculate(probability, mean, standardDev);
            expect(getObjectValue(result)).toBe(ErrorType.NUM);
        });

        it('Value is null', () => {
            const probability = NullValueObject.create();
            const mean = NumberValueObject.create(6);
            const standardDev = NumberValueObject.create(4);
            const result = testFunction.calculate(probability, mean, standardDev);
            expect(getObjectValue(result)).toBe(ErrorType.NUM);
        });

        it('Value is error', () => {
            const probability = ErrorValueObject.create(ErrorType.NAME);
            const mean = NumberValueObject.create(6);
            const standardDev = NumberValueObject.create(4);
            const result = testFunction.calculate(probability, mean, standardDev);
            expect(getObjectValue(result)).toBe(ErrorType.NAME);

            const probability2 = NumberValueObject.create(0.2069);
            const mean2 = ErrorValueObject.create(ErrorType.NAME);
            const result2 = testFunction.calculate(probability2, mean2, standardDev);
            expect(getObjectValue(result2)).toBe(ErrorType.NAME);

            const standardDev2 = ErrorValueObject.create(ErrorType.NAME);
            const result3 = testFunction.calculate(probability2, mean, standardDev2);
            expect(getObjectValue(result3)).toBe(ErrorType.NAME);
        });

        it('Value is array', () => {
            const probability = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [1, ' ', 1.23, true, false, null],
                    [0, '100', '2.34', 'test', -3, ErrorType.NAME],
                ]),
                rowCount: 2,
                columnCount: 6,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const mean = NumberValueObject.create(6);
            const standardDev = NumberValueObject.create(4);
            const result = testFunction.calculate(probability, mean, standardDev);
            expect(getObjectValue(result)).toStrictEqual([
                [ErrorType.NUM, ErrorType.VALUE, ErrorType.NUM, ErrorType.NUM, ErrorType.NUM, ErrorType.NUM],
                [ErrorType.NUM, ErrorType.NUM, ErrorType.NUM, ErrorType.VALUE, ErrorType.NUM, ErrorType.NAME],
            ]);
        });
    });
});

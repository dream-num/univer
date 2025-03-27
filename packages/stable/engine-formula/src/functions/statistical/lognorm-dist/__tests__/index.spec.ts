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
import { LognormDist } from '../index';

describe('Test lognormDist function', () => {
    const testFunction = new LognormDist(FUNCTION_NAMES_STATISTICAL.LOGNORM_DIST);

    describe('LognormDist', () => {
        it('Value is normal', () => {
            const x = NumberValueObject.create(15.2069);
            const mean = NumberValueObject.create(6);
            const standardDev = NumberValueObject.create(4);
            const cumulative = BooleanValueObject.create(true);
            const result = testFunction.calculate(x, mean, standardDev, cumulative);
            expect(getObjectValue(result)).toBe(0.20623272748031884);
        });

        it('StandardDev value test', () => {
            const x = NumberValueObject.create(15.2069);
            const mean = NumberValueObject.create(6);
            const standardDev = NumberValueObject.create(0);
            const cumulative = BooleanValueObject.create(true);
            const result = testFunction.calculate(x, mean, standardDev, cumulative);
            expect(getObjectValue(result)).toBe(ErrorType.NUM);
        });

        it('Cumulative value test', () => {
            const x = NumberValueObject.create(15.2069);
            const mean = NumberValueObject.create(6);
            const standardDev = NumberValueObject.create(4);
            const cumulative = BooleanValueObject.create(false);
            const result = testFunction.calculate(x, mean, standardDev, cumulative);
            expect(getObjectValue(result)).toBe(0.004687651063329815);
        });

        it('Value is normal string', () => {
            const x = StringValueObject.create('test');
            const mean = NumberValueObject.create(6);
            const standardDev = NumberValueObject.create(4);
            const cumulative = BooleanValueObject.create(true);
            const result = testFunction.calculate(x, mean, standardDev, cumulative);
            expect(getObjectValue(result)).toBe(ErrorType.VALUE);
        });

        it('Value is boolean', () => {
            const x = BooleanValueObject.create(true);
            const mean = NumberValueObject.create(6);
            const standardDev = NumberValueObject.create(4);
            const cumulative = BooleanValueObject.create(true);
            const result = testFunction.calculate(x, mean, standardDev, cumulative);
            expect(getObjectValue(result)).toBe(0.06680720126885809);
        });

        it('Value is null', () => {
            const x = NullValueObject.create();
            const mean = NumberValueObject.create(6);
            const standardDev = NumberValueObject.create(4);
            const cumulative = BooleanValueObject.create(true);
            const result = testFunction.calculate(x, mean, standardDev, cumulative);
            expect(getObjectValue(result)).toBe(ErrorType.NUM);
        });

        it('Value is error', () => {
            const x = ErrorValueObject.create(ErrorType.NAME);
            const mean = NumberValueObject.create(6);
            const standardDev = NumberValueObject.create(4);
            const cumulative = BooleanValueObject.create(true);
            const result = testFunction.calculate(x, mean, standardDev, cumulative);
            expect(getObjectValue(result)).toBe(ErrorType.NAME);

            const x2 = NumberValueObject.create(15.2069);
            const mean2 = ErrorValueObject.create(ErrorType.NAME);
            const result2 = testFunction.calculate(x2, mean2, standardDev, cumulative);
            expect(getObjectValue(result2)).toBe(ErrorType.NAME);

            const standardDev2 = ErrorValueObject.create(ErrorType.NAME);
            const result3 = testFunction.calculate(x2, mean, standardDev2, cumulative);
            expect(getObjectValue(result3)).toBe(ErrorType.NAME);

            const cumulative2 = ErrorValueObject.create(ErrorType.NAME);
            const result4 = testFunction.calculate(x2, mean, standardDev, cumulative2);
            expect(getObjectValue(result4)).toBe(ErrorType.NAME);
        });

        it('Value is array', () => {
            const x = ArrayValueObject.create({
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
            const cumulative = BooleanValueObject.create(true);
            const result = testFunction.calculate(x, mean, standardDev, cumulative);
            expect(getObjectValue(result)).toStrictEqual([
                [0.06680720126885809, ErrorType.VALUE, 0.07377406798431951, 0.06680720126885809, ErrorType.NUM, ErrorType.NUM],
                [ErrorType.NUM, 0.3636544740101908, 0.09896660651880768, ErrorType.VALUE, ErrorType.NUM, ErrorType.NAME],
            ]);
        });
    });
});

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
import { ConfidenceT } from '../index';

describe('Test confidenceT function', () => {
    const testFunction = new ConfidenceT(FUNCTION_NAMES_STATISTICAL.CONFIDENCE_T);

    describe('ConfidenceT', () => {
        it('Value is normal', () => {
            const alpha = NumberValueObject.create(0.05);
            const standardDev = NumberValueObject.create(2.5);
            const size = NumberValueObject.create(50);
            const result = testFunction.calculate(alpha, standardDev, size);
            expect(getObjectValue(result)).toBe(0.7104921378216537);
        });

        it('Alpha value test', () => {
            const alpha = NumberValueObject.create(-0.05);
            const standardDev = NumberValueObject.create(2.5);
            const size = NumberValueObject.create(50);
            const result = testFunction.calculate(alpha, standardDev, size);
            expect(getObjectValue(result)).toBe(ErrorType.NUM);

            const alpha2 = NumberValueObject.create(1.05);
            const result2 = testFunction.calculate(alpha2, standardDev, size);
            expect(getObjectValue(result2)).toBe(ErrorType.NUM);
        });

        it('StandardDev value test', () => {
            const alpha = NumberValueObject.create(0.05);
            const standardDev = NumberValueObject.create(-2.5);
            const size = NumberValueObject.create(50);
            const result = testFunction.calculate(alpha, standardDev, size);
            expect(getObjectValue(result)).toBe(ErrorType.NUM);
        });

        it('Size Value test', () => {
            const alpha = NumberValueObject.create(0.05);
            const standardDev = NumberValueObject.create(2.5);
            const size = NumberValueObject.create(0.9);
            const result = testFunction.calculate(alpha, standardDev, size);
            expect(getObjectValue(result)).toBe(ErrorType.NUM);

            const size2 = NumberValueObject.create(1);
            const result2 = testFunction.calculate(alpha, standardDev, size2);
            expect(getObjectValue(result2)).toBe(ErrorType.DIV_BY_ZERO);
        });

        it('Value is normal string', () => {
            const alpha = StringValueObject.create('test');
            const standardDev = NumberValueObject.create(2.5);
            const size = NumberValueObject.create(50);
            const result = testFunction.calculate(alpha, standardDev, size);
            expect(getObjectValue(result)).toBe(ErrorType.VALUE);
        });

        it('Value is boolean', () => {
            const alpha = BooleanValueObject.create(true);
            const standardDev = NumberValueObject.create(2.5);
            const size = NumberValueObject.create(50);
            const result = testFunction.calculate(alpha, standardDev, size);
            expect(getObjectValue(result)).toBe(ErrorType.NUM);
        });

        it('Value is null', () => {
            const alpha = NullValueObject.create();
            const standardDev = NumberValueObject.create(2.5);
            const size = NumberValueObject.create(50);
            const result = testFunction.calculate(alpha, standardDev, size);
            expect(getObjectValue(result)).toBe(ErrorType.NUM);
        });

        it('Value is error', () => {
            const alpha = ErrorValueObject.create(ErrorType.NAME);
            const standardDev = NumberValueObject.create(2.5);
            const size = NumberValueObject.create(50);
            const result = testFunction.calculate(alpha, standardDev, size);
            expect(getObjectValue(result)).toBe(ErrorType.NAME);

            const alpha2 = NumberValueObject.create(0.05);
            const standardDev2 = ErrorValueObject.create(ErrorType.NAME);
            const result2 = testFunction.calculate(alpha2, standardDev2, size);
            expect(getObjectValue(result2)).toBe(ErrorType.NAME);

            const size2 = ErrorValueObject.create(ErrorType.NAME);
            const result3 = testFunction.calculate(alpha2, standardDev, size2);
            expect(getObjectValue(result3)).toBe(ErrorType.NAME);
        });

        it('Value is array', () => {
            const alpha = ArrayValueObject.create({
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
            const standardDev = NumberValueObject.create(2.5);
            const size = NumberValueObject.create(50);
            const result = testFunction.calculate(alpha, standardDev, size);
            expect(getObjectValue(result)).toStrictEqual([
                [ErrorType.NUM, ErrorType.VALUE, ErrorType.NUM, ErrorType.NUM, ErrorType.NUM, ErrorType.NUM],
                [ErrorType.NUM, ErrorType.NUM, ErrorType.NUM, ErrorType.VALUE, ErrorType.NUM, ErrorType.NUM],
            ]);
        });
    });
});

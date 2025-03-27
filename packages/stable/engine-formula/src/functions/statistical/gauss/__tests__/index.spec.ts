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
import { Gauss } from '../index';

describe('Test gauss function', () => {
    const testFunction = new Gauss(FUNCTION_NAMES_STATISTICAL.GAUSS);

    describe('Gauss', () => {
        it('Value is normal', () => {
            const z = NumberValueObject.create(2.5);
            const result = testFunction.calculate(z);
            expect(getObjectValue(result)).toStrictEqual(0.49379033467422384);
        });

        it('Value is 0 or negative integers', () => {
            const z = NumberValueObject.create(0);
            const result = testFunction.calculate(z);
            expect(getObjectValue(result)).toStrictEqual(0);

            const z2 = NumberValueObject.create(-1);
            const result2 = testFunction.calculate(z2);
            expect(getObjectValue(result2)).toStrictEqual(-0.3413447460685429);
        });

        it('Value is number string', () => {
            const z = StringValueObject.create('4');
            const result = testFunction.calculate(z);
            expect(getObjectValue(result)).toStrictEqual(0.4999683287581669);
        });

        it('Value is normal string', () => {
            const z = StringValueObject.create('test');
            const result = testFunction.calculate(z);
            expect(getObjectValue(result)).toStrictEqual(ErrorType.VALUE);
        });

        it('Value is boolean', () => {
            const z = BooleanValueObject.create(true);
            const result = testFunction.calculate(z);
            expect(getObjectValue(result)).toStrictEqual(0.3413447460685429);
        });

        it('Value is null', () => {
            const z = NullValueObject.create();
            const result = testFunction.calculate(z);
            expect(getObjectValue(result)).toStrictEqual(0);
        });

        it('Value is error', () => {
            const z = ErrorValueObject.create(ErrorType.NAME);
            const result = testFunction.calculate(z);
            expect(getObjectValue(result)).toStrictEqual(ErrorType.NAME);
        });

        it('Value is array', () => {
            const z = ArrayValueObject.create({
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
            const result = testFunction.calculate(z);
            expect(getObjectValue(result)).toStrictEqual([
                [0.3413447460685429, ErrorType.VALUE, 0.39065144757430814, 0.3413447460685429, 0, 0],
                [0, 0.5, 0.4903581300546417, ErrorType.VALUE, -0.4986501019683699, ErrorType.NAME],
            ]);

            const z2 = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [0.123],
                ]),
                rowCount: 1,
                columnCount: 1,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const result2 = testFunction.calculate(z2);
            expect(getObjectValue(result2)).toStrictEqual(0.04894645101643691);
        });
    });
});

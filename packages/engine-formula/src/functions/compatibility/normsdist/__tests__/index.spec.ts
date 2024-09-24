/**
 * Copyright 2023-present DreamNum Inc.
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
import { FUNCTION_NAMES_COMPATIBILITY } from '../../function-names';
import { Normsdist } from '../index';

describe('Test normsdist function', () => {
    const testFunction = new Normsdist(FUNCTION_NAMES_COMPATIBILITY.NORMSDIST);

    describe('Normsdist', () => {
        it('Value is normal', () => {
            const z = NumberValueObject.create(1.2069);
            const result = testFunction.calculate(z);
            expect(getObjectValue(result)).toBe(0.8862646711511419);
        });

        it('Value is normal string', () => {
            const z = StringValueObject.create('test');
            const result = testFunction.calculate(z);
            expect(getObjectValue(result)).toBe(ErrorType.VALUE);
        });

        it('Value is boolean', () => {
            const z = BooleanValueObject.create(true);
            const result = testFunction.calculate(z);
            expect(getObjectValue(result)).toBe(0.8413447460685429);
        });

        it('Value is null', () => {
            const z = NullValueObject.create();
            const result = testFunction.calculate(z);
            expect(getObjectValue(result)).toBe(0.5);
        });

        it('Value is error', () => {
            const z = ErrorValueObject.create(ErrorType.NAME);
            const result = testFunction.calculate(z);
            expect(getObjectValue(result)).toBe(ErrorType.NAME);
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
                [0.8413447460685429, ErrorType.VALUE, 0.8906514475743081, 0.8413447460685429, 0.5, 0.5],
                [0.5, 1, 0.9903581300546417, ErrorType.VALUE, 0.0013498980316301035, ErrorType.NAME],
            ]);

            const z2 = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [1],
                ]),
                rowCount: 1,
                columnCount: 1,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const result2 = testFunction.calculate(z2);
            expect(getObjectValue(result2)).toStrictEqual(0.8413447460685429);
        });
    });
});

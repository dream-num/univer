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
import { FUNCTION_NAMES_MATH } from '../../function-names';
import { Sequence } from '../index';

describe('Test sequence function', () => {
    const testFunction = new Sequence(FUNCTION_NAMES_MATH.SEQUENCE);

    describe('Sequence', () => {
        it('Value is normal number', () => {
            const rows = NumberValueObject.create(4);
            const columns = NumberValueObject.create(5);
            const start = NumberValueObject.create(2);
            const step = NumberValueObject.create(2);
            const result = testFunction.calculate(rows, columns, start, step);
            expect(getObjectValue(result)).toStrictEqual([
                [2, 4, 6, 8, 10],
                [12, 14, 16, 18, 20],
                [22, 24, 26, 28, 30],
                [32, 34, 36, 38, 40],
            ]);
        });

        it('Value is number negative', () => {
            const rows = NumberValueObject.create(-1);
            const columns = NumberValueObject.create(5);
            const start = NumberValueObject.create(2);
            const step = NumberValueObject.create(2);
            const result = testFunction.calculate(rows, columns, start, step);
            expect(getObjectValue(result)).toStrictEqual(ErrorType.VALUE);
        });

        it('Value is number string', () => {
            const rows = StringValueObject.create('1.5');
            const columns = NumberValueObject.create(5);
            const start = NumberValueObject.create(2);
            const step = NumberValueObject.create(2);
            const result = testFunction.calculate(rows, columns, start, step);
            expect(getObjectValue(result)).toStrictEqual([
                [2, 4, 6, 8, 10],
            ]);
        });

        it('Value is normal string', () => {
            const rows = StringValueObject.create('test');
            const columns = NumberValueObject.create(5);
            const start = NumberValueObject.create(2);
            const step = NumberValueObject.create(2);
            const result = testFunction.calculate(rows, columns, start, step);
            expect(getObjectValue(result)).toStrictEqual(ErrorType.VALUE);
        });

        it('Value is boolean', () => {
            const rows = BooleanValueObject.create(true);
            const columns = NumberValueObject.create(5);
            const start = NumberValueObject.create(2);
            const step = NumberValueObject.create(2);
            const result = testFunction.calculate(rows, columns, start, step);
            expect(getObjectValue(result)).toStrictEqual([
                [2, 4, 6, 8, 10],
            ]);
        });

        it('Value is blank cell', () => {
            const rows = NumberValueObject.create(4);
            const columns = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [null],
                ]),
                rowCount: 1,
                columnCount: 1,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const start = NumberValueObject.create(2);
            const step = NumberValueObject.create(2);
            const result = testFunction.calculate(rows, columns, start, step);
            expect(getObjectValue(result)).toStrictEqual(ErrorType.CALC);
        });

        it('Value is null', () => {
            const rows = NullValueObject.create();
            const columns = NullValueObject.create();
            const start = NullValueObject.create();
            const step = NullValueObject.create();
            const result = testFunction.calculate(rows, columns, start, step);
            expect(getObjectValue(result)).toStrictEqual([
                [1],
            ]);
        });

        it('Value is error', () => {
            const rows = ErrorValueObject.create(ErrorType.NAME);
            const columns = NumberValueObject.create(5);
            const start = NumberValueObject.create(2);
            const step = NumberValueObject.create(2);
            const result = testFunction.calculate(rows, columns, start, step);
            expect(getObjectValue(result)).toStrictEqual(ErrorType.NAME);

            const rows2 = NumberValueObject.create(4);
            const columns2 = ErrorValueObject.create(ErrorType.NAME);
            const result2 = testFunction.calculate(rows2, columns2, start, step);
            expect(getObjectValue(result2)).toStrictEqual(ErrorType.NAME);

            const start2 = ErrorValueObject.create(ErrorType.NAME);
            const result3 = testFunction.calculate(rows2, columns, start2, step);
            expect(getObjectValue(result3)).toStrictEqual(ErrorType.NAME);

            const step2 = ErrorValueObject.create(ErrorType.NAME);
            const result4 = testFunction.calculate(rows2, columns, start, step2);
            expect(getObjectValue(result4)).toStrictEqual(ErrorType.NAME);
        });

        it('Value is array', () => {
            const rows = ArrayValueObject.create({
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
            const columns = NumberValueObject.create(5);
            const start = NumberValueObject.create(2);
            const step = NumberValueObject.create(2);
            const result = testFunction.calculate(rows, columns, start, step);
            expect(getObjectValue(result)).toStrictEqual([
                [2, ErrorType.VALUE, 2, 2, ErrorType.CALC, ErrorType.CALC],
                [ErrorType.CALC, 2, 2, ErrorType.VALUE, ErrorType.VALUE, ErrorType.NAME],
            ]);
        });
    });
});

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
import { getObjectValue } from '../../../util';
import { FUNCTION_NAMES_MATH } from '../../function-names';
import { Degrees } from '../index';

describe('Test degrees function', () => {
    const testFunction = new Degrees(FUNCTION_NAMES_MATH.DEGREES);

    describe('Degrees', () => {
        it('Value is normal number', () => {
            const angle = NumberValueObject.create(1);
            const result = testFunction.calculate(angle);
            expect(getObjectValue(result, true)).toBe(57.2957795131);
        });

        it('Value is number valid', () => {
            const angle = NumberValueObject.create(-2);
            const result = testFunction.calculate(angle);
            expect(getObjectValue(result, true)).toBe(-114.591559026165);
        });

        it('Value is number string', () => {
            const angle = StringValueObject.create('1.5');
            const result = testFunction.calculate(angle);
            expect(getObjectValue(result, true)).toBe(85.9436692696);
        });

        it('Value is normal string', () => {
            const angle = StringValueObject.create('test');
            const result = testFunction.calculate(angle);
            expect(getObjectValue(result)).toBe(ErrorType.VALUE);
        });

        it('Value is boolean', () => {
            const angle = BooleanValueObject.create(false);
            const result = testFunction.calculate(angle);
            expect(getObjectValue(result)).toBe(0);
        });
        it('Value is blank cell', () => {
            const angle = NullValueObject.create();
            const result = testFunction.calculate(angle);
            expect(getObjectValue(result)).toBe(0);
        });
        it('Value is error', () => {
            const angle = ErrorValueObject.create(ErrorType.NAME);
            const result = testFunction.calculate(angle);
            expect(getObjectValue(result)).toBe(ErrorType.NAME);
        });

        it('Value is array', () => {
            const angle = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [2.15, ' ', 5, -1.575, true, 'test'],
                    [1, true, null, '2', false, -1],
                ]),
                rowCount: 2,
                columnCount: 6,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const result = testFunction.calculate(angle);
            expect(getObjectValue(result, true)).toStrictEqual([
                [123.185925953127, ErrorType.VALUE, 286.478897565412, -90.2408527331, 57.2957795131, ErrorType.VALUE],
                [57.2957795131, 57.2957795131, 0, 114.591559026165, 0, -57.2957795131],
            ]);
        });
    });
});

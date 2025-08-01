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
import { Log } from '../index';

describe('Test log function', () => {
    const testFunction = new Log(FUNCTION_NAMES_MATH.LOG);

    describe('Log', () => {
        it('Value is normal number', () => {
            const number = NumberValueObject.create(8);
            const base = NumberValueObject.create(2);
            const result = testFunction.calculate(number, base);
            expect(getObjectValue(result)).toBe(3);
        });

        it('Value is number valid', () => {
            const number = NumberValueObject.create(-2);
            const result = testFunction.calculate(number);
            expect(getObjectValue(result)).toBe(ErrorType.NUM);
        });

        it('Value is number string', () => {
            const number = StringValueObject.create('1.5');
            const result = testFunction.calculate(number);
            expect(getObjectValue(result, true)).toBe(0.176091259056);
        });

        it('Value is normal string', () => {
            const number = StringValueObject.create('test');
            const result = testFunction.calculate(number);
            expect(getObjectValue(result)).toBe(ErrorType.VALUE);
        });

        it('Value is boolean', () => {
            const number = BooleanValueObject.create(true);
            const base = BooleanValueObject.create(true);
            const result = testFunction.calculate(number, base);
            expect(getObjectValue(result)).toBe(ErrorType.DIV_BY_ZERO);
        });
        it('Value is blank cell', () => {
            const number = NullValueObject.create();
            const result = testFunction.calculate(number);
            expect(getObjectValue(result)).toBe(ErrorType.NUM);
        });
        it('Value is error', () => {
            const number = ErrorValueObject.create(ErrorType.NAME);
            const result = testFunction.calculate(number);
            expect(getObjectValue(result)).toBe(ErrorType.NAME);
        });

        it('Value is array', () => {
            const number = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [2.15, ' ', -1.575, true, 'test', 1.98, -50.55, 5],
                ]),
                rowCount: 1,
                columnCount: 8,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const base = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [1, true, 2, false, -1, 2.5, -3, -2, null],
                ]),
                rowCount: 1,
                columnCount: 9,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const result = testFunction.calculate(number, base);
            expect(getObjectValue(result, true)).toStrictEqual([
                [ErrorType.DIV_BY_ZERO, ErrorType.VALUE, ErrorType.NUM, ErrorType.NUM, ErrorType.VALUE, 0.745502296317, ErrorType.NUM, ErrorType.NUM, ErrorType.NA],
            ]);
        });
    });
});

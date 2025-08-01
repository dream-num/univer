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
import { Radians } from '../index';

describe('Test radians function', () => {
    const testFunction = new Radians(FUNCTION_NAMES_MATH.RADIANS);

    describe('Radians', () => {
        it('Value is normal number', () => {
            const angle = NumberValueObject.create(270);
            const result = testFunction.calculate(angle);
            expect(getObjectValue(result, true)).toBe(4.71238898038);
        });

        it('Value is number valid', () => {
            const angle = NumberValueObject.create(-2);
            const result = testFunction.calculate(angle);
            expect(getObjectValue(result, true)).toBe(-0.0349065850399);
        });

        it('Value is number string', () => {
            const angle = StringValueObject.create('1.5');
            const result = testFunction.calculate(angle);
            expect(getObjectValue(result, true)).toBe(0.0261799387799);
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
                [0.0375245789179, ErrorType.VALUE, 0.0872664625997, -0.0274889357189, 0.0174532925199, ErrorType.VALUE],
                [0.0174532925199, 0.0174532925199, 0, 0.0349065850399, 0, -0.0174532925199],
            ]);
        });
    });
});

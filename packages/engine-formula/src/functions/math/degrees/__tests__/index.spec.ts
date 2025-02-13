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

import { FUNCTION_NAMES_MATH } from '../../function-names';
import { Degrees } from '../index';
import { BooleanValueObject, NullValueObject, NumberValueObject, StringValueObject } from '../../../../engine/value-object/primitive-object';
import { ArrayValueObject, transformToValue, transformToValueObject } from '../../../../engine/value-object/array-value-object';
import { ErrorType } from '../../../../basics/error-type';
import { ErrorValueObject } from '../../../../engine/value-object/base-value-object';

describe('Test degrees function', () => {
    const testFunction = new Degrees(FUNCTION_NAMES_MATH.DEGREES);

    describe('Degrees', () => {
        it('Value is normal number', () => {
            const angle = NumberValueObject.create(1);
            const result = testFunction.calculate(angle);
            expect(result.getValue()).toBe(57.29577951308232);
        });

        it('Value is number valid', () => {
            const angle = NumberValueObject.create(-2);
            const result = testFunction.calculate(angle);
            expect(result.getValue()).toBe(-114.59155902616465);
        });

        it('Value is number string', () => {
            const angle = StringValueObject.create('1.5');
            const result = testFunction.calculate(angle);
            expect(result.getValue()).toBe(85.94366926962348);
        });

        it('Value is normal string', () => {
            const angle = StringValueObject.create('test');
            const result = testFunction.calculate(angle);
            expect(result.getValue()).toBe(ErrorType.VALUE);
        });

        it('Value is boolean', () => {
            const angle = BooleanValueObject.create(false);
            const result = testFunction.calculate(angle);
            expect(result.getValue()).toBe(0);
        });
        it('Value is blank cell', () => {
            const angle = NullValueObject.create();
            const result = testFunction.calculate(angle);
            expect(result.getValue()).toBe(0);
        });
        it('Value is error', () => {
            const angle = ErrorValueObject.create(ErrorType.NAME);
            const result = testFunction.calculate(angle);
            expect(result.getValue()).toBe(ErrorType.NAME);
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
            expect(transformToValue(result.getArrayValue())).toStrictEqual([
                [123.18592595312698, ErrorType.VALUE, 286.4788975654116, -90.24085273310466, 57.29577951308232, ErrorType.VALUE],
                [57.29577951308232, 57.29577951308232, 0, 114.59155902616465, 0, -57.29577951308232],
            ]);
        });
    });
});

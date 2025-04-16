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

import { FUNCTION_NAMES_ENGINEERING } from '../../function-names';
import { Erf } from '../index';
import { BooleanValueObject, NullValueObject, NumberValueObject, StringValueObject } from '../../../../engine/value-object/primitive-object';
import { ArrayValueObject, transformToValueObject } from '../../../../engine/value-object/array-value-object';
import { ErrorType } from '../../../../basics/error-type';
import { ErrorValueObject } from '../../../../engine/value-object/base-value-object';

describe('Test erf function', () => {
    const testFunction = new Erf(FUNCTION_NAMES_ENGINEERING.ERF);

    describe('Erf', () => {
        it('Value is normal number', () => {
            const lowerLimit = NumberValueObject.create(1);
            const result = testFunction.calculate(lowerLimit);
            expect(result.getValue()).toBe(0.8427007929497149);

            const upperLimit = NumberValueObject.create(4);
            const result2 = testFunction.calculate(lowerLimit, upperLimit);
            expect(result2.getValue()).toBe(0.1572991916330272);
        });

        it('Value is number string', () => {
            const lowerLimit = StringValueObject.create('1.5');
            const result = testFunction.calculate(lowerLimit);
            expect(result.getValue()).toBe(0.9661051464753108);
        });

        it('Value is negative number', () => {
            const lowerLimit = NumberValueObject.create(-2);
            const result = testFunction.calculate(lowerLimit);
            expect(result.getValue()).toBe(-0.9953222650189527);
        });

        it('Value is normal string', () => {
            const lowerLimit = StringValueObject.create('test');
            const result = testFunction.calculate(lowerLimit);
            expect(result.getValue()).toBe(ErrorType.VALUE);

            const lowerLimit2 = NumberValueObject.create(1);
            const upperLimit2 = StringValueObject.create('test');
            const result2 = testFunction.calculate(lowerLimit2, upperLimit2);
            expect(result2.getValue()).toBe(ErrorType.VALUE);
        });

        it('Value is boolean', () => {
            const lowerLimit = BooleanValueObject.create(true);
            const result = testFunction.calculate(lowerLimit);
            expect(result.getValue()).toBe(ErrorType.VALUE);
        });

        it('Value is blank cell', () => {
            const lowerLimit = NullValueObject.create();
            const result = testFunction.calculate(lowerLimit);
            expect(result.getValue()).toBe(0);
        });

        it('Value is error', () => {
            const lowerLimit = ErrorValueObject.create(ErrorType.NAME);
            const result = testFunction.calculate(lowerLimit);
            expect(result.getValue()).toBe(ErrorType.NAME);

            const lowerLimit2 = NumberValueObject.create(1);
            const upperLimit2 = ErrorValueObject.create(ErrorType.NAME);
            const result2 = testFunction.calculate(lowerLimit2, upperLimit2);
            expect(result2.getValue()).toBe(ErrorType.NAME);
        });

        it('Value is array', () => {
            const lowerLimit = ArrayValueObject.create({
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
            const result = testFunction.calculate(lowerLimit);
            expect(result.getValue()).toStrictEqual(ErrorType.VALUE);
        });
    });
});

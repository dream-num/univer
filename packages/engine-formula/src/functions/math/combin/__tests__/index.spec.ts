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
import { FUNCTION_NAMES_MATH } from '../../function-names';
import { Combin } from '../index';

describe('Test combin function', () => {
    const testFunction = new Combin(FUNCTION_NAMES_MATH.COMBIN);

    describe('Combin', () => {
        it('Value is normal number', () => {
            const number = NumberValueObject.create(8);
            const numberChosen = NumberValueObject.create(2);
            const result = testFunction.calculate(number, numberChosen);
            expect(getObjectValue(result)).toBe(28);
        });

        it('Value is big number', () => {
            const number = NumberValueObject.create(1000000);
            const numberChosen = NumberValueObject.create(2000);
            const result = testFunction.calculate(number, numberChosen);
            expect(getObjectValue(result)).toBe(ErrorType.NUM);
        });

        it('Value is number negative', () => {
            const number = NumberValueObject.create(8);
            const numberChosen = NumberValueObject.create(-2);
            const result = testFunction.calculate(number, numberChosen);
            expect(getObjectValue(result)).toBe(ErrorType.NUM);
        });

        it('Value is number string', () => {
            const number = NumberValueObject.create(8);
            const numberChosen = StringValueObject.create('1.5');
            const result = testFunction.calculate(number, numberChosen);
            expect(getObjectValue(result)).toBe(8);
        });

        it('Value is normal string', () => {
            const number = NumberValueObject.create(8);
            const numberChosen = StringValueObject.create('test');
            const result = testFunction.calculate(number, numberChosen);
            expect(getObjectValue(result)).toBe(ErrorType.VALUE);
        });

        it('Value is boolean', () => {
            const number = NumberValueObject.create(8);
            const numberChosen = BooleanValueObject.create(true);
            const result = testFunction.calculate(number, numberChosen);
            expect(getObjectValue(result)).toBe(8);
        });
        it('Value is blank cell', () => {
            const number = NumberValueObject.create(8);
            const numberChosen = NullValueObject.create();
            const result = testFunction.calculate(number, numberChosen);
            expect(getObjectValue(result)).toBe(1);
        });
        it('Value is error', () => {
            const number = ErrorValueObject.create(ErrorType.NAME);
            const numberChosen = NumberValueObject.create(2);
            const result = testFunction.calculate(number, numberChosen);
            expect(getObjectValue(result)).toBe(ErrorType.NAME);

            const number2 = NumberValueObject.create(8);
            const numberChosen2 = ErrorValueObject.create(ErrorType.NAME);
            const result2 = testFunction.calculate(number2, numberChosen2);
            expect(getObjectValue(result2)).toBe(ErrorType.NAME);
        });

        it('Value is array', () => {
            const number = ArrayValueObject.create({
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
            const numberChosen = NumberValueObject.create(2);
            const result = testFunction.calculate(number, numberChosen);
            expect(getObjectValue(result)).toStrictEqual([
                [ErrorType.NUM, ErrorType.VALUE, ErrorType.NUM, ErrorType.NUM, ErrorType.NUM, ErrorType.NUM],
                [ErrorType.NUM, 4950, 1, ErrorType.VALUE, ErrorType.NUM, ErrorType.NAME],
            ]);
        });
    });
});

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
import { Oct2dec } from '../index';
import { BooleanValueObject, NullValueObject, NumberValueObject, StringValueObject } from '../../../../engine/value-object/primitive-object';
import { ArrayValueObject, transformToValueObject } from '../../../../engine/value-object/array-value-object';
import { ErrorType } from '../../../../basics/error-type';
import { ErrorValueObject } from '../../../../engine/value-object/base-value-object';

describe('Test oct2dec function', () => {
    const testFunction = new Oct2dec(FUNCTION_NAMES_ENGINEERING.OCT2DEC);

    describe('Oct2dec', () => {
        it('Value is normal number', () => {
            const number = NumberValueObject.create(54);
            const result = testFunction.calculate(number);
            expect(result.getValue()).toBe(44);
        });

        it('Number >= 536870912', () => {
            const number = NumberValueObject.create(7777777777);
            const result = testFunction.calculate(number);
            expect(result.getValue()).toBe(-1);
        });

        it('Value is number string', () => {
            const number = StringValueObject.create('-0.5');
            const result = testFunction.calculate(number);
            expect(result.getValue()).toBe(ErrorType.NUM);
        });

        it('Value is normal string', () => {
            const number = StringValueObject.create('test');
            const result = testFunction.calculate(number);
            expect(result.getValue()).toBe(ErrorType.NUM);
        });

        it('Value is boolean', () => {
            const number = BooleanValueObject.create(true);
            const result = testFunction.calculate(number);
            expect(result.getValue()).toBe(ErrorType.VALUE);
        });

        it('Value is blank cell', () => {
            const number = NullValueObject.create();
            const result = testFunction.calculate(number);
            expect(result.getValue()).toBe(0);
        });

        it('Value is error', () => {
            const number = ErrorValueObject.create(ErrorType.NAME);
            const result = testFunction.calculate(number);
            expect(result.getValue()).toBe(ErrorType.NAME);
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
            const result = testFunction.calculate(number);
            expect(result.getValue()).toStrictEqual(ErrorType.VALUE);
        });
    });
});

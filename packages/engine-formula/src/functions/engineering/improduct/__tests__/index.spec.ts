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
import { Improduct } from '../index';
import { BooleanValueObject, NumberValueObject, StringValueObject } from '../../../../engine/value-object/primitive-object';
import { ArrayValueObject, transformToValueObject } from '../../../../engine/value-object/array-value-object';
import { ErrorType } from '../../../../basics/error-type';
import { ErrorValueObject } from '../../../../engine/value-object/base-value-object';

describe('Test improduct function', () => {
    const testFunction = new Improduct(FUNCTION_NAMES_ENGINEERING.IMPRODUCT);

    describe('Improduct', () => {
        it('Value is normal number', () => {
            const inumber1 = StringValueObject.create('5+12i');
            const inumber2 = StringValueObject.create('5+12i');
            const result = testFunction.calculate(inumber1, inumber2);
            expect(result.getValue()).toBe('-119+120i');
        });

        it('Value is large numbers', () => {
            const inumber1 = NumberValueObject.create(25698432);
            const inumber2 = StringValueObject.create('5+12i');
            const result = testFunction.calculate(inumber1, inumber2);
            expect(result.getValue()).toBe('128492160+308381184i');
        });

        it('Value is number string', () => {
            const inumber1 = StringValueObject.create('1.5');
            const inumber2 = StringValueObject.create('5+12i');
            const result = testFunction.calculate(inumber1, inumber2);
            expect(result.getValue()).toBe('7.5+18i');
        });

        it('Value is normal string', () => {
            const inumber1 = StringValueObject.create('test');
            const inumber2 = StringValueObject.create('5+12i');
            const result = testFunction.calculate(inumber1, inumber2);
            expect(result.getValue()).toBe(ErrorType.NUM);
        });

        it('Value is boolean', () => {
            const inumber1 = BooleanValueObject.create(true);
            const inumber2 = StringValueObject.create('5+12i');
            const result = testFunction.calculate(inumber1, inumber2);
            expect(result.getValue()).toBe(ErrorType.VALUE);
        });

        it('Value is blank cell', () => {
            const inumber1 = ArrayValueObject.create({
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
            const inumber2 = StringValueObject.create('5+12i');
            const result = testFunction.calculate(inumber1, inumber2);
            expect(result.getValue()).toBe(0);
        });

        it('Value is error', () => {
            const inumber1 = ErrorValueObject.create(ErrorType.NAME);
            const inumber2 = StringValueObject.create('5+12i');
            const result = testFunction.calculate(inumber1, inumber2);
            expect(result.getValue()).toBe(ErrorType.NAME);
        });

        it('Different suffixes', () => {
            const inumber1 = StringValueObject.create('5+12i');
            const inumber2 = StringValueObject.create('5+12j');
            const result = testFunction.calculate(inumber1, inumber2);
            expect(result.getValue()).toBe(ErrorType.VALUE);
        });

        it('Value is array', () => {
            const inumber1 = ArrayValueObject.create({
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
            const inumber2 = StringValueObject.create('5+12i');
            const result = testFunction.calculate(inumber1, inumber2);
            expect(result.getValue()).toStrictEqual(ErrorType.NUM);
        });
    });
});

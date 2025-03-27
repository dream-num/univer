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
import { BooleanValueObject, NumberValueObject, StringValueObject } from '../../../../engine/value-object/primitive-object';
import { FUNCTION_NAMES_ENGINEERING } from '../../function-names';
import { Imlog10 } from '../index';

describe('Test imlog10 function', () => {
    const testFunction = new Imlog10(FUNCTION_NAMES_ENGINEERING.IMLOG10);

    describe('Imlog10', () => {
        it('Value is normal number', () => {
            const inumber = StringValueObject.create('5+12i');
            const result = testFunction.calculate(inumber);
            expect(result.getValue()).toBe('1.11394335230684+0.510732572130908i');

            const inumber2 = StringValueObject.create('5-12i');
            const result2 = testFunction.calculate(inumber2);
            expect(result2.getValue()).toBe('1.11394335230684-0.510732572130908i');
        });

        it('Value is large numbers', () => {
            const inumber = NumberValueObject.create(25698432);
            const result = testFunction.calculate(inumber);
            expect(result.getValue()).toBe(7.40990662548997);
        });

        it('Value is number string', () => {
            const inumber = StringValueObject.create('1.5');
            const result = testFunction.calculate(inumber);
            expect(result.getValue()).toBe(0.176091259055681);
        });

        it('Value is normal string', () => {
            const inumber = StringValueObject.create('test');
            const result = testFunction.calculate(inumber);
            expect(result.getValue()).toBe(ErrorType.NUM);
        });

        it('Value is boolean', () => {
            const inumber = BooleanValueObject.create(true);
            const result = testFunction.calculate(inumber);
            expect(result.getValue()).toBe(ErrorType.VALUE);
        });

        it('Value is blank cell', () => {
            const inumber = ArrayValueObject.create({
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
            const result = testFunction.calculate(inumber);
            expect(result.getValue()).toBe(ErrorType.NUM);
        });

        it('Value is error', () => {
            const inumber = ErrorValueObject.create(ErrorType.NAME);
            const result = testFunction.calculate(inumber);
            expect(result.getValue()).toBe(ErrorType.NAME);
        });

        it('Value is array', () => {
            const inumber = ArrayValueObject.create({
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
            const result = testFunction.calculate(inumber);
            expect(result.getValue()).toStrictEqual(ErrorType.VALUE);
        });
    });
});

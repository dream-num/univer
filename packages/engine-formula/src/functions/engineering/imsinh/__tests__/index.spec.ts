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
import { Imsinh } from '../index';

describe('Test imsinh function', () => {
    const testFunction = new Imsinh(FUNCTION_NAMES_ENGINEERING.IMSINH);

    describe('Imsinh', () => {
        it('Value is normal number', () => {
            const inumber = StringValueObject.create('5+12i');
            const result = testFunction.calculate(inumber);
            expect(result.getValue()).toBe('62.6166729967278-39.8190486246075i');
        });

        it('Value is large numbers', () => {
            const inumber = NumberValueObject.create(25698432);
            const result = testFunction.calculate(inumber);
            expect(result.getValue()).toBe(ErrorType.NUM);
        });

        it('Value is number string', () => {
            const inumber = StringValueObject.create('1.5');
            const result = testFunction.calculate(inumber);
            expect(result.getValue()).toBe(2.12927945509482);
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
            expect(result.getValue()).toBe(0);
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

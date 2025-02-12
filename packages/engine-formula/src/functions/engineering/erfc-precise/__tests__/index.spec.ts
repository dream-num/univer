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
import { FUNCTION_NAMES_ENGINEERING } from '../../function-names';
import { ErfcPrecise } from '../index';

describe('Test erfc.precise function', () => {
    const testFunction = new ErfcPrecise(FUNCTION_NAMES_ENGINEERING.ERFC_PRECISE);

    describe('ErfcPrecise', () => {
        it('Value is normal number', () => {
            const x = NumberValueObject.create(1);
            const result = testFunction.calculate(x);
            expect(result.getValue()).toBe(0.1572992070502851);
        });

        it('Value is number string', () => {
            const x = StringValueObject.create('1.5');
            const result = testFunction.calculate(x);
            expect(result.getValue()).toBe(0.03389485352468924);
        });

        it('Value is negative number', () => {
            const x = NumberValueObject.create(-2);
            const result = testFunction.calculate(x);
            expect(result.getValue()).toBe(1.9953222650189528);
        });

        it('Value is normal string', () => {
            const x = StringValueObject.create('test');
            const result = testFunction.calculate(x);
            expect(result.getValue()).toBe(ErrorType.VALUE);
        });

        it('Value is boolean', () => {
            const x = BooleanValueObject.create(true);
            const result = testFunction.calculate(x);
            expect(result.getValue()).toBe(ErrorType.VALUE);
        });

        it('Value is blank cell', () => {
            const x = NullValueObject.create();
            const result = testFunction.calculate(x);
            expect(result.getValue()).toBe(1);
        });

        it('Value is error', () => {
            const x = ErrorValueObject.create(ErrorType.NAME);
            const result = testFunction.calculate(x);
            expect(result.getValue()).toBe(ErrorType.NAME);
        });

        it('Value is array', () => {
            const x = ArrayValueObject.create({
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
            const result = testFunction.calculate(x);
            expect(result.getValue()).toStrictEqual(ErrorType.VALUE);
        });
    });
});

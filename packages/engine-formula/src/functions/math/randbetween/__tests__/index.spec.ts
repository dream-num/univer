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

import { describe, expect, it, vi } from 'vitest';

import { FUNCTION_NAMES_MATH } from '../../function-names';
import { Randbetween } from '../index';
import { BooleanValueObject, NullValueObject, NumberValueObject, StringValueObject } from '../../../../engine/value-object/primitive-object';
import { ErrorType } from '../../../../basics/error-type';
import { ArrayValueObject, transformToValueObject } from '../../../../engine/value-object/array-value-object';

describe('Test randbetween function', () => {
    const testFunction = new Randbetween(FUNCTION_NAMES_MATH.RANDBETWEEN);

    describe('Randbetween', () => {
        const mockRandom = vi.spyOn(Math, 'random');
        mockRandom.mockReturnValue(0.5);

        it('Value is normal', () => {
            const bottom = NumberValueObject.create(1);
            const top = NumberValueObject.create(100);
            const result = testFunction.calculate(bottom, top);
            expect(result.getValue()).toBe(51);
        });

        it('bottom > top', () => {
            const bottom = NumberValueObject.create(3);
            const top = NumberValueObject.create(1);
            const result = testFunction.calculate(bottom, top);
            expect(result.getValue()).toBe(ErrorType.NUM);
        });

        it('Value is normal string', () => {
            const bottom = StringValueObject.create('test');
            const top = NumberValueObject.create(3);
            const result = testFunction.calculate(bottom, top);
            expect(result.getValue()).toBe(ErrorType.VALUE);
        });

        it('Value is boolean', () => {
            const bottom = BooleanValueObject.create(true);
            const top = NumberValueObject.create(3);
            const result = testFunction.calculate(bottom, top);
            expect(result.getValue()).toBe(ErrorType.VALUE);
        });

        it('Value is blank cell', () => {
            const bottom = NullValueObject.create();
            const top = NumberValueObject.create(3);
            const result = testFunction.calculate(bottom, top);
            expect(result.getValue()).toBe(2);
        });

        it('Value is array and rowCount or columnCount > 1', () => {
            const bottom = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [1, 2, 3],
                ]),
                rowCount: 1,
                columnCount: 2,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const top = NumberValueObject.create(3);
            const result = testFunction.calculate(bottom, top);
            expect(result.getValue()).toBe(ErrorType.VALUE);
        });
    });
});

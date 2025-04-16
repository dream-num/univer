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

import { FUNCTION_NAMES_INFORMATION } from '../../function-names';
import { BooleanValueObject, NullValueObject, NumberValueObject, StringValueObject } from '../../../../engine/value-object/primitive-object';
import { ArrayValueObject, transformToValue, transformToValueObject } from '../../../../engine/value-object/array-value-object';
import { ErrorValueObject } from '../../../../engine/value-object/base-value-object';
import { ErrorType } from '../../../../basics/error-type';
import { Isblank } from '../index';

describe('Test isblank function', () => {
    const testFunction = new Isblank(FUNCTION_NAMES_INFORMATION.ISBLANK);

    describe('Isblank', () => {
        it('value null', () => {
            const value = NullValueObject.create();
            const result = testFunction.calculate(value);
            expect(result.getValue()).toBe(true);
        });

        it('value error', () => {
            const value = ErrorValueObject.create(ErrorType.NA);
            const result = testFunction.calculate(value);
            expect(result.getValue()).toBe(false);
        });

        it('value boolean', () => {
            const value = BooleanValueObject.create(true);
            const result = testFunction.calculate(value);
            expect(result.getValue()).toBe(false);
        });

        it('value string', () => {
            const value = StringValueObject.create('a1');
            const result = testFunction.calculate(value);
            expect(result.getValue()).toBe(false);
        });

        it('value number 1', () => {
            const value = NumberValueObject.create(1);
            const result = testFunction.calculate(value);
            expect(result.getValue()).toBe(false);
        });

        it('value number 0', () => {
            const value = NumberValueObject.create(0);
            const result = testFunction.calculate(value);
            expect(result.getValue()).toBe(false);
        });

        it('value array', () => {
            const value = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    ['a1'],
                    [null],
                ]),
                rowCount: 2,
                columnCount: 1,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const result = testFunction.calculate(value);
            expect(transformToValue(result.getArrayValue())).toStrictEqual([
                [false],
                [true],
            ]);
        });
    });
});

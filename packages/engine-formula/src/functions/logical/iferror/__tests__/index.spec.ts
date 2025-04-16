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
import { ArrayValueObject, transformToValue, transformToValueObject } from '../../../../engine/value-object/array-value-object';
import { ErrorValueObject } from '../../../../engine/value-object/base-value-object';
import { NumberValueObject, StringValueObject } from '../../../../engine/value-object/primitive-object';
import { FUNCTION_NAMES_LOGICAL } from '../../function-names';
import { Iferror } from '../index';

describe('Test iferror function', () => {
    const testFunction = new Iferror(FUNCTION_NAMES_LOGICAL.IFERROR);

    describe('Iferror', () => {
        it('Value is normal', () => {
            const value = NumberValueObject.create(1);
            const valueIfError = StringValueObject.create('error');
            const result = testFunction.calculate(value, valueIfError);
            expect(result.getValue()).toBe(1);
        });

        it('Value is error', () => {
            const value = ErrorValueObject.create(ErrorType.NA);
            const valueIfError = StringValueObject.create('error');
            const result = testFunction.calculate(value, valueIfError);
            expect(result.getValue()).toBe('error');
        });

        it('Value is array', () => {
            const value = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [1],
                    ['#N/A'],
                    [1],
                ]),
                rowCount: 3,
                columnCount: 1,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const valueIfError = StringValueObject.create('error');
            const result = testFunction.calculate(value, valueIfError);
            expect(transformToValue(result.getArrayValue())).toStrictEqual([
                [1],
                ['error'],
                [1],
            ]);
        });

        it('Value is array and valueIfError is array', () => {
            const value = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [1],
                    ['#N/A'],
                    ['#N/A'],
                ]),
                rowCount: 3,
                columnCount: 1,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const valueIfError = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    ['a1', 'a2', 'a3'],
                ]),
                rowCount: 1,
                columnCount: 3,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const result = testFunction.calculate(value, valueIfError);
            expect(transformToValue(result.getArrayValue())).toStrictEqual([[1, 1, 1], ['a1', 'a2', 'a3'], ['a1', 'a2', 'a3']]);
        });
    });
});

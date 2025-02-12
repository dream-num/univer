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

import { FUNCTION_NAMES_MATH } from '../../function-names';
import { ArrayValueObject, transformToValueObject } from '../../../../engine/value-object/array-value-object';
import { ErrorType } from '../../../../basics/error-type';
import { Sumproduct } from '../index';

describe('Test sumproduct function', () => {
    const testFunction = new Sumproduct(FUNCTION_NAMES_MATH.SUMPRODUCT);

    describe('Sumproduct', () => {
        it('Array1 is array, not includes error', () => {
            const array1 = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [1, '2', 3],
                    [null, 'test', 2],
                    [true, ' ', false],
                ]),
                rowCount: 3,
                columnCount: 3,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const result = testFunction.calculate(array1);
            expect(result.getValue()).toBe(8);
        });

        it('Array1 is array, includes error', () => {
            const array1 = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [1, '2', 3],
                    [null, 'test', ErrorType.NUM],
                    [true, ' ', false],
                ]),
                rowCount: 3,
                columnCount: 3,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const result = testFunction.calculate(array1);
            expect(result.getValue()).toBe(ErrorType.NUM);
        });

        it('Array1 is array, other variants has same dimension', () => {
            const array1 = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [1, '2', 3],
                    [null, 'test', 2],
                    [true, ' ', false],
                ]),
                rowCount: 3,
                columnCount: 3,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const array2 = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [1, 1, 1],
                    [null, 'test', 2],
                    [true, 1, false],
                ]),
                rowCount: 3,
                columnCount: 3,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const result = testFunction.calculate(array1, array2);
            expect(result.getValue()).toBe(10);
        });

        it('Array1 is array, other variants is not same dimension', () => {
            const array1 = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [1, '2', 3],
                    [null, 'test', 2],
                    [true, ' ', false],
                ]),
                rowCount: 3,
                columnCount: 3,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const array2 = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [1, 1, 1],
                    [true, 1, false],
                ]),
                rowCount: 2,
                columnCount: 3,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const result = testFunction.calculate(array1, array2);
            expect(result.getValue()).toBe(ErrorType.VALUE);
        });
    });
});

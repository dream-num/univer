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
import { NumberValueObject } from '../../../../engine/value-object/primitive-object';
import { getObjectValue } from '../../../__tests__/create-function-test-bed';
import { FUNCTION_NAMES_STATISTICAL } from '../../function-names';
import { TTest } from '../index';

describe('Test tTest function', () => {
    const testFunction = new TTest(FUNCTION_NAMES_STATISTICAL.T_TEST);

    describe('TTest', () => {
        it('Value is normal', () => {
            const array1 = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [3, 4, 5, 8, 9, 1, 2, 4, 5],
                ]),
                rowCount: 1,
                columnCount: 9,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const array2 = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [6, 19, 3, 2, 14, 4, 5, 17, 1],
                ]),
                rowCount: 1,
                columnCount: 9,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const tails = NumberValueObject.create(2);
            const type = NumberValueObject.create(1);
            const result = testFunction.calculate(array1, array2, tails, type);
            expect(getObjectValue(result)).toBe(0.19601578492531546);
        });

        it('Array1 and array2 value test', () => {
            let array1 = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [0, 1, 2, 3, null],
                ]),
                rowCount: 1,
                columnCount: 5,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            let array2 = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [0.2, 0.3, 0.1, 0.4],
                ]),
                rowCount: 1,
                columnCount: 4,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const tails = NumberValueObject.create(2);
            const type = NumberValueObject.create(1);
            let result = testFunction.calculate(array1, array2, tails, type);
            expect(getObjectValue(result)).toBe(ErrorType.NA);

            array1 = ArrayValueObject.create({
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
            array2 = ArrayValueObject.create({
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
            result = testFunction.calculate(array1, array2, tails, type);
            expect(getObjectValue(result)).toBe(ErrorType.VALUE);

            array1 = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [null, true, false, 'test'],
                ]),
                rowCount: 1,
                columnCount: 4,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            array2 = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [0.2, 0.3, 0.1, 0.4],
                ]),
                rowCount: 1,
                columnCount: 4,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            result = testFunction.calculate(array1, array2, tails, type);
            expect(getObjectValue(result)).toBe(ErrorType.DIV_BY_ZERO);

            array1 = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [ErrorType.NAME, 1, 2, 3],
                ]),
                rowCount: 1,
                columnCount: 4,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            result = testFunction.calculate(array1, array2, tails, type);
            expect(getObjectValue(result)).toBe(ErrorType.NAME);

            const array3 = ErrorValueObject.create(ErrorType.NAME);
            const array4 = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [0.2, 0.3, 0.1, 0.4],
                ]),
                rowCount: 1,
                columnCount: 4,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const result2 = testFunction.calculate(array3, array4, tails, type);
            expect(getObjectValue(result2)).toBe(ErrorType.NAME);

            const array5 = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [0, 1, 2, 3],
                ]),
                rowCount: 1,
                columnCount: 4,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const array6 = ErrorValueObject.create(ErrorType.NAME);
            const result3 = testFunction.calculate(array5, array6, tails, type);
            expect(getObjectValue(result3)).toBe(ErrorType.NAME);
        });

        it('Tails value test', () => {
            const array1 = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [3, 4, 5, 8, 9, 1, 2, 4, 5],
                ]),
                rowCount: 1,
                columnCount: 9,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const array2 = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [6, 19, 3, 2, 14, 4, 5, 17, 1],
                ]),
                rowCount: 1,
                columnCount: 9,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const tails = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [-1, 0, 1, 2, 3, true, false, null, 'test', ErrorType.NAME],
                ]),
                rowCount: 1,
                columnCount: 10,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const type = NumberValueObject.create(1);
            const result = testFunction.calculate(array1, array2, tails, type);
            expect(getObjectValue(result)).toStrictEqual([
                [ErrorType.NUM, ErrorType.NUM, 0.09800789246265773, 0.19601578492531546, ErrorType.NUM, 0.09800789246265773, ErrorType.NUM, ErrorType.NUM, ErrorType.VALUE, ErrorType.NAME],
            ]);
        });

        it('Type Value is normal', () => {
            const array1 = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [3, 4, 5, 8, 9, 1, 2, 4, 5],
                ]),
                rowCount: 1,
                columnCount: 9,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const array2 = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [6, 19, 3, 2, 14, 4, 5, 17, 1],
                ]),
                rowCount: 1,
                columnCount: 9,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const tails = NumberValueObject.create(2);
            const type = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [-1, 0, 1, 2, 3, true, false, null, 'test', ErrorType.NAME],
                ]),
                rowCount: 1,
                columnCount: 10,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const result = testFunction.calculate(array1, array2, tails, type);
            expect(getObjectValue(result)).toStrictEqual([
                [ErrorType.NUM, ErrorType.NUM, 0.19601578492531546, 0.1919958867250542, 0.20229392336804775, 0.19601578492531546, ErrorType.NUM, ErrorType.NUM, ErrorType.VALUE, ErrorType.NAME],
            ]);
        });

        it('More test', () => {
            const array1 = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [-10, 1],
                    [-8, 3],
                ]),
                rowCount: 2,
                columnCount: 2,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const array2 = NumberValueObject.create(0);
            const tails = NumberValueObject.create(2);
            const type = NumberValueObject.create(2);
            const result = testFunction.calculate(array1, array2, tails, type);
            expect(getObjectValue(result)).toBe(ErrorType.DIV_BY_ZERO);

            const array3 = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [1, 2],
                ]),
                rowCount: 1,
                columnCount: 2,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const result2 = testFunction.calculate(array1, array3, tails, type);
            expect(getObjectValue(result2)).toBe(0.3609071062401591);

            const type2 = NumberValueObject.create(3);
            const result3 = testFunction.calculate(array1, array3, tails, type2);
            expect(getObjectValue(result3)).toBe(0.21930610212734247);
        });
    });
});

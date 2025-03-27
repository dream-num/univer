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
import { NullValueObject } from '../../../../engine/value-object/primitive-object';
import { getObjectValue } from '../../../__tests__/create-function-test-bed';
import { FUNCTION_NAMES_STATISTICAL } from '../../function-names';
import { Frequency } from '../index';

describe('Test frequency function', () => {
    const testFunction = new Frequency(FUNCTION_NAMES_STATISTICAL.FREQUENCY);

    describe('Frequency', () => {
        it('Value is normal', () => {
            const dataArray = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [79],
                    [85],
                    [78],
                    [85],
                    [50],
                    [81],
                    [95],
                    [88],
                    [97],
                ]),
                rowCount: 9,
                columnCount: 1,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const binsArray = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [70],
                    [79],
                    [89],
                ]),
                rowCount: 3,
                columnCount: 1,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const result = testFunction.calculate(dataArray, binsArray);
            expect(getObjectValue(result)).toStrictEqual([
                [1],
                [2],
                [4],
                [2],
            ]);
        });

        it('BinsArray value order test', () => {
            const dataArray = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [79],
                    [85],
                    [78],
                    [85],
                    [50],
                    [81],
                    [95],
                    [88],
                    [97],
                ]),
                rowCount: 9,
                columnCount: 1,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const binsArray = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [79],
                    [70],
                    [89],
                ]),
                rowCount: 3,
                columnCount: 1,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const result = testFunction.calculate(dataArray, binsArray);
            expect(getObjectValue(result)).toStrictEqual([
                [2],
                [1],
                [4],
                [2],
            ]);

            const binsArray2 = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [89],
                    [79],
                    [70],
                ]),
                rowCount: 3,
                columnCount: 1,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const result2 = testFunction.calculate(dataArray, binsArray2);
            expect(getObjectValue(result2)).toStrictEqual([
                [4],
                [2],
                [1],
                [2],
            ]);

            const binsArray3 = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [79],
                    [79],
                    [79],
                ]),
                rowCount: 3,
                columnCount: 1,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const result3 = testFunction.calculate(dataArray, binsArray3);
            expect(getObjectValue(result3)).toStrictEqual([
                [3],
                [0],
                [0],
                [6],
            ]);
        });

        it('Value is error', () => {
            const dataArray = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [79],
                    [85],
                    [78],
                    [85],
                    [50],
                    [81],
                    [95],
                    [88],
                    [97],
                ]),
                rowCount: 9,
                columnCount: 1,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const binsArray = ErrorValueObject.create(ErrorType.NAME);
            const result = testFunction.calculate(dataArray, binsArray);
            expect(getObjectValue(result)).toStrictEqual([
                [0],
                [9],
            ]);

            const dataArray2 = ErrorValueObject.create(ErrorType.NAME);
            const binsArray2 = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [70],
                    [79],
                    [89],
                ]),
                rowCount: 3,
                columnCount: 1,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const result2 = testFunction.calculate(dataArray2, binsArray2);
            expect(getObjectValue(result2)).toStrictEqual(ErrorType.NAME);
        });

        it('Value is null', () => {
            const dataArray = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [79],
                    [85],
                    [78],
                    [85],
                    [50],
                    [81],
                    [95],
                    [88],
                    [97],
                ]),
                rowCount: 9,
                columnCount: 1,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const binsArray = NullValueObject.create();
            const result = testFunction.calculate(dataArray, binsArray);
            expect(getObjectValue(result)).toStrictEqual(ErrorType.VALUE);

            const dataArray2 = NullValueObject.create();
            const binsArray2 = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [70],
                    [79],
                    [89],
                ]),
                rowCount: 3,
                columnCount: 1,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const result2 = testFunction.calculate(dataArray2, binsArray2);
            expect(getObjectValue(result2)).toStrictEqual(ErrorType.VALUE);

            const dataArray3 = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [null],
                    [null],
                    [null],
                    [null],
                    [null],
                    [null],
                    [null],
                    [null],
                    [null],
                ]),
                rowCount: 9,
                columnCount: 1,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const binsArray3 = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [null],
                    [null],
                    [null],
                ]),
                rowCount: 3,
                columnCount: 1,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const result3 = testFunction.calculate(dataArray3, binsArray3);
            expect(getObjectValue(result3)).toStrictEqual([
                [0],
                [0],
            ]);
        });

        it('Value ignore string/boolean/blank cell', () => {
            const dataArray = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [79],
                    [85],
                    [true],
                    [85],
                    [false],
                    [81],
                    ['test'],
                    [88],
                    [null],
                ]),
                rowCount: 9,
                columnCount: 1,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const binsArray = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [true],
                    [false],
                    [null],
                ]),
                rowCount: 3,
                columnCount: 1,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const result = testFunction.calculate(dataArray, binsArray);
            expect(getObjectValue(result)).toStrictEqual([
                [0],
                [5],
            ]);
        });
    });
});

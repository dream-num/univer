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

import { beforeEach, describe, expect, it } from 'vitest';

import { ErrorType } from '../../../../basics/error-type';
import { CELL_INVERTED_INDEX_CACHE } from '../../../../basics/inverted-index-cache';
import { compareToken } from '../../../../basics/token';
import { ArrayValueObject, transformToValueObject } from '../../../../engine/value-object/array-value-object';
import { BooleanValueObject, NullValueObject, NumberValueObject, StringValueObject } from '../../../../engine/value-object/primitive-object';
import { getObjectValue } from '../../../__tests__/create-function-test-bed';
import { FUNCTION_NAMES_META } from '../../function-names';
import { Compare } from '../index';

describe('Test compare function', () => {
    const testFunction = new Compare(FUNCTION_NAMES_META.COMPARE);

    beforeEach(() => {
        // Cache will affect the calculation results
        CELL_INVERTED_INDEX_CACHE.clear();
    });

    describe('Compare', () => {
        it('Comparing Boolean and number', () => {
            const value1 = BooleanValueObject.create(false);
            const value2 = NumberValueObject.create(2);

            testFunction.setCompareType(compareToken.GREATER_THAN);
            const result = testFunction.calculate(value1, value2);
            expect(result.getValue()).toBe(true);
        });
        it('Comparing Boolean and string', () => {
            const value1 = BooleanValueObject.create(false);
            const value2 = StringValueObject.create('Univer');

            testFunction.setCompareType(compareToken.GREATER_THAN);
            const result = testFunction.calculate(value1, value2);
            expect(result.getValue()).toBe(true);
        });

        it('Comparing Boolean false and blank cell', () => {
            const value1 = BooleanValueObject.create(false);
            const value2 = NullValueObject.create();

            testFunction.setCompareType(compareToken.GREATER_THAN);
            const result = testFunction.calculate(value1, value2);
            expect(result.getValue()).toBe(false);
        });

        it('Comparing Boolean true and blank cell', () => {
            const value1 = BooleanValueObject.create(true);
            const value2 = NullValueObject.create();

            testFunction.setCompareType(compareToken.GREATER_THAN);
            const result = testFunction.calculate(value1, value2);
            expect(result.getValue()).toBe(true);
        });

        it('Array contains multi types cell, compare number', () => {
            const value1 = ArrayValueObject.create({
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

            const value2 = NumberValueObject.create(1);

            testFunction.setCompareType(compareToken.GREATER_THAN);
            const result = testFunction.calculate(value1, value2);
            expect(getObjectValue(result)).toStrictEqual([[false, true, true, true, true, false], [false, true, true, true, false, ErrorType.NAME]]);
        });

        it('Array contains multi types cell, compare string', () => {
            const value1 = ArrayValueObject.create({
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

            const value2 = StringValueObject.create('tes');

            testFunction.setCompareType(compareToken.GREATER_THAN);
            const result = testFunction.calculate(value1, value2);
            expect(getObjectValue(result)).toStrictEqual([[false, false, false, true, true, false], [false, false, false, true, false, ErrorType.NAME]]);
        });

        it('Array contains multi types cell, compare boolean', () => {
            const value1 = ArrayValueObject.create({
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

            const value2 = BooleanValueObject.create(false);

            testFunction.setCompareType(compareToken.GREATER_THAN);
            const result = testFunction.calculate(value1, value2);
            expect(getObjectValue(result)).toStrictEqual([[false, false, false, true, false, false], [false, false, false, false, false, ErrorType.NAME]]);
        });

        it('Array contains multi types cell, compare blank cell', () => {
            const value1 = ArrayValueObject.create({
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

            const value2 = NullValueObject.create();

            testFunction.setCompareType(compareToken.GREATER_THAN);
            const result = testFunction.calculate(value1, value2);
            expect(getObjectValue(result)).toStrictEqual([[true, true, true, true, false, false], [false, true, true, true, false, ErrorType.NAME]]);
        });

        it('Array contains multi types cell, compare blank string', () => {
            const value1 = ArrayValueObject.create({
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
            const value2 = StringValueObject.create('');

            testFunction.setCompareType(compareToken.GREATER_THAN);
            const result = testFunction.calculate(value1, value2);
            expect(getObjectValue(result)).toStrictEqual([[false, true, false, true, true, false], [false, false, false, true, false, ErrorType.NAME]]);
        });

        it('Array contains multi types cell, compare error', () => {
            const value1 = ArrayValueObject.create({
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
            const value2 = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [ErrorType.REF],
                ]),
                rowCount: 1,
                columnCount: 1,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });

            testFunction.setCompareType(compareToken.GREATER_THAN);
            const result = testFunction.calculate(value1, value2);
            expect(getObjectValue(result)).toStrictEqual([[ErrorType.REF, ErrorType.REF, ErrorType.REF, ErrorType.REF, ErrorType.REF, ErrorType.REF], [ErrorType.REF, ErrorType.REF, ErrorType.REF, ErrorType.REF, ErrorType.REF, ErrorType.NAME]]);
        });
    });
});
// describe('Test compare function2', () => {
//     const testFunction = new Compare(FUNCTION_NAMES_META.COMPARE);

//     describe('Compare', () => {

//         it('Array contains multi types cell, compare string', () => {
//             const value1 = ArrayValueObject.create({
//                 calculateValueList: transformToValueObject([
//                     [1, ' ', 1.23, true, false, null],
//                     [0, '100', '2.34', 'test', -3, ErrorType.NAME],
//                 ]),
//                 rowCount: 2,
//                 columnCount: 6,
//                 unitId: '',
//                 sheetId: '',
//                 row: 0,
//                 column: 0,
//             });

//             const value2 = StringValueObject.create('tes');

//             testFunction.setCompareType(compareToken.GREATER_THAN);
//             const result = testFunction.calculate(value1, value2);
//             expect(getObjectValue(result)).toStrictEqual([[false, false, false, true, true, false], [false, false, false, true, false, ErrorType.NAME]]);
//         });
//     });
// });
// describe('Test compare function3', () => {
//     const testFunction = new Compare(FUNCTION_NAMES_META.COMPARE);

//     describe('Compare', () => {

//         it('Array contains multi types cell, compare boolean', () => {
//             const value1 = ArrayValueObject.create({
//                 calculateValueList: transformToValueObject([
//                     [1, ' ', 1.23, true, false, null],
//                     [0, '100', '2.34', 'test', -3, ErrorType.NAME],
//                 ]),
//                 rowCount: 2,
//                 columnCount: 6,
//                 unitId: '',
//                 sheetId: '',
//                 row: 0,
//                 column: 0,
//             });

//             const value2 = BooleanValueObject.create(false);

//             testFunction.setCompareType(compareToken.GREATER_THAN);
//             const result = testFunction.calculate(value1, value2);
//             expect(getObjectValue(result)).toStrictEqual([[false, false, false, true, false, false], [false, false, false, false, false, ErrorType.NAME]]);
//         });
//     });
// });
// describe('Test compare function4', () => {
//     const testFunction = new Compare(FUNCTION_NAMES_META.COMPARE);

//     describe('Compare', () => {

//        it('Array contains multi types cell, compare blank cell', () => {
//             const value1 = ArrayValueObject.create({
//                 calculateValueList: transformToValueObject([
//                     [1, ' ', 1.23, true, false, null],
//                     [0, '100', '2.34', 'test', -3, ErrorType.NAME],
//                 ]),
//                 rowCount: 2,
//                 columnCount: 6,
//                 unitId: '',
//                 sheetId: '',
//                 row: 0,
//                 column: 0,
//             });

//             const value2 = NullValueObject.create();

//             testFunction.setCompareType(compareToken.GREATER_THAN);
//             const result = testFunction.calculate(value1, value2);
//             expect(getObjectValue(result)).toStrictEqual([[true, true, true, true, false, false], [false, true, true, true, false, ErrorType.NAME]]);
//         });
//     });
// });
// describe('Test compare function5', () => {
//     const testFunction = new Compare(FUNCTION_NAMES_META.COMPARE);

//     describe('Compare', () => {

//        it('Array contains multi types cell, compare blank string', () => {
//             const value1 = ArrayValueObject.create({
//                 calculateValueList: transformToValueObject([
//                     [1, ' ', 1.23, true, false, null],
//                     [0, '100', '2.34', 'test', -3, ErrorType.NAME],
//                 ]),
//                 rowCount: 2,
//                 columnCount: 6,
//                 unitId: '',
//                 sheetId: '',
//                 row: 0,
//                 column: 0,
//             });
//             const value2 = StringValueObject.create('');

//             testFunction.setCompareType(compareToken.GREATER_THAN);
//             const result = testFunction.calculate(value1, value2);
//             expect(getObjectValue(result)).toStrictEqual([[false, true, false, true, true, false], [false, false, false, true, false, ErrorType.NAME]]);
//         });
//     });
// });
// describe('Test compare function6', () => {
//     const testFunction = new Compare(FUNCTION_NAMES_META.COMPARE);

//     describe('Compare', () => {

//       it('Array contains multi types cell, compare error', () => {
//             const value1 = ArrayValueObject.create({
//                 calculateValueList: transformToValueObject([
//                     [1, ' ', 1.23, true, false, null],
//                     [0, '100', '2.34', 'test', -3, ErrorType.NAME],
//                 ]),
//                 rowCount: 2,
//                 columnCount: 6,
//                 unitId: '',
//                 sheetId: '',
//                 row: 0,
//                 column: 0,
//             });
//             const value2 = ArrayValueObject.create({
//                 calculateValueList: transformToValueObject([
//                     [ErrorType.REF],
//                 ]),
//                 rowCount: 1,
//                 columnCount: 1,
//                 unitId: '',
//                 sheetId: '',
//                 row: 0,
//                 column: 0,
//             });

//             testFunction.setCompareType(compareToken.GREATER_THAN);
//             const result = testFunction.calculate(value1, value2);
//             expect(getObjectValue(result)).toStrictEqual([[ErrorType.REF, ErrorType.REF, ErrorType.REF, ErrorType.REF, ErrorType.REF, ErrorType.REF], [ErrorType.REF, ErrorType.REF, ErrorType.REF, ErrorType.REF, ErrorType.REF, ErrorType.NAME]]);
//         });
//     });
// });

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
import { getObjectValue } from '../../../__tests__/create-function-test-bed';
import { FUNCTION_NAMES_LOOKUP } from '../../function-names';
import { Drop } from '../index';

describe('Test drop function', () => {
    const testFunction = new Drop(FUNCTION_NAMES_LOOKUP.DROP);

    describe('Drop', () => {
        it('Value is normal', async () => {
            const array = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [2, 2],
                    [2, 2],
                ]),
                rowCount: 2,
                columnCount: 2,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const rows = NumberValueObject.create(1);
            const columns = NumberValueObject.create(1);
            const result = testFunction.calculate(array, rows, columns);
            expect(getObjectValue(result)).toStrictEqual(2);

            const rows2 = NumberValueObject.create(0);
            const columns2 = NumberValueObject.create(0);
            const result2 = testFunction.calculate(array, rows2, columns2);
            expect(getObjectValue(result2)).toStrictEqual([
                [2, 2],
                [2, 2],
            ]);
        });

        it('Array value test', async () => {
            const array = ErrorValueObject.create(ErrorType.NAME);
            const rows = NumberValueObject.create(1);
            const columns = NumberValueObject.create(1);
            const result = testFunction.calculate(array, rows, columns);
            expect(getObjectValue(result)).toStrictEqual(ErrorType.NAME);

            const rows2 = NumberValueObject.create(0);
            const columns2 = NumberValueObject.create(0);
            const result2 = testFunction.calculate(array, rows2, columns2);
            expect(getObjectValue(result2)).toStrictEqual(ErrorType.NAME);

            const array2 = NumberValueObject.create(1);
            const rows3 = ArrayValueObject.create('{1;0;0}');
            const columns3 = ArrayValueObject.create('{1,0}');
            const result3 = testFunction.calculate(array2, rows3, columns3);
            expect(getObjectValue(result3)).toStrictEqual([
                [ErrorType.CALC, ErrorType.CALC],
                [ErrorType.CALC, 1],
                [ErrorType.CALC, 1],
            ]);

            const result4 = testFunction.calculate(array, rows3, columns3);
            expect(getObjectValue(result4)).toStrictEqual([
                [ErrorType.NAME, ErrorType.NAME],
                [ErrorType.NAME, ErrorType.NAME],
                [ErrorType.NAME, ErrorType.NAME],
            ]);

            const array3 = NullValueObject.create();
            const result5 = testFunction.calculate(array3, rows, columns);
            expect(getObjectValue(result5)).toStrictEqual(ErrorType.VALUE);

            const result6 = testFunction.calculate(array3, rows3, columns3);
            expect(getObjectValue(result6)).toStrictEqual([
                [ErrorType.VALUE, ErrorType.VALUE],
                [ErrorType.VALUE, ErrorType.VALUE],
                [ErrorType.VALUE, ErrorType.VALUE],
            ]);
        });

        it('Rows value test', async () => {
            const array = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [2, 2],
                    [2, 2],
                ]),
                rowCount: 2,
                columnCount: 2,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const rows = NumberValueObject.create(2);
            const columns = NumberValueObject.create(1);
            const result = testFunction.calculate(array, rows, columns);
            expect(getObjectValue(result)).toStrictEqual(ErrorType.CALC);
        });

        it('Rows value test2', async () => {
            const array = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [2, 2],
                    [2, 2],
                ]),
                rowCount: 2,
                columnCount: 2,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const rows = BooleanValueObject.create(true);
            const columns = NumberValueObject.create(1);
            const result = testFunction.calculate(array, rows, columns);
            expect(getObjectValue(result)).toStrictEqual(2);
        });

        it('Rows value test3', async () => {
            const array = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [2, 2],
                    [2, 2],
                ]),
                rowCount: 2,
                columnCount: 2,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const rows = BooleanValueObject.create(false);
            const columns = NumberValueObject.create(1);
            const result = testFunction.calculate(array, rows, columns);
            expect(getObjectValue(result)).toStrictEqual([
                [2],
                [2],
            ]);
        });

        it('Rows value test4', async () => {
            const array = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [2, 2],
                    [2, 2],
                ]),
                rowCount: 2,
                columnCount: 2,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const rows = StringValueObject.create('test');
            const columns = NumberValueObject.create(1);
            const result = testFunction.calculate(array, rows, columns);
            expect(getObjectValue(result)).toStrictEqual(ErrorType.VALUE);
        });

        it('Rows value test5', async () => {
            const array = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [2, 2],
                    [2, 2],
                ]),
                rowCount: 2,
                columnCount: 2,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const rows = ErrorValueObject.create(ErrorType.NAME);
            const columns = NumberValueObject.create(1);
            const result = testFunction.calculate(array, rows, columns);
            expect(getObjectValue(result)).toStrictEqual(ErrorType.NAME);
        });

        it('Rows value test6', async () => {
            const array = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [2, 2],
                    [2, 2],
                ]),
                rowCount: 2,
                columnCount: 2,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const rows = ArrayValueObject.create('{1,2}');
            const columns = NumberValueObject.create(1);
            const result = testFunction.calculate(array, rows, columns);
            expect(getObjectValue(result)).toStrictEqual([
                [ErrorType.VALUE, ErrorType.CALC],
            ]);
        });

        it('Columns value test', async () => {
            const array = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [2, 2],
                    [2, 2],
                ]),
                rowCount: 2,
                columnCount: 2,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const rows = NumberValueObject.create(1);
            const columns = NumberValueObject.create(2);
            const result = testFunction.calculate(array, rows, columns);
            expect(getObjectValue(result)).toStrictEqual(ErrorType.CALC);
        });

        it('Columns value test2', async () => {
            const array = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [2, 2],
                    [2, 2],
                ]),
                rowCount: 2,
                columnCount: 2,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const rows = NumberValueObject.create(1);
            const columns = BooleanValueObject.create(true);
            const result = testFunction.calculate(array, rows, columns);
            expect(getObjectValue(result)).toStrictEqual(2);
        });

        it('Columns value test3', async () => {
            const array = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [2, 2],
                    [2, 2],
                ]),
                rowCount: 2,
                columnCount: 2,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const rows = NumberValueObject.create(1);
            const columns = BooleanValueObject.create(false);
            const result = testFunction.calculate(array, rows, columns);
            expect(getObjectValue(result)).toStrictEqual([
                [2, 2],
            ]);
        });

        it('Columns value test4', async () => {
            const array = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [2, 2],
                    [2, 2],
                ]),
                rowCount: 2,
                columnCount: 2,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const rows = NumberValueObject.create(1);
            const columns = StringValueObject.create('test');
            const result = testFunction.calculate(array, rows, columns);
            expect(getObjectValue(result)).toStrictEqual(ErrorType.VALUE);
        });

        it('Columns value test5', async () => {
            const array = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [2, 2],
                    [2, 2],
                ]),
                rowCount: 2,
                columnCount: 2,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const rows = NumberValueObject.create(1);
            const columns = ErrorValueObject.create(ErrorType.NAME);
            const result = testFunction.calculate(array, rows, columns);
            expect(getObjectValue(result)).toStrictEqual(ErrorType.NAME);
        });

        it('Columns value test6', async () => {
            const array = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [2, 2],
                    [2, 2],
                ]),
                rowCount: 2,
                columnCount: 2,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const rows = NumberValueObject.create(1);
            const columns = ArrayValueObject.create('{1,2}');
            const result = testFunction.calculate(array, rows, columns);
            expect(getObjectValue(result)).toStrictEqual([
                [ErrorType.VALUE, ErrorType.CALC],
            ]);
        });
    });
});

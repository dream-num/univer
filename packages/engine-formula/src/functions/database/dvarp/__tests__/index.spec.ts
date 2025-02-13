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
import { FUNCTION_NAMES_DATABASE } from '../../function-names';
import { Dvarp } from '../index';

describe('Test dvarp function', () => {
    const testFunction = new Dvarp(FUNCTION_NAMES_DATABASE.DVARP);

    describe('Dvarp', () => {
        it('Value is normal', () => {
            const database = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    ['树种', '高度', '年数', '产量', '利润'],
                    ['苹果树', 18, 20, 14, 105],
                    ['梨树', 1.2, 1.2, 10, 96],
                    ['樱桃树', 1.3, 14, 9, 105],
                    ['苹果树', 14, 15, 10, 75],
                    ['梨树', 9, 8, 8, 76.8],
                    ['苹果树', 8, 9, 6, 45],
                ]),
                rowCount: 7,
                columnCount: 5,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const field = StringValueObject.create('产量');
            const criteria = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    ['树种', '高度'],
                    ['苹果树', '>10'],
                ]),
                rowCount: 2,
                columnCount: 2,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const result = testFunction.calculate(database, field, criteria);
            expect(getObjectValue(result)).toStrictEqual(4);
        });

        it('Database value test', () => {
            const database = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    ['树种', '高度', '年数', '产量', '利润'],
                ]),
                rowCount: 1,
                columnCount: 5,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const field = StringValueObject.create('产量');
            const criteria = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    ['树种', '高度'],
                    ['苹果树', '>10'],
                ]),
                rowCount: 2,
                columnCount: 2,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const result = testFunction.calculate(database, field, criteria);
            expect(getObjectValue(result)).toStrictEqual(ErrorType.VALUE);

            const database2 = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    ['树种', '高度', '年数', '产量', '利润'],
                    ['苹果树', null, true, false, ErrorType.NAME],
                    ['梨树', 1.2, 1.2, 10, 96],
                    ['樱桃树', 1.3, 14, 9, 105],
                    ['苹果树', 14, 15, 10, 75],
                    ['梨树', 9, 8, 8, 76.8],
                    ['苹果树', 8, 9, 6, 45],
                ]),
                rowCount: 6,
                columnCount: 5,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const result2 = testFunction.calculate(database2, field, criteria);
            expect(getObjectValue(result2)).toStrictEqual(0);

            const database3 = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    ['树种', '高度', '年数', '产量', '利润'],
                    ['苹果树', 18, 20, 'test', 105],
                    ['梨树', 1.2, 1.2, 10, 96],
                    ['樱桃树', 1.3, 14, 9, 105],
                    ['苹果树', 14, 15, 10, 75],
                    ['梨树', 9, 8, 8, 76.8],
                    ['苹果树', 8, 9, 6, 45],
                ]),
                rowCount: 7,
                columnCount: 5,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const result3 = testFunction.calculate(database3, field, criteria);
            expect(getObjectValue(result3)).toStrictEqual(0);

            const database4 = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    ['树种', '高度', '年数', '产量', '利润'],
                    ['苹果树', 18, 20, null, 105],
                    ['梨树', 1.2, 1.2, 10, 96],
                    ['樱桃树', 1.3, 14, 9, 105],
                    ['苹果树', 14, 15, 10, 75],
                    ['梨树', 9, 8, 8, 76.8],
                    ['苹果树', 8, 9, 6, 45],
                ]),
                rowCount: 7,
                columnCount: 5,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const result4 = testFunction.calculate(database4, field, criteria);
            expect(getObjectValue(result4)).toStrictEqual(0);
        });

        it('Field value test', () => {
            const database = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    ['树种', '高度', '年数', '产量', '利润'],
                    ['苹果树', 18, 20, 14, 105],
                    ['梨树', 1.2, 1.2, 10, 96],
                    ['樱桃树', 1.3, 14, 9, 105],
                    ['苹果树', 14, 15, 10, 75],
                    ['梨树', 9, 8, 8, 76.8],
                    ['苹果树', 8, 9, 6, 45],
                ]),
                rowCount: 7,
                columnCount: 5,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const field = NumberValueObject.create(4);
            const criteria = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    ['树种', '高度'],
                    ['苹果树', '>10'],
                ]),
                rowCount: 2,
                columnCount: 2,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const result = testFunction.calculate(database, field, criteria);
            expect(getObjectValue(result)).toStrictEqual(4);

            const field2 = NullValueObject.create();
            const result2 = testFunction.calculate(database, field2, criteria);
            expect(getObjectValue(result2)).toStrictEqual(ErrorType.VALUE);

            const field3 = BooleanValueObject.create(true);
            const result3 = testFunction.calculate(database, field3, criteria);
            expect(getObjectValue(result3)).toStrictEqual(ErrorType.DIV_BY_ZERO);

            const field4 = StringValueObject.create('test');
            const result4 = testFunction.calculate(database, field4, criteria);
            expect(getObjectValue(result4)).toStrictEqual(ErrorType.VALUE);

            const field5 = ErrorValueObject.create(ErrorType.NAME);
            const result5 = testFunction.calculate(database, field5, criteria);
            expect(getObjectValue(result5)).toStrictEqual(ErrorType.NAME);

            const field6 = ArrayValueObject.create('{1,2,3}');
            const result6 = testFunction.calculate(database, field6, criteria);
            expect(getObjectValue(result6)).toStrictEqual(ErrorType.VALUE);
        });

        it('Criteria value test', () => {
            const database = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    ['树种', '高度', '年数', '产量', '利润'],
                    ['苹果树', 18, 20, 14, 105],
                    ['梨树', 1.2, 1.2, 10, 96],
                    ['樱桃树', 1.3, 14, 9, 105],
                    ['苹果树', 14, 15, 10, 75],
                    ['梨树', 9, 8, 8, 76.8],
                    ['苹果树', 8, 9, 6, 45],
                ]),
                rowCount: 7,
                columnCount: 5,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const field = StringValueObject.create('产量');
            const criteria = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [null, null],
                    [null, null],
                ]),
                rowCount: 2,
                columnCount: 2,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const result = testFunction.calculate(database, field, criteria);
            expect(getObjectValue(result)).toStrictEqual(5.916666666666667);

            const criteria2 = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    ['树种', '高度'],
                ]),
                rowCount: 1,
                columnCount: 2,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const result2 = testFunction.calculate(database, field, criteria2);
            expect(getObjectValue(result2)).toStrictEqual(ErrorType.VALUE);

            const criteria3 = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [null, '高度'],
                    [true, false],
                ]),
                rowCount: 2,
                columnCount: 2,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const result3 = testFunction.calculate(database, field, criteria3);
            expect(getObjectValue(result3)).toStrictEqual(ErrorType.DIV_BY_ZERO);

            const criteria4 = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [null, '高度'],
                    [true, null],
                    [null, false],
                ]),
                rowCount: 3,
                columnCount: 2,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const result4 = testFunction.calculate(database, field, criteria4);
            expect(getObjectValue(result4)).toStrictEqual(5.916666666666667);
        });
    });
});

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
import { NumberValueObject, StringValueObject } from '../../../../engine/value-object/primitive-object';
import { getObjectValue } from '../../../__tests__/create-function-test-bed';
import { FUNCTION_NAMES_TEXT } from '../../function-names';
import { Lenb } from '../index';

describe('Test lenb function', () => {
    const testFunction = new Lenb(FUNCTION_NAMES_TEXT.LENB);

    describe('Lenb', () => {
        it('Value is normal', () => {
            const text = StringValueObject.create('Univer');
            const result = testFunction.calculate(text);
            expect(getObjectValue(result)).toStrictEqual(6);
        });

        it('Text value is array', () => {
            const text = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [1, ' ', 1.23, true, false, null, 'Univer表格シート繁體한국인'],
                    [0, '100', '2.34', 'test', -3, ErrorType.NAME, null],
                ]),
                rowCount: 2,
                columnCount: 7,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const result = testFunction.calculate(text);
            expect(getObjectValue(result)).toStrictEqual([
                [1, 1, 4, 4, 5, 0, 26],
                [1, 3, 4, 4, 2, ErrorType.NAME, 0],
            ]);

            const text2 = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    ['2012-2-2'],
                ]),
                rowCount: 1,
                columnCount: 1,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const result2 = testFunction.calculate(text2);
            expect(getObjectValue(result2)).toStrictEqual(8);
        });

        it('Text1 is array with emoji', () => {
            const text = new ArrayValueObject({
                calculateValueList: transformToValueObject([
                    ['u'],
                    [1],
                    ['ß'],
                    ['é'],
                    ['ع'],
                    ['汉'],
                    ['漢'],
                    ['😊'],
                    ['𐌸'],
                    ['👨‍👩‍👧'],
                    ['𓀀'],
                    ['𐌰'],
                    ['♚'],
                    [''],
                ]),
                rowCount: 13,
                columnCount: 1,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const result = testFunction.calculate(text);
            expect(getObjectValue(result)).toStrictEqual([
                [1],
                [1],
                [1],
                [1],
                [2],
                [2],
                [2],
                [4],
                [4],
                [16],
                [4],
                [4],
                [2],
            ]);
        });

        it('More test', () => {
            const text = StringValueObject.create(',。、；:{}');
            const result = testFunction.calculate(text);
            expect(getObjectValue(result)).toStrictEqual(10);

            const text2 = StringValueObject.create('Hello中文o😊Wo😊rld');
            const result2 = testFunction.calculate(text2);
            expect(getObjectValue(result2)).toStrictEqual(23);

            const text3 = NumberValueObject.create(0.01, '0%');
            const result3 = testFunction.calculate(text3);
            expect(getObjectValue(result3)).toStrictEqual(2);

            // eslint-disable-next-line
            const text4 = NumberValueObject.create(1.22222222222222222);
            const result4 = testFunction.calculate(text4);
            expect(getObjectValue(result4)).toStrictEqual(13);
        });
    });
});

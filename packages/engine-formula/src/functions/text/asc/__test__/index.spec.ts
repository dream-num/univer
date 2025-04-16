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
import { StringValueObject } from '../../../../engine/value-object/primitive-object';
import { getObjectValue } from '../../../__tests__/create-function-test-bed';
import { FUNCTION_NAMES_TEXT } from '../../function-names';
import { Asc } from '../index';

describe('Test asc function', () => {
    const testFunction = new Asc(FUNCTION_NAMES_TEXT.ASC);

    describe('Asc', () => {
        it('Value is normal', () => {
            const text = StringValueObject.create('ａｂｃ');
            const result = testFunction.calculate(text);
            expect(getObjectValue(result)).toStrictEqual('abc');
        });

        it('Value is array', () => {
            const text = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [1, '　', 1.23, true, false, null, 'Univer表格シート繁體한국인'],
                    [0, '１００', 'ａｂｃ', 'ｔｅｓｔ', -3, ErrorType.NAME, null],
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
                [1, ' ', 1.23, true, false, 0, 'Univer表格シート繁體한국인'],
                [0, '100', 'abc', 'test', -3, ErrorType.NAME, 0],
            ]);

            const text2 = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    ['ｕｎｉｖｅｒ'],
                ]),
                rowCount: 1,
                columnCount: 1,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const result2 = testFunction.calculate(text2);
            expect(getObjectValue(result2)).toStrictEqual('univer');
        });

        it('More test', () => {
            const text = StringValueObject.create('！＠＃￥%＾&*()＿-+=');
            const result = testFunction.calculate(text);
            expect(getObjectValue(result)).toStrictEqual('!@#￥%^&*()_-+=');
        });
    });
});

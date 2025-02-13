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
import { FUNCTION_NAMES_TEXT } from '../../function-names';
import { Textjoin } from '../index';

describe('Test textjoin function', () => {
    const testFunction = new Textjoin(FUNCTION_NAMES_TEXT.TEXTJOIN);

    describe('Textjoin', () => {
        it('Value is normal', () => {
            const delimiter = StringValueObject.create(', ');
            const ignoreEmpty = BooleanValueObject.create(true);
            const text1 = StringValueObject.create('Hi');
            const text2 = StringValueObject.create('Univer');
            const result = testFunction.calculate(delimiter, ignoreEmpty, text1, text2);
            expect(getObjectValue(result)).toStrictEqual('Hi, Univer');
        });

        it('Delimiter value test', () => {
            const delimiter = NullValueObject.create();
            const ignoreEmpty = BooleanValueObject.create(true);
            const text1 = StringValueObject.create('Hi');
            const text2 = StringValueObject.create('Univer');
            const result = testFunction.calculate(delimiter, ignoreEmpty, text1, text2);
            expect(getObjectValue(result)).toStrictEqual('HiUniver');

            const delimiter2 = BooleanValueObject.create(true);
            const result2 = testFunction.calculate(delimiter2, ignoreEmpty, text1, text2);
            expect(getObjectValue(result2)).toStrictEqual('HiTRUEUniver');

            const delimiter3 = ErrorValueObject.create(ErrorType.NAME);
            const result3 = testFunction.calculate(delimiter3, ignoreEmpty, text1, text2);
            expect(getObjectValue(result3)).toStrictEqual(ErrorType.NAME);

            const delimiter4 = ArrayValueObject.create('{"~","."}');
            const text3 = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    ['Hi', 'Univer'],
                    [null, 'test'],
                ]),
                rowCount: 2,
                columnCount: 2,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const result4 = testFunction.calculate(delimiter4, ignoreEmpty, text3);
            expect(getObjectValue(result4)).toStrictEqual('Hi~Univer.test');
        });

        it('IgnoreEmpty value test', () => {
            const delimiter = StringValueObject.create(', ');
            const ignoreEmpty = NullValueObject.create();
            const text = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    ['Hi', 'Univer'],
                    [null, 'test'],
                ]),
                rowCount: 2,
                columnCount: 2,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const result = testFunction.calculate(delimiter, ignoreEmpty, text);
            expect(getObjectValue(result)).toStrictEqual('Hi, Univer, , test');

            const ignoreEmpty2 = NumberValueObject.create(2);
            const result2 = testFunction.calculate(delimiter, ignoreEmpty2, text);
            expect(getObjectValue(result2)).toStrictEqual('Hi, Univer, test');

            const ignoreEmpty3 = StringValueObject.create('test');
            const result3 = testFunction.calculate(delimiter, ignoreEmpty3, text);
            expect(getObjectValue(result3)).toStrictEqual(ErrorType.VALUE);

            const ignoreEmpty4 = ErrorValueObject.create(ErrorType.NAME);
            const result4 = testFunction.calculate(delimiter, ignoreEmpty4, text);
            expect(getObjectValue(result4)).toStrictEqual(ErrorType.NAME);

            const ignoreEmpty5 = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [true, false],
                ]),
                rowCount: 1,
                columnCount: 2,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const result5 = testFunction.calculate(delimiter, ignoreEmpty5, text);
            expect(getObjectValue(result5)).toStrictEqual([
                ['Hi, Univer, test', 'Hi, Univer, , test'],
            ]);

            const ignoreEmpty6 = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [3],
                ]),
                rowCount: 1,
                columnCount: 1,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const result6 = testFunction.calculate(delimiter, ignoreEmpty6, text);
            expect(getObjectValue(result6)).toStrictEqual('Hi, Univer, test');
        });

        it('Text value test', () => {
            const delimiter = StringValueObject.create(', ');
            const ignoreEmpty = BooleanValueObject.create(true);
            const text = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    ['Hi', 'Univer', true],
                    [null, 'test', false],
                ]),
                rowCount: 2,
                columnCount: 3,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const result = testFunction.calculate(delimiter, ignoreEmpty, text);
            expect(getObjectValue(result)).toStrictEqual('Hi, Univer, TRUE, test, FALSE');

            const text2 = ErrorValueObject.create(ErrorType.NAME);
            const result2 = testFunction.calculate(delimiter, ignoreEmpty, text, text2);
            expect(getObjectValue(result2)).toStrictEqual(ErrorType.NAME);
        });

        it('More test', () => {
            const delimiter = StringValueObject.create('');
            const ignoreEmpty = StringValueObject.create('true');
            const text1 = StringValueObject.create('1');
            const text2 = StringValueObject.create('2');
            const result = testFunction.calculate(delimiter, ignoreEmpty, text1, text2);
            expect(getObjectValue(result)).toStrictEqual('12');

            const ignoreEmpty2 = StringValueObject.create('false');
            const result2 = testFunction.calculate(delimiter, ignoreEmpty2, text1, text2);
            expect(getObjectValue(result2)).toStrictEqual('12');
        });
    });
});

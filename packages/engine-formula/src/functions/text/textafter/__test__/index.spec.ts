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
import { NullValueObject, NumberValueObject, StringValueObject } from '../../../../engine/value-object/primitive-object';
import { getObjectValue } from '../../../__tests__/create-function-test-bed';
import { FUNCTION_NAMES_TEXT } from '../../function-names';
import { Textafter } from '../index';

describe('Test textafter function', () => {
    const testFunction = new Textafter(FUNCTION_NAMES_TEXT.TEXTAFTER);

    describe('Textafter', () => {
        it('value is normal', () => {
            const text = StringValueObject.create('***TRUETRUEFALSE');
            const delimiter = StringValueObject.create('T');
            const result = testFunction.calculate(text, delimiter);
            expect(getObjectValue(result)).toBe('RUETRUEFALSE');
        });

        it('delimiter value is empty string', () => {
            const text = StringValueObject.create('***TRUETRUEFALSE');
            const delimiter = StringValueObject.create('');
            const instanceNum = NumberValueObject.create(1);
            const result = testFunction.calculate(text, delimiter, instanceNum);
            expect(getObjectValue(result)).toBe('***TRUETRUEFALSE');

            const instanceNum2 = NumberValueObject.create(-1);
            const result2 = testFunction.calculate(text, delimiter, instanceNum2);
            expect(getObjectValue(result2)).toBe('');

            const delimiter2 = ErrorValueObject.create(ErrorType.NAME);
            const result3 = testFunction.calculate(text, delimiter2, instanceNum);
            expect(getObjectValue(result3)).toBe(ErrorType.NAME);

            const delimiter3 = StringValueObject.create('TTTTTTTTTTTTTTTTTTTTT');
            const result4 = testFunction.calculate(text, delimiter3, instanceNum);
            expect(getObjectValue(result4)).toBe(ErrorType.NA);
        });

        it('instanceNum value test', () => {
            const text = StringValueObject.create('***TRUETRUEFALSE');
            const delimiter = StringValueObject.create('T');
            const instanceNum = NumberValueObject.create(1);
            const result = testFunction.calculate(text, delimiter, instanceNum);
            expect(getObjectValue(result)).toBe('RUETRUEFALSE');

            const instanceNum2 = NumberValueObject.create(2);
            const result2 = testFunction.calculate(text, delimiter, instanceNum2);
            expect(getObjectValue(result2)).toBe('RUEFALSE');

            const instanceNum3 = NumberValueObject.create(3);
            const result3 = testFunction.calculate(text, delimiter, instanceNum3);
            expect(getObjectValue(result3)).toBe(ErrorType.NA);

            const instanceNum4 = NumberValueObject.create(17);
            const result4 = testFunction.calculate(text, delimiter, instanceNum4);
            expect(getObjectValue(result4)).toBe(ErrorType.VALUE);

            const instanceNum5 = ErrorValueObject.create(ErrorType.NAME);
            const result5 = testFunction.calculate(text, delimiter, instanceNum5);
            expect(getObjectValue(result5)).toBe(ErrorType.NAME);

            const instanceNum6 = StringValueObject.create('test');
            const result6 = testFunction.calculate(text, delimiter, instanceNum6);
            expect(getObjectValue(result6)).toBe(ErrorType.VALUE);

            const instanceNum7 = NullValueObject.create();
            const result7 = testFunction.calculate(text, delimiter, instanceNum7);
            expect(getObjectValue(result7)).toBe('RUETRUEFALSE');
        });

        it('matchMode value 0 or 1', () => {
            const text = StringValueObject.create('***TRUETRUEFALSE');
            const delimiter = StringValueObject.create('t');
            const instanceNum = NumberValueObject.create(1);
            const matchMode = NumberValueObject.create(-1);
            const result = testFunction.calculate(text, delimiter, instanceNum, matchMode);
            expect(getObjectValue(result)).toBe(ErrorType.VALUE);

            const matchMode2 = NumberValueObject.create(0);
            const result2 = testFunction.calculate(text, delimiter, instanceNum, matchMode2);
            expect(getObjectValue(result2)).toBe(ErrorType.NA);

            const matchMode3 = NumberValueObject.create(1);
            const result3 = testFunction.calculate(text, delimiter, instanceNum, matchMode3);
            expect(getObjectValue(result3)).toBe('RUETRUEFALSE');
        });

        it('matchEnd value 0 or 1', () => {
            const text = StringValueObject.create('***TRUETRUEFALSE');
            const delimiter = StringValueObject.create('t');
            const instanceNum = NumberValueObject.create(3);
            const matchMode = NumberValueObject.create(1);
            const matchEnd = NumberValueObject.create(0);
            const result = testFunction.calculate(text, delimiter, instanceNum, matchMode, matchEnd);
            expect(getObjectValue(result)).toBe(ErrorType.NA);

            const matchEnd2 = NumberValueObject.create(1);
            const result2 = testFunction.calculate(text, delimiter, instanceNum, matchMode, matchEnd2);
            expect(getObjectValue(result2)).toBe('');

            const instanceNum3 = NumberValueObject.create(-3);
            const result3 = testFunction.calculate(text, delimiter, instanceNum3, matchMode, matchEnd2);
            expect(getObjectValue(result3)).toBe('***TRUETRUEFALSE');
        });

        it('ifNotFound value test', () => {
            const text = StringValueObject.create('***TRUETRUEFALSE');
            const delimiter = StringValueObject.create('t');
            const instanceNum = NumberValueObject.create(3);
            const matchMode = NumberValueObject.create(1);
            const matchEnd = NumberValueObject.create(0);
            const ifNotFound = StringValueObject.create('not found');
            const result = testFunction.calculate(text, delimiter, instanceNum, matchMode, matchEnd, ifNotFound);
            expect(getObjectValue(result)).toBe('not found');
        });

        it('Value is array', () => {
            const text = new ArrayValueObject({
                calculateValueList: transformToValueObject([
                    [1, true, false, null, '***TRUETRUEFALSE'],
                ]),
                rowCount: 1,
                columnCount: 5,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const delimiter = StringValueObject.create('t');
            const instanceNum = NumberValueObject.create(1);
            const matchMode = new ArrayValueObject({
                calculateValueList: transformToValueObject([
                    [0],
                    [1],
                ]),
                rowCount: 2,
                columnCount: 1,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            }); ;
            const matchEnd = NumberValueObject.create(0);
            const ifNotFound = StringValueObject.create('not found');
            const result = testFunction.calculate(text, delimiter, instanceNum, matchMode, matchEnd, ifNotFound);
            expect(getObjectValue(result)).toStrictEqual([
                ['not found', 'not found', 'not found', ErrorType.VALUE, 'not found'],
                ['not found', 'RUE', 'not found', ErrorType.VALUE, 'RUETRUEFALSE'],
            ]);
        });

        it('More test', () => {
            let text = StringValueObject.create('150克*8袋');
            let delimiter = StringValueObject.create('*');
            let result = testFunction.calculate(text, delimiter);
            expect(getObjectValue(result)).toBe('8袋');

            text = StringValueObject.create('150克#8袋');
            delimiter = StringValueObject.create('#');
            result = testFunction.calculate(text, delimiter);
            expect(getObjectValue(result)).toBe('8袋');

            text = StringValueObject.create('150克&8袋');
            delimiter = StringValueObject.create('&');
            result = testFunction.calculate(text, delimiter);
            expect(getObjectValue(result)).toBe('8袋');

            text = StringValueObject.create('150克@8袋');
            delimiter = StringValueObject.create('@');
            result = testFunction.calculate(text, delimiter);
            expect(getObjectValue(result)).toBe('8袋');

            text = StringValueObject.create('150克.8袋');
            delimiter = StringValueObject.create('.');
            result = testFunction.calculate(text, delimiter);
            expect(getObjectValue(result)).toBe('8袋');

            const text2 = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    ['150克*@*8袋'],
                    ['150克@*8袋'],
                    ['150克#8袋'],
                ]),
                rowCount: 3,
                columnCount: 1,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const delimiter2 = ArrayValueObject.create('{"*","@","#"}');
            result = testFunction.calculate(text2, delimiter2);
            expect(getObjectValue(result)).toStrictEqual([
                ['@*8袋'],
                ['*8袋'],
                ['8袋'],
            ]);

            const instanceNum = NumberValueObject.create(-1);
            result = testFunction.calculate(text2, delimiter2, instanceNum);
            expect(getObjectValue(result)).toStrictEqual([
                ['8袋'],
                ['8袋'],
                ['8袋'],
            ]);

            const delimiter3 = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [null, '袋', '粒', '瓶', ErrorType.NAME],
                ]),
                rowCount: 1,
                columnCount: 5,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            result = testFunction.calculate(text2, delimiter3);
            expect(getObjectValue(result)).toStrictEqual([
                [ErrorType.NAME],
                [ErrorType.NAME],
                [ErrorType.NAME],
            ]);
        });
    });
});

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
import { NumberValueObject } from '../../../../engine/value-object/primitive-object';
import { getObjectValue } from '../../../util';
import { Code } from '../../code';
import { FUNCTION_NAMES_TEXT } from '../../function-names';
import { Char } from '../index';

describe('Test char function', () => {
    const testFunction = new Char(FUNCTION_NAMES_TEXT.CHAR);

    describe('Char', () => {
        it('Value is normal', () => {
            const number = NumberValueObject.create(123.45);
            const result = testFunction.calculate(number);
            expect(getObjectValue(result)).toStrictEqual('{');
        });

        it('Number is negative', () => {
            const number = NumberValueObject.create(-2.34);
            const result = testFunction.calculate(number);
            expect(getObjectValue(result)).toStrictEqual(ErrorType.VALUE);
        });

        it('Number is a code point above U+FFFF', () => {
            // Google Sheets' CHAR accepts full code points; CHAR and UNICHAR behave the same there.
            expect(getObjectValue(testFunction.calculate(NumberValueObject.create(128512)))).toStrictEqual('\u{1F600}');
            expect(getObjectValue(testFunction.calculate(NumberValueObject.create(65601)))).toStrictEqual('\u{10041}');
        });

        it('Number is between 128 and 159', () => {
            // Unicode code points, not the Windows-1252 code page: CHAR(128) is U+0080, not the euro sign.
            expect(getObjectValue(testFunction.calculate(NumberValueObject.create(128)))).toStrictEqual('\u0080');
            expect(getObjectValue(testFunction.calculate(NumberValueObject.create(150)))).toStrictEqual('\u0096');
        });

        it('Number is a surrogate or non-character code point', () => {
            for (const codePoint of [55296, 57343, 64976, 65535, 1114111]) {
                expect(getObjectValue(testFunction.calculate(NumberValueObject.create(codePoint)))).toStrictEqual(ErrorType.NA);
            }
        });

        it('Number is above the last code point', () => {
            expect(getObjectValue(testFunction.calculate(NumberValueObject.create(1114112)))).toStrictEqual(ErrorType.VALUE);
            expect(getObjectValue(testFunction.calculate(NumberValueObject.create(1234567890)))).toStrictEqual(ErrorType.VALUE);
        });

        it('Round trips with CODE', () => {
            const code = new Code(FUNCTION_NAMES_TEXT.CODE);

            for (const codePoint of [65, 256, 8364, 65601, 128512]) {
                const character = testFunction.calculate(NumberValueObject.create(codePoint));
                expect(getObjectValue(code.calculate(character))).toStrictEqual(codePoint);
            }
        });

        it('Value is array', () => {
            const number = ArrayValueObject.create({
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
            const result = testFunction.calculate(number);
            expect(getObjectValue(result)).toStrictEqual([
                ['', ErrorType.VALUE, '', '', ErrorType.VALUE, ErrorType.VALUE],
                [ErrorType.VALUE, 'd', '', ErrorType.VALUE, ErrorType.VALUE, ErrorType.NAME],
            ]);

            const number2 = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [1234567890],
                ]),
                rowCount: 1,
                columnCount: 1,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const result2 = testFunction.calculate(number2);
            expect(getObjectValue(result2)).toStrictEqual(ErrorType.VALUE);

            const number3 = NumberValueObject.create(28);
            const result3 = testFunction.calculate(number3);
            expect(getObjectValue(result3)).toStrictEqual('');
        });
    });
});

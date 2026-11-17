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
import { FUNCTION_NAMES_TEXT } from '../../function-names';
import { Unicode } from '../../unicode';
import { Unichar } from '../index';

describe('Test unichar function', () => {
    const testFunction = new Unichar(FUNCTION_NAMES_TEXT.UNICHAR);

    describe('Unichar', () => {
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

        it('Number is big number', () => {
            const number = NumberValueObject.create(1114111);
            const result = testFunction.calculate(number);
            expect(getObjectValue(result)).toStrictEqual(ErrorType.NA);

            const number2 = NumberValueObject.create(1114112);
            const result2 = testFunction.calculate(number2);
            expect(getObjectValue(result2)).toStrictEqual(ErrorType.VALUE);
        });

        it('Number is a code point above U+FFFF', () => {
            // Excel 2016+ and Google Sheets (executed 2026-08-29) return the supplementary-plane character.
            expect(getObjectValue(testFunction.calculate(NumberValueObject.create(128512)))).toStrictEqual('\u{1F600}');
            expect(getObjectValue(testFunction.calculate(NumberValueObject.create(65601)))).toStrictEqual('\u{10041}');
        });

        it('Number is a surrogate code point', () => {
            // Excel documents #N/A for partial surrogates.
            expect(getObjectValue(testFunction.calculate(NumberValueObject.create(55296)))).toStrictEqual(ErrorType.NA);
            expect(getObjectValue(testFunction.calculate(NumberValueObject.create(57343)))).toStrictEqual(ErrorType.NA);
        });

        it('Number is a non-character code point', () => {
            // Excel 2024 (build 20026), verified 2026-06-23: #N/A for Unicode noncharacters.
            const nonCharacters = [0xFDD0, 0xFDEF, 0xFFFE, 0xFFFF, 0x10FFFE, 0x10FFFF];

            nonCharacters.forEach((codePoint) => {
                expect(getObjectValue(testFunction.calculate(NumberValueObject.create(codePoint)))).toStrictEqual(ErrorType.NA);
            });

            expect(getObjectValue(testFunction.calculate(NumberValueObject.create(0x10FFFD)))).toStrictEqual('\u{10FFFD}');
        });

        it('Round trips a code point above U+FFFF through UNICODE', () => {
            const unicode = new Unicode(FUNCTION_NAMES_TEXT.UNICODE);
            const character = testFunction.calculate(NumberValueObject.create(128512));

            expect(getObjectValue(unicode.calculate(character))).toStrictEqual(128512);
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
        });
    });
});

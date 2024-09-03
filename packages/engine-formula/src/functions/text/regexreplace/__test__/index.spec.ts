/**
 * Copyright 2023-present DreamNum Inc.
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

import { FUNCTION_NAMES_TEXT } from '../../function-names';
import { Regexreplace } from '../index';
import { BooleanValueObject, NullValueObject, StringValueObject } from '../../../../engine/value-object/primitive-object';
import { ArrayValueObject, transformToValueObject } from '../../../../engine/value-object/array-value-object';
import { ErrorType } from '../../../../basics/error-type';
import { ErrorValueObject } from '../../../../engine/value-object/base-value-object';

describe('Test regexreplace function', () => {
    const testFunction = new Regexreplace(FUNCTION_NAMES_TEXT.REGEXREPLACE);

    describe('Regexreplace', () => {
        it('Value is normal', () => {
            const text = StringValueObject.create('abcdefg');
            const regularExpression = StringValueObject.create('c.*f');
            const replacement = StringValueObject.create('xyz');
            const result = testFunction.calculate(text, regularExpression, replacement);
            expect(result.getValue()).toStrictEqual('abxyzg');
        });

        it('RegularExpression is maybe backtrace', () => {
            const text = StringValueObject.create('https://www.example.com');
            const regularExpression = StringValueObject.create('^(https?://)?([a-z0-9.-]+).*');
            const replacement = StringValueObject.create('xyz');
            const result = testFunction.calculate(text, regularExpression, replacement);
            expect(result.getValue()).toStrictEqual(ErrorType.REF);
        });

        it('Value is boolean', () => {
            const text = BooleanValueObject.create(true);
            const regularExpression = StringValueObject.create('c.*f');
            const replacement = StringValueObject.create('xyz');
            const result = testFunction.calculate(text, regularExpression, replacement);
            expect(result.getValue()).toStrictEqual('TRUE');

            const text2 = StringValueObject.create('abcdefg');
            const regularExpression2 = BooleanValueObject.create(true);
            const result2 = testFunction.calculate(text2, regularExpression2, replacement);
            expect(result2.getValue()).toStrictEqual('abcdefg');

            const replacement2 = BooleanValueObject.create(true);
            const result3 = testFunction.calculate(text2, regularExpression, replacement2);
            expect(result3.getValue()).toStrictEqual('abTRUEg');
        });

        it('Value is blank cell', () => {
            const text = StringValueObject.create('abcdefg');
            const regularExpression = NullValueObject.create();
            const replacement = StringValueObject.create('xyz');
            const result = testFunction.calculate(text, regularExpression, replacement);
            expect(result.getValue()).toStrictEqual('xyzaxyzbxyzcxyzdxyzexyzfxyzgxyz');

            const text2 = NullValueObject.create();
            const regularExpression2 = StringValueObject.create('c.*f');
            const result2 = testFunction.calculate(text2, regularExpression2, replacement);
            expect(result2.getValue()).toStrictEqual('');

            const replacement2 = NullValueObject.create();
            const result3 = testFunction.calculate(text, regularExpression2, replacement2);
            expect(result3.getValue()).toStrictEqual('abg');
        });

        it('Value is error', () => {
            const text = StringValueObject.create('abcdefg');
            const regularExpression = ErrorValueObject.create(ErrorType.NAME);
            const replacement = StringValueObject.create('xyz');
            const result = testFunction.calculate(text, regularExpression, replacement);
            expect(result.getValue()).toStrictEqual(ErrorType.NAME);
        });

        it('Value is array', () => {
            const text = ArrayValueObject.create({
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
            const regularExpression = StringValueObject.create('c.*f');
            const replacement = StringValueObject.create('xyz');
            const result = testFunction.calculate(text, regularExpression, replacement);
            expect(result.getValue()).toStrictEqual(ErrorType.VALUE);
        });
    });
});

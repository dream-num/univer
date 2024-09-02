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
import { Regexmatch } from '../index';
import { BooleanValueObject, NullValueObject, StringValueObject } from '../../../../engine/value-object/primitive-object';
import { ArrayValueObject, transformToValueObject } from '../../../../engine/value-object/array-value-object';
import { ErrorType } from '../../../../basics/error-type';
import { ErrorValueObject } from '../../../../engine/value-object/base-value-object';

describe('Test regexmatch function', () => {
    const testFunction = new Regexmatch(FUNCTION_NAMES_TEXT.REGEXMATCH);

    describe('Regexmatch', () => {
        it('Value is normal', () => {
            const text = StringValueObject.create('abcdefg');
            const regularExpression = StringValueObject.create('c.*f');
            const result = testFunction.calculate(text, regularExpression);
            expect(result.getValue()).toStrictEqual(true);
        });

        it('Value is boolean', () => {
            const text = BooleanValueObject.create(true);
            const regularExpression = StringValueObject.create('c.*f');
            const result = testFunction.calculate(text, regularExpression);
            expect(result.getValue()).toStrictEqual(false);

            const text2 = StringValueObject.create('abcdefg');
            const regularExpression2 = BooleanValueObject.create(true);
            const result2 = testFunction.calculate(text2, regularExpression2);
            expect(result2.getValue()).toStrictEqual(false);
        });

        it('Value is blank cell', () => {
            const text = StringValueObject.create('abcdefg');
            const regularExpression = NullValueObject.create();
            const result = testFunction.calculate(text, regularExpression);
            expect(result.getValue()).toStrictEqual(true);

            const text2 = NullValueObject.create();
            const regularExpression2 = StringValueObject.create('c.*f');
            const result2 = testFunction.calculate(text2, regularExpression2);
            expect(result2.getValue()).toStrictEqual(false);
        });

        it('Value is error', () => {
            const text = StringValueObject.create('abcdefg');
            const regularExpression = ErrorValueObject.create(ErrorType.NAME);
            const result = testFunction.calculate(text, regularExpression);
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
            const result = testFunction.calculate(text, regularExpression);
            expect(result.getValue()).toStrictEqual(ErrorType.VALUE);
        });
    });
});

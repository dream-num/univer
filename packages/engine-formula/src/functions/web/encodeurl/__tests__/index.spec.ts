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
import { FUNCTION_NAMES_WEB } from '../../function-names';
import { Encodeurl } from '../index';

describe('Test encodeurl function', () => {
    const testFunction = new Encodeurl(FUNCTION_NAMES_WEB.ENCODEURL);

    describe('Encodeurl', () => {
        it('value is normal', () => {
            const text = StringValueObject.create('https://univer.ai/');
            const result = testFunction.calculate(text);
            expect(getObjectValue(result)).toBe('https%3A%2F%2Funiver.ai%2F');
        });

        it('value is number', () => {
            const text = NumberValueObject.create(1);
            const result = testFunction.calculate(text);
            expect(getObjectValue(result)).toBe('1');
        });

        it('value is blank cell', () => {
            const text = NullValueObject.create();
            const result = testFunction.calculate(text);
            expect(getObjectValue(result)).toBe('');
        });

        it('value is boolean', () => {
            const text = BooleanValueObject.create(true);
            const result = testFunction.calculate(text);
            expect(getObjectValue(result)).toBe('TRUE');
        });

        it('value is error', () => {
            const text = ErrorValueObject.create(ErrorType.NAME);
            const result = testFunction.calculate(text);
            expect(getObjectValue(result)).toBe(ErrorType.NAME);
        });

        it('value array', () => {
            const text = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [1, 2],
                ]),
                rowCount: 1,
                columnCount: 2,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const result = testFunction.calculate(text);
            expect(getObjectValue(result)).toStrictEqual([
                ['1', '2'],
            ]);

            const text2 = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    ['hello, world!'],
                ]),
                rowCount: 1,
                columnCount: 1,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const result2 = testFunction.calculate(text2);
            expect(getObjectValue(result2)).toBe('hello%2C%20world%21');
        });
    });
});

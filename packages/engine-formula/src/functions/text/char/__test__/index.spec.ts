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

import { ErrorType } from '../../../../basics/error-type';
import { ArrayValueObject, transformToValueObject } from '../../../../engine/value-object/array-value-object';
import { NumberValueObject } from '../../../../engine/value-object/primitive-object';
import { getObjectValue } from '../../../__tests__/create-function-test-bed';
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
            expect(getObjectValue(result2)).toStrictEqual('˒');

            const number3 = NumberValueObject.create(28);
            const result3 = testFunction.calculate(number3);
            expect(getObjectValue(result3)).toStrictEqual('');
        });
    });
});

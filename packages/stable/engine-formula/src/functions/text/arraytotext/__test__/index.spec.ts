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
import { NullValueObject, NumberValueObject } from '../../../../engine/value-object/primitive-object';
import { getObjectValue } from '../../../__tests__/create-function-test-bed';
import { FUNCTION_NAMES_TEXT } from '../../function-names';
import { Arraytotext } from '../index';

describe('Test arraytotext function', () => {
    const testFunction = new Arraytotext(FUNCTION_NAMES_TEXT.ARRAYTOTEXT);

    describe('Arraytotext', () => {
        it('Value is normal', () => {
            const array = ArrayValueObject.create({
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
            const format = NullValueObject.create();
            const result = testFunction.calculate(array, format);
            expect(getObjectValue(result)).toStrictEqual('1,  , 1.23, TRUE, FALSE, , 0, 100, 2.34, test, -3, #NAME?');
        });

        it('Format value test', () => {
            const array = ArrayValueObject.create({
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
            const format = NumberValueObject.create(1);
            const result = testFunction.calculate(array, format);
            expect(getObjectValue(result)).toStrictEqual('{1," ",1.23,TRUE,FALSE,;0,100,2.34,"test",-3,#NAME?}');

            const format2 = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [1],
                ]),
                rowCount: 1,
                columnCount: 1,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const result2 = testFunction.calculate(array, format2);
            expect(getObjectValue(result2)).toStrictEqual('{1," ",1.23,TRUE,FALSE,;0,100,2.34,"test",-3,#NAME?}');

            const format3 = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [1],
                    [true],
                    [false],
                    [null],
                    [ErrorType.NAME],
                ]),
                rowCount: 5,
                columnCount: 1,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const result3 = testFunction.calculate(array, format3);
            expect(getObjectValue(result3)).toStrictEqual([
                ['{1," ",1.23,TRUE,FALSE,;0,100,2.34,"test",-3,#NAME?}'],
                ['{1," ",1.23,TRUE,FALSE,;0,100,2.34,"test",-3,#NAME?}'],
                ['1,  , 1.23, TRUE, FALSE, , 0, 100, 2.34, test, -3, #NAME?'],
                ['1,  , 1.23, TRUE, FALSE, , 0, 100, 2.34, test, -3, #NAME?'],
                [ErrorType.NAME],
            ]);
        });

        it('Value is error', () => {
            const array = ErrorValueObject.create(ErrorType.NAME);
            const format = NullValueObject.create();
            const result = testFunction.calculate(array, format);
            expect(getObjectValue(result)).toStrictEqual(ErrorType.NAME);

            const array2 = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [ErrorType.NAME],
                ]),
                rowCount: 1,
                columnCount: 1,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const result2 = testFunction.calculate(array2, format);
            expect(getObjectValue(result2)).toStrictEqual(ErrorType.NAME);
        });
    });
});

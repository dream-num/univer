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
import { T } from '../index';

describe('Test t function', () => {
    const testFunction = new T(FUNCTION_NAMES_TEXT.T);

    describe('T', () => {
        it('Value is normal', () => {
            const value = StringValueObject.create('Univer');
            const result = testFunction.calculate(value);
            expect(getObjectValue(result)).toStrictEqual('Univer');
        });

        it('Value is number or boolean or null or error', () => {
            const value = NumberValueObject.create(123);
            const result = testFunction.calculate(value);
            expect(getObjectValue(result)).toStrictEqual('');

            const value2 = BooleanValueObject.create(true);
            const result2 = testFunction.calculate(value2);
            expect(getObjectValue(result2)).toStrictEqual('');

            const value3 = NullValueObject.create();
            const result3 = testFunction.calculate(value3);
            expect(getObjectValue(result3)).toStrictEqual('');

            const value4 = ErrorValueObject.create(ErrorType.NAME);
            const result4 = testFunction.calculate(value4);
            expect(getObjectValue(result4)).toStrictEqual(ErrorType.NAME);
        });

        it('Value is array', () => {
            const value = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [1, ' ', '中文测试', true, false, null],
                    [0, '100', '2.34', '2-way street', -3, ErrorType.NAME],
                ]),
                rowCount: 2,
                columnCount: 6,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const result = testFunction.calculate(value);
            expect(getObjectValue(result)).toStrictEqual([
                ['', ' ', '中文测试', '', '', ''],
                ['', '', '', '2-way street', '', ErrorType.NAME],
            ]);
        });
    });
});

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
import { StringValueObject } from '../../../../engine/value-object/primitive-object';
import { getObjectValue } from '../../../__tests__/create-function-test-bed';
import { FUNCTION_NAMES_TEXT } from '../../function-names';
import { Upper } from '../index';

describe('Test upper function', () => {
    const testFunction = new Upper(FUNCTION_NAMES_TEXT.UPPER);

    describe('Upper', () => {
        it('Value is normal', () => {
            const text = StringValueObject.create('univer');
            const result = testFunction.calculate(text);
            expect(getObjectValue(result)).toStrictEqual('UNIVER');
        });

        it('Value is array', () => {
            const text = ArrayValueObject.create({
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
            const result = testFunction.calculate(text);
            expect(getObjectValue(result)).toStrictEqual([
                ['1', ' ', '中文测试', 'TRUE', 'FALSE', ''],
                ['0', '100', '2.34', '2-WAY STREET', '-3', ErrorType.NAME],
            ]);

            const text2 = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [' Hello Univer '],
                ]),
                rowCount: 1,
                columnCount: 1,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const result2 = testFunction.calculate(text2);
            expect(getObjectValue(result2)).toStrictEqual(' HELLO UNIVER ');
        });

        it('More test', () => {
            const text = StringValueObject.create(',。、；:{}');
            const result = testFunction.calculate(text);
            expect(getObjectValue(result)).toStrictEqual(',。、；:{}');

            const text2 = StringValueObject.create('Hello中文o😊Wo😊rld');
            const result2 = testFunction.calculate(text2);
            expect(getObjectValue(result2)).toStrictEqual('HELLO中文O😊WO😊RLD');
        });
    });
});

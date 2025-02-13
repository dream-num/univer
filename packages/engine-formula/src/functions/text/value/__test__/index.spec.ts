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
import { ArrayValueObject, transformToValueObject, ValueObjectFactory } from '../../../../engine/value-object/array-value-object';
import { StringValueObject } from '../../../../engine/value-object/primitive-object';
import { getObjectValue } from '../../../__tests__/create-function-test-bed';
import { FUNCTION_NAMES_TEXT } from '../../function-names';
import { Value } from '../index';

describe('Test value function', () => {
    const testFunction = new Value(FUNCTION_NAMES_TEXT.VALUE);

    describe('Value', () => {
        it('Value is normal', () => {
            const text = StringValueObject.create('123');
            const result = testFunction.calculate(text);
            expect(getObjectValue(result)).toStrictEqual(123);
        });

        it('Value is array', () => {
            const text = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [1, ' ', '中文', true, false, null],
                    [0, '100', '2.34', 'ÿ', -3, ErrorType.NAME],
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
                [1, ErrorType.VALUE, ErrorType.VALUE, ErrorType.VALUE, ErrorType.VALUE, 0],
                [0, 100, 2.34, ErrorType.VALUE, -3, ErrorType.NAME],
            ]);

            const text2 = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    ['2.34'],
                ]),
                rowCount: 1,
                columnCount: 1,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const result2 = testFunction.calculate(text2);
            expect(getObjectValue(result2)).toStrictEqual(2.34);
        });

        it('More test', () => {
            const text = ValueObjectFactory.create('20%');
            const result = testFunction.calculate(text);
            expect(getObjectValue(result)).toStrictEqual(0.2);

            const text2 = ValueObjectFactory.create('$1000');
            const result2 = testFunction.calculate(text2);
            expect(getObjectValue(result2)).toStrictEqual(1000);

            const text3 = ValueObjectFactory.create('16:48:00');
            const result3 = testFunction.calculate(text3);
            expect(getObjectValue(result3)).toStrictEqual(0.7);

            const text4 = ValueObjectFactory.create('2012-12-12');
            const result4 = testFunction.calculate(text4);
            expect(getObjectValue(result4)).toStrictEqual(41255);
        });
    });
});

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
import { Dollar } from '../index';

describe('Test dollar function', () => {
    const testFunction = new Dollar(FUNCTION_NAMES_TEXT.DOLLAR);

    describe('Dollar', () => {
        it('Value is normal', () => {
            const number = NumberValueObject.create(1234.567);
            const decimals = NullValueObject.create();
            const result = testFunction.calculate(number, decimals);
            expect(getObjectValue(result)).toStrictEqual('$1,234.57 ');
        });

        it('Value is negative', () => {
            const number = NumberValueObject.create(-1234.567);
            const decimals = NullValueObject.create();
            const result = testFunction.calculate(number, decimals);
            expect(getObjectValue(result)).toStrictEqual('($1,234.57)');
        });

        it('Decimals value test', () => {
            const number = NumberValueObject.create(1234.567);
            const decimals = NumberValueObject.create(-2);
            const result = testFunction.calculate(number, decimals);
            expect(getObjectValue(result)).toStrictEqual('$1,200 ');

            const decimals2 = NumberValueObject.create(-4);
            const result2 = testFunction.calculate(number, decimals2);
            expect(getObjectValue(result2)).toStrictEqual('$0 ');

            const decimals3 = NumberValueObject.create(4);
            const result3 = testFunction.calculate(number, decimals3);
            expect(getObjectValue(result3)).toStrictEqual('$1,234.5670 ');

            const decimals4 = NumberValueObject.create(128);
            const result4 = testFunction.calculate(number, decimals4);
            expect(getObjectValue(result4)).toStrictEqual(ErrorType.VALUE);

            const decimals5 = NumberValueObject.create(-10);
            const result5 = testFunction.calculate(number, decimals5);
            expect(getObjectValue(result5)).toStrictEqual('$0 ');
        });

        it('Value is normal string', () => {
            const number = StringValueObject.create('test');
            const decimals = NullValueObject.create();
            const result = testFunction.calculate(number, decimals);
            expect(getObjectValue(result)).toStrictEqual(ErrorType.VALUE);
        });

        it('Value is boolean', () => {
            const number = BooleanValueObject.create(true);
            const decimals = NullValueObject.create();
            const result = testFunction.calculate(number, decimals);
            expect(getObjectValue(result)).toStrictEqual('$1.00 ');
        });

        it('Value is error', () => {
            const number = NumberValueObject.create(1234.567);
            const decimals = ErrorValueObject.create(ErrorType.NAME);
            const result = testFunction.calculate(number, decimals);
            expect(getObjectValue(result)).toStrictEqual(ErrorType.NAME);

            const number2 = ErrorValueObject.create(ErrorType.NAME);
            const decimals2 = NumberValueObject.create(2);
            const result2 = testFunction.calculate(number2, decimals2);
            expect(getObjectValue(result2)).toStrictEqual(ErrorType.NAME);
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
            const decimals = NullValueObject.create();
            const result = testFunction.calculate(number, decimals);
            expect(getObjectValue(result)).toStrictEqual([
                ['$1.00 ', ErrorType.VALUE, '$1.23 ', '$1.00 ', '$0.00 ', '$0.00 '],
                ['$0.00 ', '$100.00 ', '$2.34 ', ErrorType.VALUE, '($3.00)', ErrorType.NAME],
            ]);
        });
    });
});

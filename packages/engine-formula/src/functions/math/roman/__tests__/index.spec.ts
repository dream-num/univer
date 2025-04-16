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
import { FUNCTION_NAMES_MATH } from '../../function-names';
import { Roman } from '../index';

describe('Test roman function', () => {
    const testFunction = new Roman(FUNCTION_NAMES_MATH.ROMAN);

    describe('Roman', () => {
        it('Value is normal', () => {
            const number = NumberValueObject.create(499);
            const form = NumberValueObject.create(0);
            const result = testFunction.calculate(number, form);
            expect(getObjectValue(result)).toStrictEqual('CDXCIX');
        });

        it('Number value test', () => {
            const number = NumberValueObject.create(-1);
            const form = NumberValueObject.create(0);
            const result = testFunction.calculate(number, form);
            expect(getObjectValue(result)).toStrictEqual(ErrorType.VALUE);

            const number2 = NumberValueObject.create(4000);
            const result2 = testFunction.calculate(number2, form);
            expect(getObjectValue(result2)).toStrictEqual(ErrorType.VALUE);

            const number3 = NullValueObject.create();
            const result3 = testFunction.calculate(number3, form);
            expect(getObjectValue(result3)).toStrictEqual('');

            const number4 = ErrorValueObject.create(ErrorType.NAME);
            const result4 = testFunction.calculate(number4, form);
            expect(getObjectValue(result4)).toStrictEqual(ErrorType.NAME);

            const number5 = BooleanValueObject.create(true);
            const result5 = testFunction.calculate(number5, form);
            expect(getObjectValue(result5)).toStrictEqual('I');

            const number6 = StringValueObject.create('test');
            const result6 = testFunction.calculate(number6, form);
            expect(getObjectValue(result6)).toStrictEqual(ErrorType.VALUE);
        });

        it('Form value test', () => {
            const number = NumberValueObject.create(499);
            const form = NumberValueObject.create(-1);
            const result = testFunction.calculate(number, form);
            expect(getObjectValue(result)).toStrictEqual(ErrorType.VALUE);

            const form2 = NumberValueObject.create(1);
            const result2 = testFunction.calculate(number, form2);
            expect(getObjectValue(result2)).toStrictEqual('LDVLIV');

            const form3 = NumberValueObject.create(2);
            const result3 = testFunction.calculate(number, form3);
            expect(getObjectValue(result3)).toStrictEqual('XDIX');

            const form4 = NumberValueObject.create(3);
            const result4 = testFunction.calculate(number, form4);
            expect(getObjectValue(result4)).toStrictEqual('VDIV');

            const form5 = NumberValueObject.create(4);
            const result5 = testFunction.calculate(number, form5);
            expect(getObjectValue(result5)).toStrictEqual('ID');

            const form6 = NumberValueObject.create(5);
            const result6 = testFunction.calculate(number, form6);
            expect(getObjectValue(result6)).toStrictEqual(ErrorType.VALUE);

            const form7 = BooleanValueObject.create(true);
            const result7 = testFunction.calculate(number, form7);
            expect(getObjectValue(result7)).toStrictEqual('CDXCIX');

            const form8 = BooleanValueObject.create(false);
            const result8 = testFunction.calculate(number, form8);
            expect(getObjectValue(result8)).toStrictEqual('ID');

            const form9 = NullValueObject.create();
            const result9 = testFunction.calculate(number, form9);
            expect(getObjectValue(result9)).toStrictEqual('CDXCIX');

            const form10 = ErrorValueObject.create(ErrorType.NAME);
            const result10 = testFunction.calculate(number, form10);
            expect(getObjectValue(result10)).toStrictEqual(ErrorType.NAME);

            const form11 = StringValueObject.create('test');
            const result11 = testFunction.calculate(number, form11);
            expect(getObjectValue(result11)).toStrictEqual(ErrorType.VALUE);
        });

        it('Value is array', () => {
            const number = NumberValueObject.create(1999);
            const form = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [-1, null, 1.23, 2, '3.2', 4],
                    [5, 0, true, false, 'test', ErrorType.NAME],
                ]),
                rowCount: 2,
                columnCount: 6,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const result = testFunction.calculate(number, form);
            expect(getObjectValue(result)).toStrictEqual([
                [ErrorType.VALUE, 'MCMXCIX', 'MLMVLIV', 'MXMIX', 'MVMIV', 'MIM'],
                [ErrorType.VALUE, 'MCMXCIX', 'MCMXCIX', 'MIM', ErrorType.VALUE, ErrorType.NAME],
            ]);
        });
    });
});

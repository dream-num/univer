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
import { Valuetotext } from '../index';

describe('Test valuetotext function', () => {
    const testFunction = new Valuetotext(FUNCTION_NAMES_TEXT.VALUETOTEXT);

    describe('Valuetotext', () => {
        it('Value is normal', () => {
            const value = StringValueObject.create('Univer');
            const format = NumberValueObject.create(1);
            const result = testFunction.calculate(value, format);
            expect(getObjectValue(result)).toStrictEqual('"Univer"');
        });

        it('Format value test', () => {
            const value = StringValueObject.create('Univer');
            const format = NullValueObject.create();
            const result = testFunction.calculate(value, format);
            expect(getObjectValue(result)).toStrictEqual('Univer');

            const format2 = BooleanValueObject.create(true);
            const result2 = testFunction.calculate(value, format2);
            expect(getObjectValue(result2)).toStrictEqual('"Univer"');

            const format3 = StringValueObject.create('test');
            const result3 = testFunction.calculate(value, format3);
            expect(getObjectValue(result3)).toStrictEqual(ErrorType.VALUE);

            const format4 = ErrorValueObject.create(ErrorType.NAME);
            const result4 = testFunction.calculate(value, format4);
            expect(getObjectValue(result4)).toStrictEqual(ErrorType.NAME);

            const format5 = NumberValueObject.create(2);
            const result5 = testFunction.calculate(value, format5);
            expect(getObjectValue(result5)).toStrictEqual(ErrorType.VALUE);
        });

        it('Value is array', () => {
            const value = ArrayValueObject.create({
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
            const format = NumberValueObject.create(1);
            const result = testFunction.calculate(value, format);
            expect(getObjectValue(result)).toStrictEqual([
                [1, '" "', '"中文"', true, false, ''],
                [0, 100, 2.34, '"ÿ"', -3, ErrorType.NAME],
            ]);
        });
    });
});

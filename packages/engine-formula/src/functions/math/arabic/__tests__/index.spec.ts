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
import { Arabic } from '../index';

describe('Test arabic function', () => {
    const testFunction = new Arabic(FUNCTION_NAMES_MATH.ARABIC);

    describe('Arabic', () => {
        it('Value is normal', () => {
            const text = StringValueObject.create('mcmxii');
            const result = testFunction.calculate(text);
            expect(getObjectValue(result)).toStrictEqual(1912);
        });

        it('Result is negtive', () => {
            const text = StringValueObject.create('-mcmxii');
            const result = testFunction.calculate(text);
            expect(getObjectValue(result)).toStrictEqual(-1912);
        });

        it('Value is number', () => {
            const text = NumberValueObject.create(1);
            const result = testFunction.calculate(text);
            expect(getObjectValue(result)).toStrictEqual(ErrorType.VALUE);
        });

        it('Value is boolean', () => {
            const text = BooleanValueObject.create(true);
            const result = testFunction.calculate(text);
            expect(getObjectValue(result)).toStrictEqual(ErrorType.VALUE);
        });

        it('Value is null', () => {
            const text = NullValueObject.create();
            const result = testFunction.calculate(text);
            expect(getObjectValue(result)).toStrictEqual(0);
        });

        it('Value is error', () => {
            const text = ErrorValueObject.create(ErrorType.NAME);
            const result = testFunction.calculate(text);
            expect(getObjectValue(result)).toStrictEqual(ErrorType.NAME);
        });

        it('Value is array', () => {
            const text = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [1, ' ', 'mxmvii', true, false, null],
                    [0, 'llll', 'LVII', 'test', -3, ErrorType.NAME],
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
                [ErrorType.VALUE, ErrorType.VALUE, 1997, ErrorType.VALUE, ErrorType.VALUE, 0],
                [ErrorType.VALUE, ErrorType.VALUE, 57, ErrorType.VALUE, ErrorType.VALUE, ErrorType.NAME],
            ]);

            const text2 = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    ['LVII'],
                ]),
                rowCount: 1,
                columnCount: 1,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const result2 = testFunction.calculate(text2);
            expect(getObjectValue(result2)).toStrictEqual(57);
        });
    });
});

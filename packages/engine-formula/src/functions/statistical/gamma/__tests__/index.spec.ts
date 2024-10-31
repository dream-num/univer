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
import { ErrorValueObject } from '../../../../engine/value-object/base-value-object';
import { BooleanValueObject, NullValueObject, NumberValueObject, StringValueObject } from '../../../../engine/value-object/primitive-object';
import { getObjectValue } from '../../../__tests__/create-function-test-bed';
import { FUNCTION_NAMES_STATISTICAL } from '../../function-names';
import { Gamma } from '../index';

describe('Test gamma function', () => {
    const testFunction = new Gamma(FUNCTION_NAMES_STATISTICAL.GAMMA);

    describe('Gamma', () => {
        it('Value is normal', () => {
            const number = NumberValueObject.create(2.5);
            const result = testFunction.calculate(number);
            expect(getObjectValue(result)).toStrictEqual(1.3293403919101043);
        });

        it('Value is 0 or negative integers', () => {
            const number = NumberValueObject.create(0);
            const result = testFunction.calculate(number);
            expect(getObjectValue(result)).toStrictEqual(ErrorType.NUM);

            const number2 = NumberValueObject.create(-1);
            const result2 = testFunction.calculate(number2);
            expect(getObjectValue(result2)).toStrictEqual(ErrorType.NUM);

            const number3 = NumberValueObject.create(172);
            const result3 = testFunction.calculate(number3);
            expect(getObjectValue(result3)).toStrictEqual(ErrorType.NUM);
        });

        it('Value is number string', () => {
            const number = StringValueObject.create('-2.5');
            const result = testFunction.calculate(number);
            expect(getObjectValue(result)).toStrictEqual(-0.9453087178298095);
        });

        it('Value is normal string', () => {
            const number = StringValueObject.create('test');
            const result = testFunction.calculate(number);
            expect(getObjectValue(result)).toStrictEqual(ErrorType.VALUE);
        });

        it('Value is boolean', () => {
            const number = BooleanValueObject.create(true);
            const result = testFunction.calculate(number);
            expect(getObjectValue(result)).toStrictEqual(1);
        });

        it('Value is null', () => {
            const number = NullValueObject.create();
            const result = testFunction.calculate(number);
            expect(getObjectValue(result)).toStrictEqual(ErrorType.NUM);
        });

        it('Value is error', () => {
            const number = ErrorValueObject.create(ErrorType.NAME);
            const result = testFunction.calculate(number);
            expect(getObjectValue(result)).toStrictEqual(ErrorType.NAME);
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
                [1, ErrorType.VALUE, 0.9107548563770899, 1, ErrorType.NUM, ErrorType.NUM],
                [ErrorType.NUM, 9.33262154439441e+155, 1.19556877982239, ErrorType.VALUE, ErrorType.NUM, ErrorType.NAME],
            ]);

            const number2 = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [0.001],
                ]),
                rowCount: 1,
                columnCount: 1,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const result2 = testFunction.calculate(number2);
            expect(getObjectValue(result2)).toStrictEqual(999.4237724845955);
        });
    });
});

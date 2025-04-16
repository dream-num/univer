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
import { FUNCTION_NAMES_STATISTICAL } from '../../function-names';
import { GammaDist } from '../index';

describe('Test gammaDist function', () => {
    const testFunction = new GammaDist(FUNCTION_NAMES_STATISTICAL.GAMMA_DIST);

    describe('GammaDist', () => {
        it('Value is normal', () => {
            const x = NumberValueObject.create(10);
            const alpha = NumberValueObject.create(8);
            const beta = NumberValueObject.create(2);
            const cumulative = BooleanValueObject.create(true);
            const result = testFunction.calculate(x, alpha, beta, cumulative);
            expect(getObjectValue(result)).toBe(0.1333716740699961);
        });

        it('Alpha and beta value test', () => {
            const x = NumberValueObject.create(10);
            const alpha = NumberValueObject.create(0);
            const beta = NumberValueObject.create(2);
            const cumulative = BooleanValueObject.create(true);
            const result = testFunction.calculate(x, alpha, beta, cumulative);
            expect(getObjectValue(result)).toBe(ErrorType.NUM);

            const alpha2 = NumberValueObject.create(8);
            const beta2 = NumberValueObject.create(0);
            const result2 = testFunction.calculate(x, alpha2, beta2, cumulative);
            expect(getObjectValue(result2)).toBe(ErrorType.NUM);

            const alpha3 = NumberValueObject.create(1);
            const beta3 = NumberValueObject.create(1);
            const result3 = testFunction.calculate(x, alpha3, beta3, cumulative);
            expect(getObjectValue(result3)).toBe(0.9999546000702375);

            const alpha4 = NumberValueObject.create(5);
            const result4 = testFunction.calculate(x, alpha4, beta, cumulative);
            expect(getObjectValue(result4)).toBe(0.5595067149347875);
        });

        it('X value test', () => {
            const x = NumberValueObject.create(0);
            const alpha = NumberValueObject.create(8);
            const beta = NumberValueObject.create(2);
            const cumulative = BooleanValueObject.create(true);
            const result = testFunction.calculate(x, alpha, beta, cumulative);
            expect(getObjectValue(result)).toBe(0);

            const x2 = NumberValueObject.create(-1);
            const result2 = testFunction.calculate(x2, alpha, beta, cumulative);
            expect(getObjectValue(result2)).toBe(ErrorType.NUM);
        });

        it('Cumulative value is normal', () => {
            const x = NumberValueObject.create(10);
            const alpha = NumberValueObject.create(8);
            const beta = NumberValueObject.create(2);
            const cumulative = BooleanValueObject.create(false);
            const result = testFunction.calculate(x, alpha, beta, cumulative);
            expect(getObjectValue(result)).toBe(0.05222243147852266);

            const alpha2 = NumberValueObject.create(1);
            const beta2 = NumberValueObject.create(1);
            const result2 = testFunction.calculate(x, alpha2, beta2, cumulative);
            expect(getObjectValue(result2)).toBe(0.00004539992976248485);

            const x2 = NumberValueObject.create(3);
            const result3 = testFunction.calculate(x2, alpha2, beta2, cumulative);
            expect(getObjectValue(result3)).toBe(0.049787068367863944);

            const alpha3 = NumberValueObject.create(520);
            const beta3 = NumberValueObject.create(520);
            const result4 = testFunction.calculate(x, alpha3, beta3, cumulative);
            expect(getObjectValue(result4)).toBe(0);

            const alpha4 = NumberValueObject.create(350);
            const beta4 = NumberValueObject.create(350);
            const result5 = testFunction.calculate(x, alpha4, beta4, cumulative);
            expect(getObjectValue(result5)).toBe(0);

            const alpha5 = NumberValueObject.create(0.1);
            const beta5 = NumberValueObject.create(0.1);
            const result6 = testFunction.calculate(x, alpha5, beta5, cumulative);
            expect(getObjectValue(result6)).toBe(6.197422944912591e-46);
        });

        it('Value is normal string', () => {
            const x = StringValueObject.create('test');
            const alpha = NumberValueObject.create(8);
            const beta = NumberValueObject.create(2);
            const cumulative = BooleanValueObject.create(true);
            const result = testFunction.calculate(x, alpha, beta, cumulative);
            expect(getObjectValue(result)).toBe(ErrorType.VALUE);
        });

        it('Value is boolean', () => {
            const x = BooleanValueObject.create(true);
            const alpha = NumberValueObject.create(8);
            const beta = NumberValueObject.create(2);
            const cumulative = BooleanValueObject.create(true);
            const result = testFunction.calculate(x, alpha, beta, cumulative);
            expect(getObjectValue(result)).toBe(6.219690863728135e-8);
        });

        it('Value is null', () => {
            const x = NullValueObject.create();
            const alpha = NumberValueObject.create(8);
            const beta = NumberValueObject.create(2);
            const cumulative = BooleanValueObject.create(true);
            const result = testFunction.calculate(x, alpha, beta, cumulative);
            expect(getObjectValue(result)).toBe(0);
        });

        it('Value is error', () => {
            const x = ErrorValueObject.create(ErrorType.NAME);
            const alpha = NumberValueObject.create(8);
            const beta = NumberValueObject.create(2);
            const cumulative = BooleanValueObject.create(true);
            const result = testFunction.calculate(x, alpha, beta, cumulative);
            expect(getObjectValue(result)).toBe(ErrorType.NAME);

            const x2 = NumberValueObject.create(10);
            const alpha2 = ErrorValueObject.create(ErrorType.NAME);
            const result2 = testFunction.calculate(x2, alpha2, beta, cumulative);
            expect(getObjectValue(result2)).toBe(ErrorType.NAME);

            const beta2 = ErrorValueObject.create(ErrorType.NAME);
            const result3 = testFunction.calculate(x2, alpha, beta2, cumulative);
            expect(getObjectValue(result3)).toBe(ErrorType.NAME);

            const cumulative2 = ErrorValueObject.create(ErrorType.NAME);
            const result4 = testFunction.calculate(x2, alpha, beta, cumulative2);
            expect(getObjectValue(result4)).toBe(ErrorType.NAME);
        });

        it('Value is array', () => {
            const x = ArrayValueObject.create({
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
            const alpha = NumberValueObject.create(8);
            const beta = NumberValueObject.create(2);
            const cumulative = BooleanValueObject.create(true);
            const result = testFunction.calculate(x, alpha, beta, cumulative);
            expect(getObjectValue(result)).toStrictEqual([
                [6.219690863728135e-8, ErrorType.VALUE, 2.943752902702369e-7, 6.219690863728135e-8, 0, 0],
                [0, 0.9999999999999654, 0.00003100313605738345, ErrorType.VALUE, ErrorType.NUM, ErrorType.NAME],
            ]);
        });
    });
});

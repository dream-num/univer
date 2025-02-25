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
import { BetaDist } from '../index';

describe('Test betaDist function', () => {
    const testFunction = new BetaDist(FUNCTION_NAMES_STATISTICAL.BETA_DIST);

    describe('BetaDist', () => {
        it('Value is normal', () => {
            const x = NumberValueObject.create(2);
            const alpha = NumberValueObject.create(8);
            const beta = NumberValueObject.create(10);
            const cumulative = BooleanValueObject.create(true);
            const A = NumberValueObject.create(1);
            const B = NumberValueObject.create(3);
            const result = testFunction.calculate(x, alpha, beta, cumulative, A, B);
            expect(getObjectValue(result)).toBe(0.6854705810117458);

            const result2 = testFunction.calculate(x, alpha, beta, cumulative);
            expect(getObjectValue(result2)).toBe(ErrorType.NUM);
        });

        it('Alpha and beta value test', () => {
            const x = NumberValueObject.create(2);
            const alpha = NumberValueObject.create(0);
            const beta = NumberValueObject.create(10);
            const cumulative = BooleanValueObject.create(true);
            const A = NumberValueObject.create(1);
            const B = NumberValueObject.create(3);
            const result = testFunction.calculate(x, alpha, beta, cumulative, A, B);
            expect(getObjectValue(result)).toBe(ErrorType.NUM);

            const alpha2 = NumberValueObject.create(8);
            const beta2 = NumberValueObject.create(0);
            const result2 = testFunction.calculate(x, alpha2, beta2, cumulative, A, B);
            expect(getObjectValue(result2)).toBe(ErrorType.NUM);

            const alpha3 = NumberValueObject.create(1);
            const beta3 = NumberValueObject.create(1);
            const result3 = testFunction.calculate(x, alpha3, beta3, cumulative, A, B);
            expect(getObjectValue(result3)).toBe(0.5000000000000002);
        });

        it('X and A and B value test', () => {
            const x = NumberValueObject.create(2);
            const alpha = NumberValueObject.create(8);
            const beta = NumberValueObject.create(10);
            const cumulative = BooleanValueObject.create(true);
            const A = NumberValueObject.create(1);
            const B = NumberValueObject.create(1);
            const result = testFunction.calculate(x, alpha, beta, cumulative, A, B);
            expect(getObjectValue(result)).toBe(ErrorType.NUM);

            const x2 = NumberValueObject.create(1);
            const A2 = NumberValueObject.create(1);
            const B2 = NumberValueObject.create(3);
            const result2 = testFunction.calculate(x2, alpha, beta, cumulative, A2, B2);
            expect(getObjectValue(result2)).toBe(0);

            const x3 = NumberValueObject.create(3);
            const result3 = testFunction.calculate(x3, alpha, beta, cumulative, A2, B2);
            expect(getObjectValue(result3)).toBe(1);
        });

        it('Cumulative value is normal', () => {
            const x = NumberValueObject.create(2);
            const alpha = NumberValueObject.create(8);
            const beta = NumberValueObject.create(10);
            const cumulative = BooleanValueObject.create(false);
            const A = NumberValueObject.create(1);
            const B = NumberValueObject.create(3);
            const result = testFunction.calculate(x, alpha, beta, cumulative, A, B);
            expect(getObjectValue(result)).toBe(1.4837646484375002);

            const alpha2 = NumberValueObject.create(1);
            const beta2 = NumberValueObject.create(1);
            const result2 = testFunction.calculate(x, alpha2, beta2, cumulative, A, B);
            expect(getObjectValue(result2)).toBe(0.5);

            const x2 = NumberValueObject.create(3);
            const result3 = testFunction.calculate(x2, alpha2, beta2, cumulative, A, B);
            expect(getObjectValue(result3)).toBe(0);

            const alpha3 = NumberValueObject.create(520);
            const beta3 = NumberValueObject.create(520);
            const result4 = testFunction.calculate(x, alpha3, beta3, cumulative, A, B);
            expect(getObjectValue(result4)).toBe(12.86240966652393);

            const alpha4 = NumberValueObject.create(350);
            const beta4 = NumberValueObject.create(350);
            const result5 = testFunction.calculate(x, alpha4, beta4, cumulative, A, B);
            expect(getObjectValue(result5)).toBe(10.551251636711884);

            const alpha5 = NumberValueObject.create(0.1);
            const beta5 = NumberValueObject.create(0.1);
            const result6 = testFunction.calculate(x, alpha5, beta5, cumulative, A, B);
            expect(getObjectValue(result6)).toBe(0.08831513898907835);
        });

        it('Value is normal string', () => {
            const x = StringValueObject.create('test');
            const alpha = NumberValueObject.create(8);
            const beta = NumberValueObject.create(10);
            const cumulative = BooleanValueObject.create(true);
            const A = NumberValueObject.create(1);
            const B = NumberValueObject.create(3);
            const result = testFunction.calculate(x, alpha, beta, cumulative, A, B);
            expect(getObjectValue(result)).toBe(ErrorType.VALUE);
        });

        it('Value is boolean', () => {
            const x = BooleanValueObject.create(true);
            const alpha = NumberValueObject.create(8);
            const beta = NumberValueObject.create(10);
            const cumulative = BooleanValueObject.create(true);
            const A = NumberValueObject.create(1);
            const B = NumberValueObject.create(3);
            const result = testFunction.calculate(x, alpha, beta, cumulative, A, B);
            expect(getObjectValue(result)).toBe(0);
        });

        it('Value is null', () => {
            const x = NullValueObject.create();
            const alpha = NumberValueObject.create(8);
            const beta = NumberValueObject.create(10);
            const cumulative = BooleanValueObject.create(true);
            const A = NumberValueObject.create(1);
            const B = NumberValueObject.create(3);
            const result = testFunction.calculate(x, alpha, beta, cumulative, A, B);
            expect(getObjectValue(result)).toBe(ErrorType.NUM);

            const x2 = NumberValueObject.create(2);
            const A2 = NullValueObject.create();
            const B2 = NullValueObject.create();
            const result2 = testFunction.calculate(x2, alpha, beta, cumulative, A2, B2);
            expect(getObjectValue(result2)).toBe(ErrorType.NUM);
        });

        it('Value is error', () => {
            const x = ErrorValueObject.create(ErrorType.NAME);
            const alpha = NumberValueObject.create(8);
            const beta = NumberValueObject.create(10);
            const cumulative = BooleanValueObject.create(true);
            const A = NumberValueObject.create(1);
            const B = NumberValueObject.create(3);
            const result = testFunction.calculate(x, alpha, beta, cumulative, A, B);
            expect(getObjectValue(result)).toBe(ErrorType.NAME);

            const x2 = NumberValueObject.create(2);
            const alpha2 = ErrorValueObject.create(ErrorType.NAME);
            const result2 = testFunction.calculate(x2, alpha2, beta, cumulative, A, B);
            expect(getObjectValue(result2)).toBe(ErrorType.NAME);

            const beta2 = ErrorValueObject.create(ErrorType.NAME);
            const result3 = testFunction.calculate(x2, alpha, beta2, cumulative, A, B);
            expect(getObjectValue(result3)).toBe(ErrorType.NAME);

            const cumulative2 = ErrorValueObject.create(ErrorType.NAME);
            const result4 = testFunction.calculate(x2, alpha, beta, cumulative2, A, B);
            expect(getObjectValue(result4)).toBe(ErrorType.NAME);

            const A2 = ErrorValueObject.create(ErrorType.NAME);
            const result5 = testFunction.calculate(x2, alpha, beta, cumulative, A2, B);
            expect(getObjectValue(result5)).toBe(ErrorType.NAME);

            const B2 = ErrorValueObject.create(ErrorType.NAME);
            const result6 = testFunction.calculate(x2, alpha, beta, cumulative, A, B2);
            expect(getObjectValue(result6)).toBe(ErrorType.NAME);
        });

        it('Value is array', () => {
            const x = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [1, ' ', 1.23, true, false, null],
                    [0, '100', '2.34', 'test', -3, null],
                ]),
                rowCount: 2,
                columnCount: 6,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const alpha = NumberValueObject.create(8);
            const beta = NumberValueObject.create(10);
            const cumulative = BooleanValueObject.create(true);
            const A = NumberValueObject.create(1);
            const B = NumberValueObject.create(3);
            const result = testFunction.calculate(x, alpha, beta, cumulative, A, B);
            expect(getObjectValue(result)).toStrictEqual([
                [0, ErrorType.VALUE, 0.00028348362316367936, 0, ErrorType.NUM, ErrorType.NUM],
                [ErrorType.NUM, ErrorType.NUM, 0.9745907595394001, ErrorType.VALUE, ErrorType.NUM, ErrorType.NUM],
            ]);
        });
    });
});

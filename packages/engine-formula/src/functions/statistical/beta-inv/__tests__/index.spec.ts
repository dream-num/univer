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
import { BetaInv } from '../index';

describe('Test betaInv function', () => {
    const testFunction = new BetaInv(FUNCTION_NAMES_STATISTICAL.BETA_INV);

    describe('BetaInv', () => {
        it('Value is normal', () => {
            const probability = NumberValueObject.create(0.685470581);
            const alpha = NumberValueObject.create(8);
            const beta = NumberValueObject.create(10);
            const A = NumberValueObject.create(1);
            const B = NumberValueObject.create(3);
            const result = testFunction.calculate(probability, alpha, beta, A, B);
            expect(getObjectValue(result)).toBe(1.9999999999920839);

            const result2 = testFunction.calculate(probability, alpha, beta);
            expect(getObjectValue(result2)).toBe(0.49999999999604194);
        });

        it('Alpha and beta value test', () => {
            const probability = NumberValueObject.create(0.685470581);
            const alpha = NumberValueObject.create(0);
            const beta = NumberValueObject.create(10);
            const A = NumberValueObject.create(1);
            const B = NumberValueObject.create(3);
            const result = testFunction.calculate(probability, alpha, beta, A, B);
            expect(getObjectValue(result)).toBe(ErrorType.NUM);

            const alpha2 = NumberValueObject.create(8);
            const beta2 = NumberValueObject.create(0);
            const result2 = testFunction.calculate(probability, alpha2, beta2, A, B);
            expect(getObjectValue(result2)).toBe(ErrorType.NUM);

            const alpha3 = NumberValueObject.create(1);
            const beta3 = NumberValueObject.create(1);
            const result3 = testFunction.calculate(probability, alpha3, beta3, A, B);
            expect(getObjectValue(result3)).toBe(2.3709411619999994);
        });

        it('Probability and A and B value test', () => {
            const probability = NumberValueObject.create(2);
            const alpha = NumberValueObject.create(8);
            const beta = NumberValueObject.create(10);
            const A = NumberValueObject.create(1);
            const B = NumberValueObject.create(1);
            const result = testFunction.calculate(probability, alpha, beta, A, B);
            expect(getObjectValue(result)).toBe(ErrorType.NUM);

            const probability2 = NumberValueObject.create(1);
            const A2 = NumberValueObject.create(1);
            const B2 = NumberValueObject.create(3);
            const result2 = testFunction.calculate(probability2, alpha, beta, A2, B2);
            expect(getObjectValue(result2)).toBe(ErrorType.NUM);

            const probability3 = NumberValueObject.create(3);
            const result3 = testFunction.calculate(probability3, alpha, beta, A2, B2);
            expect(getObjectValue(result3)).toBe(ErrorType.NUM);
        });

        it('A and B value test', () => {
            const probability = NumberValueObject.create(0.685470581);
            const alpha = NumberValueObject.create(8);
            const beta = NumberValueObject.create(10);
            const A = NumberValueObject.create(1);
            const B = NumberValueObject.create(1);
            const result = testFunction.calculate(probability, alpha, beta, A, B);
            expect(getObjectValue(result)).toBe(ErrorType.NUM);

            const A2 = NumberValueObject.create(-1);
            const B2 = NumberValueObject.create(-0.1);
            const result2 = testFunction.calculate(probability, alpha, beta, A2, B2);
            expect(getObjectValue(result2)).toBe(-0.5500000000035623);
        });

        it('Value is normal string', () => {
            const probability = StringValueObject.create('test');
            const alpha = NumberValueObject.create(8);
            const beta = NumberValueObject.create(10);
            const A = NumberValueObject.create(1);
            const B = NumberValueObject.create(3);
            const result = testFunction.calculate(probability, alpha, beta, A, B);
            expect(getObjectValue(result)).toBe(ErrorType.VALUE);
        });

        it('Value is boolean', () => {
            const probability = BooleanValueObject.create(true);
            const alpha = NumberValueObject.create(8);
            const beta = NumberValueObject.create(10);
            const A = NumberValueObject.create(1);
            const B = NumberValueObject.create(3);
            const result = testFunction.calculate(probability, alpha, beta, A, B);
            expect(getObjectValue(result)).toBe(ErrorType.NUM);
        });

        it('Value is null', () => {
            const probability = NullValueObject.create();
            const alpha = NumberValueObject.create(8);
            const beta = NumberValueObject.create(10);
            const A = NumberValueObject.create(1);
            const B = NumberValueObject.create(3);
            const result = testFunction.calculate(probability, alpha, beta, A, B);
            expect(getObjectValue(result)).toBe(ErrorType.NUM);

            const probability2 = NumberValueObject.create(0.685470581);
            const A2 = NullValueObject.create();
            const B2 = NullValueObject.create();
            const result2 = testFunction.calculate(probability2, alpha, beta, A2, B2);
            expect(getObjectValue(result2)).toBe(0.49999999999604194);
        });

        it('Value is error', () => {
            const probability = ErrorValueObject.create(ErrorType.NAME);
            const alpha = NumberValueObject.create(8);
            const beta = NumberValueObject.create(10);
            const A = NumberValueObject.create(1);
            const B = NumberValueObject.create(3);
            const result = testFunction.calculate(probability, alpha, beta, A, B);
            expect(getObjectValue(result)).toBe(ErrorType.NAME);

            const probability2 = NumberValueObject.create(0.685470581);
            const alpha2 = ErrorValueObject.create(ErrorType.NAME);
            const result2 = testFunction.calculate(probability2, alpha2, beta, A, B);
            expect(getObjectValue(result2)).toBe(ErrorType.NAME);

            const beta2 = ErrorValueObject.create(ErrorType.NAME);
            const result3 = testFunction.calculate(probability2, alpha, beta2, A, B);
            expect(getObjectValue(result3)).toBe(ErrorType.NAME);

            const A2 = ErrorValueObject.create(ErrorType.NAME);
            const result4 = testFunction.calculate(probability2, alpha, beta, A2, B);
            expect(getObjectValue(result4)).toBe(ErrorType.NAME);

            const B2 = ErrorValueObject.create(ErrorType.NAME);
            const result5 = testFunction.calculate(probability2, alpha, beta, A, B2);
            expect(getObjectValue(result5)).toBe(ErrorType.NAME);
        });

        it('Value is array', () => {
            const probability = ArrayValueObject.create({
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
            const A = NumberValueObject.create(1);
            const B = NumberValueObject.create(3);
            const result = testFunction.calculate(probability, alpha, beta, A, B);
            expect(getObjectValue(result)).toStrictEqual([
                [ErrorType.NUM, ErrorType.VALUE, ErrorType.NUM, ErrorType.NUM, ErrorType.NUM, ErrorType.NUM],
                [ErrorType.NUM, ErrorType.NUM, ErrorType.NUM, ErrorType.VALUE, ErrorType.NUM, ErrorType.NUM],
            ]);
        });
    });
});

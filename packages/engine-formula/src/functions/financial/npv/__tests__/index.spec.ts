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

import { FUNCTION_NAMES_FINANCIAL } from '../../function-names';
import { Npv } from '../index';
import { BooleanValueObject, NumberValueObject, StringValueObject } from '../../../../engine/value-object/primitive-object';
import { ArrayValueObject, transformToValue } from '../../../../engine/value-object/array-value-object';
import { ErrorValueObject } from '../../../../engine/value-object/base-value-object';
import { ErrorType } from '../../../../basics/error-type';

describe('Test npv function', () => {
    const testFunction = new Npv(FUNCTION_NAMES_FINANCIAL.NPV);

    describe('Npv', () => {
        it('Value is normal', () => {
            const rate = NumberValueObject.create(0.1);
            const value1 = ArrayValueObject.create('{-10000,3000,4200,6800}');
            const result = testFunction.calculate(rate, value1);
            expect(result.getValue()).toStrictEqual(1188.4434123352207);
        });

        it('Value is error', () => {
            const rate = ErrorValueObject.create(ErrorType.NAME);
            const value1 = ArrayValueObject.create('{-10000,3000,4200,6800}');
            const result = testFunction.calculate(rate, value1);
            expect(result.getValue()).toStrictEqual(ErrorType.NAME);
        });

        it('Value is boolean', () => {
            const rate = NumberValueObject.create(0.1);
            const value1 = ArrayValueObject.create('{-10000,3000,4200,6800}');
            const value2 = BooleanValueObject.create(true);
            const result = testFunction.calculate(rate, value1, value2);
            expect(result.getValue()).toStrictEqual(1189.0643336582798);
        });

        it('Value is normal string', () => {
            const rate = NumberValueObject.create(0.1);
            const value1 = ArrayValueObject.create('{-10000,3000,4200,6800}');
            const value2 = StringValueObject.create('test');
            const result = testFunction.calculate(rate, value1, value2);
            expect(result.getValue()).toStrictEqual(ErrorType.VALUE);
        });

        it('Value is array', () => {
            const rate = ArrayValueObject.create('{0.1,-0.1,-1}');
            const value1 = ArrayValueObject.create('{-10000,3000,4200,6800}');
            const result = testFunction.calculate(rate, value1);
            expect(transformToValue(result.getArrayValue())).toStrictEqual([
                [1188.4434123352207, 8718.183203779909, ErrorType.DIV_BY_ZERO],
            ]);
        });
    });
});

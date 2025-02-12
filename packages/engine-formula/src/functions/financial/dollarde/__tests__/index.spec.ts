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

import { FUNCTION_NAMES_FINANCIAL } from '../../function-names';
import { Dollarde } from '../index';
import { BooleanValueObject, NumberValueObject, StringValueObject } from '../../../../engine/value-object/primitive-object';
import { ArrayValueObject, transformToValueObject } from '../../../../engine/value-object/array-value-object';
import { ErrorValueObject } from '../../../../engine/value-object/base-value-object';
import { ErrorType } from '../../../../basics/error-type';

describe('Test dollarde function', () => {
    const testFunction = new Dollarde(FUNCTION_NAMES_FINANCIAL.DOLLARDE);

    describe('Dollarde', () => {
        it('Value is normal', () => {
            const fractionalDollar = NumberValueObject.create(1.02);
            const fraction = NumberValueObject.create(16);
            const result = testFunction.calculate(fractionalDollar, fraction);
            expect(result.getValue()).toStrictEqual(1.125);
        });

        it('Fraction value test', () => {
            const fractionalDollar = NumberValueObject.create(1.02);
            let fraction = NumberValueObject.create(-1);
            let result = testFunction.calculate(fractionalDollar, fraction);
            expect(result.getValue()).toStrictEqual(ErrorType.NUM);

            fraction = NumberValueObject.create(0.1);
            result = testFunction.calculate(fractionalDollar, fraction);
            expect(result.getValue()).toStrictEqual(ErrorType.DIV_BY_ZERO);
        });

        it('Value is error', () => {
            const fractionalDollar = ErrorValueObject.create(ErrorType.NAME);
            const fraction = NumberValueObject.create(16);
            const result = testFunction.calculate(fractionalDollar, fraction);
            expect(result.getValue()).toStrictEqual(ErrorType.NAME);
        });

        it('Value is boolean', () => {
            const fractionalDollar = NumberValueObject.create(1.02);
            const fraction = BooleanValueObject.create(true);
            const result = testFunction.calculate(fractionalDollar, fraction);
            expect(result.getValue()).toStrictEqual(ErrorType.VALUE);
        });

        it('Value is normal string', () => {
            const fractionalDollar = StringValueObject.create('test');
            const fraction = NumberValueObject.create(16);
            const result = testFunction.calculate(fractionalDollar, fraction);
            expect(result.getValue()).toStrictEqual(ErrorType.VALUE);
        });

        it('Value is array', () => {
            const fractionalDollar = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    ['1.02', 'test', true, false, ErrorType.NAME],
                ]),
                rowCount: 1,
                columnCount: 5,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const fraction = NumberValueObject.create(16);
            const result = testFunction.calculate(fractionalDollar, fraction);
            expect(result.getValue()).toStrictEqual(ErrorType.VALUE);
        });
    });
});

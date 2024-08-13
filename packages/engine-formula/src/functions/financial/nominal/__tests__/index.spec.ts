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
import { Nominal } from '../index';
import { BooleanValueObject, NullValueObject, NumberValueObject, StringValueObject } from '../../../../engine/value-object/primitive-object';
import { ArrayValueObject, transformToValueObject } from '../../../../engine/value-object/array-value-object';
import { ErrorValueObject } from '../../../../engine/value-object/base-value-object';
import { ErrorType } from '../../../../basics/error-type';

describe('Test nominal function', () => {
    const testFunction = new Nominal(FUNCTION_NAMES_FINANCIAL.NOMINAL);

    describe('Nominal', () => {
        it('Value is normal', () => {
            const effectRate = NumberValueObject.create(0.053543);
            const npery = NumberValueObject.create(4);
            const result = testFunction.calculate(effectRate, npery);
            expect(result.getValue()).toStrictEqual(0.052500319868356016);
        });

        it('Value is error', () => {
            const effectRate = ErrorValueObject.create(ErrorType.NAME);
            const npery = NumberValueObject.create(4);
            const result = testFunction.calculate(effectRate, npery);
            expect(result.getValue()).toStrictEqual(ErrorType.NAME);
        });

        it('Value is boolean', () => {
            const effectRate = NumberValueObject.create(0.053543);
            const npery = BooleanValueObject.create(true);
            const result = testFunction.calculate(effectRate, npery);
            expect(result.getValue()).toStrictEqual(ErrorType.VALUE);
        });

        it('Value is blank cell', () => {
            const effectRate = NumberValueObject.create(0.053543);
            const npery = NullValueObject.create();
            const result = testFunction.calculate(effectRate, npery);
            expect(result.getValue()).toStrictEqual(ErrorType.NUM);
        });

        it('Value is normal string', () => {
            const effectRate = StringValueObject.create('test');
            const npery = NumberValueObject.create(4);
            const result = testFunction.calculate(effectRate, npery);
            expect(result.getValue()).toStrictEqual(ErrorType.VALUE);
        });

        it('Value is array', () => {
            const effectRate = ArrayValueObject.create({
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
            const npery = NumberValueObject.create(4);
            const result = testFunction.calculate(effectRate, npery);
            expect(result.getValue()).toStrictEqual(ErrorType.VALUE);
        });
    });
});

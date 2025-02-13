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
import { Pduration } from '../index';
import { BooleanValueObject, NullValueObject, NumberValueObject, StringValueObject } from '../../../../engine/value-object/primitive-object';
import { ArrayValueObject, transformToValue, transformToValueObject } from '../../../../engine/value-object/array-value-object';
import { ErrorValueObject } from '../../../../engine/value-object/base-value-object';
import { ErrorType } from '../../../../basics/error-type';

describe('Test pduration function', () => {
    const testFunction = new Pduration(FUNCTION_NAMES_FINANCIAL.PDURATION);

    describe('Pduration', () => {
        it('Value is normal', () => {
            const rate = NumberValueObject.create(0.025 / 12);
            const pv = NumberValueObject.create(1000);
            const fv = NumberValueObject.create(1200);
            const result = testFunction.calculate(rate, pv, fv);
            expect(result.getValue()).toStrictEqual(87.6054764193714);
        });

        it('Value is error', () => {
            const rate = ErrorValueObject.create(ErrorType.NAME);
            const pv = NumberValueObject.create(1000);
            const fv = NumberValueObject.create(1200);
            const result = testFunction.calculate(rate, pv, fv);
            expect(result.getValue()).toStrictEqual(ErrorType.NAME);
        });

        it('Value is boolean', () => {
            const rate = BooleanValueObject.create(true);
            const pv = NumberValueObject.create(1000);
            const fv = NumberValueObject.create(1200);
            const result = testFunction.calculate(rate, pv, fv);
            expect(result.getValue()).toStrictEqual(0.2630344058337942);
        });

        it('Value is blank cell', () => {
            const rate = NullValueObject.create();
            const pv = NumberValueObject.create(1000);
            const fv = NumberValueObject.create(1200);
            const result = testFunction.calculate(rate, pv, fv);
            expect(result.getValue()).toStrictEqual(ErrorType.NUM);
        });

        it('Value is normal string', () => {
            const rate = StringValueObject.create('test');
            const pv = NumberValueObject.create(1000);
            const fv = NumberValueObject.create(1200);
            const result = testFunction.calculate(rate, pv, fv);
            expect(result.getValue()).toStrictEqual(ErrorType.VALUE);
        });

        it('Value is array', () => {
            const rate = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    ['test', 0.06, false],
                    [true, null, ErrorType.NAME],
                    [-22, '1.23', 100],
                ]),
                rowCount: 3,
                columnCount: 3,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const pv = NumberValueObject.create(1000);
            const fv = NumberValueObject.create(1200);
            const result = testFunction.calculate(rate, pv, fv);
            expect(transformToValue(result.getArrayValue())).toStrictEqual([
                [ErrorType.VALUE, 3.1289681352195324, ErrorType.NUM],
                [0.2630344058337942, ErrorType.NUM, ErrorType.NAME],
                [ErrorType.NUM, 0.2273331625481107, 0.0395052645166332],
            ]);
        });
    });
});

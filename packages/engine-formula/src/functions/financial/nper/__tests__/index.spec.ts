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
import { Nper } from '../index';
import { BooleanValueObject, NullValueObject, NumberValueObject, StringValueObject } from '../../../../engine/value-object/primitive-object';
import { ArrayValueObject, transformToValue, transformToValueObject } from '../../../../engine/value-object/array-value-object';
import { ErrorValueObject } from '../../../../engine/value-object/base-value-object';
import { ErrorType } from '../../../../basics/error-type';

describe('Test nper function', () => {
    const testFunction = new Nper(FUNCTION_NAMES_FINANCIAL.NPER);

    describe('Nper', () => {
        it('Value is normal', () => {
            const rate = NumberValueObject.create(0.12 / 12);
            const pmt = NumberValueObject.create(-100);
            const pv = NumberValueObject.create(-1000);
            const fv = NumberValueObject.create(10000);
            const type = NumberValueObject.create(0);
            const result = testFunction.calculate(rate, pmt, pv, fv, type);
            expect(result.getValue()).toStrictEqual(60.08212285376166);

            const type2 = NumberValueObject.create(1);
            const result2 = testFunction.calculate(rate, pmt, pv, fv, type2);
            expect(result2.getValue()).toStrictEqual(59.67386567429457);
        });

        it('Value is error', () => {
            const rate = ErrorValueObject.create(ErrorType.NAME);
            const pmt = NumberValueObject.create(-100);
            const pv = NumberValueObject.create(-1000);
            const fv = NumberValueObject.create(10000);
            const type = NumberValueObject.create(0);
            const result = testFunction.calculate(rate, pmt, pv, fv, type);
            expect(result.getValue()).toStrictEqual(ErrorType.NAME);
        });

        it('Value is boolean', () => {
            const rate = BooleanValueObject.create(true);
            const pmt = NumberValueObject.create(-100);
            const pv = NumberValueObject.create(-1000);
            const fv = NumberValueObject.create(10000);
            const type = NumberValueObject.create(0);
            const result = testFunction.calculate(rate, pmt, pv, fv, type);
            expect(result.getValue()).toStrictEqual(3.1987798641144978);
        });

        it('Value is blank cell', () => {
            const rate = NullValueObject.create();
            const pmt = NumberValueObject.create(-100);
            const pv = NumberValueObject.create(-1000);
            const fv = NumberValueObject.create(10000);
            const type = NumberValueObject.create(0);
            const result = testFunction.calculate(rate, pmt, pv, fv, type);
            expect(result.getValue()).toStrictEqual(90);
        });

        it('Value is normal string', () => {
            const rate = StringValueObject.create('test');
            const pmt = NumberValueObject.create(-100);
            const pv = NumberValueObject.create(-1000);
            const fv = NumberValueObject.create(10000);
            const type = NumberValueObject.create(0);
            const result = testFunction.calculate(rate, pmt, pv, fv, type);
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
            const pmt = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [true, -200, false, null],
                ]),
                rowCount: 1,
                columnCount: 4,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const pv = NumberValueObject.create(-1000);
            const fv = NumberValueObject.create(10000);
            const type = NumberValueObject.create(1);
            const result = testFunction.calculate(rate, pmt, pv, fv, type);
            expect(transformToValue(result.getArrayValue())).toStrictEqual([
                [ErrorType.VALUE, 18.769843284838526, ErrorType.DIV_BY_ZERO, ErrorType.NA],
                [3.324527806346263, 45, ErrorType.NAME, ErrorType.NA],
                [ErrorType.NUM, 2.5296801547320293, 0.49892198580547814, ErrorType.NA],
            ]);
        });
    });
});

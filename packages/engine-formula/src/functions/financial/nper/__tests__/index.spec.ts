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
import { getObjectValue } from '../../../util';
import { FUNCTION_NAMES_FINANCIAL } from '../../function-names';
import { Nper } from '../index';

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
            expect(getObjectValue(result, true)).toBe(60.0821228538);

            const type2 = NumberValueObject.create(1);
            const result2 = testFunction.calculate(rate, pmt, pv, fv, type2);
            expect(getObjectValue(result2, true)).toBe(59.6738656743);
        });

        it('Value is error', () => {
            const rate = ErrorValueObject.create(ErrorType.NAME);
            const pmt = NumberValueObject.create(-100);
            const pv = NumberValueObject.create(-1000);
            const fv = NumberValueObject.create(10000);
            const type = NumberValueObject.create(0);
            const result = testFunction.calculate(rate, pmt, pv, fv, type);
            expect(getObjectValue(result)).toBe(ErrorType.NAME);
        });

        it('Value is boolean', () => {
            const rate = BooleanValueObject.create(true);
            const pmt = NumberValueObject.create(-100);
            const pv = NumberValueObject.create(-1000);
            const fv = NumberValueObject.create(10000);
            const type = NumberValueObject.create(0);
            const result = testFunction.calculate(rate, pmt, pv, fv, type);
            expect(getObjectValue(result, true)).toBe(3.19877986411);
        });

        it('Value is blank cell', () => {
            const rate = NullValueObject.create();
            const pmt = NumberValueObject.create(-100);
            const pv = NumberValueObject.create(-1000);
            const fv = NumberValueObject.create(10000);
            const type = NumberValueObject.create(0);
            const result = testFunction.calculate(rate, pmt, pv, fv, type);
            expect(getObjectValue(result)).toBe(90);
        });

        it('Value is normal string', () => {
            const rate = StringValueObject.create('test');
            const pmt = NumberValueObject.create(-100);
            const pv = NumberValueObject.create(-1000);
            const fv = NumberValueObject.create(10000);
            const type = NumberValueObject.create(0);
            const result = testFunction.calculate(rate, pmt, pv, fv, type);
            expect(getObjectValue(result)).toBe(ErrorType.VALUE);
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
            expect(getObjectValue(result, true)).toStrictEqual([
                [ErrorType.VALUE, 18.7698432848, ErrorType.DIV_BY_ZERO, ErrorType.NA],
                [3.32452780635, 45, ErrorType.NAME, ErrorType.NA],
                [ErrorType.NUM, 2.52968015473, 0.498921985805, ErrorType.NA],
            ]);
        });
    });
});

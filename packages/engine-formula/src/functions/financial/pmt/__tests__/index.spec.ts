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
import { Pmt } from '../index';

describe('Test pmt function', () => {
    const testFunction = new Pmt(FUNCTION_NAMES_FINANCIAL.PMT);

    describe('Pmt', () => {
        it('Value is normal', () => {
            const rate = NumberValueObject.create(0.08 / 12);
            const nper = NumberValueObject.create(10);
            const pv = NumberValueObject.create(100000);
            const fv = NumberValueObject.create(0);
            const type = NumberValueObject.create(0);
            const result = testFunction.calculate(rate, nper, pv, fv, type);
            expect(getObjectValue(result, true)).toBe(-10370.3208935916);

            const type2 = NumberValueObject.create(1);
            const result2 = testFunction.calculate(rate, nper, pv, fv, type2);
            expect(getObjectValue(result2, true)).toBe(-10301.6432717798);
        });

        it('Value is error', () => {
            const rate = ErrorValueObject.create(ErrorType.NAME);
            const nper = NumberValueObject.create(10);
            const pv = NumberValueObject.create(100000);
            const fv = NumberValueObject.create(0);
            const type = NumberValueObject.create(0);
            const result = testFunction.calculate(rate, nper, pv, fv, type);
            expect(getObjectValue(result)).toBe(ErrorType.NAME);
        });

        it('Value is boolean', () => {
            const rate = BooleanValueObject.create(true);
            const nper = NumberValueObject.create(10);
            const pv = NumberValueObject.create(100000);
            const fv = NumberValueObject.create(0);
            const type = NumberValueObject.create(0);
            const result = testFunction.calculate(rate, nper, pv, fv, type);
            expect(getObjectValue(result, true)).toBe(-100097.751710655);
        });

        it('Value is blank cell', () => {
            const rate = NullValueObject.create();
            const nper = NumberValueObject.create(10);
            const pv = NumberValueObject.create(100000);
            const fv = NumberValueObject.create(0);
            const type = NumberValueObject.create(0);
            const result = testFunction.calculate(rate, nper, pv, fv, type);
            expect(getObjectValue(result)).toBe(-10000);
        });

        it('Value is normal string', () => {
            const rate = StringValueObject.create('test');
            const nper = NumberValueObject.create(10);
            const pv = NumberValueObject.create(100000);
            const fv = NumberValueObject.create(0);
            const type = NumberValueObject.create(0);
            const result = testFunction.calculate(rate, nper, pv, fv, type);
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
            const nper = ArrayValueObject.create({
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
            const pv = NumberValueObject.create(100000);
            const fv = NumberValueObject.create(0);
            const type = NumberValueObject.create(0);
            const result = testFunction.calculate(rate, nper, pv, fv, type);
            expect(getObjectValue(result, true)).toStrictEqual([
                [ErrorType.VALUE, 0.0521173073586, ErrorType.NUM, ErrorType.NA],
                [-200000, 500, ErrorType.NAME, ErrorType.NA],
                [ErrorType.NUM, 2.68492712096e-65, ErrorType.NUM, ErrorType.NA],
            ]);
        });
    });
});

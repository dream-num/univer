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
import { ArrayValueObject, transformToValue, transformToValueObject } from '../../../../engine/value-object/array-value-object';
import { ErrorValueObject } from '../../../../engine/value-object/base-value-object';
import { BooleanValueObject, NullValueObject, NumberValueObject, StringValueObject } from '../../../../engine/value-object/primitive-object';
import { FUNCTION_NAMES_FINANCIAL } from '../../function-names';
import { Fv } from '../index';

describe('Test fv function', () => {
    const testFunction = new Fv(FUNCTION_NAMES_FINANCIAL.FV);

    describe('Fv', () => {
        it('Value is normal', () => {
            const rate = NumberValueObject.create(0.06 / 12);
            const nper = NumberValueObject.create(10);
            const pmt = NumberValueObject.create(-200);
            const pv = NumberValueObject.create(-500);
            const type = NumberValueObject.create(0);
            const result = testFunction.calculate(rate, nper, pmt, pv, type);
            expect(result.getValue()).toStrictEqual(2571.175347651979);

            const type2 = NumberValueObject.create(1);
            const result2 = testFunction.calculate(rate, nper, pmt, pv, type2);
            expect(result2.getValue()).toStrictEqual(2581.4033740601362);
        });

        it('Result is NaN', () => {
            const rate = NumberValueObject.create(-1);
            const nper = NumberValueObject.create(0);
            const pmt = NumberValueObject.create(-200);
            const pv = NumberValueObject.create(-500);
            const type = NumberValueObject.create(0);
            const result = testFunction.calculate(rate, nper, pmt, pv, type);
            expect(result.getValue()).toStrictEqual(ErrorType.NUM);
        });

        it('Value is error', () => {
            const rate = ErrorValueObject.create(ErrorType.NAME);
            const nper = NumberValueObject.create(10);
            const pmt = NumberValueObject.create(-200);
            const pv = NumberValueObject.create(-500);
            const type = NumberValueObject.create(0);
            const result = testFunction.calculate(rate, nper, pmt, pv, type);
            expect(result.getValue()).toStrictEqual(ErrorType.NAME);
        });

        it('Value is boolean', () => {
            const rate = BooleanValueObject.create(true);
            const nper = NumberValueObject.create(10);
            const pmt = NumberValueObject.create(-200);
            const pv = NumberValueObject.create(-500);
            const type = NumberValueObject.create(1);
            const result = testFunction.calculate(rate, nper, pmt, pv, type);
            expect(result.getValue()).toStrictEqual(921200);
        });

        it('Value is blank cell', () => {
            const rate = NullValueObject.create();
            const nper = NumberValueObject.create(10);
            const pmt = NumberValueObject.create(-200);
            const pv = NumberValueObject.create(-500);
            const type = NumberValueObject.create(1);
            const result = testFunction.calculate(rate, nper, pmt, pv, type);
            expect(result.getValue()).toStrictEqual(2500);
        });

        it('Value is normal string', () => {
            const rate = StringValueObject.create('test');
            const nper = NumberValueObject.create(10);
            const pmt = NumberValueObject.create(-200);
            const pv = NumberValueObject.create(-500);
            const type = NumberValueObject.create(1);
            const result = testFunction.calculate(rate, nper, pmt, pv, type);
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
            const nper = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [true, 10, false, null],
                ]),
                rowCount: 1,
                columnCount: 4,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const pmt = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [true],
                    [-200],
                    [false],
                    [null],
                ]),
                rowCount: 4,
                columnCount: 1,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const pv = NumberValueObject.create(-500);
            const type = NumberValueObject.create(1);
            const result = testFunction.calculate(rate, nper, pmt, pv, type);
            expect(transformToValue(result.getArrayValue())).toStrictEqual([
                [ErrorType.VALUE, 881.4522056325036, 500, ErrorType.NA],
                [1400, 2500, ErrorType.NAME, ErrorType.NA],
                [-10500, 1520612.7751707924, 500, ErrorType.NA],
                [ErrorType.NA, ErrorType.NA, ErrorType.NA, ErrorType.NA],
            ]);
        });
    });
});

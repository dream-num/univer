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
import { Rate } from '../index';
import { BooleanValueObject, NullValueObject, NumberValueObject, StringValueObject } from '../../../../engine/value-object/primitive-object';
import { ArrayValueObject, transformToValue, transformToValueObject } from '../../../../engine/value-object/array-value-object';
import { ErrorValueObject } from '../../../../engine/value-object/base-value-object';
import { ErrorType } from '../../../../basics/error-type';

describe('Test rate function', () => {
    const testFunction = new Rate(FUNCTION_NAMES_FINANCIAL.RATE);

    describe('Rate', () => {
        it('Value is normal', () => {
            const nper = NumberValueObject.create(4 * 12);
            const pmt = NumberValueObject.create(-200);
            const pv = NumberValueObject.create(100000);
            const fv = NumberValueObject.create(0);
            const type = NumberValueObject.create(0);
            const guess = NumberValueObject.create(0.1);
            const result = testFunction.calculate(nper, pmt, pv, fv, type, guess);
            expect(result.getValue()).toStrictEqual(-0.0726317700766071);

            const type2 = NumberValueObject.create(1);
            const result2 = testFunction.calculate(nper, pmt, pv, fv, type2, guess);
            expect(result2.getValue()).toStrictEqual(-0.07459013341097893);
        });

        it('Value is error', () => {
            const nper = ErrorValueObject.create(ErrorType.NAME);
            const pmt = NumberValueObject.create(-200);
            const pv = NumberValueObject.create(100000);
            const fv = NumberValueObject.create(0);
            const type = NumberValueObject.create(0);
            const guess = NumberValueObject.create(0.1);
            const result = testFunction.calculate(nper, pmt, pv, fv, type, guess);
            expect(result.getValue()).toStrictEqual(ErrorType.NAME);
        });

        it('Value is boolean', () => {
            const nper = BooleanValueObject.create(true);
            const pmt = NumberValueObject.create(-200);
            const pv = NumberValueObject.create(100000);
            const fv = NumberValueObject.create(0);
            const type = NumberValueObject.create(0);
            const guess = NumberValueObject.create(0.1);
            const result = testFunction.calculate(nper, pmt, pv, fv, type, guess);
            expect(result.getValue()).toStrictEqual(-0.9980000000000001);
        });

        it('Value is blank cell', () => {
            const nper = NullValueObject.create();
            const pmt = NumberValueObject.create(-200);
            const pv = NumberValueObject.create(100000);
            const fv = NumberValueObject.create(0);
            const type = NumberValueObject.create(0);
            const guess = NumberValueObject.create(0.1);
            const result = testFunction.calculate(nper, pmt, pv, fv, type, guess);
            expect(result.getValue()).toStrictEqual(ErrorType.NUM);
        });

        it('Value is normal string', () => {
            const nper = StringValueObject.create('test');
            const pmt = NumberValueObject.create(-200);
            const pv = NumberValueObject.create(100000);
            const fv = NumberValueObject.create(0);
            const type = NumberValueObject.create(0);
            const guess = NumberValueObject.create(0.1);
            const result = testFunction.calculate(nper, pmt, pv, fv, type, guess);
            expect(result.getValue()).toStrictEqual(ErrorType.VALUE);
        });

        it('Value is array', () => {
            const nper = ArrayValueObject.create({
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
            const pv = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [true],
                    [10],
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
            const fv = NumberValueObject.create(0);
            const type = NumberValueObject.create(0);
            const guess = NumberValueObject.create(0.1);
            const result = testFunction.calculate(nper, pmt, pv, fv, type, guess);
            expect(transformToValue(result.getArrayValue())).toStrictEqual([
                [ErrorType.VALUE, 39.93118175604701, ErrorType.NUM, ErrorType.NA],
                [ErrorType.NUM, ErrorType.NUM, ErrorType.NAME, ErrorType.NA],
                [ErrorType.NUM, ErrorType.NUM, ErrorType.NUM, ErrorType.NA],
                [ErrorType.NA, ErrorType.NA, ErrorType.NA, ErrorType.NA],
            ]);
        });
    });
});

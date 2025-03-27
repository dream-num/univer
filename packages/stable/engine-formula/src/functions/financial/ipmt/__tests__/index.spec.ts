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
import { Ipmt } from '../index';

describe('Test ipmt function', () => {
    const testFunction = new Ipmt(FUNCTION_NAMES_FINANCIAL.IPMT);

    describe('Ipmt', () => {
        it('Value is normal', () => {
            const rate = NumberValueObject.create(0.1 / 12);
            const per = NumberValueObject.create(1);
            const nper = NumberValueObject.create(3 * 12);
            const pv = NumberValueObject.create(80000);
            const fv = NumberValueObject.create(0);
            const type = NumberValueObject.create(0);
            const result = testFunction.calculate(rate, per, nper, pv, fv, type);
            expect(result.getValue()).toStrictEqual(-666.6666666666666);

            const type2 = NumberValueObject.create(1);
            const result2 = testFunction.calculate(rate, per, nper, pv, fv, type2);
            expect(result2.getValue()).toStrictEqual(0);
        });

        it('Value is error', () => {
            const rate = ErrorValueObject.create(ErrorType.NAME);
            const per = NumberValueObject.create(1);
            const nper = NumberValueObject.create(3 * 12);
            const pv = NumberValueObject.create(80000);
            const fv = NumberValueObject.create(0);
            const type = NumberValueObject.create(0);
            const result = testFunction.calculate(rate, per, nper, pv, fv, type);
            expect(result.getValue()).toStrictEqual(ErrorType.NAME);
        });

        it('Value is boolean', () => {
            const rate = BooleanValueObject.create(true);
            const per = NumberValueObject.create(1);
            const nper = NumberValueObject.create(3 * 12);
            const pv = NumberValueObject.create(80000);
            const fv = NumberValueObject.create(0);
            const type = NumberValueObject.create(0);
            const result = testFunction.calculate(rate, per, nper, pv, fv, type);
            expect(result.getValue()).toStrictEqual(-80000);
        });

        it('Value is blank cell', () => {
            const rate = NullValueObject.create();
            const per = NumberValueObject.create(1);
            const nper = NumberValueObject.create(3 * 12);
            const pv = NumberValueObject.create(80000);
            const fv = NumberValueObject.create(0);
            const type = NumberValueObject.create(0);
            const result = testFunction.calculate(rate, per, nper, pv, fv, type);
            expect(result.getValue()).toStrictEqual(-0);
        });

        it('Value is normal string', () => {
            const rate = StringValueObject.create('test');
            const per = NumberValueObject.create(1);
            const nper = NumberValueObject.create(3 * 12);
            const pv = NumberValueObject.create(80000);
            const fv = NumberValueObject.create(0);
            const type = NumberValueObject.create(0);
            const result = testFunction.calculate(rate, per, nper, pv, fv, type);
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
            const per = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [true, 2, false, null],
                ]),
                rowCount: 1,
                columnCount: 4,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const nper = ArrayValueObject.create({
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
            const pv = NumberValueObject.create(80000);
            const fv = NumberValueObject.create(0);
            const type = NumberValueObject.create(0);
            const result = testFunction.calculate(rate, per, nper, pv, fv, type);
            expect(transformToValue(result.getArrayValue())).toStrictEqual([
                [ErrorType.VALUE, ErrorType.NUM, ErrorType.NUM, ErrorType.NA],
                [-80000, -0, ErrorType.NAME, ErrorType.NA],
                [ErrorType.NUM, ErrorType.NUM, ErrorType.NUM, ErrorType.NA],
                [ErrorType.NA, ErrorType.NA, ErrorType.NA, ErrorType.NA],
            ]);
        });
    });
});

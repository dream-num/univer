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
import { Ispmt } from '../index';

describe('Test ispmt function', () => {
    const testFunction = new Ispmt(FUNCTION_NAMES_FINANCIAL.ISPMT);

    describe('Ispmt', () => {
        it('Value is normal', () => {
            const rate = NumberValueObject.create(0.1 / 12);
            const per = NumberValueObject.create(1);
            const nper = NumberValueObject.create(3 * 12);
            const pv = NumberValueObject.create(80000);
            const result = testFunction.calculate(rate, per, nper, pv);
            expect(result.getValue()).toStrictEqual(-648.1481481481482);
        });

        it('Nper value is 0', () => {
            const rate = NumberValueObject.create(0.1 / 12);
            const per = NumberValueObject.create(1);
            const nper = NumberValueObject.create(0);
            const pv = NumberValueObject.create(80000);
            const result = testFunction.calculate(rate, per, nper, pv);
            expect(result.getValue()).toStrictEqual(ErrorType.DIV_BY_ZERO);
        });

        it('Value is error', () => {
            const rate = ErrorValueObject.create(ErrorType.NAME);
            const per = NumberValueObject.create(1);
            const nper = NumberValueObject.create(3 * 12);
            const pv = NumberValueObject.create(80000);
            const result = testFunction.calculate(rate, per, nper, pv);
            expect(result.getValue()).toStrictEqual(ErrorType.NAME);
        });

        it('Value is boolean', () => {
            const rate = BooleanValueObject.create(true);
            const per = NumberValueObject.create(1);
            const nper = NumberValueObject.create(3 * 12);
            const pv = NumberValueObject.create(80000);
            const result = testFunction.calculate(rate, per, nper, pv);
            expect(result.getValue()).toStrictEqual(-77777.77777777778);
        });

        it('Value is blank cell', () => {
            const rate = NullValueObject.create();
            const per = NumberValueObject.create(1);
            const nper = NumberValueObject.create(3 * 12);
            const pv = NumberValueObject.create(80000);
            const result = testFunction.calculate(rate, per, nper, pv);
            expect(result.getValue()).toBe(-0);
        });

        it('Value is normal string', () => {
            const rate = StringValueObject.create('test');
            const per = NumberValueObject.create(1);
            const nper = NumberValueObject.create(3 * 12);
            const pv = NumberValueObject.create(80000);
            const result = testFunction.calculate(rate, per, nper, pv);
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
            const result = testFunction.calculate(rate, per, nper, pv);
            expect(transformToValue(result.getArrayValue())).toStrictEqual([
                [ErrorType.VALUE, 4800, -0, ErrorType.NA],
                [-72000, -0, ErrorType.NAME, ErrorType.NA],
                [ErrorType.DIV_BY_ZERO, ErrorType.DIV_BY_ZERO, ErrorType.DIV_BY_ZERO, ErrorType.NA],
                [ErrorType.NA, ErrorType.NA, ErrorType.NA, ErrorType.NA],
            ]);
        });
    });
});

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
import { Rri } from '../index';
import { BooleanValueObject, NullValueObject, NumberValueObject, StringValueObject } from '../../../../engine/value-object/primitive-object';
import { ArrayValueObject, transformToValue, transformToValueObject } from '../../../../engine/value-object/array-value-object';
import { ErrorValueObject } from '../../../../engine/value-object/base-value-object';
import { ErrorType } from '../../../../basics/error-type';

describe('Test rri function', () => {
    const testFunction = new Rri(FUNCTION_NAMES_FINANCIAL.RRI);

    describe('Rri', () => {
        it('Value is normal', () => {
            const nper = NumberValueObject.create(96);
            const pv = NumberValueObject.create(10000);
            const fv = NumberValueObject.create(11000);
            const result = testFunction.calculate(nper, pv, fv);
            expect(result.getValue()).toStrictEqual(0.0009933073762913303);
        });

        it('Nper <= 0', () => {
            const nper = NumberValueObject.create(-96);
            const pv = NumberValueObject.create(10000);
            const fv = NumberValueObject.create(11000);
            const result = testFunction.calculate(nper, pv, fv);
            expect(result.getValue()).toStrictEqual(ErrorType.NUM);
        });

        it('Pv === 0 && fv === 0', () => {
            const nper = NumberValueObject.create(96);
            const pv = NumberValueObject.create(0);
            const fv = NumberValueObject.create(0);
            const result = testFunction.calculate(nper, pv, fv);
            expect(result.getValue()).toStrictEqual(0);
        });

        it('Only pv === 0', () => {
            const nper = NumberValueObject.create(96);
            const pv = NumberValueObject.create(0);
            const fv = NumberValueObject.create(11000);
            const result = testFunction.calculate(nper, pv, fv);
            expect(result.getValue()).toStrictEqual(ErrorType.NUM);
        });

        it('Fv / pv < 0', () => {
            const nper = NumberValueObject.create(96);
            const pv = NumberValueObject.create(-10000);
            const fv = NumberValueObject.create(11000);
            const result = testFunction.calculate(nper, pv, fv);
            expect(result.getValue()).toStrictEqual(ErrorType.NUM);
        });

        it('Value is error', () => {
            const nper = ErrorValueObject.create(ErrorType.NAME);
            const pv = NumberValueObject.create(10000);
            const fv = NumberValueObject.create(11000);
            const result = testFunction.calculate(nper, pv, fv);
            expect(result.getValue()).toStrictEqual(ErrorType.NAME);
        });

        it('Value is boolean', () => {
            const nper = BooleanValueObject.create(true);
            const pv = NumberValueObject.create(10000);
            const fv = NumberValueObject.create(11000);
            const result = testFunction.calculate(nper, pv, fv);
            expect(result.getValue()).toStrictEqual(0.10000000000000009);
        });

        it('Value is blank cell', () => {
            const nper = NullValueObject.create();
            const pv = NumberValueObject.create(10000);
            const fv = NumberValueObject.create(11000);
            const result = testFunction.calculate(nper, pv, fv);
            expect(result.getValue()).toStrictEqual(ErrorType.NUM);
        });

        it('Value is normal string', () => {
            const nper = StringValueObject.create('test');
            const pv = NumberValueObject.create(10000);
            const fv = NumberValueObject.create(11000);
            const result = testFunction.calculate(nper, pv, fv);
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
            const result = testFunction.calculate(nper, pv, fv);
            expect(transformToValue(result.getArrayValue())).toStrictEqual([
                [ErrorType.VALUE, -1, ErrorType.NUM],
                [-1, ErrorType.NUM, ErrorType.NAME],
                [ErrorType.NUM, 0, 0],
                [ErrorType.NA, ErrorType.NA, ErrorType.NA],
            ]);
        });
    });
});

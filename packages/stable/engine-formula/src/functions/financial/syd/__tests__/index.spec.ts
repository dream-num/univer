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
import { Syd } from '../index';

describe('Test syd function', () => {
    const testFunction = new Syd(FUNCTION_NAMES_FINANCIAL.SYD);

    describe('Syd', () => {
        it('Value is normal', () => {
            const cost = NumberValueObject.create(300000);
            const salvage = NumberValueObject.create(75000);
            const life = NumberValueObject.create(10);
            const per = NumberValueObject.create(10);
            const result = testFunction.calculate(cost, salvage, life, per);
            expect(result.getValue()).toStrictEqual(4090.909090909091);
        });

        it('Value is normal string', () => {
            const cost = StringValueObject.create('test');
            const salvage = NumberValueObject.create(75000);
            const life = NumberValueObject.create(10);
            const per = NumberValueObject.create(10);
            const result = testFunction.calculate(cost, salvage, life, per);
            expect(result.getValue()).toStrictEqual(ErrorType.VALUE);
        });

        it('Value is boolean', () => {
            const cost = NumberValueObject.create(300000);
            const salvage = NumberValueObject.create(75000);
            const life = BooleanValueObject.create(true);
            const per = NumberValueObject.create(1);
            const result = testFunction.calculate(cost, salvage, life, per);
            expect(result.getValue()).toStrictEqual(225000);
        });

        it('Value is null', () => {
            const cost = NumberValueObject.create(300000);
            const salvage = NumberValueObject.create(75000);
            const life = NullValueObject.create();
            const per = NumberValueObject.create(10);
            const result = testFunction.calculate(cost, salvage, life, per);
            expect(result.getValue()).toStrictEqual(ErrorType.NUM);
        });

        it('Value is error', () => {
            const cost = NumberValueObject.create(300000);
            const salvage = ErrorValueObject.create(ErrorType.NAME);
            const life = NumberValueObject.create(10);
            const per = NumberValueObject.create(10);
            const result = testFunction.calculate(cost, salvage, life, per);
            expect(result.getValue()).toStrictEqual(ErrorType.NAME);

            const salvage2 = NumberValueObject.create(75000);
            const life2 = ErrorValueObject.create(ErrorType.NAME);
            const result2 = testFunction.calculate(cost, salvage2, life2, per);
            expect(result2.getValue()).toStrictEqual(ErrorType.NAME);

            const per2 = ErrorValueObject.create(ErrorType.NAME);
            const result3 = testFunction.calculate(cost, salvage2, life, per2);
            expect(result3.getValue()).toStrictEqual(ErrorType.NAME);
        });

        it('Salvage < 0', () => {
            const cost = NumberValueObject.create(300000);
            const salvage = NumberValueObject.create(-1);
            const life = NumberValueObject.create(10);
            const per = NumberValueObject.create(10);
            const result = testFunction.calculate(cost, salvage, life, per);
            expect(result.getValue()).toStrictEqual(ErrorType.NUM);
        });

        it('Per > life', () => {
            const cost = NumberValueObject.create(300000);
            const salvage = NumberValueObject.create(75000);
            const life = NumberValueObject.create(10);
            const per = NumberValueObject.create(11);
            const result = testFunction.calculate(cost, salvage, life, per);
            expect(result.getValue()).toStrictEqual(ErrorType.NUM);
        });

        it('value is array', () => {
            const cost = ArrayValueObject.create({
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
            const salvage = ArrayValueObject.create({
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
            const life = ArrayValueObject.create({
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
            const per = NumberValueObject.create(1);
            const result = testFunction.calculate(cost, salvage, life, per);
            expect(transformToValue(result.getArrayValue())).toStrictEqual([
                [ErrorType.VALUE, ErrorType.NUM, 0, ErrorType.NA],
                [0, ErrorType.NUM, ErrorType.NAME, ErrorType.NA],
                [ErrorType.NUM, ErrorType.NUM, ErrorType.NUM, ErrorType.NA],
                [ErrorType.NA, ErrorType.NA, ErrorType.NA, ErrorType.NA],
            ]);
        });
    });
});

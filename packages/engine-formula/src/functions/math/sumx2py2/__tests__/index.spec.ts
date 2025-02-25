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

import { FUNCTION_NAMES_MATH } from '../../function-names';
import { Sumx2py2 } from '../index';
import { BooleanValueObject, NullValueObject, NumberValueObject, StringValueObject } from '../../../../engine/value-object/primitive-object';
import { ArrayValueObject, transformToValueObject } from '../../../../engine/value-object/array-value-object';
import { ErrorType } from '../../../../basics/error-type';
import { ErrorValueObject } from '../../../../engine/value-object/base-value-object';
import { stripErrorMargin } from '../../../../engine/utils/math-kit';

describe('Test sumx2py2 function', () => {
    const testFunction = new Sumx2py2(FUNCTION_NAMES_MATH.SUMX2PY2);

    describe('Sumx2py2', () => {
        it('Value is normal number', () => {
            const arrayX = NumberValueObject.create(1);
            const arrayY = NumberValueObject.create(2);
            const result = testFunction.calculate(arrayX, arrayY);
            expect(result.getValue()).toBe(5);
        });

        it('Value is number string', () => {
            const arrayX = StringValueObject.create('-3');
            const arrayY = NumberValueObject.create(2);
            const result = testFunction.calculate(arrayX, arrayY);
            expect(result.getValue()).toBe(13);
        });

        it('arrayX is number, arrayY is string', () => {
            const arrayX = NumberValueObject.create(1);
            const arrayY = StringValueObject.create('test');
            const result = testFunction.calculate(arrayX, arrayY);
            expect(result.getValue()).toBe(ErrorType.DIV_BY_ZERO);
        });

        it('arrayX is number, arrayY is bo', () => {
            const arrayX = NumberValueObject.create(1);

            let arrayY = BooleanValueObject.create(true);
            let result = testFunction.calculate(arrayX, arrayY);
            expect(result.getValue()).toBe(ErrorType.DIV_BY_ZERO);

            arrayY = BooleanValueObject.create(false);
            result = testFunction.calculate(arrayX, arrayY);
            expect(result.getValue()).toBe(ErrorType.DIV_BY_ZERO);
        });

        it('arrayX is number, arrayY is blank cell', () => {
            const arrayX = NumberValueObject.create(1);
            const arrayY = NullValueObject.create();
            const result = testFunction.calculate(arrayX, arrayY);
            expect(result.getValue()).toBe(ErrorType.VALUE);
        });

        it('arrayX is number, arrayY is error', () => {
            const arrayX = NumberValueObject.create(1);
            const arrayY = ErrorValueObject.create(ErrorType.NAME);
            const result = testFunction.calculate(arrayX, arrayY);
            expect(result.getValue()).toBe(ErrorType.NAME);
        });

        it('arrayX.length !== arrayY.length', () => {
            const arrayX = NumberValueObject.create(1);
            const arrayY = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [1, null],
                    [0, ErrorType.VALUE],
                ]),
                rowCount: 2,
                columnCount: 2,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const result = testFunction.calculate(arrayX, arrayY);
            expect(result.getValue()).toBe(ErrorType.NA);
        });

        it('arrayX.length === arrayY.length', () => {
            const arrayX = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [1, 2, 3],
                    [4, 5, 6],
                ]),
                rowCount: 2,
                columnCount: 3,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const arrayY = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [1, null],
                    ['test', 2],
                    [3, true],
                ]),
                rowCount: 3,
                columnCount: 2,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const result = testFunction.calculate(arrayX, arrayY);
            expect(stripErrorMargin(Number(result.getValue()))).toBe(56);
        });
    });
});

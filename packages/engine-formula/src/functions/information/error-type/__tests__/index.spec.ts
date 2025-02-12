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

import { FUNCTION_NAMES_INFORMATION } from '../../function-names';
import { BooleanValueObject, NullValueObject, NumberValueObject, StringValueObject } from '../../../../engine/value-object/primitive-object';
import { ArrayValueObject, transformToValue, transformToValueObject } from '../../../../engine/value-object/array-value-object';
import { ErrorValueObject } from '../../../../engine/value-object/base-value-object';
import { ErrorType as ErrorTypeBase } from '../../../../basics/error-type';
import { ErrorType } from '../index';

describe('Test error.type function', () => {
    const testFunction = new ErrorType(FUNCTION_NAMES_INFORMATION.ERROR_TYPE);

    describe('ErrorType', () => {
        it('errorVal is error', () => {
            let errorVal = ErrorValueObject.create(ErrorTypeBase.NA);
            let result = testFunction.calculate(errorVal);
            expect(result.getValue()).toBe(7);

            errorVal = ErrorValueObject.create(ErrorTypeBase.SPILL);
            result = testFunction.calculate(errorVal);
            expect(result.getValue()).toBe(ErrorTypeBase.NA);
        });

        it('errorVal is number', () => {
            const errorVal = NumberValueObject.create(222);
            const result = testFunction.calculate(errorVal);
            expect(result.getValue()).toBe(ErrorTypeBase.NA);

            const errorVal2 = StringValueObject.create('1234');
            const result2 = testFunction.calculate(errorVal2);
            expect(result2.getValue()).toBe(ErrorTypeBase.NA);
        });

        it('errorVal is string', () => {
            const errorVal = StringValueObject.create('test');
            const result = testFunction.calculate(errorVal);
            expect(result.getValue()).toBe(ErrorTypeBase.NA);
        });

        it('errorVal is boolean', () => {
            let errorVal = BooleanValueObject.create(true);
            let result = testFunction.calculate(errorVal);
            expect(result.getValue()).toBe(ErrorTypeBase.NA);

            errorVal = BooleanValueObject.create(false);
            result = testFunction.calculate(errorVal);
            expect(result.getValue()).toBe(ErrorTypeBase.NA);
        });

        it('errorVal is blank cell', () => {
            const errorVal = NullValueObject.create();
            const result = testFunction.calculate(errorVal);
            expect(result.getValue()).toBe(ErrorTypeBase.NA);
        });

        it('value array', () => {
            const value = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [ErrorTypeBase.DIV_BY_ZERO, ErrorTypeBase.NAME, ErrorTypeBase.VALUE, ErrorTypeBase.NUM, ErrorTypeBase.NA, ErrorTypeBase.CYCLE, ErrorTypeBase.REF, ErrorTypeBase.SPILL],
                    [ErrorTypeBase.CALC, ErrorTypeBase.ERROR, ErrorTypeBase.CONNECT, ErrorTypeBase.NULL, null, true, false, 'test'],
                ]),
                rowCount: 2,
                columnCount: 8,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const result = testFunction.calculate(value);
            expect(transformToValue(result.getArrayValue())).toStrictEqual([
                [2, 5, 3, 6, 7, ErrorTypeBase.NA, 4, ErrorTypeBase.NA],
                [14, ErrorTypeBase.NA, 8, 1, ErrorTypeBase.NA, ErrorTypeBase.NA, ErrorTypeBase.NA, ErrorTypeBase.NA],
            ]);
        });
    });
});

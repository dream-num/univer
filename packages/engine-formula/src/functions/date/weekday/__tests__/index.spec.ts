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

import { FUNCTION_NAMES_DATE } from '../../function-names';
import { Weekday } from '../index';
import { BooleanValueObject, NullValueObject, NumberValueObject, StringValueObject } from '../../../../engine/value-object/primitive-object';
import { ArrayValueObject, transformToValue, transformToValueObject } from '../../../../engine/value-object/array-value-object';
import { ErrorValueObject } from '../../../../engine/value-object/base-value-object';
import { ErrorType } from '../../../../basics/error-type';

describe('Test weekday function', () => {
    const testFunction = new Weekday(FUNCTION_NAMES_DATE.WEEKDAY);

    describe('Weekday', () => {
        it('Value is all normal', () => {
            const serialNumber = NumberValueObject.create(43832);
            const returnType = NumberValueObject.create(2);
            const result = testFunction.calculate(serialNumber, returnType);
            expect(result.getValue()).toStrictEqual(4);

            const serialNumber2 = StringValueObject.create('2008-11-26');
            const returnType2 = NumberValueObject.create(1);
            const result2 = testFunction.calculate(serialNumber2, returnType2);
            expect(result2.getValue()).toStrictEqual(4);
        });

        it('Value is error', () => {
            const serialNumber = ErrorValueObject.create(ErrorType.NAME);
            const returnType = NumberValueObject.create(2);
            const result = testFunction.calculate(serialNumber, returnType);
            expect(result.getValue()).toStrictEqual(ErrorType.NAME);

            const serialNumber2 = StringValueObject.create('2008-11-26');
            const returnType2 = ErrorValueObject.create(ErrorType.NAME);
            const result2 = testFunction.calculate(serialNumber2, returnType2);
            expect(result2.getValue()).toStrictEqual(ErrorType.NAME);
        });

        it('Value is boolean', () => {
            const serialNumber = BooleanValueObject.create(false);
            const returnType = NumberValueObject.create(2);
            const result = testFunction.calculate(serialNumber, returnType);
            expect(result.getValue()).toStrictEqual(6);

            const serialNumber2 = StringValueObject.create('2008-11-26');
            const returnType2 = BooleanValueObject.create(true);
            const result2 = testFunction.calculate(serialNumber2, returnType2);
            expect(result2.getValue()).toStrictEqual(4);
        });

        it('Value is blank cell', () => {
            const serialNumber = NullValueObject.create();
            const returnType = NumberValueObject.create(2);
            const result = testFunction.calculate(serialNumber, returnType);
            expect(result.getValue()).toStrictEqual(6);

            const serialNumber2 = StringValueObject.create('2008-11-26');
            const returnType2 = NullValueObject.create();
            const result2 = testFunction.calculate(serialNumber2, returnType2);
            expect(result2.getValue()).toStrictEqual(ErrorType.NUM);
        });

        it('Value is array', () => {
            const serialNumber = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    ['2008-11-26', '2008-12-4', '2009-1-21'],
                ]),
                rowCount: 1,
                columnCount: 3,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const returnType = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [1],
                    [2.5],
                    [3],
                    [true],
                    ['abc'],
                    [-6],
                    [999999],
                ]),
                rowCount: 7,
                columnCount: 1,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const result = testFunction.calculate(serialNumber, returnType);
            expect(transformToValue(result.getArrayValue())).toStrictEqual([
                [4, 5, 4],
                [3, 4, 3],
                [2, 3, 2],
                [4, 5, 4],
                [ErrorType.VALUE, ErrorType.VALUE, ErrorType.VALUE],
                [ErrorType.NUM, ErrorType.NUM, ErrorType.NUM],
                [ErrorType.NUM, ErrorType.NUM, ErrorType.NUM],
            ]);
        });
    });
});

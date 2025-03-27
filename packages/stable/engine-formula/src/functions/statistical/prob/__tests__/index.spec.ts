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
import { getObjectValue } from '../../../__tests__/create-function-test-bed';
import { FUNCTION_NAMES_STATISTICAL } from '../../function-names';
import { Prob } from '../index';

describe('Test prob function', () => {
    const testFunction = new Prob(FUNCTION_NAMES_STATISTICAL.PROB);

    describe('Prob', () => {
        it('Value is normal', () => {
            const xRange = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [0, 1, 2, 3],
                ]),
                rowCount: 1,
                columnCount: 4,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const probRange = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [0.2, 0.3, 0.1, 0.4],
                ]),
                rowCount: 1,
                columnCount: 4,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const lowerLimit = NumberValueObject.create(2);
            const upperLimit = NullValueObject.create();
            const result = testFunction.calculate(xRange, probRange, lowerLimit, upperLimit);
            expect(getObjectValue(result)).toBe(0.1);
        });

        it('XRange and probRange value test', () => {
            let xRange = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [0, 1, 2, 3, null],
                ]),
                rowCount: 1,
                columnCount: 5,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            let probRange = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [0.2, 0.3, 0.1, 0.4],
                ]),
                rowCount: 1,
                columnCount: 4,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const lowerLimit = NumberValueObject.create(2);
            let result = testFunction.calculate(xRange, probRange, lowerLimit);
            expect(getObjectValue(result)).toBe(ErrorType.NA);

            xRange = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [null],
                ]),
                rowCount: 1,
                columnCount: 1,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            probRange = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [null],
                ]),
                rowCount: 1,
                columnCount: 1,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            result = testFunction.calculate(xRange, probRange, lowerLimit);
            expect(getObjectValue(result)).toBe(ErrorType.VALUE);

            xRange = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [null, true, false, 'test'],
                ]),
                rowCount: 1,
                columnCount: 4,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            probRange = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [0.2, 0.3, 0.1, 0.4],
                ]),
                rowCount: 1,
                columnCount: 4,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            result = testFunction.calculate(xRange, probRange, lowerLimit);
            expect(getObjectValue(result)).toBe(ErrorType.DIV_BY_ZERO);

            xRange = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [ErrorType.NAME, 1, 2, 3],
                ]),
                rowCount: 1,
                columnCount: 4,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            result = testFunction.calculate(xRange, probRange, lowerLimit);
            expect(getObjectValue(result)).toBe(ErrorType.NAME);

            const xRange2 = ErrorValueObject.create(ErrorType.NAME);
            const probRange2 = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [0.2, 0.3, 0.1, 0.4],
                ]),
                rowCount: 1,
                columnCount: 4,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const result2 = testFunction.calculate(xRange2, probRange2, lowerLimit);
            expect(getObjectValue(result2)).toBe(ErrorType.NAME);

            const xRange3 = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [0, 1, 2, 3],
                ]),
                rowCount: 1,
                columnCount: 4,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const probRange3 = ErrorValueObject.create(ErrorType.NAME);
            const result3 = testFunction.calculate(xRange3, probRange3, lowerLimit);
            expect(getObjectValue(result3)).toBe(ErrorType.NAME);

            const probRange4 = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [0.2, 0.3, 0.1, 1],
                ]),
                rowCount: 1,
                columnCount: 4,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const result4 = testFunction.calculate(xRange3, probRange4, lowerLimit);
            expect(getObjectValue(result4)).toBe(ErrorType.NUM);
        });

        it('LowerLimit and upperLimit value test', () => {
            const xRange = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [0, 1, 2, 3],
                ]),
                rowCount: 1,
                columnCount: 4,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const probRange = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [0.2, 0.3, 0.1, 0.4],
                ]),
                rowCount: 1,
                columnCount: 4,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const lowerLimit = NumberValueObject.create(2);
            const upperLimit = NumberValueObject.create(1);
            const result = testFunction.calculate(xRange, probRange, lowerLimit, upperLimit);
            expect(getObjectValue(result)).toBe(0);

            const lowerLimit2 = BooleanValueObject.create(true);
            const result2 = testFunction.calculate(xRange, probRange, lowerLimit2, upperLimit);
            expect(getObjectValue(result2)).toBe(0.3);

            const lowerLimit3 = NullValueObject.create();
            const result3 = testFunction.calculate(xRange, probRange, lowerLimit3, upperLimit);
            expect(getObjectValue(result3)).toBe(0.5);

            const lowerLimit4 = StringValueObject.create('test');
            const result4 = testFunction.calculate(xRange, probRange, lowerLimit4, upperLimit);
            expect(getObjectValue(result4)).toBe(ErrorType.VALUE);

            const lowerLimit5 = ErrorValueObject.create(ErrorType.NAME);
            const result5 = testFunction.calculate(xRange, probRange, lowerLimit5, upperLimit);
            expect(getObjectValue(result5)).toBe(ErrorType.NAME);

            const lowerLimit6 = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [-3, 1, 100, true, false, 'test', null, ErrorType.NAME],
                ]),
                rowCount: 1,
                columnCount: 8,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const result6 = testFunction.calculate(xRange, probRange, lowerLimit6, upperLimit);
            expect(getObjectValue(result6)).toStrictEqual([
                [0.5, 0.3, 0, 0.3, 0.5, ErrorType.VALUE, 0.5, ErrorType.NAME],
            ]);

            const upperLimit2 = ErrorValueObject.create(ErrorType.NAME);
            const result7 = testFunction.calculate(xRange, probRange, lowerLimit, upperLimit2);
            expect(getObjectValue(result7)).toBe(ErrorType.NAME);
        });
    });
});

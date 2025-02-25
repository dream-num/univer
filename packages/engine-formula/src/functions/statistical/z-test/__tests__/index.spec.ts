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
import { NumberValueObject } from '../../../../engine/value-object/primitive-object';
import { getObjectValue } from '../../../__tests__/create-function-test-bed';
import { FUNCTION_NAMES_STATISTICAL } from '../../function-names';
import { ZTest } from '../index';

describe('Test zTest function', () => {
    const testFunction = new ZTest(FUNCTION_NAMES_STATISTICAL.Z_TEST);

    describe('ZTest', () => {
        it('Value is normal', () => {
            const array = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [3, 6, 7, 8, 6, 5, 4, 2, 1, 9],
                ]),
                rowCount: 1,
                columnCount: 10,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const x = NumberValueObject.create(4);
            const result = testFunction.calculate(array, x);
            expect(getObjectValue(result)).toBe(0.09057419685136392);
        });

        it('Value is number string', () => {
            const array = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    ['\'3', '\'6', '\'7', '\'8', '\'6', '\'5', '\'4', '\'2', '\'1', '\'9'],
                ]),
                rowCount: 1,
                columnCount: 10,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const x = NumberValueObject.create(4);
            const result = testFunction.calculate(array, x);
            expect(getObjectValue(result)).toBe(ErrorType.NA);
        });

        it('Array value test', () => {
            const array = ArrayValueObject.create({
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
            const x = NumberValueObject.create(4);
            const result = testFunction.calculate(array, x);
            expect(getObjectValue(result)).toBe(ErrorType.NA);

            const array2 = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [3],
                ]),
                rowCount: 1,
                columnCount: 1,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const result2 = testFunction.calculate(array2, x);
            expect(getObjectValue(result2)).toBe(ErrorType.DIV_BY_ZERO);

            const array3 = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [3, true, false, null, 'test', 5, 4, 2, 1, ErrorType.NAME],
                ]),
                rowCount: 1,
                columnCount: 10,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const result3 = testFunction.calculate(array3, x);
            expect(getObjectValue(result3)).toStrictEqual(ErrorType.NAME);
        });

        it('X value test', () => {
            const array = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [3, 6, 7, 8, 6, 5, 4, 2, 1, 9],
                ]),
                rowCount: 1,
                columnCount: 10,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const x = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [-4, 100, 2.34, true, false, null, 'test', ErrorType.NAME],
                ]),
                rowCount: 1,
                columnCount: 8,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const result = testFunction.calculate(array, x);
            expect(getObjectValue(result)).toStrictEqual([
                [0, 1, 0.00039650182754802366, 3.1107494757876e-7, 2.8254398820592996e-10, 2.8254398820592996e-10, ErrorType.VALUE, ErrorType.NAME],
            ]);
        });

        it('Sigma value test', () => {
            const array = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [3, 6, 7, 8, 6, 5, 4, 2, 1, 9],
                ]),
                rowCount: 1,
                columnCount: 10,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const x = NumberValueObject.create(4);
            const sigma = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [-4, 100, 2.34, true, false, null, 'test', ErrorType.NAME],
                ]),
                rowCount: 1,
                columnCount: 8,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const result = testFunction.calculate(array, x, sigma);
            expect(getObjectValue(result)).toStrictEqual([
                [ErrorType.NUM, 0.48612556919551, 0.06856806925633085, 0.00025210911472450803, ErrorType.NUM, ErrorType.NUM, ErrorType.VALUE, ErrorType.NAME],
            ]);
        });
    });
});

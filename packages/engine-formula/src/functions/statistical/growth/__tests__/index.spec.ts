/**
 * Copyright 2023-present DreamNum Inc.
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
import { BooleanValueObject } from '../../../../engine/value-object/primitive-object';
import { getObjectValue } from '../../../__tests__/create-function-test-bed';
import { FUNCTION_NAMES_STATISTICAL } from '../../function-names';
import { Growth } from '../index';

describe('Test growth function', () => {
    const testFunction = new Growth(FUNCTION_NAMES_STATISTICAL.GROWTH);

    describe('Growth', () => {
        it('Value is normal', () => {
            const knownYs = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [33100, 47300, 69000, 102000, 150000, 220000],
                ]),
                rowCount: 1,
                columnCount: 6,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const knownXs = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [11, 1.2, 1.3, 14, 15, 16],
                ]),
                rowCount: 1,
                columnCount: 6,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const newXs = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [17, 18],
                ]),
                rowCount: 1,
                columnCount: 2,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const constb = BooleanValueObject.create(true);
            const result = testFunction.calculate(knownYs, knownXs, newXs, constb);
            expect(getObjectValue(result)).toStrictEqual([
                [136608.33775488456, 145970.01896985018],
            ]);
        });

        it('Only knownYs value', () => {
            const knownYs = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [33100],
                    [47300],
                    [69000],
                    [102000],
                    [150000],
                    [220000],
                ]),
                rowCount: 6,
                columnCount: 1,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const result = testFunction.calculate(knownYs);
            expect(getObjectValue(result)).toStrictEqual([
                [32618.20377353977],
                [47729.42261474775],
                [69841.30085621732],
                [102197.07337883205],
                [149542.48674004516],
                [218821.87621459411],
            ]);

            const knownYs2 = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [ErrorType.NAME],
                    [47300],
                    [69000],
                    [102000],
                    [150000],
                    [220000],
                ]),
                rowCount: 6,
                columnCount: 1,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const result2 = testFunction.calculate(knownYs2);
            expect(getObjectValue(result2)).toStrictEqual(ErrorType.NAME);

            const knownYs3 = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [null],
                    [47300],
                    [69000],
                    [102000],
                    [150000],
                    [220000],
                ]),
                rowCount: 6,
                columnCount: 1,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const result3 = testFunction.calculate(knownYs3);
            expect(getObjectValue(result3)).toStrictEqual(ErrorType.VALUE);

            const knownYs4 = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [true],
                    [47300],
                    [69000],
                    [102000],
                    [150000],
                    [220000],
                ]),
                rowCount: 6,
                columnCount: 1,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const result4 = testFunction.calculate(knownYs4);
            expect(getObjectValue(result4)).toStrictEqual(ErrorType.VALUE);

            const knownYs5 = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    ['test'],
                    [47300],
                    [69000],
                    [102000],
                    [150000],
                    [220000],
                ]),
                rowCount: 6,
                columnCount: 1,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const result5 = testFunction.calculate(knownYs5);
            expect(getObjectValue(result5)).toStrictEqual(ErrorType.VALUE);
        });

        it('Constb value test', () => {
            const knownYs = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [33100, 47300, 69000, 102000, 150000, 220000],
                ]),
                rowCount: 1,
                columnCount: 6,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const knownXs = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [11, 1.2, 1.3, 14, 15, 16],
                ]),
                rowCount: 1,
                columnCount: 6,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const newXs = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [17, 18],
                ]),
                rowCount: 1,
                columnCount: 2,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const constb = BooleanValueObject.create(false);
            const result = testFunction.calculate(knownYs, knownXs, newXs, constb);
            expect(getObjectValue(result)).toStrictEqual([
                [1806822.1964432136, 4216666.612455021],
            ]);

            const knownYs2 = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [33100],
                    [47300],
                    [69000],
                    [102000],
                    [150000],
                    [220000],
                ]),
                rowCount: 6,
                columnCount: 1,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const constb2 = BooleanValueObject.create(false);
            const result2 = testFunction.calculate(knownYs2, undefined, undefined, constb2);
            expect(getObjectValue(result2)).toStrictEqual([
                [14.74828953909258],
                [217.51204432890762],
                [3207.9306080026727],
                [47311.489428140674],
                [697763.5446119357],
                [10290818.785760397],
            ]);

            const constb3 = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    ['test', 1],
                    [2, ErrorType.NAME],
                ]),
                rowCount: 2,
                columnCount: 2,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const result3 = testFunction.calculate(knownYs2, undefined, undefined, constb3);
            expect(getObjectValue(result3)).toStrictEqual(ErrorType.VALUE);
        });

        it('Value is error', () => {
            const knownYs = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [33100, 47300, 69000, 102000, 150000, 220000],
                ]),
                rowCount: 1,
                columnCount: 6,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const knownXs = ErrorValueObject.create(ErrorType.NAME);
            const newXs = ErrorValueObject.create(ErrorType.NAME);
            const result = testFunction.calculate(knownYs, knownXs);
            expect(getObjectValue(result)).toStrictEqual(ErrorType.NAME);

            const result2 = testFunction.calculate(knownYs, undefined, newXs);
            expect(getObjectValue(result2)).toStrictEqual(ErrorType.NAME);
        });
    });
});

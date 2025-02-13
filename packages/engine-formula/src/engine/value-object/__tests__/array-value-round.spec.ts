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

import { ArrayValueObject, transformToValueObject } from '../array-value-object';
import { NumberValueObject } from '../primitive-object';
import { stripArrayValue } from '../../../functions/__tests__/create-function-test-bed';

describe('arrayValueObject round method test', () => {
    const originArrayValueObject = ArrayValueObject.create({
        calculateValueList: transformToValueObject([
            [0.1234, 0.9876, 0.5432, 0.6789, 0.4567],
            [0.2345, 0.8765, 0.321, 0.7654, 0.5432],
            [0.3456, 0.7654, 0.2109, 0.6543, 0.6789],
        ]),
        rowCount: 3,
        columnCount: 5,
        unitId: '',
        sheetId: '',
        row: 0,
        column: 0,
    });

    describe('round', () => {
        it('origin nm, param nm', () => {
            const roundArrayValueObject = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [2, 3, 4],
                    [1, 4, 2],
                ]),
                rowCount: 2,
                columnCount: 3,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });

            expect((originArrayValueObject.round(roundArrayValueObject) as ArrayValueObject).toValue()).toStrictEqual([
                [0.12, 0.988, 0.5432, '#N/A', '#N/A'],
                [0.2, 0.8765, 0.32, '#N/A', '#N/A'],
                ['#N/A', '#N/A', '#N/A', '#N/A', '#N/A'],
            ]);
        });

        it('origin nm, param 1m', () => {
            const roundArrayValueObject = ArrayValueObject.create({
                calculateValueList: transformToValueObject([[2, 2, 2, 3, 3]]),
                rowCount: 1,
                columnCount: 5,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });

            expect((originArrayValueObject.round(roundArrayValueObject) as ArrayValueObject).toValue()).toStrictEqual([
                [0.12, 0.99, 0.54, 0.679, 0.457],
                [0.23, 0.88, 0.32, 0.765, 0.543],
                [0.35, 0.77, 0.21, 0.654, 0.679],
            ]);
        });

        it('origin nm, param n1', () => {
            const roundArrayValueObject = ArrayValueObject.create({
                calculateValueList: transformToValueObject([[3], [2], [1]]),
                rowCount: 3,
                columnCount: 1,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });

            expect((originArrayValueObject.round(roundArrayValueObject) as ArrayValueObject).toValue()).toStrictEqual([
                [0.123, 0.988, 0.543, 0.679, 0.457],
                [0.23, 0.88, 0.32, 0.77, 0.54],
                [0.3, 0.8, 0.2, 0.7, 0.7],
            ]);
        });

        it('origin 1m, param nm', () => {
            const originArrayValueObject = ArrayValueObject.create({
                calculateValueList: transformToValueObject([[0.1234, 0.9876, 0.5432, 0.6789, 0.4567]]),
                rowCount: 1,
                columnCount: 5,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const roundArrayValueObject = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [2, 2, 2, 3, 3],
                    [3, 3, 3, 4, 4],
                    [4, 4, 4, 5, 5],
                ]),
                rowCount: 3,
                columnCount: 5,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });

            expect((originArrayValueObject.round(roundArrayValueObject) as ArrayValueObject).toValue()).toStrictEqual([
                [0.12, 0.99, 0.54, 0.679, 0.457],
                [0.123, 0.988, 0.543, 0.6789, 0.4567],
                [0.1234, 0.9876, 0.5432, 0.6789, 0.4567],
            ]);
        });

        it('origin n1, param nm', () => {
            const originArrayValueObject = ArrayValueObject.create({
                calculateValueList: transformToValueObject([[0.1234], [0.2345], [0.3456]]),
                rowCount: 3,
                columnCount: 1,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const roundArrayValueObject = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [2, 2, 2, 3, 3],
                    [3, 3, 3, 4, 4],
                    [4, 4, 4, 5, 5],
                ]),
                rowCount: 3,
                columnCount: 5,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });

            expect((originArrayValueObject.round(roundArrayValueObject) as ArrayValueObject).toValue()).toStrictEqual([
                [0.12, 0.12, 0.12, 0.123, 0.123],
                [0.235, 0.235, 0.235, 0.2345, 0.2345],
                [0.3456, 0.3456, 0.3456, 0.3456, 0.3456],
            ]);
        });

        it('origin nm multiple formats, param 1 number', () => {
            const originArrayValueObject = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [1, ' ', 1.23, true, false],
                    [0, '100', '2.34', 'test', -3],
                ]),
                rowCount: 2,
                columnCount: 5,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });

            const roundValueObject = NumberValueObject.create(1);

            expect((originArrayValueObject.round(roundValueObject) as ArrayValueObject).toValue()).toStrictEqual([
                [1, '#VALUE!', 1.2, 1, 0],
                [0, 100, 2.3, '#VALUE!', -3],
            ]);
        });

        it('origin 1 number, param nm multiple formats', () => {
            const originValueObject = NumberValueObject.create(1);
            const roundArrayValueObject = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [1, ' ', 1.23, true, false],
                    [0, '100', '2.34', 'test', -3],
                ]),
                rowCount: 2,
                columnCount: 5,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });

            expect(stripArrayValue((originValueObject.round(roundArrayValueObject) as ArrayValueObject).toValue())).toStrictEqual([
                [1, '#VALUE!', 1, 1, 1],
                [1, 1, 1, '#VALUE!', 0],
            ]);
        });
    });
});

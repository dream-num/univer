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

describe('arrayValueObject pow method test', () => {
    const originArrayValueObject = ArrayValueObject.create({
        calculateValueList: transformToValueObject([
            [1, 2, 3, 4, 5],
            [6, 7, 8, 9, 10],
            [11, 12, 13, 14, 15],
        ]),
        rowCount: 3,
        columnCount: 5,
        unitId: '',
        sheetId: '',
        row: 0,
        column: 0,
    });

    describe('pow', () => {
        it('origin nm, param nm', () => {
            const powArrayValueObject = ArrayValueObject.create({
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

            expect((originArrayValueObject.pow(powArrayValueObject) as ArrayValueObject).toValue()).toStrictEqual([
                [1, 8, 81, '#N/A', '#N/A'],
                [6, 2401, 64, '#N/A', '#N/A'],
                ['#N/A', '#N/A', '#N/A', '#N/A', '#N/A'],
            ]);
        });

        it('origin nm, param 1m', () => {
            const powArrayValueObject = ArrayValueObject.create({
                calculateValueList: transformToValueObject([[2, 2, 2, 3, 3]]),
                rowCount: 1,
                columnCount: 5,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });

            expect((originArrayValueObject.pow(powArrayValueObject) as ArrayValueObject).toValue()).toStrictEqual([
                [1, 4, 9, 64, 125],
                [36, 49, 64, 729, 1000],
                [121, 144, 169, 2744, 3375],
            ]);
        });

        it('origin nm, param n1', () => {
            const powArrayValueObject = ArrayValueObject.create({
                calculateValueList: transformToValueObject([[3], [2], [1]]),
                rowCount: 3,
                columnCount: 1,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });

            expect((originArrayValueObject.pow(powArrayValueObject) as ArrayValueObject).toValue()).toStrictEqual([
                [1, 8, 27, 64, 125],
                [36, 49, 64, 81, 100],
                [11, 12, 13, 14, 15],
            ]);
        });

        it('origin 1m, param nm', () => {
            const powArrayValueObject = ArrayValueObject.create({
                calculateValueList: transformToValueObject([[2, 2, 2, 3, 3]]),
                rowCount: 1,
                columnCount: 5,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });

            expect((powArrayValueObject.pow(originArrayValueObject) as ArrayValueObject).toValue()).toStrictEqual([
                [2, 4, 8, 81, 243],
                [64, 128, 256, 19683, 59049],
                [2048, 4096, 8192, 4782969, 14348907],
            ]);
        });

        it('origin n1, param nm', () => {
            const powArrayValueObject = ArrayValueObject.create({
                calculateValueList: transformToValueObject([[3], [2], [1]]),
                rowCount: 3,
                columnCount: 1,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });

            expect((powArrayValueObject.pow(originArrayValueObject) as ArrayValueObject).toValue()).toStrictEqual([
                [3, 9, 27, 81, 243],
                [64, 128, 256, 512, 1024],
                [1, 1, 1, 1, 1],
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

            expect((originArrayValueObject.pow(roundValueObject) as ArrayValueObject).toValue()).toStrictEqual([
                [1, '#VALUE!', 1.23, 1, 0],
                [0, 100, 2.34, '#VALUE!', -3],
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

            expect((originValueObject.pow(roundArrayValueObject) as ArrayValueObject).toValue()).toStrictEqual([
                [1, '#VALUE!', 1, 1, 1],
                [1, 1, 1, '#VALUE!', 1],
            ]);
        });
    });
});

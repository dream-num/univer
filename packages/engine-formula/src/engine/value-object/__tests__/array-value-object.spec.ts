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

/* eslint-disable no-magic-numbers */
import { describe, expect, it } from 'vitest';

import { ArrayValueObject, transformToValueObject } from '../array-value-object';

describe('arrayValueObject test', () => {
    const originArrayValueObject = new ArrayValueObject({
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

    describe('slice', () => {
        it('row==null;column=2,,', () => {
            expect(originArrayValueObject.slice(null, [2]).toValue()).toStrictEqual([
                [3, 4, 5],
                [8, 9, 10],
                [13, 14, 15],
            ]);
        });

        it('row==2,,;column=2,,', () => {
            expect(originArrayValueObject.slice([2], [2]).toValue()).toStrictEqual([[13, 14, 15]]);
        });

        it('row==,,2;column=2,,', () => {
            expect(originArrayValueObject.slice([undefined, undefined, 2], [2]).toValue()).toStrictEqual([
                [3, 4, 5],
                [13, 14, 15],
            ]);
        });

        it('row==1,,;column=null', () => {
            expect(originArrayValueObject.slice([1]).toValue()).toStrictEqual([
                [6, 7, 8, 9, 10],
                [11, 12, 13, 14, 15],
            ]);
        });

        it('row==0,1,;column=,,2', () => {
            expect(originArrayValueObject.slice([0, 1], [undefined, undefined, 2]).toValue()).toStrictEqual([
                [1, 3, 5],
                [6, 8, 10],
            ]);
        });
    });

    describe('pick', () => {
        it('normal', () => {
            const pickArrayValueObject = new ArrayValueObject({
                calculateValueList: transformToValueObject([
                    [true, false, false, true, false],
                    [true, false, true, false, false],
                    [true, false, true, false, false],
                ]),
                rowCount: 3,
                columnCount: 5,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });

            expect(originArrayValueObject.pick(pickArrayValueObject).toValue()).toStrictEqual([[1, 4, 6, 8, 11, 13]]);
        });

        it('not boolean', () => {
            const pickArrayValueObject = new ArrayValueObject({
                calculateValueList: transformToValueObject([
                    [true, false, false, 1, false],
                    [true, false, 1, false, false],
                    [true, false, 1, false, false],
                ]),
                rowCount: 3,
                columnCount: 5,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });

            expect(originArrayValueObject.pick(pickArrayValueObject).toValue()).toStrictEqual([[1, 6, 11]]);
        });

        it('pick and sum', () => {
            const pickArrayValueObject = new ArrayValueObject({
                calculateValueList: transformToValueObject([
                    [true, false, false, true, false],
                    [true, false, true, false, false],
                    [true, false, true, false, false],
                ]),
                rowCount: 3,
                columnCount: 5,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });

            expect(originArrayValueObject.pick(pickArrayValueObject).sum().getValue()).toStrictEqual(43);
        });
    });
});

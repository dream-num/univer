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

import type { IRange } from '@univerjs/core';
import { ObjectMatrix } from '@univerjs/core';
import { beforeEach, describe, expect, it } from 'vitest';

import type { ISheetData } from '../../../../basics/common';
import { ErrorType } from '../../../../basics/error-type';
import { RangeReferenceObject } from '../../../../engine/reference-object/range-reference-object';
import type { ArrayValueObject } from '../../../../engine/value-object/array-value-object';
import { ErrorValueObject } from '../../../../engine/value-object/base-value-object';
import { FUNCTION_NAMES_MATH } from '../../function-names';
import { Acosh } from '..';

const cellData = {
    0: {
        0: {
            v: 1,
        },
        1: {
            v: ' ',
        },
        2: {
            v: 1.23,
        },
        3: {
            v: true,
        },
        4: {
            v: false,
        },
    },
    1: {
        0: {
            v: 0,
        },
        1: {
            v: '100',
        },
        2: {
            v: '2.34',
        },
        3: {
            v: 'test',
        },
        4: {
            v: -3,
        },
    },
};

describe('test acosh', () => {
    let unitId: string;
    let sheetId: string;
    let sheetData: ISheetData = {};
    let acosh: Acosh;
    let acoshCalculate: (range: IRange) => ArrayValueObject;

    beforeEach(() => {
        unitId = 'test';
        sheetId = 'sheet1';
        sheetData = {
            [sheetId]: {
                cellData: new ObjectMatrix(cellData),
                rowCount: 4,
                columnCount: 3,
            },
        };

        // register acosh
        acosh = new Acosh(FUNCTION_NAMES_MATH.ACOSH);
        acoshCalculate = (range: IRange) => {
            // range

            const rangeRef = new RangeReferenceObject(range, sheetId, unitId);
            rangeRef.setUnitData({
                [unitId]: sheetData,
            });

            return acosh.calculate(rangeRef) as ArrayValueObject;
        };
    });

    describe('acosh', () => {
        describe('correct situations', () => {
            it('single cell', async () => {
                // cell A1
                const cell = {
                    startRow: 0,
                    startColumn: 0,
                    endRow: 0,
                    endColumn: 0,
                };

                const arrayValue = acoshCalculate(cell);
                expect(arrayValue.getFirstCell().getValue()).toBe(0);
            });
            it('range', async () => {
                // cell A1:E2
                const cell = {
                    startRow: 0,
                    startColumn: 0,
                    endRow: 1,
                    endColumn: 4,
                };

                const arrayValue = acoshCalculate(cell);
                expect(arrayValue.toValue()).toStrictEqual([
                    [0, '#VALUE!', 0.6658635291565548, 0, '#NUM!'],
                    ['#NUM!', 5.298292365610484, 1.494153066724473, '#VALUE!', '#NUM!'],
                ]);
            });
        });

        describe('fault situations', () => {
            it('value error', async () => {
                const error = ErrorValueObject.create(ErrorType.VALUE);
                const errorValue = acosh.calculate(error);
                expect(errorValue.isError()).toBeTruthy();
            });
        });
    });
});

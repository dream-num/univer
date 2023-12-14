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
import { RangeReferenceObject } from '../../../../engine/reference-object/range-reference-object';
import { ValueObjectFactory } from '../../../../engine/value-object/array-value-object';
import type { BaseValueObject } from '../../../../engine/value-object/base-value-object';
import { FUNCTION_NAMES_MATH } from '../../function-names';
import { Sumif } from '../sumif';

const cellData = {
    0: {
        0: {
            v: 1,
        },
        1: {
            v: 'Ada',
            t: 1,
        },
        2: {
            v: 1,
        },
    },
    1: {
        0: {
            v: 4,
        },
        1: {
            v: 'test1',
            t: 1,
        },
        2: {
            v: 1,
        },
    },
    2: {
        0: {
            v: 44,
        },
        1: {
            v: 'test12',
            t: 1,
        },
        2: {
            v: 1,
        },
    },
    3: {
        0: {
            v: 444,
        },
        1: {
            v: 'Univer',
            t: 1,
        },
        2: {
            v: 1,
        },
    },
};

describe('test sumif', () => {
    let unitId: string;
    let sheetId: string;
    let sheetData: ISheetData = {};
    let sumif: Sumif;
    let sumifCalculate: (range: IRange, criteria: string, sumRange?: IRange) => string | number | boolean;

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

        // register sumif
        sumif = new Sumif(FUNCTION_NAMES_MATH.SUMIF);
        sumifCalculate = (range: IRange, criteria: string, sumRange?: IRange) => {
            // range

            const rangeRef = new RangeReferenceObject(range, sheetId, unitId);
            rangeRef.setUnitData({
                [unitId]: sheetData,
            });

            // criteria
            const criteriaRef = ValueObjectFactory.create(criteria);
            let resultObject;
            if (sumRange) {
                // sum range
                const sumRangeRef = new RangeReferenceObject(sumRange, sheetId, unitId);
                sumRangeRef.setUnitData({
                    [unitId]: sheetData,
                });

                // calculate
                resultObject = sumif.calculate(rangeRef, criteriaRef, sumRangeRef) as BaseValueObject;
            } else {
                // calculate
                resultObject = sumif.calculate(rangeRef, criteriaRef) as BaseValueObject;
            }

            return resultObject?.getValue();
        };
    });

    describe('sumif', () => {
        it('range and criteria', async () => {
            // range A1:A4
            const range = {
                startRow: 0,
                startColumn: 0,
                endRow: 3,
                endColumn: 0,
            };

            const value = sumifCalculate(range, '>40');
            expect(value).toBe(488);
        });

        it('sum range with wildcard *', async () => {
            // range
            const range = {
                startRow: 0,
                startColumn: 1,
                endRow: 3,
                endColumn: 1,
            };

            // sum range
            const sumRange = {
                startRow: 0,
                startColumn: 2,
                endRow: 3,
                endColumn: 2,
            };

            const value = sumifCalculate(range, 'test*', sumRange);
            expect(value).toBe(2);
        });

        it('sum range with compare = and wildcard *', async () => {
            // range
            const range = {
                startRow: 0,
                startColumn: 1,
                endRow: 3,
                endColumn: 1,
            };

            // sum range
            const sumRange = {
                startRow: 0,
                startColumn: 2,
                endRow: 3,
                endColumn: 2,
            };

            const value = sumifCalculate(range, '=test*', sumRange);
            expect(value).toBe(2);
        });

        it('sum range with compare > and wildcard *', async () => {
            // range
            const range = {
                startRow: 0,
                startColumn: 1,
                endRow: 3,
                endColumn: 1,
            };

            // sum range
            const sumRange = {
                startRow: 0,
                startColumn: 2,
                endRow: 3,
                endColumn: 2,
            };

            const value = sumifCalculate(range, '>test*', sumRange);
            expect(value).toBe(3);
        });

        it('sum range with compare >= and wildcard *', async () => {
            // range
            const range = {
                startRow: 0,
                startColumn: 1,
                endRow: 3,
                endColumn: 1,
            };

            // sum range
            const sumRange = {
                startRow: 0,
                startColumn: 2,
                endRow: 3,
                endColumn: 2,
            };

            const value = sumifCalculate(range, '>=test*', sumRange);
            expect(value).toBe(3);
        });

        it('sum range with compare < and wildcard *', async () => {
            // range
            const range = {
                startRow: 0,
                startColumn: 1,
                endRow: 3,
                endColumn: 1,
            };

            // sum range
            const sumRange = {
                startRow: 0,
                startColumn: 2,
                endRow: 3,
                endColumn: 2,
            };

            const value = sumifCalculate(range, '<test*', sumRange);
            expect(value).toBe(1);
        });

        it('sum range with compare <= and wildcard *', async () => {
            // range
            const range = {
                startRow: 0,
                startColumn: 1,
                endRow: 3,
                endColumn: 1,
            };

            // sum range
            const sumRange = {
                startRow: 0,
                startColumn: 2,
                endRow: 3,
                endColumn: 2,
            };

            const value = sumifCalculate(range, '<=test*', sumRange);
            expect(value).toBe(1);
        });

        it('sum range with wildcard ?', async () => {
            // range
            const range = {
                startRow: 0,
                startColumn: 1,
                endRow: 3,
                endColumn: 1,
            };

            // sum range
            const sumRange = {
                startRow: 0,
                startColumn: 2,
                endRow: 3,
                endColumn: 2,
            };

            const value = sumifCalculate(range, 'test?', sumRange);
            expect(value).toBe(1);
        });

        it('sum range with compare = and wildcard ?', async () => {
            // range
            const range = {
                startRow: 0,
                startColumn: 1,
                endRow: 3,
                endColumn: 1,
            };

            // sum range
            const sumRange = {
                startRow: 0,
                startColumn: 2,
                endRow: 3,
                endColumn: 2,
            };

            const value = sumifCalculate(range, '=test??', sumRange);
            expect(value).toBe(1);
        });

        it('sum range with compare > and wildcard ?', async () => {
            // range
            const range = {
                startRow: 0,
                startColumn: 1,
                endRow: 3,
                endColumn: 1,
            };

            // sum range
            const sumRange = {
                startRow: 0,
                startColumn: 2,
                endRow: 3,
                endColumn: 2,
            };

            const value = sumifCalculate(range, '>test?', sumRange);
            expect(value).toBe(3);
        });

        it('sum range with compare >= and wildcard ?', async () => {
            // range
            const range = {
                startRow: 0,
                startColumn: 1,
                endRow: 3,
                endColumn: 1,
            };

            // sum range
            const sumRange = {
                startRow: 0,
                startColumn: 2,
                endRow: 3,
                endColumn: 2,
            };

            const value = sumifCalculate(range, '>=test??', sumRange);
            expect(value).toBe(3);
        });

        it('sum range with compare < and wildcard ?', async () => {
            // range
            const range = {
                startRow: 0,
                startColumn: 1,
                endRow: 2,
                endColumn: 1,
            };

            // sum range
            const sumRange = {
                startRow: 0,
                startColumn: 2,
                endRow: 2,
                endColumn: 2,
            };

            const value = sumifCalculate(range, '<test?', sumRange);
            expect(value).toBe(1);
        });

        it('sum range with compare <= and wildcard ?', async () => {
            // range
            const range = {
                startRow: 0,
                startColumn: 1,
                endRow: 2,
                endColumn: 1,
            };

            // sum range
            const sumRange = {
                startRow: 0,
                startColumn: 2,
                endRow: 2,
                endColumn: 2,
            };

            const value = sumifCalculate(range, '<=test??', sumRange);
            expect(value).toBe(1);
        });
    });
});

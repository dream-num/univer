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

import type { IWorkbookData, Univer } from '@univerjs/core';
import { LocaleType } from '@univerjs/core';
import type { Injector } from '@wendellhu/redi';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import type { ISheetData } from '../../../../basics/common';
import { RangeReferenceObject } from '../../../../engine/reference-object/range-reference-object';
import { ValueObjectFactory } from '../../../../engine/value-object/array-value-object';
import type { BaseValueObject } from '../../../../engine/value-object/base-value-object';
import { createCommandTestBed } from '../../../__tests__/create-command-test-bed';
import { FUNCTION_NAMES_MATH } from '../../function-names';
import { Sumif } from '../sumif';

const TEST_WORKBOOK_DATA: IWorkbookData = {
    id: 'test',
    appVersion: '3.0.0-alpha',
    sheets: {
        sheet1: {
            id: 'sheet1',
            cellData: {
                0: {
                    0: {
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
                    3: {
                        v: 'test1',
                        t: 1,
                    },
                },
                2: {
                    0: {
                        v: 44,
                    },
                    1: {
                        v: 'test2',
                        t: 1,
                    },
                    2: {
                        v: 1,
                    },
                    3: {
                        v: 'test12',
                        t: 1,
                    },
                },
                3: {
                    0: {
                        v: 444,
                    },
                    1: {
                        v: 'mock',
                        t: 1,
                    },
                    2: {
                        v: 1,
                    },
                    3: {
                        v: 'mock',
                        t: 1,
                    },
                },
            },
        },
    },
    locale: LocaleType.ZH_CN,
    name: '',
    sheetOrder: [],
    styles: {},
};

describe('test sumif', () => {
    let univer: Univer;
    let unitId: string;
    let sheetId: string;
    let sheetData: ISheetData = {};
    let sumif: Sumif;

    beforeEach(() => {
        const testBed = createCommandTestBed(TEST_WORKBOOK_DATA);
        univer = testBed.univer;
        unitId = testBed.unitId;
        sheetId = testBed.sheetId;
        sheetData = testBed.sheetData;

        // register sumif
        sumif = new Sumif(FUNCTION_NAMES_MATH.SUMIF);
    });

    afterEach(() => {
        univer.dispose();
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

            const rangeRef = new RangeReferenceObject(range, sheetId, unitId);
            rangeRef.setUnitData({
                [unitId]: sheetData,
            });

            // criteria >40
            const criteriaRef = ValueObjectFactory.create('>40');

            // calculate
            const resultObject = sumif.calculate(rangeRef, criteriaRef) as BaseValueObject;
            const value = resultObject?.getValue();
            expect(value).toBe(488);
        });

        it('sum range with wildcard *', async () => {
            // range
            const range = {
                startRow: 1,
                startColumn: 1,
                endRow: 3,
                endColumn: 1,
            };

            const rangeRef = new RangeReferenceObject(range, sheetId, unitId);
            rangeRef.setUnitData({
                [unitId]: sheetData,
            });

            // criteria
            const criteriaRef = ValueObjectFactory.create('test*');

            // sum range
            const sumRange = {
                startRow: 1,
                startColumn: 2,
                endRow: 3,
                endColumn: 2,
            };

            const sumRangeRef = new RangeReferenceObject(sumRange, sheetId, unitId);
            sumRangeRef.setUnitData({
                [unitId]: sheetData,
            });

            // calculate
            const resultObject = sumif.calculate(rangeRef, criteriaRef, sumRangeRef) as BaseValueObject;
            const value = resultObject?.getValue();
            expect(value).toBe(2);
        });

        it('sum range with wildcard ?', async () => {
            // range
            const range = {
                startRow: 1,
                startColumn: 3,
                endRow: 3,
                endColumn: 3,
            };

            const rangeRef = new RangeReferenceObject(range, sheetId, unitId);
            rangeRef.setUnitData({
                [unitId]: sheetData,
            });

            // criteria
            const criteriaRef = ValueObjectFactory.create('test?');

            // sum range
            const sumRange = {
                startRow: 1,
                startColumn: 2,
                endRow: 3,
                endColumn: 2,
            };

            const sumRangeRef = new RangeReferenceObject(sumRange, sheetId, unitId);
            sumRangeRef.setUnitData({
                [unitId]: sheetData,
            });

            // calculate
            const resultObject = sumif.calculate(rangeRef, criteriaRef, sumRangeRef) as BaseValueObject;
            const value = resultObject?.getValue();
            expect(value).toBe(1);
        });
    });
});

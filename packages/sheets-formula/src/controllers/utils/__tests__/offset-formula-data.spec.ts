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

import { removeFormulaData } from '../offset-formula-data';

describe('Utils offset formula data test', () => {
    describe('function removeFormulaData, remove sheet', () => {
        it('remove data', () => {
            const unitId = 'workbook-01';
            const sheetId = 'sheet-0011';
            const formulaData = {
                [unitId]: {
                    [sheetId]: {
                        0: {
                            0: {
                                f: '=SUM(A1)',
                            },
                        },
                    },
                },
            };

            removeFormulaData(formulaData, unitId, sheetId);

            expect(formulaData).toStrictEqual({
                [unitId]: {},
            });
        });

        it('remove blank worksheet', () => {
            const unitId = 'workbook-01';
            const sheetId = 'sheet-0011';
            const formulaData = {
                [unitId]: {
                    [sheetId]: {},
                },
            };

            removeFormulaData(formulaData, unitId, sheetId);

            expect(formulaData).toStrictEqual({
                [unitId]: {},
            });
        });

        it('remove blank workbook', () => {
            const unitId = 'workbook-01';
            const sheetId = 'sheet-0011';
            const formulaData = {
                [unitId]: {},
            };

            removeFormulaData(formulaData, unitId, sheetId);

            expect(formulaData).toStrictEqual({
                [unitId]: {},
            });
        });
        it('remove blank object', () => {
            const unitId = 'workbook-01';
            const sheetId = 'sheet-0011';
            const formulaData = {};

            removeFormulaData(formulaData, unitId, sheetId);

            expect(formulaData).toStrictEqual({});
        });
    });

    describe('function removeUnitFormulaData, remove unit', () => {
        it('remove data', () => {
            const unitId = 'workbook-01';
            const sheetId = 'sheet-0011';
            const formulaData = {
                [unitId]: {
                    [sheetId]: {
                        0: {
                            0: {
                                f: '=SUM(A1)',
                            },
                        },
                    },
                },
                'unit-2': {
                },
            };

            removeFormulaData(formulaData, unitId);

            expect(formulaData).toStrictEqual({
                'unit-2': {},
            });
        });

        it('remove blank workbook', () => {
            const unitId = 'workbook-01';
            const formulaData = {
                [unitId]: {},
                'unit-2': {},
            };

            removeFormulaData(formulaData, unitId);

            expect(formulaData).toStrictEqual({
                'unit-2': {},
            });
        });

        it('remove blank object', () => {
            const unitId = 'workbook-01';
            const formulaData = {};

            removeFormulaData(formulaData, unitId);

            expect(formulaData).toStrictEqual({});
        });
    });
});

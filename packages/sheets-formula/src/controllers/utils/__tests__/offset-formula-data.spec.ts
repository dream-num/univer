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

import { cellToRange } from '@univerjs/core';
import type {
    IDeleteRangeMoveLeftCommandParams,
    IDeleteRangeMoveUpCommandParams,
    IMoveRowsCommandParams,
    InsertRangeMoveDownCommandParams,
    InsertRangeMoveRightCommandParams,
    IRemoveRowColCommandParams,
} from '@univerjs/sheets';
import {
    DeleteRangeMoveLeftCommand,
    DeleteRangeMoveUpCommand,
    InsertColCommand,
    InsertRangeMoveDownCommand,
    InsertRangeMoveRightCommand,
    InsertRowCommand,
    MoveColsCommand,
    MoveRangeCommand,
    MoveRowsCommand,
    RemoveColCommand,
    RemoveRowCommand,
} from '@univerjs/sheets';
import { describe, expect, it } from 'vitest';

import { offsetArrayFormula, offsetFormula, removeFormulaData } from '../offset-formula-data';

describe('Utils offset formula data test', () => {
    describe('function offsetFormula', () => {
        it('move range normal formula', () => {
            const unitId = 'workbook-01';
            const sheetId = 'sheet-0011';
            const formulaData = {
                [unitId]: {
                    [sheetId]: {
                        0: {
                            3: {
                                f: '=SUM(A5)',
                            },
                        },
                    },
                },
            };

            const command = {
                id: MoveRangeCommand.id,
                params: {
                    fromRange: {
                        startRow: 0,
                        startColumn: 3,
                        endRow: 0,
                        endColumn: 3,
                    },
                    toRange: {
                        startRow: 3,
                        startColumn: 3,
                        endRow: 3,
                        endColumn: 3,
                    },
                },
            };

            const newFormulaData = offsetFormula(formulaData, command, unitId, sheetId);
            expect(newFormulaData).toStrictEqual({
                [unitId]: {
                    [sheetId]: {
                        0: {
                            3: null,
                        },
                        3: {
                            3: {
                                f: '=SUM(A5)',
                            },
                        },
                    },
                },
            });
        });
        it('move range array formula with first cell', () => {
            const unitId = 'workbook-01';
            const sheetId = 'sheet-0011';
            const arrayFormulaCellData = {
                [unitId]: {
                    [sheetId]: {
                        0: {
                            3: {
                                v: '1',
                            },
                        },
                        1: {
                            3: {
                                v: '2',
                            },
                        },
                        2: {
                            3: {
                                v: '3',
                            },
                        },
                    },
                },
            };
            const arrayFormulaRange = {
                [unitId]: {
                    [sheetId]: {
                        0: {
                            3: {
                                startRow: 0,
                                startColumn: 3,
                                endRow: 2,
                                endColumn: 3,
                            },
                        },
                    },
                },
            };

            const command = {
                id: MoveRangeCommand.id,
                params: {
                    fromRange: {
                        startRow: 0,
                        startColumn: 3,
                        endRow: 0,
                        endColumn: 3,
                    },
                    toRange: {
                        startRow: 3,
                        startColumn: 3,
                        endRow: 3,
                        endColumn: 3,
                    },
                },
            };

            const newFormulaData = offsetFormula(
                arrayFormulaCellData,
                command,
                unitId,
                sheetId,
                null,
                arrayFormulaRange
            );
            expect(newFormulaData).toStrictEqual({
                [unitId]: {
                    [sheetId]: {
                        0: {
                            3: null,
                        },
                        1: {
                            3: null,
                        },
                        2: {
                            3: null,
                        },
                        3: {
                            3: {
                                v: '1',
                            },
                        },
                    },
                },
            });
        });
        it('move range array formula with not first cell', () => {
            const unitId = 'workbook-01';
            const sheetId = 'sheet-0011';
            const arrayFormulaCellData = {
                [unitId]: {
                    [sheetId]: {
                        0: {
                            3: {
                                v: '1',
                            },
                        },
                        1: {
                            3: {
                                v: '2',
                            },
                        },
                        2: {
                            3: {
                                v: '3',
                            },
                        },
                        3: {
                            3: {
                                v: '4',
                            },
                        },
                    },
                },
            };
            const arrayFormulaRange = {
                [unitId]: {
                    [sheetId]: {
                        0: {
                            3: {
                                startRow: 0,
                                startColumn: 3,
                                endRow: 2,
                                endColumn: 3,
                            },
                        },
                    },
                },
            };

            const command = {
                id: MoveRangeCommand.id,
                params: {
                    fromRange: {
                        startRow: 1,
                        startColumn: 3,
                        endRow: 1,
                        endColumn: 3,
                    },
                    toRange: {
                        startRow: 3,
                        startColumn: 3,
                        endRow: 3,
                        endColumn: 3,
                    },
                },
            };

            const newFormulaData = offsetFormula(
                arrayFormulaCellData,
                command,
                unitId,
                sheetId,
                null,
                arrayFormulaRange
            );
            expect(newFormulaData).toStrictEqual({
                [unitId]: {
                    [sheetId]: {
                        0: {
                            3: {
                                v: '1',
                            },
                        },
                        1: {
                            3: {
                                v: '2',
                            },
                        },
                        2: {
                            3: {
                                v: '3',
                            },
                        },
                        3: {
                            3: null,
                        },
                    },
                },
            });
        });
        it('move rows', () => {
            const unitId = 'workbook-01';
            const sheetId = 'sheet-0011';
            const formulaData = {
                [unitId]: {
                    [sheetId]: {
                        0: {
                            3: {
                                f: '=SUM(A5)',
                            },
                        },
                    },
                },
            };

            const command = {
                id: MoveRowsCommand.id,
                params: {
                    fromRange: cellToRange(0, 1),
                    toRange: cellToRange(4, 1),
                } as IMoveRowsCommandParams,
            };

            const selections = [
                {
                    range: {
                        startRow: 0,
                        startColumn: 0,
                        endRow: 0,
                        endColumn: 19,
                        rangeType: 1,
                    },
                    primary: {
                        actualRow: 0,
                        actualColumn: 0,
                        isMerged: false,
                        isMergedMainCell: false,
                        startRow: 0,
                        startColumn: 0,
                        endRow: 0,
                        endColumn: 0,
                    },
                    style: {
                        strokeWidth: 2,
                        stroke: '#409f11',
                        fill: 'rgba(53, 50, 43, 0.1)',
                        widgets: {},
                        widgetSize: 6,
                        widgetStrokeWidth: 1,
                        widgetStroke: '#ffffff',
                        hasAutoFill: true,
                        AutofillSize: 6,
                        AutofillStrokeWidth: 1,
                        AutofillStroke: '#ffffff',
                        hasRowHeader: true,
                        rowHeaderFill: 'rgba(53, 50, 43, 0.1)',
                        rowHeaderStroke: '#409f11',
                        rowHeaderStrokeWidth: 1,
                        hasColumnHeader: true,
                        columnHeaderFill: 'rgba(53, 50, 43, 0.1)',
                        columnHeaderStroke: '#409f11',
                        columnHeaderStrokeWidth: 1,
                    },
                },
            ];

            const newFormulaData = offsetFormula(formulaData, command, unitId, sheetId, selections);
            expect(newFormulaData).toStrictEqual({
                [unitId]: {
                    [sheetId]: {
                        3: {
                            3: {
                                f: '=SUM(A5)',
                            },
                        },
                    },
                },
            });
        });
        it('move columns', () => {
            const unitId = 'workbook-01';
            const sheetId = 'sheet-0011';
            const formulaData = {
                [unitId]: {
                    [sheetId]: {
                        0: {
                            0: {
                                f: '=SUM(E2)',
                            },
                        },
                    },
                },
            };

            const command = {
                id: MoveColsCommand.id,
                params: {
                    fromRange: cellToRange(1, 0),
                    toRange: cellToRange(1, 4),
                } as IMoveRowsCommandParams,
            };

            const selections = [
                {
                    range: {
                        startRow: 0,
                        startColumn: 0,
                        endRow: 999,
                        endColumn: 0,
                        rangeType: 2,
                    },
                    primary: {
                        actualRow: 0,
                        actualColumn: 0,
                        isMerged: false,
                        isMergedMainCell: false,
                        startRow: 0,
                        startColumn: 0,
                        endRow: 0,
                        endColumn: 0,
                    },
                    style: {
                        strokeWidth: 2,
                        stroke: '#409f11',
                        fill: 'rgba(53, 50, 43, 0.1)',
                        widgets: {},
                        widgetSize: 6,
                        widgetStrokeWidth: 1,
                        widgetStroke: '#ffffff',
                        hasAutoFill: true,
                        AutofillSize: 6,
                        AutofillStrokeWidth: 1,
                        AutofillStroke: '#ffffff',
                        hasRowHeader: true,
                        rowHeaderFill: 'rgba(53, 50, 43, 0.1)',
                        rowHeaderStroke: '#409f11',
                        rowHeaderStrokeWidth: 1,
                        hasColumnHeader: true,
                        columnHeaderFill: 'rgba(53, 50, 43, 0.1)',
                        columnHeaderStroke: '#409f11',
                        columnHeaderStrokeWidth: 1,
                    },
                },
            ];

            const newFormulaData = offsetFormula(formulaData, command, unitId, sheetId, selections);
            expect(newFormulaData).toStrictEqual({
                [unitId]: {
                    [sheetId]: {
                        0: {
                            3: {
                                f: '=SUM(E2)',
                            },
                        },
                    },
                },
            });
        });
        it('insert row', () => {
            const unitId = 'workbook-01';
            const sheetId = 'sheet-0011';
            const formulaData = {
                [unitId]: {
                    [sheetId]: {
                        0: {
                            3: {
                                f: '=SUM(A1)',
                            },
                        },
                        1: {
                            3: {
                                f: '=SUM(A3)',
                            },
                        },
                    },
                },
            };

            const command = {
                id: InsertRowCommand.id,
                params: {
                    unitId,
                    subUnitId: sheetId,
                    direction: 2,
                    range: {
                        startRow: 1,
                        endRow: 1,
                        startColumn: 0,
                        endColumn: 19,
                    },
                },
            };

            const newFormulaData = offsetFormula(formulaData, command, unitId, sheetId);
            expect(newFormulaData).toStrictEqual({
                [unitId]: {
                    [sheetId]: {
                        0: {
                            3: {
                                f: '=SUM(A1)',
                            },
                        },
                        2: {
                            3: {
                                f: '=SUM(A3)',
                            },
                        },
                    },
                },
            });
        });
        it('insert row, handle arrayFormulaCellData, with arrayFormulaRange and refRanges', () => {
            const unitId = 'workbook-01';
            const sheetId = 'sheet-0011';
            const arrayFormulaCellData = {
                [unitId]: {
                    [sheetId]: {
                        4: {
                            0: {
                                v: 1,
                                t: 2,
                            },
                        },
                        5: {
                            0: {
                                v: 2,
                                t: 2,
                            },
                        },
                        6: {
                            0: {
                                v: 3,
                                t: 2,
                            },
                        },
                    },
                },
            };

            const command = {
                id: InsertRowCommand.id,
                params: {
                    unitId,
                    subUnitId: sheetId,
                    direction: 0,
                    range: {
                        startRow: 3,
                        endRow: 3,
                        startColumn: 0,
                        endColumn: 19,
                    },
                    cellValue: {},
                },
            };

            const arrayFormulaRange = {
                [unitId]: {
                    [sheetId]: {
                        4: {
                            0: {
                                startRow: 4,
                                startColumn: 0,
                                endRow: 6,
                                endColumn: 0,
                            },
                        },
                    },
                },
            };

            const refRanges = [
                {
                    row: 4,
                    column: 0,
                    range: {
                        startRow: 0,
                        startColumn: 0,
                        endRow: 2,
                        endColumn: 0,
                        startAbsoluteRefType: 0,
                        endAbsoluteRefType: 0,
                    },
                },
            ];

            const newFormulaData = offsetFormula(
                arrayFormulaCellData,
                command,
                unitId,
                sheetId,
                null,
                arrayFormulaRange,
                refRanges
            );
            expect(newFormulaData).toStrictEqual({
                [unitId]: {
                    [sheetId]: {
                        4: {
                            0: null,
                        },
                        5: {
                            0: null,
                        },
                        6: {
                            0: null,
                        },
                    },
                },
            });
        });
        it('insert row, handle arrayFormulaRange', () => {
            const unitId = 'workbook-01';
            const sheetId = 'sheet-0011';
            const arrayFormulaRange = {
                [unitId]: {
                    [sheetId]: {
                        4: {
                            0: {
                                startRow: 4,
                                startColumn: 0,
                                endRow: 6,
                                endColumn: 0,
                            },
                        },
                    },
                },
            };

            const command = {
                id: InsertRowCommand.id,
                params: {
                    unitId,
                    subUnitId: sheetId,
                    direction: 0,
                    range: {
                        startRow: 3,
                        endRow: 3,
                        startColumn: 0,
                        endColumn: 19,
                    },
                    cellValue: {},
                },
            };
            const newFormulaData = offsetFormula(arrayFormulaRange, command, unitId, sheetId, null, arrayFormulaRange);
            expect(newFormulaData).toStrictEqual({
                [unitId]: {
                    [sheetId]: {
                        4: {
                            0: null,
                        },
                        5: {
                            0: null,
                        },
                        6: {
                            0: null,
                        },
                    },
                },
            });
        });
        it('insert column', () => {
            const unitId = 'workbook-01';
            const sheetId = 'sheet-0011';
            const formulaData = {
                [unitId]: {
                    [sheetId]: {
                        0: {
                            2: {
                                f: '=SUM(C2)',
                            },
                            3: {
                                f: '=SUM(D2)',
                            },
                        },
                    },
                },
            };

            const command = {
                id: InsertColCommand.id,
                params: {
                    unitId,
                    subUnitId: sheetId,
                    direction: 1,
                    range: {
                        startColumn: 1,
                        endColumn: 1,
                        startRow: 0,
                        endRow: 3,
                    },
                },
            };

            const newFormulaData = offsetFormula(formulaData, command, unitId, sheetId);
            expect(newFormulaData).toStrictEqual({
                [unitId]: {
                    [sheetId]: {
                        0: {
                            3: {
                                f: '=SUM(C2)',
                            },
                            4: {
                                f: '=SUM(D2)',
                            },
                        },
                    },
                },
            });
        });
        it('insert range move right', () => {
            const unitId = 'workbook-01';
            const sheetId = 'sheet-0011';
            const formulaData = {
                [unitId]: {
                    [sheetId]: {
                        0: {
                            2: {
                                f: '=SUM(B2)',
                            },
                            3: {
                                f: '=SUM(C2)',
                            },
                        },
                    },
                },
            };

            const command = {
                id: InsertRangeMoveRightCommand.id,
                params: {
                    range: {
                        startRow: 0,
                        startColumn: 0,
                        endRow: 0,
                        endColumn: 0,
                        rangeType: 0,
                    },
                } as InsertRangeMoveRightCommandParams,
            };

            const newFormulaData = offsetFormula(formulaData, command, unitId, sheetId);
            expect(newFormulaData).toStrictEqual({
                [unitId]: {
                    [sheetId]: {
                        0: {
                            3: {
                                f: '=SUM(B2)',
                            },
                            4: {
                                f: '=SUM(C2)',
                            },
                        },
                    },
                },
            });
        });
        it('insert range move down', () => {
            const unitId = 'workbook-01';
            const sheetId = 'sheet-0011';
            const formulaData = {
                [unitId]: {
                    [sheetId]: {
                        0: {
                            3: {
                                f: '=SUM(A2)',
                            },
                        },
                        1: {
                            3: {
                                f: '=SUM(A3)',
                            },
                        },
                    },
                },
            };

            const command = {
                id: InsertRangeMoveDownCommand.id,
                params: {
                    range: {
                        startRow: 0,
                        startColumn: 3,
                        endRow: 0,
                        endColumn: 3,
                        rangeType: 0,
                    },
                } as InsertRangeMoveDownCommandParams,
            };

            const newFormulaData = offsetFormula(formulaData, command, unitId, sheetId);
            expect(newFormulaData).toStrictEqual({
                [unitId]: {
                    [sheetId]: {
                        // '0': {},
                        1: {
                            3: {
                                f: '=SUM(A2)',
                            },
                        },
                        2: {
                            3: {
                                f: '=SUM(A3)',
                            },
                        },
                    },
                },
            });
        });
        it('remove row', () => {
            const unitId = 'workbook-01';
            const sheetId = 'sheet-0011';
            const formulaData = {
                [unitId]: {
                    [sheetId]: {
                        1: {
                            3: {
                                f: '=SUM(A1)',
                            },
                        },
                        2: {
                            3: {
                                f: '=SUM(A2)',
                            },
                        },
                    },
                },
            };

            const command = {
                id: RemoveRowCommand.id,
                params: {
                    range: {
                        startRow: 0,
                        startColumn: 0,
                        endRow: 0,
                        endColumn: 19,
                        rangeType: 1,
                    },
                } as IRemoveRowColCommandParams,
            };
            const newFormulaData = offsetFormula(formulaData, command, unitId, sheetId);
            expect(newFormulaData).toStrictEqual({
                [unitId]: {
                    [sheetId]: {
                        0: {
                            3: {
                                f: '=SUM(A1)',
                            },
                        },
                        1: {
                            3: {
                                f: '=SUM(A2)',
                            },
                        },
                    },
                },
            });
        });
        it('remove row, handle arrayFormulaCellData, with arrayFormulaRange and refRanges', () => {
            const unitId = 'workbook-01';
            const sheetId = 'sheet-0011';
            const arrayFormulaCellData = {
                [unitId]: {
                    [sheetId]: {
                        4: {
                            0: {
                                v: 1,
                                t: 2,
                            },
                        },
                        5: {
                            0: {
                                v: 2,
                                t: 2,
                            },
                        },
                        6: {
                            0: {
                                v: 3,
                                t: 2,
                            },
                        },
                    },
                },
            };

            const command = {
                id: RemoveRowCommand.id,
                params: {
                    range: {
                        startRow: 1,
                        startColumn: 0,
                        endRow: 1,
                        endColumn: 19,
                        rangeType: 1,
                    },
                },
            };

            const arrayFormulaRange = {
                [unitId]: {
                    [sheetId]: {
                        4: {
                            0: {
                                startRow: 4,
                                startColumn: 0,
                                endRow: 6,
                                endColumn: 0,
                            },
                        },
                    },
                },
            };

            const refRanges = [
                {
                    row: 4,
                    column: 0,
                    range: {
                        startRow: 0,
                        startColumn: 0,
                        endRow: 2,
                        endColumn: 0,
                        startAbsoluteRefType: 0,
                        endAbsoluteRefType: 0,
                    },
                },
            ];

            const newFormulaData = offsetFormula(
                arrayFormulaCellData,
                command,
                unitId,
                sheetId,
                null,
                arrayFormulaRange,
                refRanges
            );
            expect(newFormulaData).toStrictEqual({
                [unitId]: {
                    [sheetId]: {
                        4: {
                            0: null,
                        },
                        5: {
                            0: null,
                        },
                        6: {
                            0: null,
                        },
                    },
                },
            });
        });
        it('remove row, handle arrayFormulaRange', () => {
            const unitId = 'workbook-01';
            const sheetId = 'sheet-0011';
            const arrayFormulaRange = {
                [unitId]: {
                    [sheetId]: {
                        4: {
                            0: {
                                startRow: 4,
                                startColumn: 0,
                                endRow: 6,
                                endColumn: 0,
                            },
                        },
                    },
                },
            };

            const command = {
                id: RemoveRowCommand.id,
                params: {
                    range: {
                        startRow: 1,
                        startColumn: 0,
                        endRow: 1,
                        endColumn: 19,
                        rangeType: 1,
                    },
                },
            };
            const newFormulaData = offsetFormula(arrayFormulaRange, command, unitId, sheetId, null, arrayFormulaRange);
            expect(newFormulaData).toStrictEqual({
                [unitId]: {
                    [sheetId]: {
                        4: {
                            0: null,
                        },
                        5: {
                            0: null,
                        },
                        6: {
                            0: null,
                        },
                    },
                },
            });
        });
        it('remove column', () => {
            const unitId = 'workbook-01';
            const sheetId = 'sheet-0011';
            const formulaData = {
                [unitId]: {
                    [sheetId]: {
                        0: {
                            2: {
                                f: '=SUM(C2)',
                            },
                            3: {
                                f: '=SUM(D2)',
                            },
                        },
                    },
                },
            };

            const command = {
                id: RemoveColCommand.id,
                params: {
                    range: {
                        startRow: 0,
                        startColumn: 0,
                        endRow: 999,
                        endColumn: 0,
                        rangeType: 2,
                    },
                } as IRemoveRowColCommandParams,
            };
            const newFormulaData = offsetFormula(formulaData, command, unitId, sheetId);
            expect(newFormulaData).toStrictEqual({
                [unitId]: {
                    [sheetId]: {
                        0: {
                            1: {
                                f: '=SUM(C2)',
                            },
                            2: {
                                f: '=SUM(D2)',
                            },
                        },
                    },
                },
            });
        });
        it('remove column, handle arrayFormulaCellData, with arrayFormulaRange and refRanges', () => {
            const unitId = 'workbook-01';
            const sheetId = 'sheet-0011';
            const arrayFormulaCellData = {
                [unitId]: {
                    [sheetId]: {
                        0: {
                            4: {
                                v: 1,
                                t: 2,
                            },
                            5: {
                                v: 2,
                                t: 2,
                            },
                            6: {
                                v: 3,
                                t: 2,
                            },
                        },
                    },
                },
            };

            const command = {
                id: RemoveColCommand.id,
                params: {
                    range: {
                        startRow: 0,
                        startColumn: 1,
                        endRow: 999,
                        endColumn: 1,
                        rangeType: 2,
                    },
                },
            };

            const arrayFormulaRange = {
                [unitId]: {
                    [sheetId]: {
                        0: {
                            4: {
                                startRow: 0,
                                startColumn: 4,
                                endRow: 0,
                                endColumn: 6,
                            },
                        },
                    },
                },
            };

            const refRanges = [
                {
                    row: 0,
                    column: 4,
                    range: {
                        startRow: 0,
                        startColumn: 0,
                        endRow: 0,
                        endColumn: 2,
                        startAbsoluteRefType: 0,
                        endAbsoluteRefType: 0,
                    },
                },
            ];

            const newFormulaData = offsetFormula(
                arrayFormulaCellData,
                command,
                unitId,
                sheetId,
                null,
                arrayFormulaRange,
                refRanges
            );
            expect(newFormulaData).toStrictEqual({
                [unitId]: {
                    [sheetId]: {
                        0: {
                            4: null,
                            5: null,
                            6: null,
                        },
                    },
                },
            });
        });
        it('remove column, handle arrayFormulaRange', () => {
            const unitId = 'workbook-01';
            const sheetId = 'sheet-0011';
            const arrayFormulaRange = {
                [unitId]: {
                    [sheetId]: {
                        0: {
                            4: {
                                startRow: 0,
                                startColumn: 4,
                                endRow: 0,
                                endColumn: 6,
                            },
                        },
                    },
                },
            };

            const command = {
                id: RemoveColCommand.id,
                params: {
                    range: {
                        startRow: 0,
                        startColumn: 1,
                        endRow: 999,
                        endColumn: 1,
                        rangeType: 2,
                    },
                },
            };
            const newFormulaData = offsetFormula(arrayFormulaRange, command, unitId, sheetId, null, arrayFormulaRange);
            expect(newFormulaData).toStrictEqual({
                [unitId]: {
                    [sheetId]: {
                        0: {
                            4: null,
                            5: null,
                            6: null,
                        },
                    },
                },
            });
        });
        it('delete range move up', () => {
            const unitId = 'workbook-01';
            const sheetId = 'sheet-0011';
            const formulaData = {
                [unitId]: {
                    [sheetId]: {
                        1: {
                            3: {
                                f: '=SUM(A2)',
                            },
                        },
                        2: {
                            3: {
                                f: '=SUM(A3)',
                            },
                        },
                    },
                },
            };

            const command = {
                id: DeleteRangeMoveUpCommand.id,
                params: {
                    range: {
                        startRow: 0,
                        startColumn: 3,
                        endRow: 0,
                        endColumn: 3,
                        rangeType: 0,
                    },
                } as IDeleteRangeMoveUpCommandParams,
            };

            const newFormulaData = offsetFormula(formulaData, command, unitId, sheetId);
            expect(newFormulaData).toStrictEqual({
                [unitId]: {
                    [sheetId]: {
                        0: {
                            3: {
                                f: '=SUM(A2)',
                            },
                        },
                        1: {
                            3: {
                                f: '=SUM(A3)',
                            },
                        },
                        // '2': {},
                    },
                },
            });
        });
        it('delete range move left', () => {
            const unitId = 'workbook-01';
            const sheetId = 'sheet-0011';
            const formulaData = {
                [unitId]: {
                    [sheetId]: {
                        0: {
                            2: {
                                f: '=SUM(B2)',
                            },
                            3: {
                                f: '=SUM(C2)',
                            },
                        },
                    },
                },
            };

            const command = {
                id: DeleteRangeMoveLeftCommand.id,
                params: {
                    range: {
                        startRow: 0,
                        startColumn: 0,
                        endRow: 0,
                        endColumn: 0,
                        rangeType: 0,
                    },
                } as IDeleteRangeMoveLeftCommandParams,
            };

            const newFormulaData = offsetFormula(formulaData, command, unitId, sheetId);
            expect(newFormulaData).toStrictEqual({
                [unitId]: {
                    [sheetId]: {
                        0: {
                            1: {
                                f: '=SUM(B2)',
                            },
                            2: {
                                f: '=SUM(C2)',
                            },
                        },
                    },
                },
            });
        });
    });
    describe('function offsetArrayFormula', () => {
        it('offset array formula data', () => {
            const unitId = 'workbook-01';
            const sheetId = 'sheet-0011';
            const arrayFormulaData = {
                [unitId]: {
                    [sheetId]: {
                        7: {
                            0: {
                                startRow: 6,
                                startColumn: 0,
                                endRow: 9,
                                endColumn: 3,
                            },
                            5: {
                                startRow: 6,
                                startColumn: 5,
                                endRow: 9,
                                endColumn: 8,
                            },
                        },
                    },
                },
            };

            const command = {
                id: DeleteRangeMoveLeftCommand.id,
                params: {
                    range: {
                        startRow: 0,
                        startColumn: 0,
                        endRow: 0,
                        endColumn: 0,
                        rangeType: 0,
                    },
                },
            };

            const newArrayFormulaData = offsetArrayFormula(arrayFormulaData, command, unitId, sheetId);
            expect(newArrayFormulaData).toStrictEqual({
                [unitId]: {
                    [sheetId]: {
                        7: {
                            0: {
                                startRow: 7,
                                startColumn: 0,
                                endRow: 10,
                                endColumn: 3,
                            },
                            5: {
                                startRow: 7,
                                startColumn: 5,
                                endRow: 10,
                                endColumn: 8,
                            },
                        },
                    },
                },
            });
        });
    });

    describe('function removeFormulaData', () => {
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
});

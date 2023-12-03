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
} from '@univerjs/base-sheets';
import { describe, expect, it } from 'vitest';

import { offsetArrayFormula, offsetFormula } from '../utils';

describe('utils test', () => {
    describe('function offsetFormula', () => {
        it('move range', () => {
            const unitId = 'workbook-01';
            const sheetId = 'sheet-0011';
            const formulaData = {
                [unitId]: {
                    [sheetId]: {
                        '0': {
                            '3': {
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
                        '0': {
                            '3': null,
                        },
                        '3': {
                            '3': {
                                f: '=SUM(A5)',
                            },
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
                        '0': {
                            '3': {
                                f: '=SUM(A5)',
                            },
                        },
                    },
                },
            };

            const command = {
                id: MoveRowsCommand.id,
                params: {
                    fromRow: 0,
                    toRow: 4,
                },
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
                        '3': {
                            '3': {
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
                        '0': {
                            '0': {
                                f: '=SUM(E2)',
                            },
                        },
                    },
                },
            };

            const command = {
                id: MoveColsCommand.id,
                params: {
                    fromCol: 0,
                    toCol: 4,
                },
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
                        '0': {
                            '3': {
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
                        '0': {
                            '3': {
                                f: '=SUM(A1)',
                            },
                        },
                        '1': {
                            '3': {
                                f: '=SUM(A3)',
                            },
                        },
                    },
                },
            };

            const command = {
                id: InsertRowCommand.id,
                params: {
                    workbookId: unitId,
                    worksheetId: sheetId,
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
                        '0': {
                            '3': {
                                f: '=SUM(A1)',
                            },
                        },
                        // '1': {},
                        '2': {
                            '3': {
                                f: '=SUM(A3)',
                            },
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
                        '0': {
                            '2': {
                                f: '=SUM(C2)',
                            },
                            '3': {
                                f: '=SUM(D2)',
                            },
                        },
                    },
                },
            };

            const command = {
                id: InsertColCommand.id,
                params: {
                    workbookId: unitId,
                    worksheetId: sheetId,
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
                        '0': {
                            '3': {
                                f: '=SUM(C2)',
                            },
                            '4': {
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
                        '0': {
                            '2': {
                                f: '=SUM(B2)',
                            },
                            '3': {
                                f: '=SUM(C2)',
                            },
                        },
                    },
                },
            };

            const command = {
                id: InsertRangeMoveRightCommand.id,
                params: {
                    ranges: [
                        {
                            startRow: 0,
                            startColumn: 0,
                            endRow: 0,
                            endColumn: 0,
                            rangeType: 0,
                        },
                    ],
                },
            };

            const newFormulaData = offsetFormula(formulaData, command, unitId, sheetId);
            expect(newFormulaData).toStrictEqual({
                [unitId]: {
                    [sheetId]: {
                        '0': {
                            '3': {
                                f: '=SUM(B2)',
                            },
                            '4': {
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
                        '0': {
                            '3': {
                                f: '=SUM(A2)',
                            },
                        },
                        '1': {
                            '3': {
                                f: '=SUM(A3)',
                            },
                        },
                    },
                },
            };

            const command = {
                id: InsertRangeMoveDownCommand.id,
                params: {
                    ranges: [
                        {
                            startRow: 0,
                            startColumn: 3,
                            endRow: 0,
                            endColumn: 3,
                            rangeType: 0,
                        },
                    ],
                },
            };

            const newFormulaData = offsetFormula(formulaData, command, unitId, sheetId);
            expect(newFormulaData).toStrictEqual({
                [unitId]: {
                    [sheetId]: {
                        // '0': {},
                        '1': {
                            '3': {
                                f: '=SUM(A2)',
                            },
                        },
                        '2': {
                            '3': {
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
                        '1': {
                            '3': {
                                f: '=SUM(A1)',
                            },
                        },
                        '2': {
                            '3': {
                                f: '=SUM(A2)',
                            },
                        },
                    },
                },
            };

            const command = {
                id: RemoveRowCommand.id,
                params: {
                    ranges: [
                        {
                            startRow: 0,
                            startColumn: 0,
                            endRow: 0,
                            endColumn: 19,
                            rangeType: 1,
                        },
                    ],
                },
            };
            const newFormulaData = offsetFormula(formulaData, command, unitId, sheetId);
            expect(newFormulaData).toStrictEqual({
                [unitId]: {
                    [sheetId]: {
                        '0': {
                            '3': {
                                f: '=SUM(A1)',
                            },
                        },
                        '1': {
                            '3': {
                                f: '=SUM(A2)',
                            },
                        },
                        // '2': {},
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
                        '0': {
                            '2': {
                                f: '=SUM(C2)',
                            },
                            '3': {
                                f: '=SUM(D2)',
                            },
                        },
                    },
                },
            };

            const command = {
                id: RemoveColCommand.id,
                params: {
                    ranges: [
                        {
                            startRow: 0,
                            startColumn: 0,
                            endRow: 999,
                            endColumn: 0,
                            rangeType: 2,
                        },
                    ],
                },
            };
            const newFormulaData = offsetFormula(formulaData, command, unitId, sheetId);
            expect(newFormulaData).toStrictEqual({
                [unitId]: {
                    [sheetId]: {
                        '0': {
                            '1': {
                                f: '=SUM(C2)',
                            },
                            '2': {
                                f: '=SUM(D2)',
                            },
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
                        '1': {
                            '3': {
                                f: '=SUM(A2)',
                            },
                        },
                        '2': {
                            '3': {
                                f: '=SUM(A3)',
                            },
                        },
                    },
                },
            };

            const command = {
                id: DeleteRangeMoveUpCommand.id,
                params: {
                    ranges: [
                        {
                            startRow: 0,
                            startColumn: 3,
                            endRow: 0,
                            endColumn: 3,
                            rangeType: 0,
                        },
                    ],
                },
            };

            const newFormulaData = offsetFormula(formulaData, command, unitId, sheetId);
            expect(newFormulaData).toStrictEqual({
                [unitId]: {
                    [sheetId]: {
                        '0': {
                            '3': {
                                f: '=SUM(A2)',
                            },
                        },
                        '1': {
                            '3': {
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
                        '0': {
                            '2': {
                                f: '=SUM(B2)',
                            },
                            '3': {
                                f: '=SUM(C2)',
                            },
                        },
                    },
                },
            };

            const command = {
                id: DeleteRangeMoveLeftCommand.id,
                params: {
                    ranges: [
                        {
                            startRow: 0,
                            startColumn: 0,
                            endRow: 0,
                            endColumn: 0,
                            rangeType: 0,
                        },
                    ],
                },
            };

            const newFormulaData = offsetFormula(formulaData, command, unitId, sheetId);
            expect(newFormulaData).toStrictEqual({
                [unitId]: {
                    [sheetId]: {
                        '0': {
                            '1': {
                                f: '=SUM(B2)',
                            },
                            '2': {
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
                        '7': {
                            '0': {
                                startRow: 6,
                                startColumn: 0,
                                endRow: 9,
                                endColumn: 3,
                            },
                            '5': {
                                startRow: 6,
                                startColumn: 5,
                                endRow: 9,
                                endColumn: 8,
                            },
                        },
                    },
                },
            };

            const newArrayFormulaData = offsetArrayFormula(arrayFormulaData, unitId, sheetId);
            expect(newArrayFormulaData).toStrictEqual({
                [unitId]: {
                    [sheetId]: {
                        '7': {
                            '0': {
                                startRow: 7,
                                startColumn: 0,
                                endRow: 10,
                                endColumn: 3,
                            },
                            '5': {
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
});

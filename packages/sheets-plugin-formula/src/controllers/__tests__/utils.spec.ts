import {
    DeleteRangeMoveLeftCommand,
    DeleteRangeMoveUpCommand,
    InsertColCommand,
    InsertRangeMoveDownCommand,
    InsertRangeMoveRightCommand,
    InsertRowCommand,
    RemoveColCommand,
    RemoveRowCommand,
} from '@univerjs/base-sheets';
import { describe, expect, it } from 'vitest';

import { offsetFormula } from '../utils';

describe('utils test', () => {
    describe('function offsetFormula', () => {
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
                        '1': {},
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
                        '0': {},
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
                        '2': {},
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
                        '2': {},
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
});

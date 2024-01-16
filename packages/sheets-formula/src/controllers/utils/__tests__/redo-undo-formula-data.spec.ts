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

import { UndoCommand } from '@univerjs/core';
import { DeleteRangeMutation, InsertRangeMutation, MoveRangeMutation } from '@univerjs/sheets';
import { describe, expect, it } from 'vitest';

import {
    handleRedoUndoDeleteRange,
    handleRedoUndoInsertRange,
    handleRedoUndoMoveRange,
} from '../redo-undo-formula-data';

describe('Utils redo undo formula data test', () => {
    describe('Function handleRedoUndoMoveRange', () => {
        it('Move range array formula with first cell, undo', () => {
            const unitId = 'workbook-01';
            const subUnitId = 'sheet1';

            const command = {
                id: MoveRangeMutation.id,
                type: 2,
                params: {
                    from: {
                        value: {
                            '4': {
                                '0': {
                                    f: '=A1:A3',
                                    v: 1,
                                    t: 2,
                                },
                            },
                        },
                        subUnitId,
                    },
                    to: {
                        value: {
                            '4': {
                                '2': null,
                            },
                        },
                        subUnitId,
                    },
                    unitId,
                    trigger: UndoCommand.id,
                },
            };

            const formulaData = {
                [unitId]: {
                    [subUnitId]: {
                        '4': {
                            '2': {
                                f: '=A1:A3',
                            },
                        },
                    },
                },
            };

            const arrayFormulaRange = {
                [unitId]: {
                    [subUnitId]: {
                        '4': {
                            '2': {
                                startRow: 4,
                                startColumn: 2,
                                endRow: 6,
                                endColumn: 2,
                            },
                        },
                    },
                },
            };

            const arrayFormulaCellData = {
                [unitId]: {
                    [subUnitId]: {
                        '4': {
                            '0': null,
                            '2': {
                                v: 1,
                                t: 2,
                            },
                        },
                        '5': {
                            '0': null,
                            '2': {
                                v: 2,
                                t: 2,
                            },
                        },
                        '6': {
                            '0': null,
                            '2': {
                                v: 3,
                                t: 2,
                            },
                        },
                    },
                },
            };

            handleRedoUndoMoveRange(command, formulaData, arrayFormulaRange, arrayFormulaCellData);

            expect(formulaData).toStrictEqual({
                [unitId]: {
                    [subUnitId]: {
                        '4': {
                            '0': {
                                f: '=A1:A3',
                            },
                        },
                    },
                },
            });
            expect(arrayFormulaRange).toStrictEqual({
                [unitId]: {
                    [subUnitId]: {
                        '4': {
                            '0': {
                                startRow: 4,
                                startColumn: 2,
                                endRow: 6,
                                endColumn: 2,
                            },
                            '2': null,
                        },
                    },
                },
            });

            expect(arrayFormulaCellData).toStrictEqual({
                [unitId]: {
                    [subUnitId]: {
                        '4': {
                            '0': {
                                v: 1,
                                t: 2,
                            },
                            '2': null,
                        },
                        '5': {
                            '0': null,
                            '2': null,
                        },
                        '6': {
                            '0': null,
                            '2': null,
                        },
                    },
                },
            });
        });
    });

    describe('Function handleRedoUndoDeleteRange', () => {
        it('Delete range array formula', () => {
            const unitId = 'workbook-01';
            const subUnitId = 'sheet1';

            const command = {
                id: DeleteRangeMutation.id,
                type: 2,
                params: {
                    unitId,
                    subUnitId,
                    range: {
                        startRow: 1,
                        endRow: 1,
                        startColumn: 0,
                        endColumn: 19,
                    },
                    shiftDimension: 1,
                    trigger: UndoCommand.id,
                },
            };

            const formulaData = {
                [unitId]: {
                    [subUnitId]: {
                        '5': {
                            '0': {
                                f: '=A1:A3',
                            },
                        },
                    },
                },
            };

            const arrayFormulaRange = {
                [unitId]: {
                    [subUnitId]: {
                        '5': {
                            '0': {
                                startRow: 5,
                                startColumn: 0,
                                endRow: 8,
                                endColumn: 0,
                            },
                        },
                    },
                },
            };

            const arrayFormulaCellData = {
                [unitId]: {
                    [subUnitId]: {
                        '4': {
                            '0': null,
                        },
                        '5': {
                            '0': {
                                v: 1,
                                t: 2,
                            },
                        },
                        '6': {
                            '0': {
                                v: 0,
                                t: 2,
                            },
                        },
                        '7': {
                            '0': {
                                v: 2,
                                t: 2,
                            },
                        },
                        '8': {
                            '0': {
                                v: 3,
                                t: 2,
                            },
                        },
                    },
                },
            };

            handleRedoUndoDeleteRange(command, formulaData, arrayFormulaRange, arrayFormulaCellData);

            expect(formulaData).toStrictEqual({
                [unitId]: {
                    [subUnitId]: {
                        '4': {
                            '0': {
                                f: '=A1:A3',
                            },
                        },
                    },
                },
            });
            expect(arrayFormulaRange).toStrictEqual({
                [unitId]: {
                    [subUnitId]: {
                        '5': {
                            '0': null,
                        },
                        '6': {
                            '0': null,
                        },
                        '7': {
                            '0': null,
                        },
                        '8': {
                            '0': null,
                        },
                    },
                },
            });

            expect(arrayFormulaCellData).toStrictEqual({
                [unitId]: {
                    [subUnitId]: {
                        '4': {
                            '0': null,
                        },
                        '5': {
                            '0': null,
                        },
                        '6': {
                            '0': null,
                        },
                        '7': {
                            '0': null,
                        },
                        '8': {
                            '0': null,
                        },
                    },
                },
            });
        });
    });

    describe('Function handleRedoUndoInsertRange', () => {
        it('Insert range array formula', () => {
            const unitId = 'workbook-01';
            const subUnitId = 'sheet1';

            const command = {
                id: InsertRangeMutation.id,
                type: 2,
                params: {
                    unitId,
                    subUnitId,
                    range: {
                        startRow: 1,
                        startColumn: 0,
                        endRow: 1,
                        endColumn: 19,
                        rangeType: 1,
                    },
                    shiftDimension: 1,
                    cellValue: {
                        '1': {
                            '0': {
                                v: 2,
                                t: 2,
                            },
                        },
                    },
                    trigger: UndoCommand.id,
                },
            };

            const formulaData = {
                [unitId]: {
                    [subUnitId]: {
                        '3': {
                            '0': {
                                f: '=A1:A3',
                            },
                        },
                    },
                },
            };

            const arrayFormulaRange = {
                [unitId]: {
                    [subUnitId]: {
                        '3': {
                            '0': {
                                startRow: 3,
                                startColumn: 0,
                                endRow: 4,
                                endColumn: 0,
                            },
                        },
                    },
                },
            };

            const arrayFormulaCellData = {
                [unitId]: {
                    [subUnitId]: {
                        '3': {
                            '0': {
                                v: 1,
                                t: 2,
                            },
                        },
                        '4': {
                            '0': {
                                v: 3,
                                t: 2,
                            },
                        },
                        '5': {
                            '0': null,
                        },
                        '6': {
                            '0': null,
                        },
                    },
                },
            };

            handleRedoUndoInsertRange(command, formulaData, arrayFormulaRange, arrayFormulaCellData);

            expect(formulaData).toStrictEqual({
                [unitId]: {
                    [subUnitId]: {
                        '4': {
                            '0': {
                                f: '=A1:A3',
                            },
                        },
                    },
                },
            });
            expect(arrayFormulaRange).toStrictEqual({
                [unitId]: {
                    [subUnitId]: {
                        '3': {
                            '0': null,
                        },
                        '4': {
                            '0': null,
                        },
                    },
                },
            });

            expect(arrayFormulaCellData).toStrictEqual({
                [unitId]: {
                    [subUnitId]: {
                        '3': {
                            '0': null,
                        },
                        '4': {
                            '0': null,
                        },
                        '5': {
                            '0': null,
                        },
                        '6': {
                            '0': null,
                        },
                    },
                },
            });
        });
    });
});

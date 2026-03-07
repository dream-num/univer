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

import type { IRange, IWorkbookData } from '@univerjs/core';
import type { ITestBed } from './util';
import { Direction, ICommandService, LocaleType } from '@univerjs/core';
import { InsertColCommand, MoveRangeCommand, RemoveColCommand } from '@univerjs/sheets';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { FormulaRefRangeService } from '../formula-ref-range.service';
import { createCommandTestBed } from './util';

const MoveRangeCommandId = 'sheet.command.move-range';

function createMultiSheetWorkbookData(): IWorkbookData {
    return {
        id: 'test',
        appVersion: '3.0.0-alpha',
        sheets: {
            sheet1: {
                id: 'sheet1',
                name: 'Sheet1',
                cellData: {
                    0: {
                        0: {
                            v: 1,
                        },
                    },
                },
            },
            sheet2: {
                id: 'sheet2',
                name: 'Sheet2',
                cellData: {
                    0: {
                        0: {
                            v: 2,
                        },
                    },
                },
            },
        },
        locale: LocaleType.ZH_CN,
        name: '',
        sheetOrder: ['sheet1', 'sheet2'],
        styles: {},
    };
}

describe('FormulaRefRangeService', () => {
    let testBed: ITestBed;

    beforeEach(() => {
        testBed = createCommandTestBed();
    });

    afterEach(() => {
        testBed.univer.dispose();
    });

    it('transform formula string with move range', () => {
        const formulaRefRangeService = testBed.get(FormulaRefRangeService);
        const resFormula = formulaRefRangeService.transformFormulaByEffectCommand(
            'test',
            'sheet1',
            '=SUM(A1)',
            {
                id: MoveRangeCommandId,
                params: {
                    fromRange: {
                        startRow: 0,
                        endRow: 1,
                        startColumn: 0,
                        endColumn: 1,
                    },
                    toRange: {
                        startRow: 2,
                        endRow: 2,
                        startColumn: 1,
                        endColumn: 1,
                    },
                },
            }
        );

        expect(resFormula).toBe('=SUM(B3)');
    });

    it('not transform formula string with move range', () => {
        const formulaRefRangeService = testBed.get(FormulaRefRangeService);
        const resFormula = formulaRefRangeService.transformFormulaByEffectCommand(
            'test',
            'sheet1',
            '=SUM(A1:A10)',
            {
                id: MoveRangeCommandId,
                params: {
                    fromRange: {
                        startRow: 0,
                        endRow: 1,
                        startColumn: 0,
                        endColumn: 1,
                    },
                    toRange: {
                        startRow: 2,
                        endRow: 2,
                        startColumn: 1,
                        endColumn: 1,
                    },
                },
            }
        );

        expect(resFormula).toBe('=SUM(A1:A10)');
    });

    it('only transforms references on the current sheet', () => {
        testBed.univer.dispose();
        testBed = createCommandTestBed(createMultiSheetWorkbookData());

        const formulaRefRangeService = testBed.get(FormulaRefRangeService);
        const resFormula = formulaRefRangeService.transformFormulaByEffectCommand(
            'test',
            'sheet1',
            '=SUM(Sheet2!A1)+SUM(A1)',
            {
                id: MoveRangeCommandId,
                params: {
                    fromRange: {
                        startRow: 0,
                        endRow: 1,
                        startColumn: 0,
                        endColumn: 1,
                    },
                    toRange: {
                        startRow: 2,
                        endRow: 2,
                        startColumn: 1,
                        endColumn: 1,
                    },
                },
            }
        );

        expect(resFormula).toBe('=SUM(Sheet2!A1)+SUM(B3)');
    });

    it('throws when the referenced sheet cannot be resolved', () => {
        const formulaRefRangeService = testBed.get(FormulaRefRangeService);

        expect(() => formulaRefRangeService.transformFormulaByEffectCommand(
            'test',
            'sheet1',
            '=SUM(Sheet2!A1)',
            {
                id: MoveRangeCommandId,
                params: {
                    fromRange: {
                        startRow: 0,
                        endRow: 1,
                        startColumn: 0,
                        endColumn: 1,
                    },
                    toRange: {
                        startRow: 2,
                        endRow: 2,
                        startColumn: 1,
                        endColumn: 1,
                    },
                },
            }
        )).toThrowError('Sheet not found');
    });

    it('transform range formula string with move range', async () => {
        const formulaRefRangeService = testBed.get(FormulaRefRangeService);

        let newFormulas: {
            formulas: string[];
            ranges: IRange[];
        }[] = [];

        formulaRefRangeService.registerRangeFormula(
            'test',
            'sheet1',
            [{
                startRow: 5,
                endRow: 10,
                startColumn: 5,
                endColumn: 5,
            }],
            ['=SUM(A1)'],
            (res) => {
                newFormulas = res;
                return {
                    redos: [],
                    undos: [],
                };
            }
        );

        await testBed.get(ICommandService).executeCommand(
            MoveRangeCommand.id,
            {
                fromRange: {
                    startRow: 0,
                    endRow: 1,
                    startColumn: 0,
                    endColumn: 1,
                },
                toRange: {
                    startRow: 2,
                    endRow: 2,
                    startColumn: 1,
                    endColumn: 1,
                },
            }
        );

        expect(newFormulas).toEqual(
            [
                { formulas: ['=SUM(A3)'], ranges: [{ startColumn: 5, endColumn: 5, startRow: 7, endRow: 10 }] },
                { formulas: ['=SUM(B3)'], ranges: [{ startColumn: 5, endColumn: 5, startRow: 5, endRow: 6 }] },
            ]
        );
    });

    it('not transform range formula string with move range', async () => {
        const formulaRefRangeService = testBed.get(FormulaRefRangeService);

        let newFormulas: {
            formulas: string[];
            ranges: IRange[];
        }[] = [];

        formulaRefRangeService.registerRangeFormula(
            'test',
            'sheet1',
            [{
                startRow: 5,
                endRow: 10,
                startColumn: 5,
                endColumn: 5,
            }],
            ['=SUM(A1:A10)'],
            (res) => {
                newFormulas = res;
                return {
                    redos: [],
                    undos: [],
                };
            }
        );

        await testBed.get(ICommandService).executeCommand(
            MoveRangeCommand.id,
            {
                fromRange: {
                    startRow: 0,
                    endRow: 1,
                    startColumn: 0,
                    endColumn: 1,
                },
                toRange: {
                    startRow: 2,
                    endRow: 2,
                    startColumn: 1,
                    endColumn: 1,
                },
            }
        );

        expect(newFormulas).toEqual(
            [
                {
                    formulas: ['=SUM(A1:A10)'],
                    ranges: [{
                        startRow: 5,
                        endRow: 10,
                        startColumn: 5,
                        endColumn: 5,
                    }],
                },
            ]
        );
    });

    it('transform range formula string with delete col', async () => {
        const formulaRefRangeService = testBed.get(FormulaRefRangeService);

        let newFormulas: {
            formulas: string[];
            ranges: IRange[];
        }[] = [];

        formulaRefRangeService.registerRangeFormula(
            'test',
            'sheet1',
            [{
                startRow: 5,
                endRow: 10,
                startColumn: 5,
                endColumn: 10,
            }],
            ['=A1'],
            (res) => {
                newFormulas = res;
                return {
                    redos: [],
                    undos: [],
                };
            }
        );

        await testBed.get(ICommandService).executeCommand(
            RemoveColCommand.id,
            {
                range: {
                    startColumn: 0,
                    endColumn: 1,
                    startRow: 0,
                    endRow: 9999,
                },
            }
        );

        expect(newFormulas).toEqual(
            [
                { formulas: ['=A1'], ranges: [{ startColumn: 5, endColumn: 8, startRow: 5, endRow: 10 }] },
                { formulas: ['=#REF!'], ranges: [{ startColumn: 3, endColumn: 4, startRow: 5, endRow: 10 }] },
            ]
        );
    });

    it('transform range formula string with insert col', async () => {
        const formulaRefRangeService = testBed.get(FormulaRefRangeService);

        let newFormulas: {
            formulas: string[];
            ranges: IRange[];
        }[] = [];

        formulaRefRangeService.registerRangeFormula(
            'test',
            'sheet1',
            [{
                startRow: 5,
                endRow: 10,
                startColumn: 5,
                endColumn: 10,
            }],
            ['=A1'],
            (res) => {
                newFormulas = res;
                return {
                    redos: [],
                    undos: [],
                };
            }
        );

        await testBed.get(ICommandService).executeCommand(
            InsertColCommand.id,
            {
                unitId: 'test',
                subUnitId: 'sheet1',
                range: {
                    startColumn: 0,
                    endColumn: 1,
                    startRow: 0,
                    endRow: 9999,
                },
                direction: Direction.LEFT,
            }
        );

        expect(newFormulas).toEqual(
            [
                {
                    formulas: ['=C1'],
                    ranges: [{ startColumn: 7, endColumn: 12, startRow: 5, endRow: 10 }],
                },
            ]
        );
    });

    it('stops listening for range changes after registerFormula is disposed', async () => {
        const formulaRefRangeService = testBed.get(FormulaRefRangeService);
        const updatedFormulas: string[] = [];

        const disposable = formulaRefRangeService.registerFormula(
            'test',
            'sheet1',
            '=SUM(A1)',
            (formula) => {
                updatedFormulas.push(formula);
                return {
                    redos: [],
                    undos: [],
                };
            }
        );

        await testBed.get(ICommandService).executeCommand(
            MoveRangeCommand.id,
            {
                fromRange: {
                    startRow: 0,
                    endRow: 1,
                    startColumn: 0,
                    endColumn: 1,
                },
                toRange: {
                    startRow: 2,
                    endRow: 2,
                    startColumn: 1,
                    endColumn: 1,
                },
            }
        );

        disposable.dispose();

        await testBed.get(ICommandService).executeCommand(
            MoveRangeCommand.id,
            {
                fromRange: {
                    startRow: 0,
                    endRow: 1,
                    startColumn: 0,
                    endColumn: 1,
                },
                toRange: {
                    startRow: 2,
                    endRow: 2,
                    startColumn: 1,
                    endColumn: 1,
                },
            }
        );

        expect(updatedFormulas).toEqual(['=SUM(B3)']);
    });
});

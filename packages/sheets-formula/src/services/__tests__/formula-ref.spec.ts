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
import { Direction, ICommandService, LocaleType, RANGE_TYPE } from '@univerjs/core';
import { InsertColCommand, InsertRowCommand, MoveRangeCommand, RemoveColCommand, RemoveRowCommand } from '@univerjs/sheets';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import type { ITestBed } from './util';
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

    it('keeps the inserted column covered when it is inserted inside the range', async () => {
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
                    startColumn: 7,
                    endColumn: 7,
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
                    ranges: [{ startRow: 5, endRow: 10, startColumn: 8, endColumn: 11 }],
                },
                {
                    formulas: ['=A1'],
                    ranges: [{ startRow: 5, endRow: 10, startColumn: 5, endColumn: 7 }],
                },
            ]
        );
    });

    it('keeps a whole row range whole and unsplit when a column is inserted', async () => {
        const formulaRefRangeService = testBed.get(FormulaRefRangeService);

        let newFormulas: {
            formulas: string[];
            ranges: IRange[];
        }[] = [];

        formulaRefRangeService.registerRangeFormula(
            'test',
            'sheet1',
            [{
                startRow: 2,
                endRow: 2,
                startColumn: 0,
                endColumn: 9,
                rangeType: RANGE_TYPE.ROW,
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
                    startColumn: 3,
                    endColumn: 3,
                    startRow: 0,
                    endRow: 9999,
                },
                direction: Direction.LEFT,
            }
        );

        expect(newFormulas).toEqual(
            [
                {
                    formulas: ['=A1'],
                    ranges: [{ startRow: 2, endRow: 2, startColumn: 0, endColumn: 10, rangeType: RANGE_TYPE.ROW }],
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

function createItemsSummaryWorkbookData(): IWorkbookData {
    return {
        id: 'test',
        appVersion: '3.0.0-alpha',
        sheets: {
            sheet1: {
                id: 'sheet1',
                name: 'Items',
                rowCount: 100,
                columnCount: 20,
                cellData: {},
            },
            sheet2: {
                id: 'sheet2',
                name: 'Summary',
                rowCount: 100,
                columnCount: 20,
                cellData: {},
            },
        },
        locale: LocaleType.ZH_CN,
        name: '',
        sheetOrder: ['sheet1', 'sheet2'],
        styles: {},
    };
}

type RuleResult = { formulas: string[]; ranges: IRange[] }[];

function registerRule(testBed: ITestBed, unitId: string, subUnitId: string, ranges: IRange[], formulas: string[]) {
    const results: RuleResult[] = [];
    const disposable = testBed.get(FormulaRefRangeService).registerRangeFormula(unitId, subUnitId, ranges, formulas, (res) => {
        results.push(res);
        return {
            redos: [],
            undos: [],
        };
    });

    return {
        results,
        last: () => results[results.length - 1],
        dispose: () => disposable.dispose(),
    };
}

describe('FormulaRefRangeService structural changes', () => {
    let testBed: ITestBed;

    beforeEach(() => {
        testBed = createCommandTestBed(createItemsSummaryWorkbookData());
    });

    afterEach(() => {
        testBed.univer.dispose();
    });

    async function insertRow(sheetId: string, row: number) {
        await testBed.get(ICommandService).executeCommand(InsertRowCommand.id, {
            unitId: 'test',
            subUnitId: sheetId,
            direction: Direction.UP,
            range: { startRow: row, endRow: row, startColumn: 0, endColumn: 19 },
        });
    }

    async function removeRow(sheetId: string, row: number) {
        await testBed.get(ICommandService).executeCommand(RemoveRowCommand.id, {
            unitId: 'test',
            subUnitId: sheetId,
            range: { startRow: row, endRow: row, startColumn: 0, endColumn: 19 },
        });
    }

    async function insertColumn(sheetId: string, column: number) {
        await testBed.get(ICommandService).executeCommand(InsertColCommand.id, {
            unitId: 'test',
            subUnitId: sheetId,
            direction: Direction.LEFT,
            range: { startRow: 0, endRow: 99, startColumn: column, endColumn: column },
        });
    }

    it('moves relative and absolute references with the rule range when a row is inserted above it', async () => {
        const relative = registerRule(testBed, 'test', 'sheet1', [{ startRow: 1, endRow: 3, startColumn: 1, endColumn: 1 }], ['=H2:H4']);
        const absolute = registerRule(testBed, 'test', 'sheet1', [{ startRow: 1, endRow: 3, startColumn: 2, endColumn: 2 }], ['=$H$2:$H$4']);

        await insertRow('sheet1', 0);

        expect(relative.last()).toEqual([
            { formulas: ['=H3:H5'], ranges: [{ startRow: 2, endRow: 4, startColumn: 1, endColumn: 1 }] },
        ]);
        expect(absolute.last()).toEqual([
            { formulas: ['=$H$3:$H$5'], ranges: [{ startRow: 2, endRow: 4, startColumn: 2, endColumn: 2 }] },
        ]);
    });

    it('shrinks relative and absolute references when a referenced row is removed', async () => {
        const relative = registerRule(testBed, 'test', 'sheet1', [{ startRow: 1, endRow: 3, startColumn: 1, endColumn: 1 }], ['=H2:H4']);
        const absolute = registerRule(testBed, 'test', 'sheet1', [{ startRow: 1, endRow: 3, startColumn: 2, endColumn: 2 }], ['=$H$2:$H$4']);

        await removeRow('sheet1', 2);

        expect(relative.last()).toEqual([
            { formulas: ['=H2:H3'], ranges: [{ startRow: 1, endRow: 2, startColumn: 1, endColumn: 1 }] },
        ]);
        expect(absolute.last()).toEqual([
            { formulas: ['=$H$2:$H$3'], ranges: [{ startRow: 1, endRow: 2, startColumn: 2, endColumn: 2 }] },
        ]);
    });

    it('moves relative and absolute references when a column is inserted before them', async () => {
        const relative = registerRule(testBed, 'test', 'sheet1', [{ startRow: 1, endRow: 3, startColumn: 2, endColumn: 2 }], ['=H2:H4']);
        const absolute = registerRule(testBed, 'test', 'sheet1', [{ startRow: 1, endRow: 3, startColumn: 1, endColumn: 1 }], ['=$H$2:$H$4']);

        await insertColumn('sheet1', 0);

        expect(relative.last()).toEqual([
            { formulas: ['=I2:I4'], ranges: [{ startRow: 1, endRow: 3, startColumn: 3, endColumn: 3 }] },
        ]);
        expect(absolute.last()).toEqual([
            { formulas: ['=$I$2:$I$4'], ranges: [{ startRow: 1, endRow: 3, startColumn: 2, endColumn: 2 }] },
        ]);
    });

    it('updates an absolute reference below an inserted row without moving the rule range', async () => {
        const rule = registerRule(testBed, 'test', 'sheet1', [{ startRow: 1, endRow: 3, startColumn: 5, endColumn: 5 }], ['=$A$100']);

        await insertRow('sheet1', 50);

        expect(rule.last()).toEqual([
            { formulas: ['=$A$101'], ranges: [{ startRow: 1, endRow: 3, startColumn: 5, endColumn: 5 }] },
        ]);
    });

    it('keeps rule ranges on another sheet and moves their cross-sheet references', async () => {
        const absolute = registerRule(testBed, 'test', 'sheet2', [{ startRow: 1, endRow: 4, startColumn: 1, endColumn: 1 }], ['=Items!$D$6>1']);
        const relative = registerRule(testBed, 'test', 'sheet2', [{ startRow: 1, endRow: 4, startColumn: 2, endColumn: 2 }], ['=Items!D6>1']);

        await insertRow('sheet1', 0);

        expect(absolute.last()).toEqual([
            { formulas: ['=Items!$D$7>1'], ranges: [{ startRow: 1, endRow: 4, startColumn: 1, endColumn: 1 }] },
        ]);
        expect(relative.last()).toEqual([
            { formulas: ['=Items!D7>1'], ranges: [{ startRow: 1, endRow: 4, startColumn: 2, endColumn: 2 }] },
        ]);
    });

    it('keeps a whole column rule on another sheet whole', async () => {
        const rule = registerRule(testBed, 'test', 'sheet2', [{
            startRow: 0,
            endRow: 99,
            startColumn: 1,
            endColumn: 1,
            rangeType: RANGE_TYPE.COLUMN,
        }], ['=Items!D6']);

        await insertRow('sheet1', 0);

        expect(rule.last()).toEqual([
            {
                formulas: ['=Items!D7'],
                ranges: [{
                    startRow: 0,
                    endRow: 99,
                    startColumn: 1,
                    endColumn: 1,
                    rangeType: RANGE_TYPE.COLUMN,
                }],
            },
        ]);
    });

    it('turns a cross-sheet reference into #REF! when its row is removed', async () => {
        const rule = registerRule(testBed, 'test', 'sheet2', [{ startRow: 1, endRow: 1, startColumn: 1, endColumn: 1 }], ['=Items!D6']);

        await removeRow('sheet1', 5);

        expect(rule.last()).toEqual([
            { formulas: ['=#REF!'], ranges: [{ startRow: 1, endRow: 1, startColumn: 1, endColumn: 1 }] },
        ]);
    });

    it('updates a registered formula when the edited sheet is not active', async () => {
        const workbook = testBed.sheet;
        const sheet2 = workbook.getSheetBySheetId('sheet2')!;
        workbook.setActiveSheet(sheet2);

        const formulas: string[] = [];
        testBed.get(FormulaRefRangeService).registerFormula('test', 'sheet1', '=D6', (formula) => {
            formulas.push(formula);
            return {
                redos: [],
                undos: [],
            };
        });

        await insertRow('sheet1', 0);

        expect(formulas).toEqual(['=D7']);
    });
});

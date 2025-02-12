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

import type { ITestBed } from './util';
import { ICommandService, type IRange } from '@univerjs/core';
import { InsertColCommand, MoveRangeCommand, RemoveColCommand } from '@univerjs/sheets';
import { beforeEach, describe, expect, it } from 'vitest';
import { FormulaRefRangeService } from '../formula-ref-range.service';
import { createCommandTestBed } from './util';

const MoveRangeCommandId = 'sheet.command.move-range';

describe('FormulaRefRangeService', () => {
    let testBed: ITestBed;

    beforeEach(() => {
        testBed = createCommandTestBed();
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
});

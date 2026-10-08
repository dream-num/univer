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

import type { ISetRangeValuesMutationParams } from '../../commands/mutations/set-range-values.mutation';
import { BooleanNumber, CellValueType, FormulaType, ICommandService, Tools } from '@univerjs/core';
import { ErrorType, SetFormulaCalculationResultMutation } from '@univerjs/engine-formula';
import { describe, expect, it } from 'vitest';
import { SetRangeValuesMutation } from '../../commands/mutations/set-range-values.mutation';
import { CalculateResultApplyController } from '../calculate-result-apply.controller';
import { createFunctionTestBed } from './formula/create-function-test-bed';

describe('CalculateResultApplyController', () => {
    it('skips non-sheet unit results without blocking later sheet results', async () => {
        const testBed = createFunctionTestBed();
        const commandService = testBed.get(ICommandService);
        commandService.registerCommand(SetFormulaCalculationResultMutation);
        commandService.registerCommand(SetRangeValuesMutation);
        testBed.get(CalculateResultApplyController);

        await commandService.executeCommand(SetFormulaCalculationResultMutation.id, {
            unitData: {
                'base-unit': {
                    'table-1': { 0: { 0: { v: 900 } } },
                },
                [testBed.unitId]: {
                    [testBed.sheetId]: { 0: { 0: { v: 2760 } } },
                },
            },
            unitOtherData: {},
        });

        expect(testBed.sheet.getSheetBySheetId(testBed.sheetId)?.getCellMatrix().getValue(0, 0)?.v).toBe(2760);
        testBed.univer.dispose();
    });

    it.each([
        { cell: null, expected: undefined, source: { f: '=SUM(A1:B2)' } },
        { cell: { v: 42 }, expected: 42, source: { f: '=SUM(A1:B2)' } },
        { cell: { f: '=2', v: 2 }, expected: 2, source: { f: '=SUM(A1:B2)' } },
        { cell: { f: '=SUM(A1:B2)' }, expected: 10, source: { f: '=SUM(A1:B2)' } },
        { cell: { si: 'shared-1' }, expected: 10, source: { f: '', si: 'shared-1' } },
        { cell: { si: 'shared-2' }, expected: undefined, source: { f: '', si: 'shared-1' } },
    ])('does not restore a late result over a removed or replaced scalar formula: $cell', async ({ cell, expected, source }) => {
        const testBed = createFunctionTestBed();
        const commandService = testBed.get(ICommandService);
        commandService.registerCommand(SetFormulaCalculationResultMutation);
        commandService.registerCommand(SetRangeValuesMutation);
        testBed.get(CalculateResultApplyController);
        const sheet = testBed.sheet.getSheetBySheetId(testBed.sheetId)!;
        await commandService.executeCommand(SetRangeValuesMutation.id, {
            unitId: testBed.unitId,
            subUnitId: testBed.sheetId,
            cellValue: { 8: { 8: cell } },
        });

        await commandService.executeCommand(SetFormulaCalculationResultMutation.id, {
            unitData: { [testBed.unitId]: { [testBed.sheetId]: { 8: { 8: { v: 10, t: CellValueType.NUMBER } } } } },
            sourceFormulaData: { [testBed.unitId]: { [testBed.sheetId]: { 8: { 8: source } } } },
            unitOtherData: {},
        });

        expect(sheet.getCellMatrix().getValue(8, 8)?.v).toBe(expected);
        expect(sheet.getCellMatrix().getValue(8, 8)?.f).toBe(cell?.f);
        testBed.univer.dispose();
    });

    it('keeps scalar formula identity through serialized worker value replay after an undo', () => {
        const testBed = createFunctionTestBed();
        const commandService = testBed.get(ICommandService);
        commandService.registerCommand(SetFormulaCalculationResultMutation);
        commandService.registerCommand(SetRangeValuesMutation);
        testBed.get(CalculateResultApplyController);
        const sheet = testBed.sheet.getSheetBySheetId(testBed.sheetId)!;
        const formula = '=SUM(A1:B2)';
        let replay: ISetRangeValuesMutationParams | undefined;
        const listener = commandService.onCommandExecuted((command, options) => {
            if (command.id === SetRangeValuesMutation.id && options?.applyFormulaCalculationResult) {
                replay = JSON.parse(JSON.stringify(command.params));
            }
        });
        try {
            commandService.syncExecuteCommand(SetRangeValuesMutation.id, {
                unitId: testBed.unitId,
                subUnitId: testBed.sheetId,
                cellValue: { 8: { 8: { f: formula } } },
            });
            commandService.syncExecuteCommand(SetFormulaCalculationResultMutation.id, {
                unitData: { [testBed.unitId]: { [testBed.sheetId]: { 8: { 8: { v: 10, t: CellValueType.NUMBER } } } } },
                sourceFormulaData: { [testBed.unitId]: { [testBed.sheetId]: { 8: { 8: { f: formula } } } } },
                unitOtherData: {},
            });
            expect(sheet.getCellMatrix().getValue(8, 8)?.v).toBe(10);
            const delayedReplay = Tools.deepClone(replay);
            commandService.syncExecuteCommand(SetRangeValuesMutation.id, {
                unitId: testBed.unitId,
                subUnitId: testBed.sheetId,
                cellValue: { 8: { 8: null } },
            });
            expect(delayedReplay).toBeDefined();
            commandService.syncExecuteCommand(SetRangeValuesMutation.id, delayedReplay);
            expect(sheet.getCellMatrix().getValue(8, 8)).toBeUndefined();
            commandService.syncExecuteCommand(SetRangeValuesMutation.id, {
                unitId: testBed.unitId,
                subUnitId: testBed.sheetId,
                cellValue: { 8: { 8: { f: formula } } },
            });
            commandService.syncExecuteCommand(SetRangeValuesMutation.id, delayedReplay);
            expect(sheet.getCellMatrix().getValue(8, 8)).toMatchObject({ f: formula, v: 10 });
        } finally {
            listener.dispose();
            testBed.univer.dispose();
        }
    });

    it.each([ErrorType.REF, ErrorType.NAME, ErrorType.DIV_BY_ZERO])('applies calculated %s errors to fixed and dynamic arrays', async (error) => {
        const testBed = createFunctionTestBed();
        const commandService = testBed.get(ICommandService);
        commandService.registerCommand(SetFormulaCalculationResultMutation);
        commandService.registerCommand(SetRangeValuesMutation);
        testBed.get(CalculateResultApplyController);
        const sheet = testBed.sheet.getSheetBySheetId(testBed.sheetId)!;
        sheet.getCellMatrix().setValue(0, 0, {
            f: '=VSTACK("Project")',
            ref: 'A1:A2',
            v: 'Project',
            t: CellValueType.STRING,
            ft: FormulaType.ARRAY,
            fd: BooleanNumber.FALSE,
        });
        sheet.getCellMatrix().setValue(0, 1, {
            ft: FormulaType.ARRAY,
            fd: BooleanNumber.TRUE,
            f: '=VSTACK("Project")',
            v: 'Project',
            t: CellValueType.STRING,
        });

        sheet.getCellMatrix().setValue(1, 0, { v: 100, ref: 'A1:A2' });

        await commandService.executeCommand(SetFormulaCalculationResultMutation.id, {
            unitData: {
                [testBed.unitId]: {
                    [testBed.sheetId]: {
                        0: {
                            0: { v: error, t: CellValueType.STRING },
                            1: { v: error, t: CellValueType.STRING },
                        },
                        1: { 0: { v: error, t: CellValueType.STRING } },
                    },
                },
            },
            unitOtherData: {},
        });

        expect(sheet.getCellMatrix().getValue(0, 0)?.v).toBe(error);
        expect(sheet.getCellMatrix().getValue(0, 1)?.v).toBe(error);
        expect(sheet.getCellMatrix().getValue(1, 0)?.v).toBe(error);
        expect(sheet.getCellMatrix().getValue(0, 0)).toMatchObject({ ft: FormulaType.ARRAY, fd: BooleanNumber.FALSE });
        testBed.univer.dispose();
    });

    it('applies explicit clearing results to array anchors and followers', async () => {
        const testBed = createFunctionTestBed();
        const commandService = testBed.get(ICommandService);
        commandService.registerCommand(SetFormulaCalculationResultMutation);
        commandService.registerCommand(SetRangeValuesMutation);
        testBed.get(CalculateResultApplyController);
        const sheet = testBed.sheet.getSheetBySheetId(testBed.sheetId)!;
        sheet.getCellMatrix().setValue(0, 0, {
            f: '=A2:B2',
            ref: 'A1:B1',
            ft: FormulaType.ARRAY,
            fd: BooleanNumber.FALSE,
        });
        sheet.getCellMatrix().setValue(0, 1, {
            ref: 'A1:B1',
            s: { bl: 1 },
        });
        sheet.getCellMatrix().setValue(0, 2, {
            f: '=C2',
        });

        await commandService.executeCommand(SetFormulaCalculationResultMutation.id, {
            unitData: {
                [testBed.unitId]: {
                    [testBed.sheetId]: {
                        0: {
                            0: null,
                            1: null,
                            2: null,
                        },
                    },
                },
            },
            unitOtherData: {},
        });

        expect(sheet.getCellMatrix().getValue(0, 0)).toBeUndefined();
        expect(sheet.getCellMatrix().getValue(0, 1)).toBeUndefined();
        expect(sheet.getCellMatrix().getValue(0, 2)).toBeUndefined();
        testBed.univer.dispose();
    });
});

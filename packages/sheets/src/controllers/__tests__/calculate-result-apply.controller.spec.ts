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

import { CellValueType, ICommandService } from '@univerjs/core';
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

    it('keeps a valid imported cache when a legacy array origin recalculates to an error', async () => {
        const testBed = createFunctionTestBed();
        const commandService = testBed.get(ICommandService);
        commandService.registerCommand(SetFormulaCalculationResultMutation);
        commandService.registerCommand(SetRangeValuesMutation);
        testBed.get(CalculateResultApplyController);
        const sheet = testBed.sheet.getSheetBySheetId(testBed.sheetId)!;
        sheet.getCellMatrix().setValue(0, 0, {
            f: '=VSTACK("Project")',
            v: 'Project',
            t: CellValueType.STRING,
            custom: { _xlsx: { legacyArrayFormula: true } },
        });
        sheet.getCellMatrix().setValue(0, 1, {
            f: '=VSTACK("Project")',
            v: 'Project',
            t: CellValueType.STRING,
        });

        await commandService.executeCommand(SetFormulaCalculationResultMutation.id, {
            unitData: {
                [testBed.unitId]: {
                    [testBed.sheetId]: {
                        0: {
                            0: { v: ErrorType.REF, t: CellValueType.STRING },
                            1: { v: ErrorType.REF, t: CellValueType.STRING },
                        },
                    },
                },
            },
            unitOtherData: {},
        });

        expect(sheet.getCellMatrix().getValue(0, 0)?.v).toBe('Project');
        expect(sheet.getCellMatrix().getValue(0, 1)?.v).toBe(ErrorType.REF);
        testBed.univer.dispose();
    });

    it('keeps legacy array cells when recalculation returns null entries', async () => {
        const testBed = createFunctionTestBed();
        const commandService = testBed.get(ICommandService);
        commandService.registerCommand(SetFormulaCalculationResultMutation);
        commandService.registerCommand(SetRangeValuesMutation);
        testBed.get(CalculateResultApplyController);
        const sheet = testBed.sheet.getSheetBySheetId(testBed.sheetId)!;
        sheet.getCellMatrix().setValue(0, 0, {
            f: '=A2:B2',
            ref: 'A1:B1',
            custom: { _xlsx: { legacyArrayFormula: true } },
        });
        sheet.getCellMatrix().setValue(0, 1, {
            ref: 'A1:B1',
            s: { bl: 1 },
        });
        sheet.getCellMatrix().setValue(0, 2, {
            f: '=C2',
        });
        const legacyFollower = sheet.getCellMatrix().getValue(0, 1);

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

        expect(sheet.getCellMatrix().getValue(0, 0)).toMatchObject({
            f: '=A2:B2',
            ref: 'A1:B1',
            custom: { _xlsx: { legacyArrayFormula: true } },
        });
        expect(sheet.getCellMatrix().getValue(0, 1)).toEqual(legacyFollower);
        expect(sheet.getCellMatrix().getValue(0, 2)).toBeUndefined();
        testBed.univer.dispose();
    });
});

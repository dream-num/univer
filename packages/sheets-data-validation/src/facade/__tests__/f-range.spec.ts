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

/* eslint-disable ts/no-non-null-asserted-optional-chain */

import type { Injector } from '@univerjs/core';
import type { FUniver } from '@univerjs/core/facade';
import { DataValidationType, ICommandService } from '@univerjs/core';
import { FormulaExecuteStageType, SetFormulaCalculationResultMutation } from '@univerjs/engine-formula';
import { SetRangeValuesCommand, SetRangeValuesMutation } from '@univerjs/sheets';
import { AddSheetDataValidationCommand, ClearRangeDataValidationCommand, DataValidationCustomFormulaService } from '@univerjs/sheets-data-validation';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createFacadeTestBed } from './create-test-bed';

import '@univerjs/sheets-formula/facade';

describe('Test FRange', () => {
    let get: Injector['get'];
    let commandService: ICommandService;
    let univerAPI: FUniver;

    beforeEach(() => {
        const testBed = createFacadeTestBed();
        get = testBed.get;

        univerAPI = testBed.univerAPI;

        commandService = get(ICommandService);
        commandService.registerCommand(AddSheetDataValidationCommand);
        commandService.registerCommand(ClearRangeDataValidationCommand);
        commandService.registerCommand(SetRangeValuesCommand);
        commandService.registerCommand(SetRangeValuesMutation);
        commandService.registerCommand(SetFormulaCalculationResultMutation);

        vi.stubGlobal('requestIdleCallback', ((callback: IdleRequestCallback) => {
            callback({ didTimeout: false, timeRemaining: () => 16 } as IdleDeadline);
            return 1;
        }) as typeof requestIdleCallback);
    });

    it('Range set data validation', async () => {
        const activeSheet = univerAPI.getActiveWorkbook()?.getActiveSheet()!;
        const range = activeSheet.getRange(0, 0, 10, 10);
        const range2 = activeSheet.getRange(11, 11, 2, 2);
        await range.setDataValidation(univerAPI.newDataValidation().requireCheckbox().build());
        await range2?.setDataValidation(univerAPI.newDataValidation().requireNumberEqualTo(1).build());
        const range3 = activeSheet.getRange(0, 0, 100, 100);

        expect(range.getDataValidation()).toBeTruthy();
        expect(range.getDataValidation()?.rule.ranges).toEqual([{
            unitId: univerAPI.getActiveWorkbook()?.getId(),
            sheetId: activeSheet.getSheetId(),
            startRow: 0,
            endRow: 9,
            startColumn: 0,
            endColumn: 9,
        }]);
        expect(range.getDataValidation()?.getCriteriaType()).toEqual(DataValidationType.CHECKBOX);
        expect(range.getDataValidations().length).toEqual(1);
        expect(range3?.getDataValidations().length).toEqual(2);

        expect(activeSheet?.getDataValidations().length).toEqual(2);
    });

    it('RangeList set and clear data validations', async () => {
        const activeSheet = univerAPI.getActiveWorkbook()?.getActiveSheet()!;
        const rule = univerAPI.newDataValidation().requireCheckbox().build();

        activeSheet.getRangeList(['A1:A10', 'C1:C10']).setDataValidation(rule);

        expect(activeSheet.getRange('A1').getDataValidation()?.getCriteriaType()).toEqual(DataValidationType.CHECKBOX);
        expect(activeSheet.getRange('C1').getDataValidation()?.getCriteriaType()).toEqual(DataValidationType.CHECKBOX);
        expect(activeSheet.getRange('A1:C10').getDataValidations().length).toEqual(1);

        activeSheet.getRangeList(['A1:A10', 'C1:C10']).clearDataValidations();

        expect(activeSheet.getRange('A1:C10').getDataValidations().length).toEqual(0);
    });

    it('RangeList inserts, checks, unchecks, and removes checkboxes', () => {
        const activeSheet = univerAPI.getActiveWorkbook()?.getActiveSheet()!;

        activeSheet.getRangeList(['A1:A2', 'C1:C2'])
            .insertCheckboxes('Yes', 'No')
            .check();

        expect(activeSheet.getRange('A1').getValue()).toBe('Yes');
        expect(activeSheet.getRange('C2').getValue()).toBe('Yes');
        expect(activeSheet.getRange('A1').getDataValidation()?.getCriteriaType()).toBe(DataValidationType.CHECKBOX);

        activeSheet.getRangeList(['A1:A2', 'C1:C2']).uncheck();

        expect(activeSheet.getRange('A2').getValue()).toBe('No');
        expect(activeSheet.getRange('C1').getValue()).toBe('No');

        activeSheet.getRangeList(['A1:A2', 'C1:C2']).removeCheckboxes();

        expect(activeSheet.getRange('A1:C2').getDataValidations()).toHaveLength(0);
    });

    it('RangeList refuses to remove non-checkbox data validations as checkboxes', () => {
        const activeSheet = univerAPI.getActiveWorkbook()?.getActiveSheet()!;
        const rule = univerAPI.newDataValidation().requireNumberEqualTo(1).build();

        activeSheet.getRangeList(['A1']).setDataValidation(rule);

        expect(() => activeSheet.getRangeList(['A1']).removeCheckboxes()).toThrow('Cannot remove checkboxes because the range contains non-checkbox data validation');
    });

    it('resolves onCalculationResultApplied after data-validation custom formula results are emitted', async () => {
        const workbook = univerAPI.getActiveWorkbook()!;
        const activeSheet = workbook.getActiveSheet();
        const unitId = workbook.getId();
        const subUnitId = activeSheet.getSheetId();
        const range = activeSheet.getRange(0, 0, 1, 1);
        const formula = univerAPI.getFormula();

        vi.spyOn(formula, 'calculationProcessing').mockImplementation((callback) => {
            callback({
                stage: FormulaExecuteStageType.START_CALCULATION,
                completedFormulasCount: 0,
                completedArrayFormulasCount: 0,
                formulaCycleIndex: 0,
                totalArrayFormulasToCalculate: 0,
                totalFormulasToCalculate: 1,
            });

            return { dispose: () => {} };
        });

        const rule = univerAPI.newDataValidation()
            .requireFormulaSatisfied('=A1>0')
            .build();

        await range.setDataValidation(rule);

        const customFormulaService = get(DataValidationCustomFormulaService);
        const registeredFormula = customFormulaService.getRuleFormulaInfo(unitId, subUnitId, rule.rule.uid);
        expect(registeredFormula?.formula).toBe('=A1>0');

        const waitForResult = formula.onCalculationResultApplied();

        await commandService.executeCommand(SetFormulaCalculationResultMutation.id, {
            unitData: {},
            unitOtherData: {
                [unitId]: {
                    [subUnitId]: {
                        [registeredFormula!.formulaId]: {
                            0: {
                                0: [[{ v: true }]],
                            },
                        },
                    },
                },
            },
        });

        await expect(waitForResult).resolves.toBeUndefined();
    });
});

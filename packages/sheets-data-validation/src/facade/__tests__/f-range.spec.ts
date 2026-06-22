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

import type { Injector } from '@univerjs/core';
import type { FUniver } from '@univerjs/core/facade';
import {
    DataValidationErrorStyle,
    DataValidationOperator,
    DataValidationStatus,
    DataValidationType,
    ICommandService,
} from '@univerjs/core';
import {
    FormulaExecuteStageType,
    SetFormulaCalculationNotificationMutation,
    SetFormulaCalculationResultMutation,
    SetFormulaCalculationStartMutation,
} from '@univerjs/engine-formula';
import {
    AddSheetDataValidationCommand,
    ClearRangeDataValidationCommand,
    DataValidationCustomFormulaService,
    RemoveSheetDataValidationCommand,
    UpdateSheetDataValidationOptionsCommand,
    UpdateSheetDataValidationRangeCommand,
    UpdateSheetDataValidationSettingCommand,
} from '@univerjs/sheets-data-validation';
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
        [
            AddSheetDataValidationCommand,
            ClearRangeDataValidationCommand,
            RemoveSheetDataValidationCommand,
            UpdateSheetDataValidationOptionsCommand,
            UpdateSheetDataValidationRangeCommand,
            UpdateSheetDataValidationSettingCommand,
        ].forEach((command) => commandService.registerCommand(command));
        commandService.registerCommand(SetFormulaCalculationStartMutation);
        commandService.registerCommand(SetFormulaCalculationNotificationMutation);
        commandService.registerCommand(SetFormulaCalculationResultMutation);

        vi.stubGlobal('requestIdleCallback', ((callback: IdleRequestCallback) => {
            callback({ didTimeout: false, timeRemaining: () => 16 } as IdleDeadline);
            return 1;
        }) as typeof requestIdleCallback);
    });

    it('Range set data validation', async () => {
        const activeSheet = univerAPI.getActiveWorkbook()?.getActiveSheet();
        if (!activeSheet) {
            throw new Error('Active sheet not found');
        }
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

    it('manages an applied validation rule from a range facade', async () => {
        const activeSheet = univerAPI.getActiveWorkbook()!.getActiveSheet();
        const sourceRange = activeSheet.getRange(0, 0, 2, 1);
        const targetRange = activeSheet.getRange(3, 0, 2, 1);

        const rule = univerAPI.newDataValidation()
            .requireNumberBetween(1, 10)
            .setOptions({
                errorStyle: DataValidationErrorStyle.STOP,
                showErrorMessage: true,
                error: 'Use a number from 1 to 10',
            })
            .build();

        sourceRange.setDataValidation(rule);
        const appliedRule = sourceRange.getDataValidation()!;

        expect(appliedRule.getApplied()).toBe(true);
        expect(appliedRule.getAllowInvalid()).toBe(false);
        expect(appliedRule.getCriteriaType()).toBe(DataValidationType.DECIMAL);
        expect(appliedRule.getCriteriaValues()).toEqual([DataValidationOperator.BETWEEN, '1', '10']);
        expect(appliedRule.getHelpText()).toBe('Use a number from 1 to 10');
        expect(appliedRule.getUnitId()).toBe(univerAPI.getActiveWorkbook()!.getId());
        expect(appliedRule.getSheetId()).toBe(activeSheet.getSheetId());
        expect(appliedRule.getRanges().map((range) => range.getA1Notation())).toEqual(['A1:A2']);
        expect(appliedRule.copy().getCriteriaValues()).toEqual([DataValidationOperator.BETWEEN, '1', '10']);

        appliedRule
            .setCriteria(DataValidationType.DECIMAL, [DataValidationOperator.GREATER_THAN, '2', undefined as never], false)
            .setOptions({ error: 'Use a whole number greater than 2', showErrorMessage: false })
            .setRanges([targetRange]);

        const movedRule = targetRange.getDataValidation()!;
        expect(sourceRange.getDataValidation()).toBeUndefined();
        expect(movedRule.getCriteriaType()).toBe(DataValidationType.DECIMAL);
        expect(movedRule.getCriteriaValues()).toEqual([DataValidationOperator.GREATER_THAN, '2', undefined]);
        expect(movedRule.getHelpText()).toBe('Use a whole number greater than 2');
        expect(movedRule.getRanges().map((range) => range.getA1Notation())).toEqual(['A4:A5']);

        expect(await targetRange.getValidatorStatus()).toEqual([
            [DataValidationStatus.INVALID, DataValidationStatus.INVALID],
        ]);

        expect(movedRule.delete()).toBe(true);
        expect(targetRange.getDataValidation()).toBeUndefined();

        targetRange.setDataValidation(rule);
        expect(targetRange.getDataValidations()).toHaveLength(1);
        targetRange.setDataValidation(null);
        expect(targetRange.getDataValidations()).toEqual([]);
    });

    it('resolves onCalculationResultApplied after data-validation custom formula results are emitted', async () => {
        const workbook = univerAPI.getActiveWorkbook()!;
        const activeSheet = workbook.getActiveSheet();
        const unitId = workbook.getId();
        const subUnitId = activeSheet.getSheetId();
        const range = activeSheet.getRange(0, 0, 1, 1);
        const formula = univerAPI.getFormula();

        const rule = univerAPI.newDataValidation()
            .requireFormulaSatisfied('=A1>0')
            .build();

        await range.setDataValidation(rule);

        const customFormulaService = get(DataValidationCustomFormulaService);
        const registeredFormula = customFormulaService.getRuleFormulaInfo(unitId, subUnitId, rule.rule.uid);
        expect(registeredFormula?.formula).toBe('=A1>0');

        const waitForResult = formula.onCalculationResultApplied();

        await commandService.executeCommand(SetFormulaCalculationStartMutation.id, {}, { onlyLocal: true });
        await commandService.executeCommand(SetFormulaCalculationNotificationMutation.id, {
            stageInfo: {
                stage: FormulaExecuteStageType.START_CALCULATION,
                completedFormulasCount: 0,
                completedArrayFormulasCount: 0,
                formulaCycleIndex: 0,
                totalArrayFormulasToCalculate: 0,
                totalFormulasToCalculate: 1,
            },
        });

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

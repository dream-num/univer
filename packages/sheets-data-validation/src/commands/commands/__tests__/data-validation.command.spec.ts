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

import type { Injector, Workbook } from '@univerjs/core';
import type { FUniver } from '@univerjs/core/facade';
import { DataValidationErrorStyle, DataValidationOperator, DataValidationType, ICommandService } from '@univerjs/core';
import {
    AddDataValidationMutation,
    RemoveDataValidationMutation,
    UpdateDataValidationMutation,
    UpdateRuleType,
} from '@univerjs/data-validation';
import { SetRangeValuesMutation } from '@univerjs/sheets';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createFacadeTestBed } from '../../../facade/__tests__/create-test-bed';
import { SheetDataValidationModel } from '../../../models/sheet-data-validation-model';
import {
    AddSheetDataValidationCommand,
    ClearRangeDataValidationCommand,
    getDataValidationDiffMutations,
    RemoveSheetAllDataValidationCommand,
    RemoveSheetDataValidationCommand,
    UpdateSheetDataValidationOptionsCommand,
    UpdateSheetDataValidationRangeCommand,
    UpdateSheetDataValidationSettingCommand,
} from '../data-validation.command';

const unitId = 'test';
const subUnitId = 'sheet1';

describe('sheet data validation commands', () => {
    let univerAPI: FUniver;
    let workbook: Workbook;
    let injector: Injector;
    let commandService: ICommandService;
    let model: SheetDataValidationModel;
    let dispose: () => void;

    beforeEach(() => {
        const testBed = createFacadeTestBed();
        univerAPI = testBed.univerAPI;
        workbook = testBed.sheet as Workbook;
        injector = testBed.injector;
        commandService = testBed.get(ICommandService);
        model = testBed.get(SheetDataValidationModel);
        dispose = () => testBed.univer.dispose();

        const commands = [
            SetRangeValuesMutation,
            AddSheetDataValidationCommand,
            UpdateSheetDataValidationRangeCommand,
            UpdateSheetDataValidationSettingCommand,
            UpdateSheetDataValidationOptionsCommand,
            ClearRangeDataValidationCommand,
            RemoveSheetDataValidationCommand,
            RemoveSheetAllDataValidationCommand,
        ];

        for (const command of commands) {
            commandService.registerCommand(command);
        }
    });

    afterEach(() => {
        dispose();
    });

    it('adds checkbox validation to the selected range', async () => {
        const activeSheet = univerAPI.getActiveWorkbook()!.getActiveSheet();
        const rule = univerAPI.newDataValidation()
            .requireCheckbox('Yes', 'No')
            .build();

        activeSheet.getRange(0, 0, 2, 1).setDataValidation(rule);

        const rules = model.getRules(unitId, subUnitId);

        expect(rules).toHaveLength(1);
        expect(rules[0].type).toBe(DataValidationType.CHECKBOX);
        expect(rules[0].formula1).toBe('Yes');
        expect(rules[0].formula2).toBe('No');
        expect(rules[0].ranges).toEqual([{ unitId, sheetId: subUnitId, startRow: 0, endRow: 1, startColumn: 0, endColumn: 0 }]);
    });

    it('moves a validation rule to a new range and applies checkbox defaults there', async () => {
        const activeSheet = univerAPI.getActiveWorkbook()!.getActiveSheet();
        const rule = univerAPI.newDataValidation()
            .requireCheckbox('TRUE', 'FALSE')
            .build();

        activeSheet.getRange(0, 0, 1, 1).setDataValidation(rule);
        const ruleId = model.getRules(unitId, subUnitId)[0].uid;

        const result = await commandService.executeCommand(UpdateSheetDataValidationRangeCommand.id, {
            unitId,
            subUnitId,
            ruleId,
            ranges: [{ startRow: 2, endRow: 3, startColumn: 1, endColumn: 1 }],
        });

        const updatedRule = model.getRuleById(unitId, subUnitId, ruleId);
        const worksheet = workbook.getSheetBySheetId(subUnitId);

        expect(result).toBe(true);
        expect(updatedRule?.ranges).toEqual([{ startRow: 2, endRow: 3, startColumn: 1, endColumn: 1 }]);
        expect(worksheet?.getCellRaw(2, 1)?.v).toBe(0);
        expect(worksheet?.getCellRaw(3, 1)?.v).toBe(0);
    });

    it('updates validation settings and options on an existing rule', async () => {
        const activeSheet = univerAPI.getActiveWorkbook()!.getActiveSheet();
        const rule = univerAPI.newDataValidation()
            .requireNumberBetween(1, 10)
            .build();

        activeSheet.getRange(0, 1, 2, 1).setDataValidation(rule);
        const ruleId = model.getRules(unitId, subUnitId)[0].uid;

        const settingResult = await commandService.executeCommand(UpdateSheetDataValidationSettingCommand.id, {
            unitId,
            subUnitId,
            ruleId,
            setting: {
                type: DataValidationType.DECIMAL,
                operator: univerAPI.Enum.DataValidationOperator.GREATER_THAN,
                formula1: '5',
            },
        });
        const optionsResult = await commandService.executeCommand(UpdateSheetDataValidationOptionsCommand.id, {
            unitId,
            subUnitId,
            ruleId,
            options: {
                errorStyle: DataValidationErrorStyle.STOP,
                showErrorMessage: true,
                error: 'Value must be greater than five',
            },
        });

        const updatedRule = model.getRuleById(unitId, subUnitId, ruleId);

        expect(settingResult).toBe(true);
        expect(optionsResult).toBe(true);
        expect(updatedRule?.operator).toBe(univerAPI.Enum.DataValidationOperator.GREATER_THAN);
        expect(updatedRule?.formula1).toBe('5');
        expect(updatedRule?.errorStyle).toBe(DataValidationErrorStyle.STOP);
        expect(updatedRule?.error).toBe('Value must be greater than five');
    });

    it('updates checkbox settings and rewrites existing checkbox values', async () => {
        const activeSheet = univerAPI.getActiveWorkbook()!.getActiveSheet();
        const rule = univerAPI.newDataValidation()
            .requireCheckbox('Y', 'N')
            .build();
        const worksheet = workbook.getSheetBySheetId(subUnitId);

        activeSheet.getRange(0, 2, 2, 1).setDataValidation(rule);
        worksheet?.getCellMatrix().setValue(0, 2, { v: 'N' });
        worksheet?.getCellMatrix().setValue(1, 2, { v: 'Y' });
        const ruleId = model.getRules(unitId, subUnitId)[0].uid;

        const result = await commandService.executeCommand(UpdateSheetDataValidationSettingCommand.id, {
            unitId,
            subUnitId,
            ruleId,
            setting: {
                type: DataValidationType.CHECKBOX,
                formula1: 'Done',
                formula2: 'Todo',
            },
        });

        const updatedRule = model.getRuleById(unitId, subUnitId, ruleId);

        expect(result).toBe(true);
        expect(updatedRule?.formula1).toBe('Done');
        expect(updatedRule?.formula2).toBe('Todo');
        expect(worksheet?.getCellRaw(0, 2)?.v).toBe('Todo');
        expect(worksheet?.getCellRaw(1, 2)?.v).toBe('Done');
    });

    it('clears validation from a range without removing unrelated rules', async () => {
        const activeSheet = univerAPI.getActiveWorkbook()!.getActiveSheet();
        const firstRule = univerAPI.newDataValidation().requireCheckbox().build();
        const secondRule = univerAPI.newDataValidation().requireNumberEqualTo(1).build();

        activeSheet.getRange(0, 0, 1, 1).setDataValidation(firstRule);
        activeSheet.getRange(4, 4, 1, 1).setDataValidation(secondRule);

        const result = await commandService.executeCommand(ClearRangeDataValidationCommand.id, {
            unitId,
            subUnitId,
            ranges: [{ startRow: 0, endRow: 0, startColumn: 0, endColumn: 0 }],
        });
        const rules = model.getRules(unitId, subUnitId);

        expect(result).toBe(true);
        expect(rules).toHaveLength(1);
        expect(rules[0].type).toBe(DataValidationType.DECIMAL);
        expect(rules[0].ranges).toEqual([{ unitId, sheetId: subUnitId, startRow: 4, endRow: 4, startColumn: 4, endColumn: 4 }]);
    });

    it('removes one rule or all rules from the sheet', async () => {
        const activeSheet = univerAPI.getActiveWorkbook()!.getActiveSheet();
        const firstRule = univerAPI.newDataValidation().requireCheckbox().build();
        const secondRule = univerAPI.newDataValidation().requireNumberEqualTo(1).build();

        activeSheet.getRange(0, 0, 1, 1).setDataValidation(firstRule);
        activeSheet.getRange(4, 4, 1, 1).setDataValidation(secondRule);

        const ruleId = model.getRules(unitId, subUnitId)[0].uid;
        const removeOneResult = await commandService.executeCommand(RemoveSheetDataValidationCommand.id, {
            unitId,
            subUnitId,
            ruleId,
        });
        const removeAllResult = await commandService.executeCommand(RemoveSheetAllDataValidationCommand.id, {
            unitId,
            subUnitId,
        });

        expect(removeOneResult).toBe(true);
        expect(removeAllResult).toBe(true);
        expect(model.getRules(unitId, subUnitId)).toEqual([]);
    });

    it('builds diff mutations for validation rule add and formula-offset range changes', () => {
        const checkboxRule = {
            uid: 'checkbox-diff',
            type: DataValidationType.CHECKBOX,
            formula1: '1',
            formula2: '0',
            ranges: [{ startRow: 6, endRow: 6, startColumn: 0, endColumn: 0 }],
        };
        const customFormulaRule = {
            uid: 'formula-diff',
            type: DataValidationType.CUSTOM,
            operator: DataValidationOperator.BETWEEN,
            formula1: '=A1>0',
            formula2: '=B1<10',
            ranges: [{ startRow: 0, endRow: 0, startColumn: 0, endColumn: 0 }],
        };

        const { redoMutations, undoMutations } = getDataValidationDiffMutations(unitId, subUnitId, [
            {
                type: 'add',
                rule: checkboxRule,
            },
            {
                type: 'update',
                ruleId: customFormulaRule.uid,
                rule: customFormulaRule,
                oldRanges: [{ startRow: 0, endRow: 0, startColumn: 0, endColumn: 0 }],
                newRanges: [{ startRow: 1, endRow: 1, startColumn: 1, endColumn: 1 }],
            },
        ] as never, injector);

        let hasAddRule = false;
        let hasFormulaUpdate = false;
        let hasDefaultCellValue = false;
        let hasUndoRemove = false;
        for (const mutation of redoMutations) {
            if (mutation.id === AddDataValidationMutation.id) {
                hasAddRule = true;
            }
            if (mutation.id === UpdateDataValidationMutation.id && (mutation.params as never as { payload: { type: UpdateRuleType } }).payload.type === UpdateRuleType.ALL) {
                hasFormulaUpdate = true;
            }
            if (mutation.id === SetRangeValuesMutation.id && (mutation.params as never as { cellValue: Record<number, Record<number, { v: unknown }>> }).cellValue[6]?.[0]?.v === '0') {
                hasDefaultCellValue = true;
            }
        }
        for (const mutation of undoMutations) {
            if (mutation.id === RemoveDataValidationMutation.id) {
                hasUndoRemove = true;
            }
        }

        expect(hasAddRule).toBe(true);
        expect(hasFormulaUpdate).toBe(true);
        expect(hasDefaultCellValue).toBe(true);
        expect(hasUndoRemove).toBe(true);
    });

    it('returns no diff mutations when the target sheet is missing', () => {
        const result = getDataValidationDiffMutations(unitId, 'missing-sheet', [
            {
                type: 'add',
                rule: {
                    uid: 'missing-target-rule',
                    type: DataValidationType.CHECKBOX,
                    ranges: [{ startRow: 0, endRow: 0, startColumn: 0, endColumn: 0 }],
                },
            },
        ] as never, injector);

        expect(result.redoMutations).toEqual([]);
        expect(result.undoMutations).toEqual([]);
    });
});

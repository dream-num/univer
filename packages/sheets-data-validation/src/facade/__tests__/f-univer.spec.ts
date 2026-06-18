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

import { DataValidationOperator, DataValidationStatus, DataValidationType, ICommandService } from '@univerjs/core';
import {
    AddSheetDataValidationCommand,
    ClearRangeDataValidationCommand,
    RemoveSheetAllDataValidationCommand,
    RemoveSheetDataValidationCommand,
    SheetDataValidationModel,
    UpdateSheetDataValidationOptionsCommand,
    UpdateSheetDataValidationRangeCommand,
    UpdateSheetDataValidationSettingCommand,
} from '@univerjs/sheets-data-validation';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createFacadeTestBed } from './create-test-bed';

describe('FUniver sheets data validation events', () => {
    let testBed: ReturnType<typeof createFacadeTestBed>;
    let commandService: ICommandService;

    beforeEach(() => {
        testBed = createFacadeTestBed();
        commandService = testBed.get(ICommandService);
        [
            AddSheetDataValidationCommand,
            ClearRangeDataValidationCommand,
            RemoveSheetAllDataValidationCommand,
            RemoveSheetDataValidationCommand,
            UpdateSheetDataValidationOptionsCommand,
            UpdateSheetDataValidationRangeCommand,
            UpdateSheetDataValidationSettingCommand,
        ].forEach((command) => commandService.registerCommand(command));
    });

    afterEach(() => {
        testBed.univer.dispose();
    });

    it('fires before and changed events around validation rule lifecycle commands', () => {
        const { univerAPI } = testBed;
        const workbook = univerAPI.getActiveWorkbook()!;
        const worksheet = workbook.getActiveSheet();
        const range = worksheet.getRange(0, 0, 1, 1);
        const movedRange = worksheet.getRange(2, 0, 1, 1);
        const logs: string[] = [];

        univerAPI.addEvent(univerAPI.Event.BeforeSheetDataValidationAdd, ({ rule, worksheet }) => {
            logs.push(`before-add:${worksheet.getSheetId()}:${rule.type}`);
        });
        univerAPI.addEvent(univerAPI.Event.SheetDataValidationChanged, ({ changeType, rule }) => {
            logs.push(`changed:${changeType}:${rule.getCriteriaType()}`);
        });
        univerAPI.addEvent(univerAPI.Event.BeforeSheetDataValidationCriteriaUpdate, ({ newCriteria }) => {
            logs.push(`before-criteria:${newCriteria.type}:${newCriteria.formula1}`);
        });
        univerAPI.addEvent(univerAPI.Event.BeforeSheetDataValidationOptionsUpdate, ({ newOptions }) => {
            logs.push(`before-options:${newOptions.error}`);
        });
        univerAPI.addEvent(univerAPI.Event.BeforeSheetDataValidationRangeUpdate, ({ newRanges }) => {
            logs.push(`before-range:${newRanges[0].startRow}`);
        });
        univerAPI.addEvent(univerAPI.Event.BeforeSheetDataValidationDelete, ({ ruleId }) => {
            logs.push(`before-delete:${ruleId}`);
        });
        univerAPI.addEvent(univerAPI.Event.BeforeSheetDataValidationDeleteAll, ({ rules }) => {
            logs.push(`before-delete-all:${rules.length}`);
        });

        const rule = univerAPI.newDataValidation()
            .requireNumberBetween(1, 5)
            .build();

        range.setDataValidation(rule);
        const appliedRule = range.getDataValidation()!;
        const ruleId = appliedRule.rule.uid;

        appliedRule.setCriteria(DataValidationType.DECIMAL, [DataValidationOperator.GREATER_THAN, '2', undefined as never]);
        appliedRule.setOptions({ error: 'Use a whole number greater than 2' });
        appliedRule.setRanges([movedRange]);
        expect(movedRange.getDataValidation()?.delete()).toBe(true);

        movedRange.setDataValidation(univerAPI.newDataValidation().requireCheckbox().build());
        expect(commandService.syncExecuteCommand(RemoveSheetAllDataValidationCommand.id, {
            unitId: workbook.getId(),
            subUnitId: worksheet.getSheetId(),
        })).toBe(true);

        expect(logs).toEqual([
            `before-add:${worksheet.getSheetId()}:${DataValidationType.DECIMAL}`,
            `changed:add:${DataValidationType.DECIMAL}`,
            `before-criteria:${DataValidationType.DECIMAL}:2`,
            `changed:update:${DataValidationType.DECIMAL}`,
            'before-options:Use a whole number greater than 2',
            `changed:update:${DataValidationType.DECIMAL}`,
            'before-range:2',
            `changed:update:${DataValidationType.DECIMAL}`,
            `before-delete:${ruleId}`,
            `changed:remove:${DataValidationType.DECIMAL}`,
            `before-add:${worksheet.getSheetId()}:${DataValidationType.CHECKBOX}`,
            `changed:add:${DataValidationType.CHECKBOX}`,
            'before-delete-all:1',
            `changed:remove:${DataValidationType.CHECKBOX}`,
        ]);
    });

    it('cancels validation commands from before events', () => {
        const { univerAPI } = testBed;
        const range = univerAPI.getActiveWorkbook()!.getActiveSheet().getRange(0, 0, 1, 1);
        univerAPI.addEvent(univerAPI.Event.BeforeSheetDataValidationAdd, (event) => {
            event.cancel = true;
        });

        range.setDataValidation(univerAPI.newDataValidation().requireCheckbox().build());

        expect(range.getDataValidation()).toBeUndefined();
    });

    it('fires validator status changes for cells whose validation result changes', async () => {
        const { get, univerAPI } = testBed;
        const workbook = univerAPI.getActiveWorkbook()!;
        const worksheet = workbook.getActiveSheet();
        const range = worksheet.getRange(0, 0, 1, 1);
        const statuses: string[] = [];

        range.setDataValidation(univerAPI.newDataValidation().requireNumberBetween(1, 5).build());
        const rule = range.getDataValidation()!;

        univerAPI.addEvent(univerAPI.Event.SheetDataValidatorStatusChanged, ({ column, row, rule, status }) => {
            statuses.push(`${row}:${column}:${rule.getCriteriaType()}:${status}`);
        });

        get(SheetDataValidationModel).validator(rule.rule, {
            unitId: workbook.getId(),
            subUnitId: worksheet.getSheetId(),
            workbook: workbook.getWorkbook(),
            worksheet: worksheet.getSheet(),
            row: 0,
            col: 0,
        });

        await new Promise((resolve) => setTimeout(resolve, 0));

        expect(statuses).toEqual([`0:0:${DataValidationType.DECIMAL}:${DataValidationStatus.VALID}`]);
    });
});

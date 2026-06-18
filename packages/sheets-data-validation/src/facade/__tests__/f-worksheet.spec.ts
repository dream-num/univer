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

import type { Injector, IWorkbookData } from '@univerjs/core';
import type { FUniver } from '@univerjs/core/facade';
import {
    DataValidationStatus,
    ICommandService,
    LocaleType,
} from '@univerjs/core';
import {
    AddSheetDataValidationCommand,
    ClearRangeDataValidationCommand,
    RemoveSheetAllDataValidationCommand,
    RemoveSheetDataValidationCommand,
    UpdateSheetDataValidationOptionsCommand,
    UpdateSheetDataValidationRangeCommand,
    UpdateSheetDataValidationSettingCommand,
} from '@univerjs/sheets-data-validation';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createFacadeTestBed } from './create-test-bed';

function createWorkbookData(): IWorkbookData {
    return {
        id: 'test',
        appVersion: '3.0.0-alpha',
        locale: LocaleType.ZH_CN,
        name: '',
        sheetOrder: ['sheet1'],
        styles: {},
        sheets: {
            sheet1: {
                id: 'sheet1',
                name: 'sheet1',
                rowCount: 100,
                columnCount: 100,
                cellData: {
                    0: { 0: { v: 1, t: 2 } },
                    1: { 0: { v: 2, t: 2 } },
                    2: { 0: { v: 3, t: 2 } },
                    3: { 0: { v: 4, t: 2 } },
                },
            },
        },
    };
}

describe('Test FWorksheet data validation facade', () => {
    let get: Injector['get'];
    let univerAPI: FUniver;
    let univer: ReturnType<typeof createFacadeTestBed>['univer'];

    beforeEach(() => {
        const testBed = createFacadeTestBed(createWorkbookData());
        univer = testBed.univer;
        get = testBed.get;
        univerAPI = testBed.univerAPI;

        const commandService = get(ICommandService);
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
        univer.dispose();
    });

    it('reads worksheet rules, validator status, and validation errors', async () => {
        const workbook = univerAPI.getActiveWorkbook()!;
        const worksheet = workbook.getActiveSheet();
        const range = worksheet.getRange(0, 0, 4, 1);
        const rule = univerAPI.newDataValidation()
            .requireNumberBetween(1, 2)
            .setOptions({
                showErrorMessage: true,
                error: 'Only values from 1 to 2 are valid',
            })
            .build();

        range.setDataValidation(rule);

        const rules = worksheet.getDataValidations();
        expect(rules).toHaveLength(1);
        expect(worksheet.getDataValidation(rules[0].rule.uid)?.getCriteriaValues()).toEqual(
            rules[0].getCriteriaValues()
        );
        expect(worksheet.getDataValidation('missing-rule')).toBeNull();

        const worksheetStatus = await worksheet.getValidatorStatusAsync();
        expect(worksheetStatus.getValue(2, 0)).toBe(DataValidationStatus.INVALID);
        expect(worksheetStatus.getValue(3, 0)).toBe(DataValidationStatus.INVALID);

        await expect(range.getDataValidationErrorAsync()).resolves.toMatchObject([
            {
                sheetName: 'sheet1',
                row: 2,
                column: 0,
                ruleId: rules[0].rule.uid,
                inputValue: 3,
            },
            {
                sheetName: 'sheet1',
                row: 3,
                column: 0,
                ruleId: rules[0].rule.uid,
                inputValue: 4,
            },
        ]);

        await expect(worksheet.getAllDataValidationErrorAsync()).resolves.toMatchObject([
            {
                sheetName: 'sheet1',
                row: 2,
                column: 0,
                inputValue: 3,
            },
            {
                sheetName: 'sheet1',
                row: 3,
                column: 0,
                inputValue: 4,
            },
        ]);
    });

    it('aggregates validation status and errors at workbook level', async () => {
        const workbook = univerAPI.getActiveWorkbook()!;
        const worksheet = workbook.getActiveSheet();
        const rule = univerAPI.newDataValidation()
            .requireNumberLessThanOrEqualTo(2)
            .build();

        worksheet.getRange(0, 0, 4, 1).setDataValidation(rule);

        const status = await workbook.getValidatorStatus();
        expect(status.sheet1.getValue(2, 0)).toBe(DataValidationStatus.INVALID);
        expect(status.sheet1.getValue(3, 0)).toBe(DataValidationStatus.INVALID);

        await expect(workbook.getAllDataValidationErrorAsync()).resolves.toMatchObject([
            {
                sheetName: 'sheet1',
                row: 2,
                column: 0,
                inputValue: 3,
            },
            {
                sheetName: 'sheet1',
                row: 3,
                column: 0,
                inputValue: 4,
            },
        ]);
    });

    it('returns empty error lists when no rule is applied', async () => {
        const workbook = univerAPI.getActiveWorkbook()!;
        const worksheet = workbook.getActiveSheet();

        await expect(worksheet.getAllDataValidationErrorAsync()).resolves.toEqual([]);
        await expect(workbook.getAllDataValidationErrorAsync()).resolves.toEqual([]);
        await expect(worksheet.getRange(0, 0, 1, 1).getDataValidationErrorAsync()).resolves.toEqual([]);
    });
});

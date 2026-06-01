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

import type { ICellData, Injector, Nullable } from '@univerjs/core';
import type { FUniver } from '@univerjs/core/facade';
import { ICommandService, IUniverInstanceService, LocaleType } from '@univerjs/core';
import { CopySheetCommand, InsertSheetCommand, InsertSheetMutation, RemoveSheetCommand, RemoveSheetMutation, SetHorizontalTextAlignCommand, SetRangeValuesCommand, SetRangeValuesMutation, SetStyleCommand, SetTextWrapCommand, SetVerticalTextAlignCommand, SetWorksheetActiveOperation, SetWorksheetOrderCommand, SetWorksheetOrderMutation } from '@univerjs/sheets';
import { beforeEach, describe, expect, it } from 'vitest';
import { createFacadeTestBed } from './create-test-bed';

describe('Test FWorkbook', () => {
    let get: Injector['get'];
    let commandService: ICommandService;
    let univerAPI: FUniver;
    let getValueByPosition: (
        startRow: number,
        startColumn: number,
        endRow: number,
        endColumn: number
    ) => Nullable<ICellData>;

    beforeEach(() => {
        const testBed = createFacadeTestBed();
        get = testBed.get;
        univerAPI = testBed.univerAPI;

        commandService = get(ICommandService);
        commandService.registerCommand(SetRangeValuesCommand);
        commandService.registerCommand(SetRangeValuesMutation);
        commandService.registerCommand(SetStyleCommand);
        commandService.registerCommand(SetVerticalTextAlignCommand);
        commandService.registerCommand(SetHorizontalTextAlignCommand);
        commandService.registerCommand(SetTextWrapCommand);
        commandService.registerCommand(InsertSheetCommand);
        commandService.registerCommand(InsertSheetMutation);
        commandService.registerCommand(SetWorksheetActiveOperation);
        commandService.registerCommand(RemoveSheetCommand);
        commandService.registerCommand(RemoveSheetMutation);
        commandService.registerCommand(CopySheetCommand);
        commandService.registerCommand(SetWorksheetOrderCommand);
        commandService.registerCommand(SetWorksheetOrderMutation);

        getValueByPosition = (
            startRow: number,
            startColumn: number,
            endRow: number,
            endColumn: number
        ): Nullable<ICellData> =>
            get(IUniverInstanceService)
                .getUniverSheetInstance('test')
                ?.getSheetBySheetId('sheet1')
                ?.getRange(startRow, startColumn, endRow, endColumn)
                .getValue();
    });

    it('Workbook getSheets', () => {
        const sheets = univerAPI.getActiveWorkbook()?.getSheets();
        expect(sheets).not.toBeNull();
        expect(sheets?.length).toBe(1);
    });

    it('Workbook getSheetByName', () => {
        const activeSheet = univerAPI.getActiveWorkbook()?.getSheetByName('sheet1');
        expect(activeSheet).not.toBeNull();
    });

    it('Workbook insertSheet, deleteSheet, and setActiveSheet', async () => {
        const workbook = univerAPI.getActiveWorkbook();

        // insert a new sheet
        let activeSheet = workbook?.insertSheet();
        expect(activeSheet).not.toBeNull();
        expect(workbook?.getSheets().length).toBe(2);

        const sheets = workbook?.getSheets();

        if (!sheets) {
            throw new Error('sheets is null');
        }

        // set the first sheet as active sheet
        activeSheet = workbook?.setActiveSheet(sheets[0]);
        expect(activeSheet?.getSheetName()).toBe('sheet1');

        // delete the active sheet
        await workbook?.deleteSheet(activeSheet!);
        expect(workbook?.getSheets().length).toBe(1);
    });

    it('Workbook deleteActiveSheet', async () => {
        const activeSpreadsheet = univerAPI.getActiveWorkbook()!;
        activeSpreadsheet.insertSheet();
        expect(activeSpreadsheet.getNumSheets()).toBe(2);
        await activeSpreadsheet.deleteActiveSheet();
        expect(activeSpreadsheet.getNumSheets()).toBe(1);
        activeSpreadsheet.setActiveSheet(activeSpreadsheet.getSheets()[0]);
        await activeSpreadsheet.duplicateActiveSheet();
        expect(activeSpreadsheet.getNumSheets()).toBe(2);
        univerAPI.setLocale(LocaleType.RU_RU);
        expect(univerAPI.getCurrentLocale()).toBe(LocaleType.RU_RU);
        const worksheet = activeSpreadsheet.getActiveSheet();
        expect(worksheet.getIndex()).toBe(0);
        await activeSpreadsheet.moveActiveSheet(1);
        expect(worksheet.getIndex()).toBe(1);
    });

    it('Workbook insertSheet should auto-generate incremental names when name is not provided', () => {
        const workbook = univerAPI.getActiveWorkbook()!;
        const initialCount = workbook.getNumSheets();

        const sheet1 = workbook.insertSheet();
        expect(workbook.getNumSheets()).toBe(initialCount + 1);

        const sheet2 = workbook.insertSheet();
        expect(workbook.getNumSheets()).toBe(initialCount + 2);

        expect(sheet1.getSheetName()).not.toBe(sheet2.getSheetName());
    });

    it('Workbook insertSheet should use provided unique name directly', () => {
        const workbook = univerAPI.getActiveWorkbook()!;
        const sheet = workbook.insertSheet('MyUniqueSheet');
        expect(sheet.getSheetName()).toBe('MyUniqueSheet');
    });

    it('Workbook insertSheet should deduplicate when provided name already exists', () => {
        const workbook = univerAPI.getActiveWorkbook()!;
        const sheet = workbook.insertSheet('sheet1');
        expect(sheet.getSheetName()).not.toBe('sheet1');
    });

    it('Workbook create should use provided unique name directly', () => {
        const workbook = univerAPI.getActiveWorkbook()!;
        const sheet = workbook.create('MyCreatedSheet', 10, 10);
        expect(sheet.getSheetName()).toBe('MyCreatedSheet');
    });

    it('Workbook create should deduplicate when provided name already exists', () => {
        const workbook = univerAPI.getActiveWorkbook()!;
        const sheet = workbook.create('sheet1', 10, 10);
        expect(sheet.getSheetName()).not.toBe('sheet1');
    });
});

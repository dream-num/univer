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
import { ICommandService } from '@univerjs/core';
import { InsertSheetCommand, InsertSheetMutation, RemoveSheetCommand, RemoveSheetMutation, SetSelectionsOperation, SetWorksheetActiveOperation } from '@univerjs/sheets';
import { beforeEach, describe, expect, it } from 'vitest';
import { createFacadeTestBed } from './create-test-bed';

describe('Test Active Range', () => {
    let get: Injector['get'];
    let commandService: ICommandService;
    let univerAPI: FUniver;

    beforeEach(() => {
        const testBed = createFacadeTestBed();
        get = testBed.get;
        univerAPI = testBed.univerAPI;

        commandService = get(ICommandService);
        commandService.registerCommand(InsertSheetCommand);
        commandService.registerCommand(InsertSheetMutation);
        commandService.registerCommand(SetWorksheetActiveOperation);
        commandService.registerCommand(RemoveSheetCommand);
        commandService.registerCommand(RemoveSheetMutation);
        commandService.registerCommand(SetSelectionsOperation);
    });

    it('Workbook setActiveRange', () => {
        const workbook = univerAPI.getActiveWorkbook()!;
        expect(workbook.getSheets().length).toBe(1);

        const sheet = workbook.getSheets()[0];

        expect(sheet.getActiveRange()).toBeDefined();

        sheet.setActiveRange(sheet.getRange(0, 0, 2, 2));

        let activeRange = workbook.getActiveRange();
        expect(activeRange?.getRange().startRow).toBe(0);
        expect(activeRange?.getRange().startColumn).toBe(0);
        expect(activeRange?.getRange().endColumn).toBe(1);
        expect(activeRange?.getRange().endRow).toBe(1);

        const sheet2 = workbook.insertSheet();
        expect(workbook.getSheets().length).toBe(2);

        sheet2.setActiveRange(sheet2.getRange(0, 0, 3, 3));
        activeRange = workbook.getActiveRange();
        expect(activeRange?.getRange().startRow).toBe(0);
        expect(activeRange?.getRange().startColumn).toBe(0);
        expect(activeRange?.getRange().endColumn).toBe(2);
        expect(activeRange?.getRange().endRow).toBe(2);

        workbook.setActiveSheet(sheet);
        activeRange = workbook.getActiveRange();
        expect(activeRange?.getRange().startRow).toBe(0);
        expect(activeRange?.getRange().startColumn).toBe(0);
        expect(activeRange?.getRange().endColumn).toBe(1);
        expect(activeRange?.getRange().endRow).toBe(1);

        workbook.setActiveRange(sheet2.getRange(0, 0, 1, 1));
        expect(workbook.getActiveSheet().getSheetId()).toBe(sheet2.getSheetId());
    });

    it('Worksheet setActiveRange', () => {
        const workbook = univerAPI.getActiveWorkbook()!;
        const sheet1 = workbook.getSheets()[0];
        const sheet2 = workbook.insertSheet();

        const range1 = sheet1.getRange(0, 0, 10, 10);
        const range2 = sheet2.getRange(0, 0, 10, 10);

        sheet1.setActiveRange(range1);
        expect(workbook.getActiveRange()?.getRange()).toEqual(range1.getRange());

        sheet2.setActiveRange(range2);
        expect(workbook.getActiveRange()?.getRange()).toEqual(range2.getRange());

        expect(() => {
            sheet1.setActiveRange(range2);
        }).toThrow('Specified range must be part of the sheet.');
    });
});

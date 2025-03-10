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

import type { Injector, IRange } from '@univerjs/core';
import type { FUniver } from '@univerjs/core/facade';
import { ICommandService } from '@univerjs/core';
import { ClearSheetsFilterCriteriaCommand, RemoveSheetFilterCommand, SetSheetFilterRangeCommand, SetSheetsFilterCriteriaCommand } from '@univerjs/sheets-filter';
import { beforeEach, describe, expect, it } from 'vitest';
import { createFacadeTestBed } from './create-test-bed';

describe('Test FRange', () => {
    let get: Injector['get'];
    let commandService: ICommandService;
    let univerAPI: FUniver;

    beforeEach(() => {
        const testBed = createFacadeTestBed();
        get = testBed.get;

        univerAPI = testBed.univerAPI;

        commandService = get(ICommandService);
    });

    describe('FFilter', () => {
        beforeEach(() => {
            commandService.registerCommand(SetSheetsFilterCriteriaCommand);
            commandService.registerCommand(ClearSheetsFilterCriteriaCommand);
            commandService.registerCommand(SetSheetFilterRangeCommand);
            commandService.registerCommand(RemoveSheetFilterCommand);
        });

        it('create, modify and clear filters with Facade API', async () => {
            const activeSheet = univerAPI.getActiveWorkbook()!.getActiveSheet();
            expect(activeSheet.getFilter()).toBeNull();
            expect(activeSheet.getRange(0, 0, 1, 1).getFilter()).toBeNull();

            const range = activeSheet.getRange(0, 0, 10, 10);
            const filter = (await range.createFilter())!;

            expect(filter).not.toBeNull();
            expect(activeSheet.getFilter()).not.toBeNull();
            expect(activeSheet.getRange(0, 0, 1, 1).getFilter()).not.toBeNull();
            expect(filter.getRange().getRange()).toStrictEqual({
                unitId: univerAPI.getActiveWorkbook()?.getId(),
                sheetId: activeSheet.getSheetId(),
                startColumn: 0,
                startRow: 0,
                endColumn: 9,
                endRow: 9,
            } as IRange);

            expect(await filter.setColumnFilterCriteria(1, { colId: 1, filters: { blank: true } })).toBeTruthy();
            expect(filter.getColumnFilterCriteria(1)).toEqual({ colId: 1, filters: { blank: true } });

            expect(await filter.setColumnFilterCriteria(2, { colId: 2, filters: { filters: ['a'] } })).toBeTruthy();
            expect(filter.getColumnFilterCriteria(2)).toEqual({ colId: 2, filters: { filters: ['a'] } });

            expect(await filter.removeColumnFilterCriteria(1)).toBeTruthy();
            expect(filter.getColumnFilterCriteria(1)).toBeFalsy();

            expect(await filter.removeFilterCriteria()).toBeTruthy();
            expect(filter.getColumnFilterCriteria(2)).toBeFalsy();

            expect(await filter.remove()).toBeTruthy();
            expect(activeSheet.getFilter()).toBeNull();
        });
    });
});

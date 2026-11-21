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

import { describe, expect, it, onTestFinished } from 'vitest';
import { ClearSheetsFilterCriteriaCommand } from '../../commands/commands/sheets-filter.command';
import { createFacadeTestBed } from './create-test-bed';

describe('FFilter.removeFilterCriteria', () => {
    it('clears the filter on its own worksheet while an untargeted command clears the active one', () => {
        const { univer, univerAPI } = createFacadeTestBed();
        onTestFinished(() => univer.dispose());
        const workbook = univerAPI.getActiveWorkbook()!;
        const archive = workbook.getActiveSheet();
        const sales = workbook.insertSheet('Sales');
        const archiveFilter = archive.getRange('A1:A3').createFilter()!;
        const salesFilter = sales.getRange('A1:A3').createFilter()!;
        const criteria = { colId: 0, filters: { filters: ['East'] } };
        archiveFilter.setColumnFilterCriteria(0, criteria);
        salesFilter.setColumnFilterCriteria(0, criteria);

        const events: string[] = [];
        univerAPI.addEvent(univerAPI.Event.SheetBeforeRangeFilterClear, ({ worksheet }) => {
            events.push(`before:${worksheet.getSheetId()}`);
        });
        univerAPI.addEvent(univerAPI.Event.SheetRangeFilterCleared, ({ worksheet }) => {
            events.push(`after:${worksheet.getSheetId()}`);
        });

        archiveFilter.removeFilterCriteria();
        expect(archiveFilter.getColumnFilterCriteria(0)).toBeUndefined();
        expect(salesFilter.getColumnFilterCriteria(0)).toEqual(criteria);

        univerAPI.syncExecuteCommand(ClearSheetsFilterCriteriaCommand.id);
        expect(salesFilter.getColumnFilterCriteria(0)).toBeUndefined();
        expect(events).toEqual([
            `before:${archive.getSheetId()}`,
            `after:${archive.getSheetId()}`,
            `before:${sales.getSheetId()}`,
            `after:${sales.getSheetId()}`,
        ]);
    });
});

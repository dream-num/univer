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

import type { IWorkbookData, Workbook } from '@univerjs/core';
import type { FUniver } from '@univerjs/core/facade';
import { IUniverInstanceService, LocaleType, UniverInstanceType } from '@univerjs/core';
import { beforeEach, describe, expect, it } from 'vitest';
import { SheetsFilterService } from '../../services/sheet-filter.service';
import { createWorksheetTestBed } from './create-worksheet-test-bed';

function createWorkbookData(id: string): IWorkbookData {
    return {
        id,
        appVersion: '3.0.0-alpha',
        name: id,
        locale: LocaleType.EN_US,
        sheets: {
            sheet1: {
                id: 'sheet1',
                name: 'sheet1',
                cellData: {
                    0: { 0: { v: 1 } },
                    1: { 0: { v: 2 } },
                    2: { 0: { v: 3 } },
                },
            },
        },
        sheetOrder: ['sheet1'],
        styles: {},
    };
}

describe('Test FFilter', () => {
    let univerAPI: FUniver;
    let testBed: ReturnType<typeof createWorksheetTestBed>;

    beforeEach(() => {
        testBed = createWorksheetTestBed();
        univerAPI = testBed.univerAPI;
    });

    it('removeFilterCriteria clears the filter bound to this FFilter', () => {
        const workbookA = univerAPI.getActiveWorkbook()!;
        const filterA = workbookA.getSheetByName('sheet1')!.getRange('A1:A3').createFilter()!;
        filterA.setColumnFilterCriteria(0, { colId: 0, filters: { filters: ['1'] } });

        testBed.univer.createUnit<IWorkbookData, Workbook>(UniverInstanceType.UNIVER_SHEET, createWorkbookData('test-b'));
        testBed.get(IUniverInstanceService).focusUnit('test-b');
        const filterB = univerAPI.getActiveWorkbook()!.getSheetByName('sheet1')!.getRange('A1:A3').createFilter()!;
        filterB.setColumnFilterCriteria(0, { colId: 0, filters: { filters: ['2'] } });

        filterA.removeFilterCriteria();

        const filterService = testBed.get(SheetsFilterService);
        expect(filterService.getFilterModel('test', 'sheet1')?.getFilterColumn(0)).toBeNull();
        expect(filterService.getFilterModel('test-b', 'sheet1')?.getFilterColumn(0)).not.toBeNull();
    });
});

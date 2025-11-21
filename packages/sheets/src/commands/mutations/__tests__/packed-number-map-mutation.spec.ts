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
import type { ISetWorksheetColWidthMutationParams } from '../set-worksheet-col-width.mutation';
import type { ISetWorksheetRowHeightMutationParams } from '../set-worksheet-row-height.mutation';

import { ICommandService, IUniverInstanceService, UniverInstanceType } from '@univerjs/core';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createCommandTestBed } from '../../commands/__tests__/create-command-test-bed';
import { packNumberMap } from '../../utils/pack-number-map';
import { SetWorksheetColWidthMutation } from '../set-worksheet-col-width.mutation';
import { SetWorksheetRowHeightMutation } from '../set-worksheet-row-height.mutation';

describe('Test packed number map mutations', () => {
    let univer: any;
    let get: Injector['get'];
    let commandService: ICommandService;

    beforeEach(() => {
        const testBed = createCommandTestBed();
        univer = testBed.univer;
        get = testBed.get;

        commandService = get(ICommandService);
        commandService.registerCommand(SetWorksheetColWidthMutation);
        commandService.registerCommand(SetWorksheetRowHeightMutation);
    });

    afterEach(() => univer.dispose());

    function getWorksheet() {
        return get(IUniverInstanceService).getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET)!.getActiveSheet()!;
    }

    it('Should support PackedNumberMap in SetWorksheetColWidthMutation', () => {
        const worksheet = getWorksheet();
        const unitId = 'test';
        const subUnitId = 'sheet1';

        // Initial check
        expect(worksheet.getColumnWidth(0)).toBe(88); // Default width

        // Prepare packed data
        const colWidths = {
            0: 100,
            1: 200,
            2: 100,
        };
        const packed = packNumberMap(colWidths);

        const params: ISetWorksheetColWidthMutationParams = {
            unitId,
            subUnitId,
            ranges: [{ startRow: 0, endRow: 10, startColumn: 0, endColumn: 2 }],
            colWidth: { compress: true, data: packed },
        };

        commandService.syncExecuteCommand(SetWorksheetColWidthMutation.id, params);

        expect(worksheet.getColumnWidth(0)).toBe(100);
        expect(worksheet.getColumnWidth(1)).toBe(200);
        expect(worksheet.getColumnWidth(2)).toBe(100);
    });

    it('Should support PackedNumberMap in SetWorksheetRowHeightMutation', () => {
        const worksheet = getWorksheet();
        const unitId = 'test';
        const subUnitId = 'sheet1';

        // Initial check
        expect(worksheet.getRowHeight(0)).toBe(24); // Default height (assuming 24, check default config if fails)

        // Prepare packed data
        const rowHeights = {
            0: 50,
            1: 60,
            2: 50,
        };
        const packed = packNumberMap(rowHeights);

        const params: ISetWorksheetRowHeightMutationParams = {
            unitId,
            subUnitId,
            ranges: [{ startRow: 0, endRow: 2, startColumn: 0, endColumn: 10 }],
            rowHeight: { compress: true, data: packed },
        };

        commandService.syncExecuteCommand(SetWorksheetRowHeightMutation.id, params);

        expect(worksheet.getRowHeight(0)).toBe(50);
        expect(worksheet.getRowHeight(1)).toBe(60);
        expect(worksheet.getRowHeight(2)).toBe(50);
    });
});

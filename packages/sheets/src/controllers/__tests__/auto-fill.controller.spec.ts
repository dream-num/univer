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

import type { ICellData, IStyleData, IWorkbookData, Univer, Workbook } from '@univerjs/core';
import {
    BorderStyleTypes,
    ICommandService,
    IUniverInstanceService,
    LocaleType,
    RANGE_TYPE,
    Tools,
    UniverInstanceType,
} from '@univerjs/core';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { AutoFillCommand, SheetCopyDownCommand, SheetCopyRightCommand } from '../../commands/commands/auto-fill.command';
import { AddWorksheetMergeMutation } from '../../commands/mutations/add-worksheet-merge.mutation';
import { RemoveWorksheetMergeMutation } from '../../commands/mutations/remove-worksheet-merge.mutation';
import { SetRangeValuesMutation } from '../../commands/mutations/set-range-values.mutation';
import { SetSelectionsOperation } from '../../commands/operations/selection.operation';
import { createTestBase } from '../../services/__tests__/util';
import { AutoFillService, IAutoFillService } from '../../services/auto-fill/auto-fill.service';
import { SheetsSelectionsService } from '../../services/selections/selection.service';
import { AutoFillController } from '../auto-fill.controller';

const SOURCE_STYLE: IStyleData = {
    n: { pattern: '$#,##0.00' },
    bg: { rgb: '#ffeecc' },
    cl: { rgb: '#123456' },
    bd: {
        t: { s: BorderStyleTypes.THIN, cl: { rgb: '#111111' } },
        r: { s: BorderStyleTypes.THIN, cl: { rgb: '#222222' } },
        b: { s: BorderStyleTypes.THIN, cl: { rgb: '#333333' } },
        l: { s: BorderStyleTypes.THIN, cl: { rgb: '#444444' } },
    },
};

const TARGET_STYLE: IStyleData = {
    n: { pattern: '0%' },
    bg: { rgb: '#ddeeff' },
};

const WORKBOOK_DATA: IWorkbookData = {
    id: 'test',
    appVersion: '3.0.0-alpha',
    locale: LocaleType.EN_US,
    name: '',
    sheetOrder: ['sheet1'],
    styles: {
        sourceStyle: SOURCE_STYLE,
        targetStyle: TARGET_STYLE,
    },
    sheets: {
        sheet1: {
            id: 'sheet1',
            cellData: {
                0: {
                    0: { v: 123, s: 'sourceStyle' },
                },
                1: {
                    0: { v: 'down target', s: 'targetStyle' },
                    2: { v: 'blank target', s: 'targetStyle' },
                },
                2: {
                    3: { v: 'right source', s: 'sourceStyle' },
                    4: { v: 'right target', s: 'targetStyle' },
                },
            },
        },
    },
};

describe('AutoFillController copy-fill shortcuts', () => {
    let univer: Univer;
    let commandService: ICommandService;
    let selectionService: SheetsSelectionsService;
    let workbook: Workbook;

    beforeEach(() => {
        const testBed = createTestBase(Tools.deepClone(WORKBOOK_DATA), [
            [SheetsSelectionsService],
            [IAutoFillService, { useClass: AutoFillService }],
            [AutoFillController],
        ]);

        univer = testBed.univer;
        commandService = testBed.get(ICommandService);
        selectionService = testBed.get(SheetsSelectionsService);
        workbook = testBed.get(IUniverInstanceService).getCurrentUnitOfType<Workbook>(UniverInstanceType.UNIVER_SHEET)!;

        testBed.get(AutoFillController);

        commandService.registerCommand(AutoFillCommand);
        commandService.registerCommand(SheetCopyDownCommand);
        commandService.registerCommand(SheetCopyRightCommand);
        commandService.registerCommand(SetRangeValuesMutation);
        commandService.registerCommand(SetSelectionsOperation);
        commandService.registerCommand(AddWorksheetMergeMutation);
        commandService.registerCommand(RemoveWorksheetMergeMutation);
    });

    afterEach(() => {
        univer.dispose();
    });

    function selectRange(startRow: number, startColumn: number, endRow = startRow, endColumn = startColumn) {
        selectionService.addSelections([
            {
                range: {
                    startRow,
                    startColumn,
                    endRow,
                    endColumn,
                    rangeType: RANGE_TYPE.NORMAL,
                },
                primary: null,
                style: null,
            },
        ]);
    }

    function getCell(row: number, column: number): ICellData | undefined {
        return workbook.getActiveSheet()!.getCellRaw(row, column) ?? undefined;
    }

    function getCellStyle(row: number, column: number): IStyleData | undefined {
        const style = workbook.getStyles().getStyleByCell(getCell(row, column));
        return style ?? undefined;
    }

    it('copies values and styles down with the copy-down shortcut command', async () => {
        selectRange(1, 0);

        expect(await commandService.executeCommand(SheetCopyDownCommand.id)).toBe(true);

        expect(getCell(1, 0)?.v).toBe(123);
        expect(getCellStyle(1, 0)).toEqual(SOURCE_STYLE);
    });

    it('copies values and styles right with the copy-right shortcut command', async () => {
        selectRange(2, 4);

        expect(await commandService.executeCommand(SheetCopyRightCommand.id)).toBe(true);

        expect(getCell(2, 4)?.v).toBe('right source');
        expect(getCellStyle(2, 4)).toEqual(SOURCE_STYLE);
    });

    it('clears target values and direct styles when copying from a blank cell', async () => {
        selectRange(1, 2);

        expect(await commandService.executeCommand(SheetCopyDownCommand.id)).toBe(true);

        const targetCell = getCell(1, 2);
        expect(targetCell?.v).toBeUndefined();
        expect(getCellStyle(1, 2)).toBeUndefined();
    });
});

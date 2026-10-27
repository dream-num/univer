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

import { ICommandService, LocaleService, LocaleType, RANGE_TYPE, RedoCommand, UndoCommand } from '@univerjs/core';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { SheetsSelectionsService } from '../../../services/selections/selection.service';
import {
    SetWorksheetRowHeightMutation,
    SetWorksheetRowIsAutoHeightMutation,
} from '../../mutations/set-worksheet-row-height.mutation';
import { DeltaRowHeightCommand, SetRowHeightCommand } from '../set-worksheet-row-height.command';
import { createCommandTestBed } from './create-command-test-bed';

describe('row-height dimension validation', () => {
    let testBed: ReturnType<typeof createCommandTestBed>;

    beforeEach(() => {
        testBed = createCommandTestBed();
        const commandService = testBed.get(ICommandService);
        commandService.registerCommand(SetRowHeightCommand);
        commandService.registerCommand(DeltaRowHeightCommand);
        commandService.registerCommand(SetWorksheetRowHeightMutation);
        commandService.registerCommand(SetWorksheetRowIsAutoHeightMutation);
        const localeService = testBed.get(LocaleService);
        localeService.setLocale(LocaleType.EN_US);
        localeService.setDirection('ltr');
    });

    afterEach(() => testBed.univer.dispose());

    it.each([-1, Number.NaN, Number.POSITIVE_INFINITY, '96', null])(
        'rejects invalid size %s without changing the sheet or undo history',
        async (value) => {
            const commandService = testBed.get(ICommandService);
            const worksheet = testBed.sheet.getActiveSheet()!;
            const ranges = [{ startRow: 0, endRow: 1, startColumn: 0, endColumn: 1 }];
            const params = { unitId: testBed.sheet.getUnitId(), subUnitId: worksheet.getSheetId(), ranges };
            const original = worksheet.getRowHeight(0);
            expect(await commandService.executeCommand(SetRowHeightCommand.id, { ...params, value: 96.5 })).toBe(true);
            const snapshot = testBed.sheet.save();
            expect(await commandService.executeCommand(SetRowHeightCommand.id, { ...params, value })).toBe(false);
            expect(testBed.sheet.save()).toEqual(snapshot);
            await commandService.executeCommand(UndoCommand.id);
            expect(worksheet.getRowHeight(0)).toBe(original);
            await commandService.executeCommand(RedoCommand.id);
            expect(worksheet.getRowHeight(0)).toBe(96.5);
        }
    );

    it('rejects a drag resulting in negative size before side effects', async () => {
        testBed.get(SheetsSelectionsService).setSelections([{
            range: { startRow: 0, endRow: 1, startColumn: 0, endColumn: 1, rangeType: RANGE_TYPE.ROW },
            primary: null,
            style: null,
        }]);
        const commandService = testBed.get(ICommandService);
        const snapshot = testBed.sheet.save();
        expect(await commandService.executeCommand(DeltaRowHeightCommand.id, { anchorRow: 0, deltaY: -1000 })).toBe(false);
        expect(testBed.sheet.save()).toEqual(snapshot);
    });

    it('supports zero size with undo and redo', async () => {
        const commandService = testBed.get(ICommandService);
        const worksheet = testBed.sheet.getActiveSheet()!;
        const original = worksheet.getRowHeight(0);
        const params = {
            unitId: testBed.sheet.getUnitId(),
            subUnitId: worksheet.getSheetId(),
            ranges: [{ startRow: 0, endRow: 0, startColumn: 0, endColumn: 0 }],
            value: 0,
        };
        expect(await commandService.executeCommand(SetRowHeightCommand.id, params)).toBe(true);
        expect(worksheet.getRowHeight(0)).toBe(0);
        await commandService.executeCommand(UndoCommand.id);
        expect(worksheet.getRowHeight(0)).toBe(original);
        await commandService.executeCommand(RedoCommand.id);
        expect(worksheet.getRowHeight(0)).toBe(0);
    });
});

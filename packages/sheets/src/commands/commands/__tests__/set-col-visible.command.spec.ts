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

import { BooleanNumber, ICommandService, LocaleService, LocaleType, RedoCommand, UndoCommand } from '@univerjs/core';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { SheetInterceptorService } from '../../../services/sheet-interceptor/sheet-interceptor.service';
import { SetColHiddenMutation, SetColVisibleMutation } from '../../mutations/set-col-visible.mutation';
import { SetWorksheetColWidthMutation } from '../../mutations/set-worksheet-col-width.mutation';
import { SetSelectionsOperation } from '../../operations/selection.operation';
import { SetSpecificColsVisibleCommand } from '../set-col-visible.command';
import { createCommandTestBed } from './create-command-test-bed';

describe('restoring hidden and zero-width columns', () => {
    let testBed: ReturnType<typeof createCommandTestBed>;

    beforeEach(() => {
        testBed = createCommandTestBed({
            id: 'test',
            name: 'Restore columns',
            appVersion: '1.0.0',
            locale: LocaleType.EN_US,
            styles: {},
            sheetOrder: ['sheet1'],
            sheets: {
                sheet1: {
                    id: 'sheet1',
                    name: 'Sheet1',
                    rowCount: 10,
                    columnCount: 7,
                    defaultColumnWidth: 109.5,
                    columnData: {
                        0: { w: 0, s: 'zero-column' },
                        1: { w: 140, hd: BooleanNumber.TRUE },
                        2: { w: 0 },
                        3: { w: 0, hd: BooleanNumber.TRUE },
                        4: { w: 1.5 },
                        6: { w: 0 },
                    },
                },
            },
        });
        const commandService = testBed.get(ICommandService);
        for (const command of [SetSpecificColsVisibleCommand, SetColVisibleMutation, SetColHiddenMutation, SetWorksheetColWidthMutation, SetSelectionsOperation]) {
            commandService.registerCommand(command);
        }
        const localeService = testBed.get(LocaleService);
        localeService.setLocale(LocaleType.EN_US);
        localeService.setDirection('ltr');
    });

    afterEach(() => testBed.univer.dispose());

    it('restores zero-width columns to the worksheet default and undoes without hiding them', async () => {
        const worksheet = testBed.sheet.getActiveSheet()!;
        const commandService = testBed.get(ICommandService);
        let autoHeightCalls = 0;
        testBed.get(SheetInterceptorService).interceptAutoHeight({
            getMutations: () => {
                autoHeightCalls++;
                return { undos: [], redos: [] };
            },
        });
        const before = testBed.sheet.save();
        expect(await commandService.executeCommand(SetSpecificColsVisibleCommand.id, {
            unitId: testBed.sheet.getUnitId(),
            subUnitId: worksheet.getSheetId(),
            ranges: [{ startRow: 0, endRow: 9, startColumn: 0, endColumn: 0 }],
        })).toBe(true);
        expect(worksheet.getColumnWidth(0)).toBe(109.5);
        expect(worksheet.getColVisible(0)).toBe(true);
        expect(worksheet.getColumnManager().getColumn(0)?.s).toBe('zero-column');
        const after = testBed.sheet.save();
        await commandService.executeCommand(UndoCommand.id);
        expect(testBed.sheet.save()).toEqual(before);
        expect(worksheet.getColVisible(0)).toBe(true);
        await commandService.executeCommand(RedoCommand.id);
        expect(testBed.sheet.save()).toEqual(after);
        expect(autoHeightCalls).toBe(0);
    });

    it('restores mixed hidden and zero-width columns in one undo step while preserving other widths', async () => {
        const worksheet = testBed.sheet.getActiveSheet()!;
        const commandService = testBed.get(ICommandService);
        const before = testBed.sheet.save();
        expect(await commandService.executeCommand(SetSpecificColsVisibleCommand.id, {
            unitId: testBed.sheet.getUnitId(),
            subUnitId: worksheet.getSheetId(),
            ranges: [{ startRow: 0, endRow: 9, startColumn: 0, endColumn: 4 }],
        })).toBe(true);
        expect([0, 1, 2, 3, 4].map((column) => worksheet.getColumnWidth(column))).toEqual([109.5, 140, 109.5, 0, 1.5]);
        expect([0, 1, 2, 3, 4].map((column) => worksheet.getColVisible(column))).toEqual([true, true, true, true, true]);
        const after = testBed.sheet.save();
        await commandService.executeCommand(UndoCommand.id);
        expect(testBed.sheet.save()).toEqual(before);
        await commandService.executeCommand(RedoCommand.id);
        expect(testBed.sheet.save()).toEqual(after);
    });

    it('keeps the existing hidden-column behavior when the hidden column also has zero width', async () => {
        const worksheet = testBed.sheet.getActiveSheet()!;
        const commandService = testBed.get(ICommandService);
        const params = {
            unitId: testBed.sheet.getUnitId(),
            subUnitId: worksheet.getSheetId(),
            ranges: [{ startRow: 0, endRow: 9, startColumn: 3, endColumn: 3 }],
        };
        expect(await commandService.executeCommand(SetSpecificColsVisibleCommand.id, params)).toBe(true);
        expect(worksheet.getColVisible(3)).toBe(true);
        expect(worksheet.getColumnWidth(3)).toBe(0);
        expect(await commandService.executeCommand(SetSpecificColsVisibleCommand.id, params)).toBe(true);
        expect(worksheet.getColumnWidth(3)).toBe(109.5);
        await commandService.executeCommand(UndoCommand.id);
        expect(worksheet.getColVisible(3)).toBe(true);
        expect(worksheet.getColumnWidth(3)).toBe(0);
        await commandService.executeCommand(UndoCommand.id);
        expect(worksheet.getColVisible(3)).toBe(false);
    });
});

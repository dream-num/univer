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
import { INTERCEPTOR_POINT } from '../../../services/sheet-interceptor/interceptor-const';
import { SheetInterceptorService } from '../../../services/sheet-interceptor/sheet-interceptor.service';
import { SetRowHiddenMutation, SetRowVisibleMutation } from '../../mutations/set-row-visible.mutation';
import { SetWorksheetRowHeightMutation } from '../../mutations/set-worksheet-row-height.mutation';
import { SetSelectionsOperation } from '../../operations/selection.operation';
import { SetSpecificRowsVisibleCommand } from '../set-row-visible.command';
import { createCommandTestBed } from './create-command-test-bed';

describe('restoring hidden and zero-height rows', () => {
    let testBed: ReturnType<typeof createCommandTestBed>;
    const cleanups: Array<() => void> = [];

    beforeEach(() => {
        testBed = createCommandTestBed({
            id: 'test',
            name: 'Restore rows',
            appVersion: '1.0.0',
            locale: LocaleType.EN_US,
            styles: {},
            sheetOrder: ['sheet1'],
            sheets: {
                sheet1: {
                    id: 'sheet1',
                    name: 'Sheet1',
                    rowCount: 8,
                    columnCount: 10,
                    defaultRowHeight: 29.5,
                    rowData: {
                        0: { h: 0, ia: BooleanNumber.FALSE, ah: 80, s: 'zero-row' },
                        1: { h: 40, hd: BooleanNumber.TRUE },
                        2: { h: 0, ah: 0 },
                        3: { h: 0, hd: BooleanNumber.TRUE },
                        4: { h: 1.5 },
                        5: { h: 0, ah: 48 },
                        6: { h: 0 },
                        7: { h: 0 },
                    },
                },
            },
        });
        const commandService = testBed.get(ICommandService);
        for (const command of [
            SetSpecificRowsVisibleCommand,
            SetRowVisibleMutation,
            SetRowHiddenMutation,
            SetWorksheetRowHeightMutation,
            SetSelectionsOperation,
        ]) {
            commandService.registerCommand(command);
        }
        const localeService = testBed.get(LocaleService);
        localeService.setLocale(LocaleType.EN_US);
        localeService.setDirection('ltr');
    });

    afterEach(() => {
        for (const cleanup of cleanups.splice(0).reverse()) {
            cleanup();
        }
        testBed.univer.dispose();
    });

    it('restores the worksheet default height without changing metadata or recalculating auto height', async () => {
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
        expect(await commandService.executeCommand(SetSpecificRowsVisibleCommand.id, {
            unitId: testBed.sheet.getUnitId(),
            subUnitId: worksheet.getSheetId(),
            ranges: [{ startRow: 0, endRow: 0, startColumn: 0, endColumn: 9 }],
        })).toBe(true);
        expect(worksheet.getRowHeight(0)).toBe(29.5);
        expect(worksheet.getRowVisible(0)).toBe(true);
        expect(worksheet.getRowManager().getRow(0)).toMatchObject({
            ia: BooleanNumber.FALSE,
            ah: 80,
            s: 'zero-row',
        });
        const after = testBed.sheet.save();
        await commandService.executeCommand(UndoCommand.id);
        expect(testBed.sheet.save()).toEqual(before);
        expect(worksheet.getRowVisible(0)).toBe(true);
        await commandService.executeCommand(RedoCommand.id);
        expect(testBed.sheet.save()).toEqual(after);
        expect(autoHeightCalls).toBe(0);
    });

    it('restores mixed rows in one undo step and preserves positive and effective automatic heights', async () => {
        const worksheet = testBed.sheet.getActiveSheet()!;
        const commandService = testBed.get(ICommandService);
        const before = testBed.sheet.save();
        expect(await commandService.executeCommand(SetSpecificRowsVisibleCommand.id, {
            unitId: testBed.sheet.getUnitId(),
            subUnitId: worksheet.getSheetId(),
            ranges: [{ startRow: 0, endRow: 5, startColumn: 0, endColumn: 9 }],
        })).toBe(true);
        expect([0, 1, 2, 3, 4, 5].map((row) => worksheet.getRowHeight(row)))
            .toEqual([29.5, 40, 29.5, 0, 1.5, 48]);
        expect([0, 1, 2, 3, 4, 5].map((row) => worksheet.getRowVisible(row)))
            .toEqual([true, true, true, true, true, true]);
        expect(worksheet.getRowManager().getRow(5)?.h).toBe(0);
        const after = testBed.sheet.save();
        await commandService.executeCommand(UndoCommand.id);
        expect(testBed.sheet.save()).toEqual(before);
        await commandService.executeCommand(RedoCommand.id);
        expect(testBed.sheet.save()).toEqual(after);
    });

    it('keeps the existing hidden-row behavior when the hidden row also has zero height', async () => {
        const worksheet = testBed.sheet.getActiveSheet()!;
        const commandService = testBed.get(ICommandService);
        const params = {
            unitId: testBed.sheet.getUnitId(),
            subUnitId: worksheet.getSheetId(),
            ranges: [{ startRow: 3, endRow: 3, startColumn: 0, endColumn: 9 }],
        };
        expect(await commandService.executeCommand(SetSpecificRowsVisibleCommand.id, params)).toBe(true);
        expect(worksheet.getRowVisible(3)).toBe(true);
        expect(worksheet.getRowHeight(3)).toBe(0);
        expect(await commandService.executeCommand(SetSpecificRowsVisibleCommand.id, params)).toBe(true);
        expect(worksheet.getRowHeight(3)).toBe(29.5);
        await commandService.executeCommand(UndoCommand.id);
        expect(worksheet.getRowVisible(3)).toBe(true);
        expect(worksheet.getRowHeight(3)).toBe(0);
        await commandService.executeCommand(UndoCommand.id);
        expect(worksheet.getRowVisible(3)).toBe(false);
    });

    it('preserves rows collapsed by filtering when restoring an adjacent zero-height row', async () => {
        const worksheet = testBed.sheet.getActiveSheet()!;
        const commandService = testBed.get(ICommandService);
        const registration = testBed.get(SheetInterceptorService).intercept(INTERCEPTOR_POINT.ROW_FILTERED, {
            handler: (filtered, location, next) => filtered || location.row === 7 || next(),
        });
        cleanups.push(() => registration.dispose());
        const before = testBed.sheet.save();
        expect(await commandService.executeCommand(SetSpecificRowsVisibleCommand.id, {
            unitId: testBed.sheet.getUnitId(),
            subUnitId: worksheet.getSheetId(),
            ranges: [{ startRow: 6, endRow: 7, startColumn: 0, endColumn: 9 }],
        })).toBe(true);
        expect(worksheet.getRowHeight(6)).toBe(29.5);
        expect(worksheet.getRowManager().getRow(7)?.h).toBe(0);
        expect(worksheet.getRowVisible(7)).toBe(false);
        await commandService.executeCommand(UndoCommand.id);
        expect(testBed.sheet.save()).toEqual(before);
    });
});

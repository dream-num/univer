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
import type { IClipboardInterfaceService } from '@univerjs/ui';
import {
    ICommandService,
    Injector,
    IPermissionService,
    IUndoRedoService,
    IUniverInstanceService,
    LocaleService,
    LocaleType,
    Tools,
    UniverInstanceType,
} from '@univerjs/core';
import {
    SetRangeValuesMutation,
    SetSelectionsOperation,
    SetWorksheetActiveOperation,
    SetWorksheetRowAutoHeightMutation,
    SheetPermissionCheckController,
    SheetsSelectionsService,
    WorksheetSetCellStylePermission,
    WorksheetSetCellValuePermission,
} from '@univerjs/sheets';
import { expect, it, vi } from 'vitest';
import enUS from '../../../locale/en-US';
import { clipboardTestBed } from '../../../services/clipboard/__tests__/clipboard-test-bed';
import { PREDEFINED_HOOK_NAME_PASTE } from '../../../services/clipboard/clipboard.service';
import { SheetOptionalPasteCommand, SheetPasteCommand } from '../clipboard.command';

it.each([false, true])('silently cancels a delayed paste after target disposal (replacement: %s)', async (replace) => {
    let release = () => {};
    const gate = new Promise<void>((resolve) => {
        release = resolve;
    });
    const getType = vi.fn(async () => new Blob(['stale paste'], { type: 'text/plain' }));
    const boundary: IClipboardInterfaceService = {
        supportClipboard: true,
        write: async () => {},
        writeText: async () => {},
        readText: async () => '',
        read: vi.fn(async () => {
            await gate;
            return [{ presentationStyle: 'unspecified' as const, types: ['text/plain'], getType }];
        }),
    };
    const { univer, get, sheet } = clipboardTestBed(undefined, undefined, boundary);
    try {
        const commands = get(ICommandService);
        for (const command of [SetRangeValuesMutation, SetSelectionsOperation, SetWorksheetActiveOperation, SetWorksheetRowAutoHeightMutation]) {
            commands.registerCommand(command);
        }
        get(SheetsSelectionsService).setSelections('test', 'sheet1', [{
            range: { startRow: 0, endRow: 0, startColumn: 0, endColumn: 0 },
            primary: null,
            style: null,
        }]);
        const snapshot = Tools.deepClone(sheet.getSnapshot());
        const pending = SheetPasteCommand.handler(get(Injector), { value: PREDEFINED_HOOK_NAME_PASTE.DEFAULT_PASTE });
        expect(boundary.read).toHaveBeenCalledOnce();
        expect(get(IUniverInstanceService).disposeUnit(sheet.getUnitId())).toBe(true);
        const replacement = replace
            ? univer.createUnit<IWorkbookData, Workbook>(UniverInstanceType.UNIVER_SHEET, snapshot)
            : null;
        const before = replacement ? JSON.stringify(replacement.getSnapshot()) : null;
        release();
        expect(await pending).toBe(false);
        expect(getType).not.toHaveBeenCalled();
        expect(replacement ? JSON.stringify(replacement.getSnapshot()) : null).toEqual(before);
    } finally {
        release();
        univer.dispose();
    }
});

it('enforces value and style permissions for both menu paste and floating paste options', async () => {
    const html = '<table><tr><td style="font-weight:bold">Source</td></tr></table>';
    let mime = 'text/html';
    const boundary: IClipboardInterfaceService = {
        supportClipboard: true,
        write: async () => {},
        writeText: async () => {},
        readText: async () => '',
        read: async () => [{
            presentationStyle: 'unspecified',
            types: [mime],
            getType: async () => new Blob([mime === 'text/html' ? html : '42%'], { type: mime }),
        }],
    };
    const { get, sheet, univer } = clipboardTestBed(undefined, undefined, boundary);
    try {
        const accessor = get(Injector);
        const locale = get(LocaleService);
        locale.load({ [LocaleType.EN_US]: enUS });
        locale.setLocale(LocaleType.EN_US);
        locale.setDirection('ltr');
        const commands = get(ICommandService);
        for (const command of [SetRangeValuesMutation, SetSelectionsOperation, SetWorksheetActiveOperation, SetWorksheetRowAutoHeightMutation]) {
            commands.registerCommand(command);
        }
        const worksheet = sheet.getActiveSheet();
        const unitId = sheet.getUnitId();
        const subUnitId = worksheet.getSheetId();
        get(SheetsSelectionsService).setSelections(unitId, subUnitId, [{
            range: { startRow: 0, endRow: 0, startColumn: 0, endColumn: 0 },
            primary: null,
            style: null,
        }]);
        commands.syncExecuteCommand(SetRangeValuesMutation.id, { unitId, subUnitId, cellValue: { 0: { 0: { v: 'Keep' } } } });
        const permissions = get(IPermissionService);
        const value = new WorksheetSetCellValuePermission(unitId, subUnitId);
        const style = new WorksheetSetCellStylePermission(unitId, subUnitId);
        permissions.addPermissionPoint(value);
        permissions.addPermissionPoint(style);
        permissions.updatePermissionPoint(value.id, false);
        const paste = (type: keyof typeof PREDEFINED_HOOK_NAME_PASTE) => SheetPasteCommand.handler(accessor, { value: PREDEFINED_HOOK_NAME_PASTE[type] });
        expect(await paste('SPECIAL_PASTE_FORMAT')).toBe(true);
        expect(worksheet.getCellStyle(0, 0)?.bl).toBe(1);
        const history = get(IUndoRedoService).getUndoRedoStatus(unitId);
        const messages: string[] = [];
        const subscription = get(SheetPermissionCheckController).triggerPermissionUIEvent$.subscribe((message) => messages.push(message));
        try {
            for (const type of ['SPECIAL_PASTE_VALUE', 'SPECIAL_PASTE_FORMULA'] as const) {
                await expect(paste(type)).rejects.toThrow('have no permission');
                await expect(SheetOptionalPasteCommand.handler(accessor, { type })).rejects.toThrow('have no permission');
            }
            expect(messages).toContain(enUS['sheets-ui'].permission.dialog.pasteErr);
        } finally {
            subscription.unsubscribe();
        }
        mime = 'text/plain';
        expect(await paste('SPECIAL_PASTE_FORMAT')).toBe(false);
        expect(worksheet.getCellRaw(0, 0)?.v).toBe('Keep');
        expect(get(IUndoRedoService).getUndoRedoStatus(unitId)).toEqual(history);

        permissions.updatePermissionPoint(value.id, true);
        permissions.updatePermissionPoint(style.id, false);
        await expect(paste('SPECIAL_PASTE_FORMAT')).rejects.toThrow('have no permission');
        await expect(SheetOptionalPasteCommand.handler(accessor, { type: 'SPECIAL_PASTE_VALUE' })).rejects.toThrow('have no permission');
        expect(await paste('SPECIAL_PASTE_VALUE')).toBe(true);
        expect(worksheet.getCellRaw(0, 0)?.v).toBe(0.42);
        expect(worksheet.getCellStyle(0, 0)?.n).toBeUndefined();
    } finally {
        univer.dispose();
    }
});

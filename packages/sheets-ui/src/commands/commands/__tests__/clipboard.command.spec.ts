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
import { ICommandService, Injector, IUniverInstanceService, Tools, UniverInstanceType } from '@univerjs/core';
import {
    SetRangeValuesMutation,
    SetSelectionsOperation,
    SetWorksheetActiveOperation,
    SetWorksheetRowAutoHeightMutation,
    SheetsSelectionsService,
} from '@univerjs/sheets';
import { expect, it, vi } from 'vitest';
import { clipboardTestBed } from '../../../services/clipboard/__tests__/clipboard-test-bed';
import { PREDEFINED_HOOK_NAME_PASTE } from '../../../services/clipboard/clipboard.service';
import { SheetPasteCommand } from '../clipboard.command';

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

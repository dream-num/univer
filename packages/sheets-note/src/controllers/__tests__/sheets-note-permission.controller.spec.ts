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

import type { ICommandInfo } from '@univerjs/core';
import { ICommandService, Injector, LocaleService, toDisposable } from '@univerjs/core';
import { SheetPermissionCheckController } from '@univerjs/sheets';
import { describe, expect, it, vi } from 'vitest';
import { SheetDeleteNoteCommand, SheetToggleNotePopupCommand, SheetUpdateNoteCommand } from '../../commands/commands/note.command';
import { SHEET_NOTE_EDIT_PERMISSIONS } from '../../const';
import { SheetsNotePermissionController } from '../sheets-note-permission.controller';

type BeforeCommandHandler = (command: ICommandInfo) => void;

const CELL_RANGE = [{ startRow: 3, startColumn: 2, endRow: 3, endColumn: 2 }];

function createTestBed(options: { allowed?: boolean } = {}) {
    let beforeCommandHandler: BeforeCommandHandler | undefined;
    const permissionCheck = {
        permissionCheckWithRanges: vi.fn(() => options.allowed ?? true),
        permissionCheckWithoutRange: vi.fn(() => options.allowed ?? true),
        blockExecuteWithoutPermission: vi.fn(),
    };
    const injector = new Injector([
        [ICommandService, { useValue: {
            beforeCommandExecuted: vi.fn((handler: BeforeCommandHandler) => {
                beforeCommandHandler = handler;

                return toDisposable(() => undefined);
            }),
        } as never }],
        [LocaleService, { useValue: { t: (key: string) => key } as never }],
        [SheetPermissionCheckController, { useValue: permissionCheck as never }],
        [SheetsNotePermissionController],
    ]);

    const controller = injector.get(SheetsNotePermissionController);

    return {
        client: () => beforeCommandHandler,
        controller,
        permissionCheck,
    };
}

describe('SheetsNotePermissionController', () => {
    it('checks the edited cell and blocks the update when edit permission is missing', () => {
        const bed = createTestBed({ allowed: false });

        bed.client()?.({
            id: SheetUpdateNoteCommand.id,
            params: {
                unitId: 'unit-1',
                sheetId: 'sheet-1',
                row: 3,
                col: 2,
                note: { id: 'note-1', row: 3, col: 2, width: 160, height: 72, note: 'hint' },
            },
        } as ICommandInfo);

        expect(bed.permissionCheck.permissionCheckWithRanges).toHaveBeenCalledWith(
            SHEET_NOTE_EDIT_PERMISSIONS,
            CELL_RANGE,
            'unit-1',
            'sheet-1'
        );
        expect(bed.permissionCheck.blockExecuteWithoutPermission).toHaveBeenCalledWith('sheets-note.permission.editErr');

        bed.controller.dispose();
    });

    it('does not block an update when edit permission is granted', () => {
        const bed = createTestBed();

        bed.client()?.({
            id: SheetUpdateNoteCommand.id,
            params: {
                unitId: 'unit-1',
                sheetId: 'sheet-1',
                row: 3,
                col: 2,
                note: { id: 'note-1', row: 3, col: 2, width: 160, height: 72, note: 'hint' },
            },
        } as ICommandInfo);

        expect(bed.permissionCheck.blockExecuteWithoutPermission).not.toHaveBeenCalled();

        bed.controller.dispose();
    });

    it('checks the given cell when deleting a note by location', () => {
        const bed = createTestBed({ allowed: false });

        bed.client()?.({
            id: SheetDeleteNoteCommand.id,
            params: { unitId: 'unit-1', sheetId: 'sheet-1', row: 3, col: 2 },
        } as ICommandInfo);

        expect(bed.permissionCheck.permissionCheckWithRanges).toHaveBeenCalledWith(
            SHEET_NOTE_EDIT_PERMISSIONS,
            CELL_RANGE,
            'unit-1',
            'sheet-1'
        );
        expect(bed.permissionCheck.permissionCheckWithoutRange).not.toHaveBeenCalled();
        expect(bed.permissionCheck.blockExecuteWithoutPermission).toHaveBeenCalled();

        bed.controller.dispose();
    });

    it('falls back to the current selection when deleting from the context menu', () => {
        const bed = createTestBed({ allowed: false });

        bed.client()?.({ id: SheetDeleteNoteCommand.id } as ICommandInfo);

        expect(bed.permissionCheck.permissionCheckWithRanges).not.toHaveBeenCalled();
        expect(bed.permissionCheck.permissionCheckWithoutRange).toHaveBeenCalledWith(SHEET_NOTE_EDIT_PERMISSIONS);
        expect(bed.permissionCheck.blockExecuteWithoutPermission).toHaveBeenCalled();

        bed.controller.dispose();
    });

    it('blocks showing or hiding a note without edit permission', () => {
        const bed = createTestBed({ allowed: false });

        bed.client()?.({ id: SheetToggleNotePopupCommand.id } as ICommandInfo);

        expect(bed.permissionCheck.permissionCheckWithoutRange).toHaveBeenCalledWith(SHEET_NOTE_EDIT_PERMISSIONS);
        expect(bed.permissionCheck.blockExecuteWithoutPermission).toHaveBeenCalled();

        bed.controller.dispose();
    });

    it('ignores commands without note parameters', () => {
        const bed = createTestBed({ allowed: false });

        bed.client()?.({
            id: SheetUpdateNoteCommand.id,
        } as ICommandInfo);
        bed.client()?.({ id: 'sheet.command.set-range-values' } as ICommandInfo);

        expect(bed.permissionCheck.permissionCheckWithRanges).not.toHaveBeenCalled();
        expect(bed.permissionCheck.permissionCheckWithoutRange).not.toHaveBeenCalled();
        expect(bed.permissionCheck.blockExecuteWithoutPermission).not.toHaveBeenCalled();

        bed.controller.dispose();
    });
});

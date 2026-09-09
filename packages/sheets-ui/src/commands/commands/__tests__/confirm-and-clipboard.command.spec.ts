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

import type { IAccessor, IRange, Workbook, Worksheet } from '@univerjs/core';
import type { IClipboardInterfaceService } from '@univerjs/ui';
import {
    ICommandService,
    IConfirmService,
    Injector,
    IPermissionService,
    IUndoRedoService,
    IUniverInstanceService,
    LocaleService,
    RedoCommand,
    UndoCommand,
} from '@univerjs/core';
import {
    AddWorksheetMergeMutation,
    DeleteRangeMoveLeftCommand,
    DeleteRangeMoveUpCommand,
    InsertRangeMoveDownCommand,
    InsertRangeMoveRightCommand,
    MoveRangeMutation,
    RemoveWorksheetMergeMutation,
    SetRangeValuesMutation,
    SetSelectionsOperation,
    SetWorksheetActiveOperation,
    SetWorksheetColWidthMutation,
    SetWorksheetRowAutoHeightMutation,
    SetWorksheetRowHeightMutation,
    SheetsSelectionsService,
    WorkbookCopyPermission,
    WorkbookEditablePermission,
    WorksheetSetCellStylePermission,
    WorksheetSetCellValuePermission,
} from '@univerjs/sheets';
import * as sheets from '@univerjs/sheets';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { clipboardTestBed } from '../../../services/clipboard/__tests__/clipboard-test-bed';
import { ISheetClipboardService, PREDEFINED_HOOK_NAME_PASTE } from '../../../services/clipboard/clipboard.service';
import {
    SheetCopyCommand,
    SheetCutCommand,
    SheetOptionalPasteCommand,
    SheetPasteBesidesBorderCommand,
    SheetPasteColWidthCommand,
    SheetPasteCommand,
    SheetPasteFormatCommand,
    SheetPasteShortKeyCommand,
    SheetPasteValueCommand,
} from '../clipboard.command';
import { DeleteRangeMoveLeftConfirmCommand } from '../delete-range-move-left-confirm.command';
import { DeleteRangeMoveUpConfirmCommand } from '../delete-range-move-up-confirm.command';
import { InsertRangeMoveDownConfirmCommand } from '../insert-range-move-down-confirm.command';
import { InsertRangeMoveRightConfirmCommand } from '../insert-range-move-right-confirm.command';

function createAccessor(pairs: Array<[unknown, unknown]>): IAccessor {
    const map = new Map<unknown, unknown>(pairs);
    return {
        get(token: unknown) {
            if (!map.has(token)) {
                throw new Error(`Unknown token: ${String(token)}`);
            }
            return map.get(token);
        },
    } as unknown as IAccessor;
}

function createWorksheet(options?: {
    rowCount?: number;
    colCount?: number;
    filteredRows?: number[];
    merges?: IRange[];
}): Worksheet {
    const filtered = new Set(options?.filteredRows ?? []);
    return {
        getRowCount: () => options?.rowCount ?? 10,
        getColumnCount: () => options?.colCount ?? 8,
        getRowFiltered: (row: number) => filtered.has(row),
        getMergeData: () => options?.merges ?? [],
    } as unknown as Worksheet;
}

function mockSheetCommandTarget(worksheet: Worksheet): void {
    vi.spyOn(sheets, 'getSheetCommandTarget').mockReturnValue({
        workbook: {} as unknown as Workbook,
        worksheet,
        unitId: 'unit-1',
        subUnitId: 'sheet-1',
    });
}

function createSelectionService(range?: IRange | null) {
    return {
        getCurrentSelections: () => (range ? [{ range }] : range === null ? null : [{ range: undefined }]),
    };
}

describe('insert/delete range confirm commands', () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('InsertRangeMoveDownConfirm handles filtered rows, merge confirm and direct execute', async () => {
        const executeCommand = vi.fn(async () => true);
        const confirm = vi.fn().mockResolvedValueOnce(true).mockResolvedValueOnce(false).mockResolvedValueOnce(true);
        const locale = { t: (key: string) => key };
        const rowSelection = { startRow: 1, endRow: 1, startColumn: 0, endColumn: 0 } as IRange;

        const filteredWorksheet = createWorksheet({ filteredRows: [2] });
        mockSheetCommandTarget(filteredWorksheet);
        const accessorFiltered = createAccessor([
            [IConfirmService, { confirm }],
            [ICommandService, { executeCommand }],
            [LocaleService, locale],
            [SheetsSelectionsService, createSelectionService(rowSelection)],
            [IUniverInstanceService, {}],
        ]);
        expect(await InsertRangeMoveDownConfirmCommand.handler(accessorFiltered)).toBe(false);
        expect(executeCommand).not.toHaveBeenCalled();

        const mergeWorksheet = createWorksheet({
            merges: [{ startRow: 0, endRow: 3, startColumn: 0, endColumn: 2 } as IRange],
        });
        mockSheetCommandTarget(mergeWorksheet);
        const accessorMerge = createAccessor([
            [IConfirmService, { confirm }],
            [ICommandService, { executeCommand }],
            [LocaleService, locale],
            [SheetsSelectionsService, createSelectionService(rowSelection)],
            [IUniverInstanceService, {}],
        ]);

        expect(await InsertRangeMoveDownConfirmCommand.handler(accessorMerge)).toBe(true);
        expect(await InsertRangeMoveDownConfirmCommand.handler(accessorMerge)).toBe(true);
        expect(executeCommand).toHaveBeenCalledWith(InsertRangeMoveDownCommand.id);

        const noMergeWorksheet = createWorksheet();
        mockSheetCommandTarget(noMergeWorksheet);
        expect(await InsertRangeMoveDownConfirmCommand.handler(accessorMerge)).toBe(true);
        expect(executeCommand).toHaveBeenCalledWith(InsertRangeMoveDownCommand.id);
    });

    it('InsertRangeMoveRightConfirm executes directly and handles merge confirm', async () => {
        const executeCommand = vi.fn(async () => true);
        const confirm = vi.fn().mockResolvedValueOnce(false).mockResolvedValueOnce(true);
        const locale = { t: (key: string) => key };
        const range = { startRow: 1, endRow: 1, startColumn: 1, endColumn: 1 } as IRange;
        const accessor = createAccessor([
            [IConfirmService, { confirm }],
            [ICommandService, { executeCommand }],
            [LocaleService, locale],
            [SheetsSelectionsService, createSelectionService(range)],
            [IUniverInstanceService, {}],
        ]);

        mockSheetCommandTarget(createWorksheet());
        expect(await InsertRangeMoveRightConfirmCommand.handler(accessor)).toBe(true);
        expect(executeCommand).toHaveBeenCalledWith(InsertRangeMoveRightCommand.id);

        mockSheetCommandTarget(createWorksheet({
            merges: [{ startRow: 0, endRow: 3, startColumn: 0, endColumn: 2 } as IRange],
        }));
        expect(await InsertRangeMoveRightConfirmCommand.handler(accessor)).toBe(true);
        expect(await InsertRangeMoveRightConfirmCommand.handler(accessor)).toBe(true);
    });

    it('DeleteRangeMoveUpConfirm handles filter/merge/no-merge branches', async () => {
        const executeCommand = vi.fn(async () => true);
        const confirm = vi.fn().mockResolvedValueOnce(true).mockResolvedValueOnce(false).mockResolvedValueOnce(true);
        const locale = { t: (key: string) => key };
        const range = { startRow: 1, endRow: 1, startColumn: 0, endColumn: 0 } as IRange;
        const accessor = createAccessor([
            [IConfirmService, { confirm }],
            [ICommandService, { executeCommand }],
            [LocaleService, locale],
            [SheetsSelectionsService, createSelectionService(range)],
            [IUniverInstanceService, {}],
        ]);

        mockSheetCommandTarget(createWorksheet({ filteredRows: [2] }));
        expect(await DeleteRangeMoveUpConfirmCommand.handler(accessor)).toBe(false);

        mockSheetCommandTarget(createWorksheet({
            merges: [{ startRow: 0, endRow: 3, startColumn: 0, endColumn: 2 } as IRange],
        }));
        expect(await DeleteRangeMoveUpConfirmCommand.handler(accessor)).toBe(true);
        expect(await DeleteRangeMoveUpConfirmCommand.handler(accessor)).toBe(true);
        expect(executeCommand).toHaveBeenCalledWith(DeleteRangeMoveUpCommand.id);

        mockSheetCommandTarget(createWorksheet());
        expect(await DeleteRangeMoveUpConfirmCommand.handler(accessor)).toBe(true);
    });

    it('DeleteRangeMoveLeftConfirm handles merge/no-merge and guard branches', async () => {
        const executeCommand = vi.fn(async () => true);
        const confirm = vi.fn().mockResolvedValueOnce(false).mockResolvedValueOnce(true);
        const locale = { t: (key: string) => key };
        const range = { startRow: 1, endRow: 1, startColumn: 1, endColumn: 1 } as IRange;
        const accessor = createAccessor([
            [IConfirmService, { confirm }],
            [ICommandService, { executeCommand }],
            [LocaleService, locale],
            [SheetsSelectionsService, createSelectionService(range)],
            [IUniverInstanceService, {}],
        ]);

        mockSheetCommandTarget(createWorksheet({
            merges: [{ startRow: 0, endRow: 3, startColumn: 0, endColumn: 2 } as IRange],
        }));
        expect(await DeleteRangeMoveLeftConfirmCommand.handler(accessor)).toBe(true);
        expect(await DeleteRangeMoveLeftConfirmCommand.handler(accessor)).toBe(true);

        mockSheetCommandTarget(createWorksheet());
        expect(await DeleteRangeMoveLeftConfirmCommand.handler(accessor)).toBe(true);
        expect(executeCommand).toHaveBeenCalledWith(DeleteRangeMoveLeftCommand.id);

        const noSelectionAccessor = createAccessor([
            [IConfirmService, { confirm }],
            [ICommandService, { executeCommand }],
            [LocaleService, locale],
            [SheetsSelectionsService, createSelectionService(null)],
            [IUniverInstanceService, {}],
        ]);
        expect(await DeleteRangeMoveLeftConfirmCommand.handler(noSelectionAccessor)).toBe(false);

        vi.spyOn(sheets, 'getSheetCommandTarget').mockReturnValue(null);
        expect(await DeleteRangeMoveLeftConfirmCommand.handler(accessor)).toBe(false);
    });
});

describe('clipboard command branches', () => {
    it.each(['copy', 'cut'] as const)('uses the internal %s cache without system clipboard support and restores history', async (mode) => {
        const boundary: IClipboardInterfaceService = {
            supportClipboard: false,
            write: vi.fn(async () => {}),
            writeText: vi.fn(async () => {}),
            readText: vi.fn(async () => ''),
            read: vi.fn(async () => []),
        };
        const { univer, get, sheet } = clipboardTestBed(undefined, undefined, boundary);
        try {
            const accessor = get(Injector);
            const commands = get(ICommandService);
            for (const command of [
                SetRangeValuesMutation,
                SetSelectionsOperation,
                SetWorksheetActiveOperation,
                SetWorksheetRowAutoHeightMutation,
                SetWorksheetRowHeightMutation,
                SetWorksheetColWidthMutation,
                AddWorksheetMergeMutation,
                RemoveWorksheetMergeMutation,
                MoveRangeMutation,
            ]) {
                commands.registerCommand(command);
            }
            const select = (column: number) => get(SheetsSelectionsService).setSelections('test', 'sheet1', [{
                range: { startRow: 0, endRow: 0, startColumn: column, endColumn: column },
                primary: null,
                style: null,
            }]);
            select(0);
            expect(await SheetPasteCommand.handler(accessor, { value: PREDEFINED_HOOK_NAME_PASTE.DEFAULT_PASTE })).toBe(false);
            commands.syncExecuteCommand(SetRangeValuesMutation.id, {
                unitId: 'test',
                subUnitId: 'sheet1',
                cellValue: { 0: { 0: { v: 'cached-value', s: { bl: 1 } } } },
            });
            const copyCommand = mode === 'copy' ? SheetCopyCommand : SheetCutCommand;
            expect(await copyCommand.handler(accessor)).toBe(true);
            select(1);
            expect(await SheetPasteCommand.handler(accessor, { value: PREDEFINED_HOOK_NAME_PASTE.DEFAULT_PASTE })).toBe(true);
            const worksheet = sheet.getSheetBySheetId('sheet1')!;
            expect(worksheet.getCell(0, 1)?.v).toBe('cached-value');
            expect(worksheet.getCellStyle(0, 1)?.bl).toBe(1);
            expect(worksheet.getCell(0, 0)?.v).toBe(mode === 'copy' ? 'cached-value' : undefined);
            if (mode === 'copy') {
                expect(await SheetOptionalPasteCommand.handler(accessor, { type: 'SPECIAL_PASTE_VALUE' })).toBe(true);
                expect(worksheet.getCell(0, 1)?.v).toBe('cached-value');
                expect(worksheet.getCellStyle(0, 1)?.bl).not.toBe(1);
            }
            expect(await commands.executeCommand(UndoCommand.id)).toBe(true);
            expect(worksheet.getCell(0, 0)?.v).toBe('cached-value');
            expect(worksheet.getCell(0, 1)?.v).toBeUndefined();
            expect(await commands.executeCommand(RedoCommand.id)).toBe(true);
            expect(worksheet.getCell(0, 1)?.v).toBe('cached-value');
            expect(boundary.read).not.toHaveBeenCalled();
        } finally {
            univer.dispose();
        }
    });

    it('keeps menu paste data and history on the selection captured before the system read', async () => {
        let releaseRead = () => {};
        const readGate = new Promise<void>((resolve) => {
            releaseRead = resolve;
        });
        const boundary: IClipboardInterfaceService = {
            supportClipboard: true,
            write: vi.fn(async () => {}),
            writeText: vi.fn(async () => {}),
            readText: async () => 'system-value',
            read: async () => {
                await readGate;
                return [{
                    presentationStyle: 'unspecified',
                    types: ['text/plain'],
                    getType: async () => new Blob(['system-value'], { type: 'text/plain' }),
                }];
            },
        };
        const { univer, get, sheet } = clipboardTestBed(undefined, undefined, boundary);
        try {
            const accessor = get(Injector);
            const commands = get(ICommandService);
            for (const command of [SetRangeValuesMutation, SetSelectionsOperation, SetWorksheetActiveOperation, SetWorksheetRowAutoHeightMutation]) {
                commands.registerCommand(command);
            }
            const select = (column: number) => get(SheetsSelectionsService).setSelections('test', 'sheet1', [{
                range: { startRow: 0, endRow: 0, startColumn: column, endColumn: column },
                primary: null,
                style: null,
            }]);
            select(0);
            expect(await SheetPasteShortKeyCommand.handler(accessor, { textContent: 'source-value' })).toBe(true);
            expect(await SheetCopyCommand.handler(accessor)).toBe(true);
            expect(boundary.write).toHaveBeenCalled();
            expect(await SheetCutCommand.handler(accessor)).toBe(true);
            select(1);
            const pendingPaste = SheetPasteCommand.handler(accessor, { value: PREDEFINED_HOOK_NAME_PASTE.DEFAULT_PASTE });
            select(2);
            releaseRead();
            expect(await pendingPaste).toBe(true);
            const worksheet = sheet.getSheetBySheetId('sheet1')!;
            expect(worksheet.getCell(0, 1)?.v).toBe('system-value');
            expect(worksheet.getCell(0, 0)?.v).toBe('source-value');
            expect(worksheet.getCell(0, 2)?.v).toBeUndefined();
            expect(await commands.executeCommand(UndoCommand.id)).toBe(true);
            expect(worksheet.getCell(0, 1)?.v).toBeUndefined();
        } finally {
            releaseRead();
            univer.dispose();
        }
    });

    it.each([
        { name: 'cell value', PermissionPoint: WorksheetSetCellValuePermission },
        { name: 'cell style', PermissionPoint: WorksheetSetCellStylePermission },
    ])('rejects menu paste when $name permission is revoked during the system read', async ({ PermissionPoint }) => {
        let releaseRead = () => {};
        const readGate = new Promise<void>((resolve) => {
            releaseRead = resolve;
        });
        const getType = vi.fn(async () => new Blob(['forbidden'], { type: 'text/plain' }));
        const boundary: IClipboardInterfaceService = {
            supportClipboard: true,
            write: vi.fn(async () => {}),
            writeText: vi.fn(async () => {}),
            readText: vi.fn(async () => ''),
            read: vi.fn(async () => {
                await readGate;
                return [{ presentationStyle: 'unspecified' as const, types: ['text/plain'], getType }];
            }),
        };
        const { univer, get, sheet } = clipboardTestBed(undefined, undefined, boundary);
        try {
            get(SheetsSelectionsService).setSelections('test', 'sheet1', [{
                range: { startRow: 0, endRow: 0, startColumn: 0, endColumn: 0 },
                primary: null,
                style: null,
            }]);
            const permissions = get(IPermissionService);
            const point = new PermissionPoint('test', 'sheet1');
            if (!permissions.getPermissionPoint(point.id)) {
                permissions.addPermissionPoint(point);
            }
            permissions.updatePermissionPoint(point.id, true);
            const before = JSON.stringify(sheet.getSnapshot());
            const history = get(IUndoRedoService);
            const beforeHistory = history.getUndoRedoStatus('test');
            const pendingPaste = SheetPasteCommand.handler(get(Injector), { value: PREDEFINED_HOOK_NAME_PASTE.DEFAULT_PASTE });
            expect(boundary.read).toHaveBeenCalledOnce();
            permissions.updatePermissionPoint(point.id, false);
            releaseRead();
            await expect(pendingPaste).rejects.toThrow('have no permission');
            expect(getType).not.toHaveBeenCalled();
            expect(JSON.stringify(sheet.getSnapshot())).toBe(before);
            expect(history.getUndoRedoStatus('test')).toEqual(beforeHistory);
        } finally {
            releaseRead();
            univer.dispose();
        }
    });

    it('checks real clipboard permissions without calling the system boundary or changing cells', async () => {
        const boundary: IClipboardInterfaceService = {
            supportClipboard: true,
            write: vi.fn(async () => {}),
            writeText: vi.fn(async () => {}),
            readText: vi.fn(async () => ''),
            read: vi.fn(async () => []),
        };
        const { univer, get, sheet } = clipboardTestBed(undefined, undefined, boundary);
        try {
            const accessor = get(Injector);
            get(ISheetClipboardService);
            get(SheetsSelectionsService).setSelections('test', 'sheet1', [{
                range: { startRow: 0, endRow: 0, startColumn: 0, endColumn: 0 },
                primary: null,
                style: null,
            }]);
            const permissions = get(IPermissionService);
            for (const point of [new WorkbookCopyPermission('test'), new WorkbookEditablePermission('test')]) {
                if (!permissions.getPermissionPoint(point.id)) {
                    permissions.addPermissionPoint(point);
                }
                permissions.updatePermissionPoint(point.id, false);
            }
            const before = JSON.stringify(sheet.getSnapshot());
            await expect(SheetCopyCommand.handler(accessor)).rejects.toThrow('have no permission');
            await expect(SheetCutCommand.handler(accessor)).rejects.toThrow('have no permission');
            await expect(SheetPasteCommand.handler(accessor, { value: PREDEFINED_HOOK_NAME_PASTE.DEFAULT_PASTE })).rejects.toThrow('have no permission');
            await expect(SheetPasteShortKeyCommand.handler(accessor, { textContent: 'forbidden' })).rejects.toThrow('have no permission');
            expect(boundary.read).not.toHaveBeenCalled();
            expect(boundary.write).not.toHaveBeenCalled();
            expect(JSON.stringify(sheet.getSnapshot())).toBe(before);
        } finally {
            univer.dispose();
        }
    });

    it('routes special paste commands to SheetPasteCommand', async () => {
        const executeCommand = vi.fn(async () => true);
        const accessor = createAccessor([
            [ICommandService, { executeCommand }],
        ]);

        expect(await SheetPasteValueCommand.handler(accessor)).toBe(true);
        expect(await SheetPasteFormatCommand.handler(accessor)).toBe(true);
        expect(await SheetPasteColWidthCommand.handler(accessor)).toBe(true);
        expect(await SheetPasteBesidesBorderCommand.handler(accessor)).toBe(true);

        expect(executeCommand).toHaveBeenCalledWith(SheetPasteCommand.id, {
            value: PREDEFINED_HOOK_NAME_PASTE.SPECIAL_PASTE_VALUE,
        });
        expect(executeCommand).toHaveBeenCalledWith(SheetPasteCommand.id, {
            value: PREDEFINED_HOOK_NAME_PASTE.SPECIAL_PASTE_FORMAT,
        });
        expect(executeCommand).toHaveBeenCalledWith(SheetPasteCommand.id, {
            value: PREDEFINED_HOOK_NAME_PASTE.SPECIAL_PASTE_COL_WIDTH,
        });
        expect(executeCommand).toHaveBeenCalledWith(SheetPasteCommand.id, {
            value: PREDEFINED_HOOK_NAME_PASTE.SPECIAL_PASTE_BESIDES_BORDER,
        });
    });
});

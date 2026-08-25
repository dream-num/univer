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
import {
    ICommandService,
    IConfirmService,
    IPermissionService,
    IUniverInstanceService,
    LocaleService,
} from '@univerjs/core';
import {
    DeleteRangeMoveLeftCommand,
    DeleteRangeMoveUpCommand,
    InsertRangeMoveDownCommand,
    InsertRangeMoveRightCommand,
    SheetPermissionCheckController,
    SheetsSelectionsService,
} from '@univerjs/sheets';
import * as sheets from '@univerjs/sheets';
import { IClipboardInterfaceService } from '@univerjs/ui';
import { afterEach, describe, expect, it, vi } from 'vitest';
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
    it('runs copy/cut/paste and optional-paste command handlers', async () => {
        const copy = vi.fn(async () => true);
        const cut = vi.fn(async () => true);
        const paste = vi.fn(async () => true);
        const pasteByCopyId = vi.fn(async () => true);
        const legacyPaste = vi.fn();
        const rePasteWithPasteType = vi.fn(async () => true);
        const copyContentCache = vi.fn(() => ({ getLastCopyId: () => 'copy-1' }));
        const clipboardService = {
            copy,
            cut,
            paste,
            pasteByCopyId,
            legacyPaste,
            rePasteWithPasteType,
            copyContentCache,
        };
        const read = vi.fn(async () => [{ id: 'clip-1' }]);

        const accessor = createAccessor([
            [ISheetClipboardService, clipboardService],
            [IClipboardInterfaceService, { supportClipboard: true, read }],
            [IUniverInstanceService, { getCurrentUnitOfType: vi.fn(() => null) }],
            [IPermissionService, { getPermissionPoint: vi.fn(() => undefined) }],
            [LocaleService, { t: vi.fn((key: string) => key) }],
            [SheetPermissionCheckController, {
                permissionCheckWithRanges: vi.fn(() => true),
                blockExecuteWithoutPermission: vi.fn(),
            }],
        ]);

        expect(await SheetCopyCommand.handler(accessor)).toBe(true);
        expect(await SheetCutCommand.handler(accessor)).toBe(true);
        expect(await SheetPasteCommand.handler(accessor, { value: 'v' })).toBe(true);
        expect(paste).toHaveBeenCalledWith({ id: 'clip-1' }, 'v');

        const accessorWithoutClipboardAPI = createAccessor([
            [ISheetClipboardService, clipboardService],
            [IClipboardInterfaceService, { supportClipboard: false, read: vi.fn(async () => []) }],
            [IUniverInstanceService, { getCurrentUnitOfType: vi.fn(() => null) }],
            [IPermissionService, { getPermissionPoint: vi.fn(() => undefined) }],
            [LocaleService, { t: vi.fn((key: string) => key) }],
            [SheetPermissionCheckController, {
                permissionCheckWithRanges: vi.fn(() => true),
                blockExecuteWithoutPermission: vi.fn(),
            }],
        ]);
        expect(await SheetPasteCommand.handler(accessorWithoutClipboardAPI, { value: 'value-only' })).toBe(true);
        expect(pasteByCopyId).toHaveBeenCalledWith('copy-1', 'value-only');

        const accessorNoData = createAccessor([
            [ISheetClipboardService, {
                ...clipboardService,
                copyContentCache: () => ({ getLastCopyId: () => '' }),
            }],
            [IClipboardInterfaceService, { supportClipboard: true, read: vi.fn(async () => []) }],
            [IUniverInstanceService, { getCurrentUnitOfType: vi.fn(() => null) }],
            [IPermissionService, { getPermissionPoint: vi.fn(() => undefined) }],
            [LocaleService, { t: vi.fn((key: string) => key) }],
            [SheetPermissionCheckController, {
                permissionCheckWithRanges: vi.fn(() => true),
                blockExecuteWithoutPermission: vi.fn(),
            }],
        ]);
        expect(await SheetPasteCommand.handler(accessorNoData, { value: 'none' })).toBe(false);

        expect(await SheetPasteShortKeyCommand.handler(accessor, {
            htmlContent: '<b>x</b>',
            textContent: 'x',
            files: [],
            formulaClipboardPayload: '{"formulas":[]}',
        })).toBe(true);
        expect(legacyPaste).toHaveBeenCalledWith('<b>x</b>', 'x', [], '{"formulas":[]}');

        expect(await SheetOptionalPasteCommand.handler(accessor, { type: PREDEFINED_HOOK_NAME_PASTE.SPECIAL_PASTE_VALUE })).toBe(true);
        expect(rePasteWithPasteType).toHaveBeenCalledWith(PREDEFINED_HOOK_NAME_PASTE.SPECIAL_PASTE_VALUE);
    });

    it('checks clipboard permissions only after the sheet implementation is selected', async () => {
        const copy = vi.fn(async () => true);
        const cut = vi.fn(async () => true);
        const legacyPaste = vi.fn();
        const permissionCheckWithRanges = vi.fn(() => false);
        const blockExecuteWithoutPermission = vi.fn((message: string) => {
            throw new Error(message);
        });
        const accessor = createAccessor([
            [ISheetClipboardService, {
                copy,
                cut,
                legacyPaste,
            }],
            [IUniverInstanceService, { getCurrentUnitOfType: vi.fn(() => null) }],
            [IPermissionService, { getPermissionPoint: vi.fn(() => undefined) }],
            [LocaleService, { t: vi.fn((key: string) => `translated:${key}`) }],
            [SheetPermissionCheckController, {
                permissionCheckWithRanges,
                blockExecuteWithoutPermission,
            }],
        ]);

        await expect(SheetCopyCommand.handler(accessor)).rejects.toThrow('translated:sheets-ui.permission.dialog.copyErr');
        await expect(SheetCutCommand.handler(accessor)).rejects.toThrow('translated:sheets-ui.permission.dialog.cutErr');
        await expect(SheetPasteCommand.handler(accessor, { value: PREDEFINED_HOOK_NAME_PASTE.DEFAULT_PASTE })).rejects.toThrow('translated:sheets-ui.permission.dialog.pasteErr');
        await expect(SheetPasteShortKeyCommand.handler(accessor, {})).rejects.toThrow('translated:sheets-ui.permission.dialog.pasteErr');

        expect(permissionCheckWithRanges).toHaveBeenCalledTimes(4);
        expect(copy).not.toHaveBeenCalled();
        expect(cut).not.toHaveBeenCalled();
        expect(legacyPaste).not.toHaveBeenCalled();
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

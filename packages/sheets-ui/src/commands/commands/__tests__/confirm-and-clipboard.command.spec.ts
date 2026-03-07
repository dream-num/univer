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

import type { IRange } from '@univerjs/core';
import {
    ICommandService,
    IConfirmService,
    IUniverInstanceService,
    LocaleService,
} from '@univerjs/core';
import {
    DeleteRangeMoveLeftCommand,
    DeleteRangeMoveUpCommand,
    InsertRangeMoveDownCommand,
    InsertRangeMoveRightCommand,
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

function createAccessor(pairs: Array<[unknown, unknown]>) {
    const map = new Map<unknown, unknown>(pairs);
    return {
        get(token: unknown) {
            if (!map.has(token)) {
                throw new Error(`Unknown token: ${String(token)}`);
            }
            return map.get(token);
        },
    } as any;
}

function createWorksheet(options?: {
    rowCount?: number;
    colCount?: number;
    filteredRows?: number[];
    merges?: IRange[];
}) {
    const filtered = new Set(options?.filteredRows ?? []);
    return {
        getRowCount: () => options?.rowCount ?? 10,
        getColumnCount: () => options?.colCount ?? 8,
        getRowFiltered: (row: number) => filtered.has(row),
        getMergeData: () => options?.merges ?? [],
    } as any;
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
        vi.spyOn(sheets, 'getSheetCommandTarget').mockReturnValue({
            worksheet: filteredWorksheet,
        } as any);
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
        vi.spyOn(sheets, 'getSheetCommandTarget').mockReturnValue({
            worksheet: mergeWorksheet,
        } as any);
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
        vi.spyOn(sheets, 'getSheetCommandTarget').mockReturnValue({
            worksheet: noMergeWorksheet,
        } as any);
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

        vi.spyOn(sheets, 'getSheetCommandTarget').mockReturnValue({
            worksheet: createWorksheet(),
        } as any);
        expect(await InsertRangeMoveRightConfirmCommand.handler(accessor)).toBe(true);
        expect(executeCommand).toHaveBeenCalledWith(InsertRangeMoveRightCommand.id);

        vi.spyOn(sheets, 'getSheetCommandTarget').mockReturnValue({
            worksheet: createWorksheet({
                merges: [{ startRow: 0, endRow: 3, startColumn: 0, endColumn: 2 } as IRange],
            }),
        } as any);
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

        vi.spyOn(sheets, 'getSheetCommandTarget').mockReturnValue({
            worksheet: createWorksheet({ filteredRows: [2] }),
        } as any);
        expect(await DeleteRangeMoveUpConfirmCommand.handler(accessor)).toBe(false);

        vi.spyOn(sheets, 'getSheetCommandTarget').mockReturnValue({
            worksheet: createWorksheet({
                merges: [{ startRow: 0, endRow: 3, startColumn: 0, endColumn: 2 } as IRange],
            }),
        } as any);
        expect(await DeleteRangeMoveUpConfirmCommand.handler(accessor)).toBe(true);
        expect(await DeleteRangeMoveUpConfirmCommand.handler(accessor)).toBe(true);
        expect(executeCommand).toHaveBeenCalledWith(DeleteRangeMoveUpCommand.id);

        vi.spyOn(sheets, 'getSheetCommandTarget').mockReturnValue({
            worksheet: createWorksheet(),
        } as any);
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

        vi.spyOn(sheets, 'getSheetCommandTarget').mockReturnValue({
            worksheet: createWorksheet({
                merges: [{ startRow: 0, endRow: 3, startColumn: 0, endColumn: 2 } as IRange],
            }),
        } as any);
        expect(await DeleteRangeMoveLeftConfirmCommand.handler(accessor)).toBe(true);
        expect(await DeleteRangeMoveLeftConfirmCommand.handler(accessor)).toBe(true);

        vi.spyOn(sheets, 'getSheetCommandTarget').mockReturnValue({
            worksheet: createWorksheet(),
        } as any);
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
        ]);

        expect(await SheetCopyCommand.handler(accessor)).toBe(true);
        expect(await SheetCutCommand.handler(accessor)).toBe(true);
        expect(await SheetPasteCommand.handler(accessor, { value: 'v' })).toBe(true);
        expect(paste).toHaveBeenCalledWith({ id: 'clip-1' }, 'v');

        const accessorWithoutClipboardAPI = createAccessor([
            [ISheetClipboardService, clipboardService],
            [IClipboardInterfaceService, { supportClipboard: false, read: vi.fn(async () => []) }],
        ]);
        expect(await SheetPasteCommand.handler(accessorWithoutClipboardAPI, { value: 'value-only' })).toBe(true);
        expect(pasteByCopyId).toHaveBeenCalledWith('copy-1', 'value-only');

        const accessorNoData = createAccessor([
            [ISheetClipboardService, {
                ...clipboardService,
                copyContentCache: () => ({ getLastCopyId: () => '' }),
            }],
            [IClipboardInterfaceService, { supportClipboard: true, read: vi.fn(async () => []) }],
        ]);
        expect(await SheetPasteCommand.handler(accessorNoData, { value: 'none' })).toBe(false);

        expect(await SheetPasteShortKeyCommand.handler(accessor, { htmlContent: '<b>x</b>', textContent: 'x', files: [] })).toBe(true);
        expect(legacyPaste).toHaveBeenCalledWith('<b>x</b>', 'x', []);

        expect(await SheetOptionalPasteCommand.handler(accessor, { type: PREDEFINED_HOOK_NAME_PASTE.SPECIAL_PASTE_VALUE })).toBe(true);
        expect(rePasteWithPasteType).toHaveBeenCalledWith(PREDEFINED_HOOK_NAME_PASTE.SPECIAL_PASTE_VALUE);
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

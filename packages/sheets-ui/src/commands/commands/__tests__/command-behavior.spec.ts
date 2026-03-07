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

import {
    EDITOR_ACTIVATED,
    ICommandService,
    IConfigService,
    IConfirmService,
    IContextService,
    IUndoRedoService,
    IUniverInstanceService,
    LocaleService,
    ThemeService,
} from '@univerjs/core';
import {
    SetInlineFormatBoldCommand,
    SetInlineFormatFontFamilyCommand,
    SetInlineFormatFontSizeCommand,
    SetInlineFormatItalicCommand,
    SetInlineFormatStrikethroughCommand,
    SetInlineFormatSubscriptCommand,
    SetInlineFormatSuperscriptCommand,
    SetInlineFormatTextColorCommand,
    SetInlineFormatUnderlineCommand,
} from '@univerjs/docs-ui';
import { IRenderManagerService } from '@univerjs/engine-render';
import {
    AddRangeProtectionMutation,
    AddWorksheetProtectionCommand,
    DeleteRangeProtectionMutation,
    DeleteWorksheetProtectionCommand,
    RangeProtectionRuleModel,
    RemoveSheetCommand,
    SetBoldCommand,
    SetFontFamilyCommand,
    SetFontSizeCommand,
    SetItalicCommand,
    SetStrikeThroughCommand,
    SetTextColorCommand,
    SetUnderlineCommand,
    SheetsSelectionsService,
    WorksheetProtectionRuleModel,
} from '@univerjs/sheets';
import { describe, expect, it, vi } from 'vitest';
import { SHEET_VIEW_KEY, SHEET_ZOOM_RANGE } from '../../../common/keys';
import { AutoWidthController } from '../../../controllers/auto-width.controller';
import * as menuUtils from '../../../controllers/menu/utils';
import { IEditorBridgeService } from '../../../services/editor-bridge.service';
import { ISheetBarService } from '../../../services/sheet-bar/sheet-bar.service';
import { SetScrollOperation } from '../../operations/scroll.operation';
import { SetZoomRatioOperation } from '../../operations/set-zoom-ratio.operation';
import { SheetPermissionOpenPanelOperation } from '../../operations/sheet-permission-open-panel.operation';
import { SetColumnHeaderHeightCommand, SetRowHeaderWidthCommand } from '../headersize-changed.command';
import {
    ResetRangeTextColorCommand,
    SetRangeBoldCommand,
    SetRangeFontDecreaseCommand,
    SetRangeFontFamilyCommand,
    SetRangeFontIncreaseCommand,
    SetRangeFontSizeCommand,
    SetRangeItalicCommand,
    SetRangeStrickThroughCommand,
    SetRangeSubscriptCommand,
    SetRangeSuperscriptCommand,
    SetRangeTextColorCommand,
    SetRangeUnderlineCommand,
} from '../inline-format.command';
import {
    AddRangeProtectionFromContextMenuCommand,
    AddRangeProtectionFromSheetBarCommand,
    AddRangeProtectionFromToolbarCommand,
    DeleteRangeProtectionFromContextMenuCommand,
    SetRangeProtectionFromContextMenuCommand,
    ViewSheetPermissionFromContextMenuCommand,
    ViewSheetPermissionFromSheetBarCommand,
} from '../range-protection.command';
import { RemoveSheetConfirmCommand } from '../remove-sheet-confirm.command';
import { ResetScrollCommand, ScrollCommand, ScrollToCellCommand, SetScrollRelativeCommand } from '../set-scroll.command';
import { SetWorksheetColAutoWidthCommand } from '../set-worksheet-auto-col-width.command';
import { ChangeZoomRatioCommand, SetZoomRatioCommand } from '../set-zoom-ratio.command';
import { ShowMenuListCommand } from '../unhide.command';
import {
    ChangeSheetProtectionFromSheetBarCommand,
    DeleteWorksheetProtectionFormSheetBarCommand,
} from '../worksheet-protection.command';

function createAccessor(pairs: Array<[unknown, unknown]>) {
    const map = new Map<unknown, unknown>(pairs);
    return {
        get(token: unknown) {
            if (!map.has(token)) {
                throw new Error(`Unknown token: ${String(token)}`);
            }
            return map.get(token);
        },
        has(token: unknown) {
            return map.has(token);
        },
    } as any;
}

describe('sheets-ui command behaviors', () => {
    it('routes inline-format commands according to editor focus', async () => {
        const executeCommand = vi.fn(async () => true);
        const getContextValue = vi.fn((key: unknown) => key === EDITOR_ACTIVATED);
        const commandService = { executeCommand };
        const contextService = { getContextValue };
        const baseAccessor = createAccessor([
            [ICommandService, commandService],
            [IContextService, contextService],
            [ThemeService, { getColorFromTheme: vi.fn(() => '#111111') }],
            [IUniverInstanceService, { getCurrentUnitOfType: () => ({ getActiveSheet: () => ({ getComposedCellStyle: () => ({ fs: 9 }) }) }) }],
            [SheetsSelectionsService, { getCurrentLastSelection: () => ({ primary: { startRow: 0, startColumn: 0 } }) }],
        ]);

        await SetRangeBoldCommand.handler(baseAccessor, undefined as any);
        await SetRangeItalicCommand.handler(baseAccessor, undefined as any);
        await SetRangeUnderlineCommand.handler(baseAccessor, undefined as any);
        await SetRangeStrickThroughCommand.handler(baseAccessor, undefined as any);
        await SetRangeSubscriptCommand.handler(baseAccessor, undefined as any);
        await SetRangeSuperscriptCommand.handler(baseAccessor, undefined as any);
        await SetRangeFontSizeCommand.handler(baseAccessor, { value: 10 } as any);
        await SetRangeFontFamilyCommand.handler(baseAccessor, { value: 'Arial' } as any);
        await SetRangeTextColorCommand.handler(baseAccessor, { value: '#fff' } as any);
        await ResetRangeTextColorCommand.handler(baseAccessor, undefined as any);

        expect(executeCommand).toHaveBeenCalledWith(SetInlineFormatBoldCommand.id);
        expect(executeCommand).toHaveBeenCalledWith(SetInlineFormatItalicCommand.id);
        expect(executeCommand).toHaveBeenCalledWith(SetInlineFormatUnderlineCommand.id);
        expect(executeCommand).toHaveBeenCalledWith(SetInlineFormatStrikethroughCommand.id);
        expect(executeCommand).toHaveBeenCalledWith(SetInlineFormatSubscriptCommand.id);
        expect(executeCommand).toHaveBeenCalledWith(SetInlineFormatSuperscriptCommand.id);
        expect(executeCommand).toHaveBeenCalledWith(SetInlineFormatFontSizeCommand.id, { value: 10 });
        expect(executeCommand).toHaveBeenCalledWith(SetInlineFormatFontFamilyCommand.id, { value: 'Arial' });
        expect(executeCommand).toHaveBeenCalledWith(SetInlineFormatTextColorCommand.id, { value: '#fff' });
        expect(executeCommand).toHaveBeenCalledWith(SetInlineFormatTextColorCommand.id, { value: null });
    });

    it('routes inline-format commands to sheet commands in non-editor mode', async () => {
        const executeCommand = vi.fn(async () => true);
        const commandService = { executeCommand };
        const contextService = { getContextValue: vi.fn(() => false) };
        const baseAccessor = createAccessor([
            [ICommandService, commandService],
            [IContextService, contextService],
            [ThemeService, { getColorFromTheme: vi.fn(() => '#000000') }],
            [IUniverInstanceService, { getCurrentUnitOfType: () => ({ getActiveSheet: () => ({ getComposedCellStyle: () => ({ fs: 12 }) }) }) }],
            [SheetsSelectionsService, { getCurrentLastSelection: () => ({ primary: { startRow: 0, startColumn: 0 } }) }],
        ]);

        await SetRangeBoldCommand.handler(baseAccessor, undefined as any);
        await SetRangeItalicCommand.handler(baseAccessor, undefined as any);
        await SetRangeUnderlineCommand.handler(baseAccessor, undefined as any);
        await SetRangeStrickThroughCommand.handler(baseAccessor, undefined as any);
        await SetRangeFontSizeCommand.handler(baseAccessor, { value: 14 } as any);
        await SetRangeFontFamilyCommand.handler(baseAccessor, { value: 'Times New Roman' } as any);
        await SetRangeTextColorCommand.handler(baseAccessor, { value: '#123456' } as any);
        await ResetRangeTextColorCommand.handler(baseAccessor, undefined as any);

        expect(executeCommand).toHaveBeenCalledWith(SetBoldCommand.id);
        expect(executeCommand).toHaveBeenCalledWith(SetItalicCommand.id);
        expect(executeCommand).toHaveBeenCalledWith(SetUnderlineCommand.id);
        expect(executeCommand).toHaveBeenCalledWith(SetStrikeThroughCommand.id);
        expect(executeCommand).toHaveBeenCalledWith(SetFontSizeCommand.id, { value: 14 });
        expect(executeCommand).toHaveBeenCalledWith(SetFontFamilyCommand.id, { value: 'Times New Roman' });
        expect(executeCommand).toHaveBeenCalledWith(SetTextColorCommand.id, { value: '#123456' });
        expect(executeCommand).toHaveBeenCalledWith(SetTextColorCommand.id, { value: '#000000' });
    });

    it('returns false for subscript/superscript when not in editor mode', async () => {
        const accessor = createAccessor([
            [ICommandService, { executeCommand: vi.fn(async () => true) }],
            [IContextService, { getContextValue: vi.fn(() => false) }],
        ]);

        expect(await SetRangeSubscriptCommand.handler(accessor, undefined as any)).toBe(false);
        expect(await SetRangeSuperscriptCommand.handler(accessor, undefined as any)).toBe(false);
    });

    it('handles font increase/decrease bounds and empty selection', async () => {
        const executeCommand = vi.fn(async () => true);
        const getFontStyleAtCursor = vi.spyOn(menuUtils, 'getFontStyleAtCursor');

        getFontStyleAtCursor.mockReturnValueOnce({ ts: { fs: 400 } } as any);
        const increaseInEditorAccessor = createAccessor([
            [ICommandService, { executeCommand }],
            [IContextService, { getContextValue: vi.fn((key: unknown) => key === EDITOR_ACTIVATED) }],
            [IUniverInstanceService, { getCurrentUnitOfType: () => ({ getActiveSheet: () => ({ getComposedCellStyle: () => ({ fs: 11 }) }) }) }],
            [SheetsSelectionsService, { getCurrentLastSelection: () => ({ primary: { startRow: 1, startColumn: 1 } }) }],
        ]);

        expect(await SetRangeFontIncreaseCommand.handler(increaseInEditorAccessor, undefined as any)).toBe(true);
        expect(executeCommand).toHaveBeenCalledWith(SetInlineFormatFontSizeCommand.id, { value: 400 });

        const decreaseInCellAccessor = createAccessor([
            [ICommandService, { executeCommand }],
            [IContextService, { getContextValue: vi.fn(() => false) }],
            [IUniverInstanceService, { getCurrentUnitOfType: () => ({ getActiveSheet: () => ({ getComposedCellStyle: () => ({ fs: 6 }) }) }) }],
            [SheetsSelectionsService, { getCurrentLastSelection: () => ({ primary: { startRow: 2, startColumn: 2 } }) }],
        ]);

        expect(await SetRangeFontDecreaseCommand.handler(decreaseInCellAccessor, undefined as any)).toBe(true);
        expect(executeCommand).toHaveBeenCalledWith(SetFontSizeCommand.id, { value: 6 });

        const noSelectionAccessor = createAccessor([
            [ICommandService, { executeCommand }],
            [IContextService, { getContextValue: vi.fn(() => false) }],
            [IUniverInstanceService, { getCurrentUnitOfType: () => ({ getActiveSheet: () => ({ getComposedCellStyle: () => ({ fs: 10 }) }) }) }],
            [SheetsSelectionsService, { getCurrentLastSelection: () => null }],
        ]);
        expect(await SetRangeFontIncreaseCommand.handler(noSelectionAccessor, undefined as any)).toBe(false);
    });

    it('updates header sizes and custom header components', async () => {
        const rowHeader = { setCustomHeader: vi.fn() };
        const colHeader = { setCustomHeader: vi.fn() };
        const setRowHeaderSize = vi.fn();
        const setColumnHeaderSize = vi.fn();
        const render = {
            with: vi.fn(() => ({ setRowHeaderSize, setColumnHeaderSize })),
            components: new Map([
                [SHEET_VIEW_KEY.ROW, rowHeader],
                [SHEET_VIEW_KEY.COLUMN, colHeader],
            ]),
        };
        const renderManager = { getRenderById: vi.fn(() => render) };
        const accessor = createAccessor([[IRenderManagerService, renderManager]]);

        expect(await SetRowHeaderWidthCommand.handler(accessor, { unitId: 'u1', subUnitId: 's1', size: 32 })).toBe(true);
        expect(await SetColumnHeaderHeightCommand.handler(accessor, { unitId: 'u1', subUnitId: 's1', size: 26 })).toBe(true);
        expect(setRowHeaderSize).toHaveBeenCalledWith(render, 's1', 32);
        expect(setColumnHeaderSize).toHaveBeenCalledWith(render, 's1', 26);
        expect(rowHeader.setCustomHeader).toHaveBeenCalledWith({ headerStyle: { size: 32 } }, 's1');
        expect(colHeader.setCustomHeader).toHaveBeenCalledWith({ headerStyle: { size: 26 } }, 's1');
    });

    it('guards header-size commands when params or render manager are missing', async () => {
        const accessor = createAccessor([[IRenderManagerService, null]]);
        expect(await SetRowHeaderWidthCommand.handler(accessor, undefined as any)).toBe(false);
        expect(await SetColumnHeaderHeightCommand.handler(accessor, undefined as any)).toBe(false);
    });

    it('handles scroll commands with target and fallback branches', async () => {
        const executeCommand = vi.fn(async () => true);
        const syncExecuteCommand = vi.fn(() => true);
        const worksheet = { getSheetId: () => 'sheet-1', getConfig: () => ({ freeze: { xSplit: 2, ySplit: 1 } }) };
        const workbook = {
            getUnitId: () => 'unit-1',
            getActiveSheet: () => worksheet,
        };
        const renderManager = {
            getRenderById: vi.fn(() => ({
                with: vi.fn(() => ({
                    getCurrentScrollState: () => ({
                        sheetViewStartRow: 4,
                        sheetViewStartColumn: 5,
                        offsetX: 12,
                        offsetY: 30,
                    }),
                })),
            })),
        };
        const univerInstanceService = {
            getCurrentUnitOfType: () => workbook,
            getCurrentUnitForType: () => workbook,
        };

        const accessor = createAccessor([
            [ICommandService, { executeCommand, syncExecuteCommand }],
            [IUniverInstanceService, univerInstanceService],
            [IRenderManagerService, renderManager],
        ]);

        expect(await SetScrollRelativeCommand.handler(accessor, { offsetX: -2, offsetY: 5 })).toBe(true);
        expect(executeCommand).toHaveBeenCalledWith(SetScrollOperation.id, expect.objectContaining({
            unitId: 'unit-1',
            sheetId: 'sheet-1',
            offsetX: 10,
            offsetY: 35,
            sheetViewStartRow: 4,
            sheetViewStartColumn: 5,
        }));

        expect(ScrollCommand.handler(accessor, { offsetX: 66 } as any)).toBe(true);
        expect(syncExecuteCommand).toHaveBeenCalledWith(SetScrollOperation.id, expect.objectContaining({
            unitId: 'unit-1',
            sheetId: 'sheet-1',
            sheetViewStartRow: 4,
            sheetViewStartColumn: 5,
            offsetX: 66,
            offsetY: 30,
        }));

        const scrollToRange = vi.fn(() => true);
        const scrollAccessor = createAccessor([
            [IUniverInstanceService, { getCurrentUnitForType: () => ({ getUnitId: () => 'unit-1' }) }],
            [IRenderManagerService, { getRenderById: () => ({ with: () => ({ scrollToRange }) }) }],
        ]);
        expect(ScrollToCellCommand.handler(scrollAccessor, { range: { startRow: 1, endRow: 1, startColumn: 2, endColumn: 2 } as any })).toBe(true);
        expect(scrollToRange).toHaveBeenCalledWith({ startRow: 1, endRow: 1, startColumn: 2, endColumn: 2 }, undefined, undefined);

        expect(await ResetScrollCommand.handler(accessor, undefined as any)).toBe(true);
        expect(executeCommand).toHaveBeenCalledWith(SetScrollOperation.id, {
            unitId: 'unit-1',
            sheetId: 'sheet-1',
            sheetViewStartRow: 0,
            sheetViewStartColumn: 0,
        });
    });

    it('guards scroll commands when params or targets are missing', async () => {
        const accessor = createAccessor([
            [ICommandService, { executeCommand: vi.fn(), syncExecuteCommand: vi.fn() }],
            [IUniverInstanceService, { getCurrentUnitOfType: () => null, getCurrentUnitForType: () => null }],
            [IRenderManagerService, { getRenderById: vi.fn() }],
        ]);

        expect(await SetScrollRelativeCommand.handler(accessor, { offsetX: 1, offsetY: 1 })).toBe(false);
        expect(ScrollCommand.handler(accessor, undefined as any)).toBe(false);
        expect(ScrollCommand.handler(accessor, { offsetY: 10 } as any)).toBe(false);
        expect(await ResetScrollCommand.handler(accessor, undefined as any)).toBe(false);
    });

    it('handles zoom ratio commands with clamp and editor-visible guards', async () => {
        const executeCommand = vi.fn(() => true);
        const worksheet = {
            getSheetId: () => 'sheet-1',
            getConfig: () => ({ zoomRatio: 4 }),
        };
        const workbook = {
            getUnitId: () => 'unit-1',
            getActiveSheet: () => worksheet,
        };
        const accessor = createAccessor([
            [IUniverInstanceService, { getCurrentUnitOfType: () => workbook }],
            [ICommandService, { executeCommand }],
            [IEditorBridgeService, { isVisible: () => ({ visible: false, unitId: 'other' }) }],
        ]);

        expect(ChangeZoomRatioCommand.handler(accessor, { delta: 0.5 })).toBe(true);
        expect(executeCommand).toHaveBeenCalledWith(SetZoomRatioOperation.id, {
            unitId: 'unit-1',
            subUnitId: 'sheet-1',
            zoomRatio: SHEET_ZOOM_RANGE[1] / 100,
        });

        expect(SetZoomRatioCommand.handler(accessor, { unitId: 'unit-1', subUnitId: 'sheet-1', zoomRatio: 1.25 })).toBe(true);
        expect(executeCommand).toHaveBeenCalledWith(SetZoomRatioOperation.id, {
            unitId: 'unit-1',
            subUnitId: 'sheet-1',
            zoomRatio: 1.25,
        });

        const hiddenByEditorAccessor = createAccessor([
            [IUniverInstanceService, { getCurrentUnitOfType: () => workbook }],
            [ICommandService, { executeCommand }],
            [IEditorBridgeService, { isVisible: () => ({ visible: true, unitId: 'unit-1' }) }],
        ]);
        expect(ChangeZoomRatioCommand.handler(hiddenByEditorAccessor, { delta: -0.1 })).toBe(false);
        expect(SetZoomRatioCommand.handler(hiddenByEditorAccessor, { unitId: 'unit-1', subUnitId: 'sheet-1', zoomRatio: 1 })).toBe(false);
    });

    it('guards zoom commands for invalid params or missing targets', () => {
        const accessor = createAccessor([
            [IUniverInstanceService, { getCurrentUnitOfType: () => null }],
            [ICommandService, { executeCommand: vi.fn() }],
            [IEditorBridgeService, { isVisible: () => ({ visible: false, unitId: 'none' }) }],
        ]);
        expect(ChangeZoomRatioCommand.handler(accessor, undefined as any)).toBe(false);
        expect(ChangeZoomRatioCommand.handler(accessor, { delta: 0.1 })).toBe(false);
        expect(SetZoomRatioCommand.handler(accessor, undefined as any)).toBe(false);
    });

    it('executes auto-width command with undo/redo and guards empty ranges', () => {
        const syncExecuteCommand = vi.fn(() => true);
        const pushUndoRedo = vi.fn();
        const accessor = createAccessor([
            [ICommandService, { syncExecuteCommand }],
            [IUndoRedoService, { pushUndoRedo }],
            [SheetsSelectionsService, {
                getCurrentSelections: () => [{ range: { startRow: 0, endRow: 1, startColumn: 0, endColumn: 1 } }],
            }],
            [IUniverInstanceService, { getCurrentUnitOfType: () => ({ getUnitId: () => 'unit-1', getActiveSheet: () => ({ getSheetId: () => 'sheet-1' }) }) }],
            [AutoWidthController, {
                getUndoRedoParamsOfColWidth: vi.fn(() => ({
                    redos: [{ id: 'redo-1', params: { a: 1 } }],
                    undos: [{ id: 'undo-1', params: { b: 2 } }],
                })),
            }],
        ]);

        expect(SetWorksheetColAutoWidthCommand.handler(accessor, undefined as any)).toBe(true);
        expect(syncExecuteCommand).toHaveBeenCalledWith('redo-1', { a: 1 }, undefined);
        expect(pushUndoRedo).toHaveBeenCalledWith({
            unitID: 'unit-1',
            undoMutations: [{ id: 'undo-1', params: { b: 2 } }],
            redoMutations: [{ id: 'redo-1', params: { a: 1 } }],
        });

        const emptySelectionAccessor = createAccessor([
            [ICommandService, { syncExecuteCommand: vi.fn(() => true) }],
            [IUndoRedoService, { pushUndoRedo: vi.fn() }],
            [SheetsSelectionsService, { getCurrentSelections: () => [] }],
            [IUniverInstanceService, { getCurrentUnitOfType: () => ({ getUnitId: () => 'unit-1', getActiveSheet: () => ({ getSheetId: () => 'sheet-1' }) }) }],
            [AutoWidthController, { getUndoRedoParamsOfColWidth: vi.fn(() => ({ redos: [], undos: [] })) }],
        ]);
        expect(SetWorksheetColAutoWidthCommand.handler(emptySelectionAccessor, undefined as any)).toBe(false);
    });

    it('handles remove-sheet confirmation for both confirm and cancel', async () => {
        const executeCommand = vi.fn(async () => true);
        const confirm = vi.fn()
            .mockResolvedValueOnce(false)
            .mockResolvedValueOnce(true);
        const worksheet = {
            getCellMatrix: () => ({
                forEach: (fn: (...args: unknown[]) => void) => {
                    fn();
                    fn();
                },
            }),
            getSheetId: () => 'sheet-1',
        };
        const workbook = {
            getUnitId: () => 'unit-1',
            getSheetBySheetId: (subUnitId: string) => (subUnitId === 'sheet-1' ? worksheet : null),
        };

        const accessor = createAccessor([
            [IConfirmService, { confirm }],
            [ICommandService, { executeCommand }],
            [LocaleService, { t: (key: string) => key }],
            [IConfigService, { getConfig: () => ({ largeSheetOperation: { largeSheetCellCountThreshold: 1 } }) }],
            [IUniverInstanceService, { getCurrentUnitOfType: () => workbook }],
        ]);

        expect(await RemoveSheetConfirmCommand.handler(accessor, { subUnitId: 'sheet-1' } as any)).toBe(false);
        expect(await RemoveSheetConfirmCommand.handler(accessor, { subUnitId: 'sheet-1' } as any)).toBe(true);
        expect(executeCommand).toHaveBeenCalledWith(RemoveSheetCommand.id, { subUnitId: 'sheet-1' });
    });

    it('guards remove-sheet command when target sheet is missing', async () => {
        const accessor = createAccessor([
            [IConfirmService, { confirm: vi.fn() }],
            [ICommandService, { executeCommand: vi.fn() }],
            [LocaleService, { t: (key: string) => key }],
            [IConfigService, { getConfig: () => ({}) }],
            [IUniverInstanceService, { getCurrentUnitOfType: () => null }],
        ]);
        expect(await RemoveSheetConfirmCommand.handler(accessor, { subUnitId: 'sheet-1' } as any)).toBe(false);
    });

    it('handles worksheet protection commands', async () => {
        const executeCommand = vi.fn()
            .mockResolvedValueOnce(true)
            .mockResolvedValueOnce(true);
        const pushUndoRedo = vi.fn();
        const worksheet = { getSheetId: () => 'sheet-1' };
        const workbook = {
            getUnitId: () => 'unit-1',
            getActiveSheet: () => worksheet,
        };
        const accessor = createAccessor([
            [ICommandService, { executeCommand }],
            [IUndoRedoService, { pushUndoRedo }],
            [WorksheetProtectionRuleModel, { getRule: () => ({ permissionId: 'perm-1' }) }],
            [IUniverInstanceService, { getCurrentUnitForType: () => workbook }],
        ]);

        expect(await DeleteWorksheetProtectionFormSheetBarCommand.handler(accessor, { ok: true } as any)).toBe(true);
        expect(pushUndoRedo).toHaveBeenCalledWith({
            unitID: 'unit-1',
            redoMutations: [{ id: DeleteWorksheetProtectionCommand.id, params: { unitId: 'unit-1', subUnitId: 'sheet-1' } }],
            undoMutations: [{ id: AddWorksheetProtectionCommand.id, params: { unitId: 'unit-1', rule: { permissionId: 'perm-1' } } }],
        });

        expect(await ChangeSheetProtectionFromSheetBarCommand.handler(accessor, undefined as any)).toBe(true);
        expect(executeCommand).toHaveBeenCalledWith('sheet-permission.operation.openDialog');

        const noWorksheetAccessor = createAccessor([
            [ICommandService, { executeCommand: vi.fn() }],
            [IUndoRedoService, { pushUndoRedo: vi.fn() }],
            [WorksheetProtectionRuleModel, { getRule: vi.fn() }],
            [IUniverInstanceService, { getCurrentUnitForType: () => ({ getUnitId: () => 'unit-1', getActiveSheet: () => null }) }],
        ]);
        expect(await DeleteWorksheetProtectionFormSheetBarCommand.handler(noWorksheetAccessor, { ok: true } as any)).toBe(false);
        expect(await DeleteWorksheetProtectionFormSheetBarCommand.handler(noWorksheetAccessor, undefined as any)).toBe(false);
    });

    it('opens and deletes range protection from toolbar/context/sheet-bar', async () => {
        const executeCommand = vi.fn(async () => true);
        const accessor = createAccessor([[ICommandService, { executeCommand }]]);

        expect(await AddRangeProtectionFromToolbarCommand.handler(accessor, undefined as any)).toBe(true);
        expect(await AddRangeProtectionFromContextMenuCommand.handler(accessor, undefined as any)).toBe(true);
        expect(await ViewSheetPermissionFromContextMenuCommand.handler(accessor, undefined as any)).toBe(true);
        expect(await AddRangeProtectionFromSheetBarCommand.handler(accessor, undefined as any)).toBe(true);
        expect(await ViewSheetPermissionFromSheetBarCommand.handler(accessor, undefined as any)).toBe(true);

        expect(executeCommand).toHaveBeenCalledWith(SheetPermissionOpenPanelOperation.id, { showDetail: true });
        expect(executeCommand).toHaveBeenCalledWith(SheetPermissionOpenPanelOperation.id, { showDetail: false });
        expect(executeCommand).toHaveBeenCalledWith(SheetPermissionOpenPanelOperation.id, { fromSheetBar: true, showDetail: true });
    });

    it('handles delete/set range protection command branches', async () => {
        const executeCommand = vi.fn()
            .mockResolvedValueOnce(true)
            .mockResolvedValueOnce(true)
            .mockResolvedValueOnce(true)
            .mockResolvedValueOnce(true);
        const pushUndoRedo = vi.fn();
        const worksheet = { getSheetId: () => 'sheet-1' };
        const workbook = { getUnitId: () => 'unit-1', getActiveSheet: () => worksheet };
        const overlapRule = {
            id: 'rule-1',
            permissionId: 'perm-1',
            ranges: [{ startRow: 1, endRow: 3, startColumn: 1, endColumn: 3 }],
        };

        const accessorWithWorksheetRule = createAccessor([
            [ICommandService, { executeCommand }],
            [IUniverInstanceService, { getCurrentUnitForType: () => workbook }],
            [IUndoRedoService, { pushUndoRedo }],
            [SheetsSelectionsService, { getCurrentLastSelection: () => ({ range: { startRow: 1, endRow: 1, startColumn: 1, endColumn: 1 } }) }],
            [WorksheetProtectionRuleModel, { getRule: () => ({ permissionId: 'sheet-perm' }) }],
            [RangeProtectionRuleModel, { getSubunitRuleList: () => [overlapRule] }],
        ]);

        expect(await DeleteRangeProtectionFromContextMenuCommand.handler(accessorWithWorksheetRule, undefined as any)).toBe(true);
        expect(executeCommand).toHaveBeenCalledWith(DeleteWorksheetProtectionCommand.id, {
            unitId: 'unit-1',
            subUnitId: 'sheet-1',
            rule: { permissionId: 'sheet-perm' },
        });

        expect(await SetRangeProtectionFromContextMenuCommand.handler(accessorWithWorksheetRule, undefined as any)).toBe(true);
        expect(executeCommand).toHaveBeenCalledWith(SheetPermissionOpenPanelOperation.id, expect.objectContaining({
            showDetail: true,
            rule: expect.objectContaining({ unitId: 'unit-1', subUnitId: 'sheet-1' }),
        }));

        const accessorWithRangeRule = createAccessor([
            [ICommandService, { executeCommand }],
            [IUniverInstanceService, { getCurrentUnitForType: () => workbook }],
            [IUndoRedoService, { pushUndoRedo }],
            [SheetsSelectionsService, { getCurrentLastSelection: () => ({ range: { startRow: 1, endRow: 1, startColumn: 1, endColumn: 1 } }) }],
            [WorksheetProtectionRuleModel, { getRule: () => null }],
            [RangeProtectionRuleModel, { getSubunitRuleList: () => [overlapRule] }],
        ]);

        expect(await DeleteRangeProtectionFromContextMenuCommand.handler(accessorWithRangeRule, undefined as any)).toBe(true);
        expect(executeCommand).toHaveBeenCalledWith(DeleteRangeProtectionMutation.id, {
            unitId: 'unit-1',
            subUnitId: 'sheet-1',
            ruleIds: ['rule-1'],
        });
        expect(pushUndoRedo).toHaveBeenCalledWith(expect.objectContaining({
            unitID: 'unit-1',
            redoMutations: [{ id: DeleteRangeProtectionMutation.id, params: { unitId: 'unit-1', subUnitId: 'sheet-1', ruleIds: ['rule-1'] } }],
            undoMutations: [{ id: AddRangeProtectionMutation.id, params: { unitId: 'unit-1', subUnitId: 'sheet-1', rules: [overlapRule] } }],
        }));

        expect(await SetRangeProtectionFromContextMenuCommand.handler(accessorWithRangeRule, undefined as any)).toBe(true);

        const accessorNoSelection = createAccessor([
            [ICommandService, { executeCommand }],
            [IUniverInstanceService, { getCurrentUnitForType: () => workbook }],
            [IUndoRedoService, { pushUndoRedo }],
            [SheetsSelectionsService, { getCurrentLastSelection: () => null }],
            [WorksheetProtectionRuleModel, { getRule: () => null }],
            [RangeProtectionRuleModel, { getSubunitRuleList: () => [] }],
        ]);

        expect(await DeleteRangeProtectionFromContextMenuCommand.handler(accessorNoSelection, undefined as any)).toBe(false);
        expect(await SetRangeProtectionFromContextMenuCommand.handler(accessorNoSelection, undefined as any)).toBe(false);
    });

    it('handles show-menu-list command', async () => {
        const triggerSheetBarMenu = vi.fn();
        const accessor = createAccessor([[ISheetBarService, { triggerSheetBarMenu }]]);
        expect(await ShowMenuListCommand.handler(accessor)).toBe(true);
        expect(triggerSheetBarMenu).toHaveBeenCalledTimes(1);
    });
});

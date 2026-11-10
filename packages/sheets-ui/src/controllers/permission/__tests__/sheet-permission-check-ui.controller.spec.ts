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

import type { ICommandInfo, IWorkbookData, Workbook } from '@univerjs/core';
import {
    createInternalEditorID,
    Direction,
    DOCS_FORMULA_BAR_EDITOR_UNIT_ID_KEY,
    DOCS_NORMAL_EDITOR_UNIT_ID_KEY,
    DocumentDataModel,
    ICommandService,
    IContextService,
    Injector,
    IPermissionService,
    IUniverInstanceService,
    LocaleService,
    LocaleType,
    Univer,
    UniverInstanceType,
} from '@univerjs/core';
import { DocSelectionManagerService, DocStateChangeManagerService, DocStateEmitService, InsertTextCommand } from '@univerjs/docs';
import { EditorService, IEditorService, IMEInputCommand } from '@univerjs/docs-ui';
import { CanvasColorService, ICanvasColorService, IRenderManagerService, RenderManagerService, SHEET_VIEWPORT_KEY, Spreadsheet, Viewport } from '@univerjs/engine-render';
import { UnitObject } from '@univerjs/protocol';
import { EditStateEnum, RangeProtectionPermissionEditPoint, RangeProtectionRuleModel, SheetPermissionCheckController, SheetsSelectionsService, UniverSheetsPlugin, ViewStateEnum } from '@univerjs/sheets';
import { IDialogService, IPlatformService, IShortcutService, IUIRuntimeScopeService, KeyCode, PlatformService, ShortcutService, UIRuntimeScopeService } from '@univerjs/ui';
import { EMPTY } from 'rxjs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { SheetCopyCommand, SheetCutCommand, SheetPasteCommand } from '../../../commands/commands/clipboard.command';
import { MoveSelectionEnterAndTabCommand } from '../../../commands/commands/set-selection.command';
import { SetActivateCellEditOperation } from '../../../commands/operations/activate-cell-edit.operation';
import { SetCellEditVisibleOperation } from '../../../commands/operations/cell-edit.operation';
import { ScrollToRangeOperation } from '../../../commands/operations/scroll-to-range.operation';
import { SHEET_VIEW_KEY } from '../../../common/keys';
import enUS from '../../../locale/en-US';
import { EditorBridgeService, IEditorBridgeService } from '../../../services/editor-bridge.service';
import { CellEditorManagerService, ICellEditorManagerService } from '../../../services/editor/cell-editor-manager.service';
import { SheetCellEditorResizeService } from '../../../services/editor/cell-editor-resize.service';
import { ISheetSelectionRenderService } from '../../../services/selection/base-selection-render.service';
import { SheetSelectionRenderService } from '../../../services/selection/selection-render.service';
import { SheetSkeletonManagerService } from '../../../services/sheet-skeleton-manager.service';
import { ShortcutExperienceService } from '../../../services/shortcut-experience.service';
import { EditingRenderController } from '../../editor/editing.render-controller';
import { EditorBridgeRenderController } from '../../render-controllers/editor-bridge.render-controller';
import { SheetsScrollRenderController } from '../../render-controllers/scroll.render-controller';
import { SheetPermissionCheckUIController } from '../sheet-permission-check-ui.controller';

function createControllerTestBed() {
    let beforeCommandExecuted: ((commandInfo: ICommandInfo) => void) | undefined;
    const permissionCheckWithoutRange = vi.fn(() => false);
    const permissionCheckWithRanges = vi.fn(() => true);
    const blockExecuteWithoutPermission = vi.fn();
    const injector = new Injector([
        [ICommandService, { useValue: {
            beforeCommandExecuted: (listener: (commandInfo: ICommandInfo) => void) => {
                beforeCommandExecuted = listener;
                return { dispose: vi.fn() };
            },
        } }],
        [IPermissionService, { useValue: { getShowComponents: () => true } }],
        [IDialogService, { useValue: { open: vi.fn(), close: vi.fn() } }],
        [RangeProtectionRuleModel, { useValue: {} }],
        [LocaleService, { useValue: { t: (key: string) => `translated:${key}` } }],
        [IContextService, { useValue: { getContextValue: () => false } }],
        [SheetPermissionCheckController, { useValue: {
            triggerPermissionUIEvent$: EMPTY,
            permissionCheckWithoutRange,
            permissionCheckWithRanges,
            blockExecuteWithoutPermission,
        } }],
        [SheetPermissionCheckUIController],
    ]);

    return {
        injector,
        executeBefore: (commandInfo: ICommandInfo) => beforeCommandExecuted?.(commandInfo),
        permissionCheckWithoutRange,
        permissionCheckWithRanges,
        blockExecuteWithoutPermission,
    };
}

describe('SheetPermissionCheckUIController', () => {
    it.each([
        [InsertTextCommand.id, 'document editor', 'host-doc'],
        [IMEInputCommand.id, 'document editor', 'host-doc'],
        [InsertTextCommand.id, 'shape text editor', createInternalEditorID('SHAPE_TEXT')],
        [IMEInputCommand.id, 'shape text editor', createInternalEditorID('SHAPE_TEXT')],
        [InsertTextCommand.id, 'slide text editor', createInternalEditorID('SLIDE_SHAPE_TEXT')],
    ])('does not apply sheet permissions to %s input from a %s', (id, _, unitId) => {
        const { injector, executeBefore, permissionCheckWithoutRange, blockExecuteWithoutPermission } = createControllerTestBed();
        injector.get(SheetPermissionCheckUIController);

        executeBefore({
            id,
            params: { unitId },
        });

        expect(permissionCheckWithoutRange).not.toHaveBeenCalled();
        expect(blockExecuteWithoutPermission).not.toHaveBeenCalled();
        injector.dispose();
    });

    it('checks the workbook identified by a cell editor visibility operation', () => {
        const { injector, executeBefore, permissionCheckWithoutRange } = createControllerTestBed();
        injector.get(SheetPermissionCheckUIController);

        executeBefore({
            id: SetCellEditVisibleOperation.id,
            params: { visible: true, unitId: 'embedded-sheet' },
        });

        expect(permissionCheckWithoutRange).toHaveBeenCalledWith(expect.any(Object), 'embedded-sheet');
        injector.dispose();
    });

    it.each([
        DOCS_NORMAL_EDITOR_UNIT_ID_KEY,
        DOCS_FORMULA_BAR_EDITOR_UNIT_ID_KEY,
    ])('checks the current workbook when visibility is requested by internal sheet editor %s', (unitId) => {
        const { injector, executeBefore, permissionCheckWithoutRange } = createControllerTestBed();
        injector.get(SheetPermissionCheckUIController);

        executeBefore({
            id: SetCellEditVisibleOperation.id,
            params: { visible: true, unitId },
        });

        expect(permissionCheckWithoutRange).toHaveBeenCalledWith(expect.any(Object), undefined);
        injector.dispose();
    });

    it.each([
        [InsertTextCommand.id, DOCS_NORMAL_EDITOR_UNIT_ID_KEY],
        [IMEInputCommand.id, DOCS_NORMAL_EDITOR_UNIT_ID_KEY],
        [InsertTextCommand.id, DOCS_FORMULA_BAR_EDITOR_UNIT_ID_KEY],
    ])('keeps applying sheet permissions to %s from %s', (id, unitId) => {
        const { injector, executeBefore, permissionCheckWithoutRange, blockExecuteWithoutPermission } = createControllerTestBed();
        injector.get(SheetPermissionCheckUIController);

        executeBefore({
            id,
            params: { unitId },
        });

        expect(permissionCheckWithoutRange).toHaveBeenCalledOnce();
        expect(blockExecuteWithoutPermission).toHaveBeenCalledWith('translated:sheets-ui.permission.dialog.editErr');
        injector.dispose();
    });

    it.each([
        [SheetCopyCommand.id, 'copy'],
        [SheetCutCommand.id, 'cut'],
        [SheetPasteCommand.id, 'paste'],
    ])('does not preflight the global %s command before its multi-command implementation is selected', (id) => {
        const { injector, executeBefore, permissionCheckWithRanges, blockExecuteWithoutPermission } = createControllerTestBed();
        injector.get(SheetPermissionCheckUIController);

        executeBefore({ id });

        expect(permissionCheckWithRanges).not.toHaveBeenCalled();
        expect(blockExecuteWithoutPermission).not.toHaveBeenCalled();
        injector.dispose();
    });
});

describe('editing after navigating multiple ranges', () => {
    let univer: Univer;

    beforeEach(() => {
        // Happy DOM has no canvas backend; selection, editing, and permission logic remain real.
        vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(function (this: HTMLCanvasElement) {
            return {
                canvas: this,
                setTransform: vi.fn(),
                clearRect: vi.fn(),
                measureText: (text: string) => ({ width: text.length * 7, fontBoundingBoxAscent: 10, fontBoundingBoxDescent: 4, actualBoundingBoxAscent: 10, actualBoundingBoxDescent: 4 }),
            } as unknown as CanvasRenderingContext2D;
        });
        univer = new Univer({ locale: LocaleType.EN_US, locales: { [LocaleType.EN_US]: enUS } });
        univer.registerPlugin(UniverSheetsPlugin);
    });

    afterEach(() => {
        univer.dispose();
        vi.restoreAllMocks();
    });

    it.each([
        { name: 'Tab', keycode: KeyCode.TAB, direction: Direction.RIGHT, reverse: false },
        { name: 'Enter', keycode: KeyCode.ENTER, direction: Direction.DOWN, reverse: false },
        { name: 'Shift+Tab', keycode: KeyCode.TAB, direction: Direction.LEFT, reverse: true },
        { name: 'Shift+Enter', keycode: KeyCode.ENTER, direction: Direction.UP, reverse: true },
    ])('writes to the new active cell after $name and still blocks protected targets', async ({ keycode, direction, reverse }) => {
        const injector = univer.__getInjector();
        const open = vi.fn();
        injector.add([IDialogService, { useValue: { open, close: vi.fn(), closeAll: vi.fn(), getDialogs$: () => EMPTY } }]);
        injector.add([ICanvasColorService, { useClass: CanvasColorService }]);
        injector.add([IRenderManagerService, { useClass: RenderManagerService }]);
        injector.add([DocSelectionManagerService]);
        injector.add([DocStateEmitService]);
        injector.add([DocStateChangeManagerService]);
        injector.add([IEditorService, { useClass: EditorService }]);
        injector.add([IEditorBridgeService, { useClass: EditorBridgeService }]);
        injector.add([ICellEditorManagerService, { useClass: CellEditorManagerService }]);
        injector.add([SheetCellEditorResizeService, { useValue: { resizeCellEditor: vi.fn() } as unknown as SheetCellEditorResizeService }]);
        injector.add([ShortcutExperienceService]);
        injector.add([IPlatformService, { useClass: PlatformService }]);
        injector.add([IShortcutService, { useClass: ShortcutService }]);
        injector.add([IUIRuntimeScopeService, { useClass: UIRuntimeScopeService }]);
        injector.add([SheetPermissionCheckUIController]);
        injector.add([EditingRenderController]);
        const workbook = univer.createUnit<IWorkbookData, Workbook>(UniverInstanceType.UNIVER_SHEET, {
            id: 'multi-edit',
            sheetOrder: ['sheet1'],
            sheets: { sheet1: { id: 'sheet1', rowCount: 20, columnCount: 20, cellData: {} } },
        });
        const worksheet = workbook.getActiveSheet();
        const renderManager = injector.get(IRenderManagerService);
        renderManager.registerRenderModule(UniverInstanceType.UNIVER_SHEET, [SheetSkeletonManagerService]);
        const render = renderManager.createRender(workbook.getUnitId());
        render.mainComponent = new Spreadsheet(SHEET_VIEW_KEY.MAIN);
        injector.createInstance(Viewport, SHEET_VIEWPORT_KEY.VIEW_MAIN, render.scene, { left: 0, top: 0, right: 0, bottom: 0 });
        render.with(SheetSkeletonManagerService).setCurrent({ sheetId: 'sheet1' });
        const commands = injector.get(ICommandService);
        [MoveSelectionEnterAndTabCommand, SetActivateCellEditOperation, SetCellEditVisibleOperation, ScrollToRangeOperation].forEach((command) => commands.registerCommand(command));
        renderManager.registerRenderModule(UniverInstanceType.UNIVER_SHEET, [SheetSelectionRenderService]);
        render.getInjector!().add([ISheetSelectionRenderService, { useValue: render.with(SheetSelectionRenderService) }]);
        renderManager.registerRenderModule(UniverInstanceType.UNIVER_SHEET, [EditorBridgeRenderController]);
        render.with(EditorBridgeRenderController);
        render.getInjector!().add([SheetsScrollRenderController, { useValue: { scrollToRange: vi.fn(() => true) } as unknown as SheetsScrollRenderController }]);
        injector.get(SheetPermissionCheckUIController);
        const editing = injector.get(EditingRenderController);
        const bridge = injector.get(IEditorBridgeService);
        const selections = injector.get(SheetsSelectionsService);
        const oldRow = reverse ? 3 : 4;
        const targetRow = reverse ? 1 : 0;
        worksheet.getCellMatrix().setValue(oldRow, oldRow, { v: 'old active cell' });
        worksheet.getCellMatrix().setValue(targetRow, targetRow, { v: 'new active cell' });
        selections.setSelections('multi-edit', 'sheet1', [
            { range: { startRow: 0, endRow: 1, startColumn: 0, endColumn: 1 }, primary: null, style: null },
            { range: { startRow: 3, endRow: 4, startColumn: 3, endColumn: 4 }, primary: worksheet.getCellInfoInMergeData(oldRow, oldRow), style: null },
        ]);
        injector.get(IUniverInstanceService).focusUnit('multi-edit');
        expect(await commands.executeCommand(MoveSelectionEnterAndTabCommand.id, { keycode, direction })).toBe(true);
        expect(bridge.getEditLocation()).toMatchObject({ row: targetRow, column: targetRow });
        expect(commands.syncExecuteCommand(SetCellEditVisibleOperation.id, { visible: true, unitId: 'multi-edit' })).toBe(true);
        bridge.changeEditorDirty(true);
        const input = injector.createInstance(DocumentDataModel, { id: 'input', body: { dataStream: 'typed value\r\n' }, documentStyle: {} });
        await editing.submitCellData(input);
        expect(worksheet.getCellRaw(targetRow, targetRow)?.v).toBe('typed value');
        expect(worksheet.getCellRaw(oldRow, oldRow)?.v).toBe('old active cell');
        expect(open).not.toHaveBeenCalled();

        const permissions = injector.get(IPermissionService);
        const editPoint = new RangeProtectionPermissionEditPoint('multi-edit', 'sheet1', 'protected-active');
        editPoint.value = false;
        permissions.addPermissionPoint(editPoint);
        const rules = injector.get(RangeProtectionRuleModel);
        const rule = {
            id: 'protected-active',
            permissionId: 'protected-active',
            unitId: 'multi-edit',
            subUnitId: 'sheet1',
            unitType: UnitObject.SelectRange,
            editState: EditStateEnum.OnlyMe,
            viewState: ViewStateEnum.OthersCanView,
            ranges: [{ startRow: 3, endRow: 4, startColumn: 3, endColumn: 4 }],
        };
        rules.addRule('multi-edit', 'sheet1', rule);
        expect(commands.syncExecuteCommand(SetCellEditVisibleOperation.id, { visible: true, unitId: 'multi-edit' })).toBe(true);
        bridge.changeEditorDirty(true);
        await editing.submitCellData(injector.createInstance(DocumentDataModel, { id: 'allowed-input', body: { dataStream: 'allowed value\r\n' }, documentStyle: {} }));
        expect(worksheet.getCellRaw(targetRow, targetRow)?.v).toBe('allowed value');
        expect(worksheet.getCellRaw(oldRow, oldRow)?.v).toBe('old active cell');
        expect(open).not.toHaveBeenCalled();

        rules.setRule('multi-edit', 'sheet1', rule.id, { ...rule, ranges: [{ startRow: 0, endRow: 1, startColumn: 0, endColumn: 1 }] });
        expect(commands.syncExecuteCommand(SetCellEditVisibleOperation.id, { visible: true, unitId: 'multi-edit' })).toBe(false);
        await editing.submitCellData(injector.createInstance(DocumentDataModel, { id: 'blocked-input', body: { dataStream: 'blocked value\r\n' }, documentStyle: {} }));
        expect(worksheet.getCellRaw(targetRow, targetRow)?.v).toBe('allowed value');
        expect(worksheet.getCellRaw(oldRow, oldRow)?.v).toBe('old active cell');
        expect(open).toHaveBeenCalled();
    });
});

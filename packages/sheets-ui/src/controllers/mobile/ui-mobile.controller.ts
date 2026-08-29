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

import type { DocumentDataModel, ICommand, Workbook } from '@univerjs/core';
import {
    CommandType,
    Direction,
    Disposable,
    DOCS_FORMULA_BAR_EDITOR_UNIT_ID_KEY,
    ICommandService,
    IConfigService,
    IContextService,
    Inject,
    Injector,
    IUniverInstanceService,
    toDisposable,
    UniverInstanceType,
} from '@univerjs/core';
import { DeleteLeftCommand, DeleteRightCommand, DocSelectionRenderService, EnterCommand, IEditorService } from '@univerjs/docs-ui';
import { DeviceInputEventType, getCurrentTypeOfRenderer, IRenderManagerService } from '@univerjs/engine-render';
import {
    SetBoldCommand,
    SetFontFamilyCommand,
    SetFontSizeCommand,
    SetItalicCommand,
    SetStrikeThroughCommand,
    SetUnderlineCommand,
    SheetsSelectionsService,
} from '@univerjs/sheets';
import {
    BuiltInUIPart,
    connectInjector,
    ILayoutService,
    IMenuManagerService,
    IShortcutService,
    IUIPartsService,
    KeyCode,
} from '@univerjs/ui';
import { DeleteRangeMoveLeftConfirmCommand } from '../../commands/commands/delete-range-move-left-confirm.command';
import { DeleteRangeMoveUpConfirmCommand } from '../../commands/commands/delete-range-move-up-confirm.command';
import { SetColumnHeaderHeightCommand, SetRowHeaderWidthCommand } from '../../commands/commands/headersize-changed.command';
import { HideColConfirmCommand, HideRowConfirmCommand } from '../../commands/commands/hide-row-col-confirm.command';
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
} from '../../commands/commands/inline-format.command';
import { InsertRangeMoveDownConfirmCommand } from '../../commands/commands/insert-range-move-down-confirm.command';
import { InsertRangeMoveRightConfirmCommand } from '../../commands/commands/insert-range-move-right-confirm.command';
import { AddRangeProtectionFromContextMenuCommand, AddRangeProtectionFromSheetBarCommand, AddRangeProtectionFromToolbarCommand, DeleteRangeProtectionFromContextMenuCommand, SetRangeProtectionFromContextMenuCommand, ViewSheetPermissionFromContextMenuCommand, ViewSheetPermissionFromSheetBarCommand } from '../../commands/commands/range-protection.command';
import { RemoveColConfirmCommand, RemoveRowConfirmCommand } from '../../commands/commands/remove-row-col-confirm.command';
import { RemoveSheetConfirmCommand } from '../../commands/commands/remove-sheet-confirm.command';
import {
    ApplyFormatPainterCommand,
    SetInfiniteFormatPainterCommand,
    SetOnceFormatPainterCommand,
} from '../../commands/commands/set-format-painter.command';
import {
    SetColumnFrozenCommand,
    SetFirstColumnFrozenCommand,
    SetFirstRowFrozenCommand,
    SetRowFrozenCommand,
    SetSelectionFrozenCommand,
} from '../../commands/commands/set-frozen.command';
import { ScrollCommand, ScrollToCellCommand, SetScrollRelativeCommand } from '../../commands/commands/set-scroll.command';
import {
    ExpandSelectionCommand,
    MoveSelectionCommand,
    MoveSelectionEnterAndTabCommand,
    SelectAllCommand,
} from '../../commands/commands/set-selection.command';
import { SetWorksheetColAutoWidthCommand } from '../../commands/commands/set-worksheet-auto-col-width.command';
import { ChangeZoomRatioCommand, SetZoomRatioCommand } from '../../commands/commands/set-zoom-ratio.command';
import { ShowMenuListCommand } from '../../commands/commands/unhide.command';
import { ChangeSheetProtectionFromSheetBarCommand, DeleteWorksheetProtectionFormSheetBarCommand } from '../../commands/commands/worksheet-protection.command';
import { SetActivateCellEditOperation } from '../../commands/operations/activate-cell-edit.operation';
import {
    SetCellEditVisibleArrowOperation,
    SetCellEditVisibleOperation,
    SetCellEditVisibleWithF2Operation,
} from '../../commands/operations/cell-edit.operation';
import { RenameSheetOperation } from '../../commands/operations/rename-sheet.operation';
import { ScrollToRangeOperation } from '../../commands/operations/scroll-to-range.operation';
import { SetScrollOperation } from '../../commands/operations/scroll.operation';
import { SetFormatPainterOperation } from '../../commands/operations/set-format-painter.operation';
import { SetZoomRatioOperation } from '../../commands/operations/set-zoom-ratio.operation';
import { SheetPermissionOpenDialogOperation } from '../../commands/operations/sheet-permission-open-dialog.operation';
import { SheetPermissionOpenPanelOperation } from '../../commands/operations/sheet-permission-open-panel.operation';
import { SidebarDefinedNameOperation } from '../../commands/operations/sidebar-defined-name.operation';
import {
    MOBILE_FORMULA_BAR_SUBMIT_COMMAND_ID,
    MOBILE_FX_EDITOR_EXPANDED,
    MOBILE_KEYBOARD_VISIBLE,
    MOBILE_SHEET_FX_EDITOR,
} from '../../consts/mobile-context';
import { menuSchema } from '../../menu/schema';
import { IEditorBridgeService } from '../../services/editor-bridge.service';
import { MobileSheetActionPanel } from '../../views/mobile/action-panel/MobileSheetActionPanel';
import { MobileFormulaBar } from '../../views/mobile/formula-bar/MobileFormulaBar';
import { MobileSheetBar } from '../../views/mobile/sheet-bar/MobileSheetBar';
import { RenderSheetContent } from '../../views/sheet-container/SheetContainer';
import { EditingRenderController } from '../editor/editing.render-controller';

export const MobileFormulaBarBreakLineCommand: ICommand = {
    id: 'sheet.command.mobile-formula-bar-break-line',
    type: CommandType.COMMAND,
    handler(accessor) {
        const editor = accessor.get(IEditorService).getEditor(DOCS_FORMULA_BAR_EDITOR_UNIT_ID_KEY);
        const range = editor?.getSelectionRanges().find((selection) => selection.collapsed);
        if (!range) return false;

        // Use the docs Enter pipeline so a list paragraph creates the next list item and an
        // empty list item exits the list, matching the native rich-text editor behavior.
        return accessor.get(ICommandService).executeCommand(EnterCommand.id);
    },
};

export const MobileFormulaBarSubmitCommand: ICommand = {
    id: MOBILE_FORMULA_BAR_SUBMIT_COMMAND_ID,
    type: CommandType.COMMAND,
    async handler(accessor) {
        const instanceService = accessor.get(IUniverInstanceService);
        const workbook = instanceService.getCurrentUnitOfType<Workbook>(UniverInstanceType.UNIVER_SHEET);
        const formulaModel = instanceService.getUnit<DocumentDataModel>(
            DOCS_FORMULA_BAR_EDITOR_UNIT_ID_KEY,
            UniverInstanceType.UNIVER_DOC
        );
        if (!workbook || !formulaModel) return false;

        const render = accessor.get(IRenderManagerService).getRenderUnitById(workbook.getUnitId());
        const editingController = accessor.get(EditingRenderController);
        const editorBridgeService = accessor.get(IEditorBridgeService);
        if (
            !render
            || !editingController
            || (editorBridgeService.getEditorDirty() && await editingController.submitCellData(formulaModel) === false)
        ) {
            return false;
        }

        const commandService = accessor.get(ICommandService);
        editorBridgeService.enableForceKeepVisible();
        try {
            const moved = await commandService.executeCommand(MoveSelectionEnterAndTabCommand.id, {
                keycode: KeyCode.ENTER,
                direction: Direction.DOWN,
                fromCurrentSelection: true,
            });
            if (!moved) return false;
        } finally {
            editorBridgeService.disableForceKeepVisible();
        }

        const primary = accessor.get(SheetsSelectionsService).getCurrentLastSelection()?.primary;
        const sheetId = workbook.getActiveSheet()?.getSheetId();
        if (!primary || !sheetId) return false;

        commandService.syncExecuteCommand(SetActivateCellEditOperation.id, {
            scene: render.scene,
            engine: render.engine,
            primary,
            unitId: workbook.getUnitId(),
            sheetId,
        });
        editorBridgeService.refreshEditCellState();
        editorBridgeService.changeEditorDirty(false);

        const endOffset = Math.max(0, (formulaModel.getBody()?.dataStream.length ?? 2) - 2);
        accessor.get(IEditorService).getEditor(DOCS_FORMULA_BAR_EDITOR_UNIT_ID_KEY)?.setSelectionRanges([{
            startOffset: endOffset,
            endOffset,
        }], false);
        return true;
    },
};

export class SheetUIMobileController extends Disposable {
    constructor(
        @Inject(Injector) protected readonly _injector: Injector,
        @ILayoutService protected readonly _layoutService: ILayoutService,
        @ICommandService protected readonly _commandService: ICommandService,
        @IMenuManagerService protected readonly _menuManagerService: IMenuManagerService,
        @IUIPartsService protected readonly _uiPartsService: IUIPartsService,
        @IShortcutService protected readonly _shortcutService: IShortcutService,
        @IConfigService protected readonly _configService: IConfigService,
        @IEditorBridgeService protected readonly _editorBridgeService: IEditorBridgeService,
        @IContextService protected readonly _contextService: IContextService,
        @IRenderManagerService protected readonly _renderManagerService: IRenderManagerService,
        @IUniverInstanceService protected readonly _univerInstanceService: IUniverInstanceService
    ) {
        super();

        this._contextService.setContextValue(MOBILE_SHEET_FX_EDITOR, true);
        this._init();
    }

    private _init(): void {
        this._initCommands();
        this._initMenus();
        this._initWorkbenchParts();
        this._initFocusHandler();
        this._initKeyboardViewportState();
        this._initMobileFxShortcut();
    }

    private _initCommands(): void {
        [
            ChangeZoomRatioCommand,
            MobileFormulaBarBreakLineCommand,
            MobileFormulaBarSubmitCommand,
            ExpandSelectionCommand,
            MoveSelectionCommand,
            MoveSelectionEnterAndTabCommand,
            RenameSheetOperation,
            RemoveSheetConfirmCommand,
            RemoveRowConfirmCommand,
            RemoveColConfirmCommand,
            HideRowConfirmCommand,
            HideColConfirmCommand,
            ScrollCommand,
            ScrollToCellCommand,
            SelectAllCommand,
            SetActivateCellEditOperation,
            SetBoldCommand,
            SetCellEditVisibleArrowOperation,
            SetCellEditVisibleOperation,
            SetCellEditVisibleWithF2Operation,
            SetRangeBoldCommand,
            SetRangeItalicCommand,
            SetRangeUnderlineCommand,
            SetRangeStrickThroughCommand,
            SetRangeSubscriptCommand,
            SetRangeSuperscriptCommand,
            SetRangeFontIncreaseCommand,
            SetRangeFontDecreaseCommand,
            SetRangeFontSizeCommand,
            SetRangeFontFamilyCommand,
            SetRangeTextColorCommand,
            ResetRangeTextColorCommand,
            SetItalicCommand,
            SetStrikeThroughCommand,
            SetFontFamilyCommand,
            SetFontSizeCommand,
            SetFormatPainterOperation,
            SetInfiniteFormatPainterCommand,
            SetOnceFormatPainterCommand,
            ApplyFormatPainterCommand,
            SetScrollOperation,
            SetScrollRelativeCommand,
            SetSelectionFrozenCommand,
            SetRowFrozenCommand,
            SetColumnFrozenCommand,
            SetFirstRowFrozenCommand,
            SetFirstColumnFrozenCommand,
            ScrollToRangeOperation,
            SetUnderlineCommand,
            SetZoomRatioCommand,
            SetZoomRatioOperation,
            ShowMenuListCommand,
            InsertRangeMoveDownConfirmCommand,
            DeleteRangeMoveUpConfirmCommand,
            InsertRangeMoveRightConfirmCommand,
            DeleteRangeMoveLeftConfirmCommand,
            SidebarDefinedNameOperation,

            // permission
            SheetPermissionOpenPanelOperation,
            SheetPermissionOpenDialogOperation,
            AddRangeProtectionFromToolbarCommand,
            AddRangeProtectionFromContextMenuCommand,
            ViewSheetPermissionFromContextMenuCommand,
            AddRangeProtectionFromSheetBarCommand,
            ViewSheetPermissionFromSheetBarCommand,
            ChangeSheetProtectionFromSheetBarCommand,
            DeleteRangeProtectionFromContextMenuCommand,
            SetRangeProtectionFromContextMenuCommand,
            DeleteWorksheetProtectionFormSheetBarCommand,
            SetWorksheetColAutoWidthCommand,
            SetRowHeaderWidthCommand,
            SetColumnHeaderHeightCommand,
        ].forEach((c) => {
            this.disposeWithMe(this._commandService.registerCommand(c));
        });
    }

    private _initMenus(): void {
        this._menuManagerService.mergeMenu(menuSchema);
    }

    private _initWorkbenchParts(): void {
        const uiController = this._uiPartsService;
        const injector = this._injector;

        this.disposeWithMe(uiController.registerComponent(BuiltInUIPart.HEADER, () => connectInjector(MobileSheetBar, injector)));
        this.disposeWithMe(uiController.registerComponent(BuiltInUIPart.CONTENT, () => connectInjector(RenderSheetContent, injector)));
        this.disposeWithMe(uiController.registerComponent(BuiltInUIPart.FOOTER, () => connectInjector(MobileFormulaBar, injector)));
        this.disposeWithMe(uiController.registerComponent(BuiltInUIPart.FOOTER, () => connectInjector(MobileSheetActionPanel, injector)));
    }

    private _initFocusHandler(): void {
        this.disposeWithMe(
            this._layoutService.registerFocusHandler(UniverInstanceType.UNIVER_SHEET, (_unitId: string) => {
                if (this._editorBridgeService.isVisible().visible) this._focusCellEditorInput();
            })
        );
        this.disposeWithMe(this._editorBridgeService.visible$.subscribe(({ visible }) => {
            if (visible) this._focusCellEditorInput();
        }));
    }

    private _focusCellEditorInput(): void {
        const currentEditorRender = getCurrentTypeOfRenderer(
            UniverInstanceType.UNIVER_DOC,
            this._univerInstanceService,
            this._renderManagerService
        );
        const docSelectionRenderService = currentEditorRender?.with(DocSelectionRenderService);

        docSelectionRenderService?.focus();
    }

    private _initKeyboardViewportState(): void {
        const visualViewport = window.visualViewport;
        let stableHeight = Math.round(window.innerHeight);
        let stableWidth = Math.round(window.innerWidth);
        let keyboardWasVisible = false;

        const update = () => {
            const width = Math.round(window.innerWidth);
            const visibleBottom = visualViewport
                ? visualViewport.offsetTop + visualViewport.height
                : window.innerHeight;

            if (width !== stableWidth) {
                stableHeight = Math.round(Math.max(window.innerHeight, visibleBottom));
                stableWidth = width;
            } else if (!isMobileKeyboardVisible(stableHeight, visibleBottom)) {
                stableHeight = Math.round(Math.max(stableHeight, window.innerHeight, visibleBottom));
            }

            const keyboardVisible = isMobileKeyboardVisible(stableHeight, visibleBottom);
            this._contextService.setContextValue(MOBILE_KEYBOARD_VISIBLE, keyboardVisible);

            if (
                keyboardWasVisible &&
                !keyboardVisible &&
                !this._contextService.getContextValue(MOBILE_FX_EDITOR_EXPANDED)
            ) {
                const visibleState = this._editorBridgeService.isVisible();
                if (visibleState.visible) {
                    this._commandService.executeCommand(SetCellEditVisibleOperation.id, {
                        ...visibleState,
                        visible: false,
                        eventType: DeviceInputEventType.PointerDown,
                    });
                }
            }

            keyboardWasVisible = keyboardVisible;
        };

        update();
        window.addEventListener('resize', update);
        visualViewport?.addEventListener('resize', update);
        visualViewport?.addEventListener('scroll', update);
        this.disposeWithMe(toDisposable(() => {
            window.removeEventListener('resize', update);
            visualViewport?.removeEventListener('resize', update);
            visualViewport?.removeEventListener('scroll', update);
            this._contextService.setContextValue(MOBILE_KEYBOARD_VISIBLE, false);
        }));
    }

    private _initMobileFxShortcut(): void {
        const isFormulaEditorEvent = (event: KeyboardEvent) =>
            event.target instanceof HTMLElement &&
            event.target.id === `__editor_${DOCS_FORMULA_BAR_EDITOR_UNIT_ID_KEY}`;
        const shortcuts = [
            {
                id: MobileFormulaBarSubmitCommand.id,
                binding: KeyCode.ENTER,
                preconditions: (contextService: IContextService) =>
                    !contextService.getContextValue(MOBILE_FX_EDITOR_EXPANDED),
            },
            {
                id: MobileFormulaBarBreakLineCommand.id,
                binding: KeyCode.ENTER,
                preconditions: (contextService: IContextService) =>
                    Boolean(contextService.getContextValue(MOBILE_FX_EDITOR_EXPANDED)),
            },
            { id: DeleteLeftCommand.id, binding: KeyCode.BACKSPACE },
            { id: DeleteRightCommand.id, binding: KeyCode.DELETE },
        ];

        shortcuts.forEach((shortcut) => this.disposeWithMe(this._shortcutService.registerShortcut({
            ...shortcut,
            priority: 1000,
            eventPreconditions: isFormulaEditorEvent,
        })));
    }
}

export function isMobileKeyboardVisible(stableHeight: number, visibleBottom: number): boolean {
    return stableHeight - visibleBottom > 80;
}

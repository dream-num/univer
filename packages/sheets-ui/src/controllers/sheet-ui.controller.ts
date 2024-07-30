/**
 * Copyright 2023-present DreamNum Inc.
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

import { connectInjector, Disposable, ICommandService, Inject, Injector, LifecycleStages, OnLifecycle, UniverInstanceType } from '@univerjs/core';
import type { DependencyOverride } from '@univerjs/core';

import {
    SetBoldCommand,
    SetFontFamilyCommand,
    SetFontSizeCommand,
    SetItalicCommand,
    SetStrikeThroughCommand,
    SetUnderlineCommand,
} from '@univerjs/sheets';
import type { IMenuItemFactory, MenuConfig } from '@univerjs/ui';
import { BuiltInUIPart, ComponentManager, ILayoutService, IMenuService, IShortcutService, IUIPartsService } from '@univerjs/ui';

import { ITextSelectionRenderManager } from '@univerjs/engine-render';
import {
    AddWorksheetMergeAllCommand,
    AddWorksheetMergeCommand,
    AddWorksheetMergeHorizontalCommand,
    AddWorksheetMergeVerticalCommand,
} from '../commands/commands/add-worksheet-merge.command';
import { DeleteRangeMoveLeftConfirmCommand } from '../commands/commands/delete-range-move-left-confirm.command';
import { DeleteRangeMoveUpConfirmCommand } from '../commands/commands/delete-range-move-up-confirm.command';
import { HideColConfirmCommand, HideRowConfirmCommand } from '../commands/commands/hide-row-col-confirm.command';
import {
    SetRangeBoldCommand,
    SetRangeFontFamilyCommand,
    SetRangeFontSizeCommand,
    SetRangeItalicCommand,
    SetRangeStrickThroughCommand,
    SetRangeSubscriptCommand,
    SetRangeSuperscriptCommand,
    SetRangeTextColorCommand,
    SetRangeUnderlineCommand,
} from '../commands/commands/inline-format.command';
import { InsertRangeMoveDownConfirmCommand } from '../commands/commands/insert-range-move-down-confirm.command';
import { InsertRangeMoveRightConfirmCommand } from '../commands/commands/insert-range-move-right-confirm.command';
import { RefillCommand } from '../commands/commands/refill.command';
import { RemoveColConfirmCommand, RemoveRowConfirmCommand } from '../commands/commands/remove-row-col-confirm.command';
import { RemoveSheetConfirmCommand } from '../commands/commands/remove-sheet-confirm.command';
import {
    ApplyFormatPainterCommand,
    SetInfiniteFormatPainterCommand,
    SetOnceFormatPainterCommand,
} from '../commands/commands/set-format-painter.command';
import {
    CancelFrozenCommand,
    SetColumnFrozenCommand,
    SetRowFrozenCommand,
    SetSelectionFrozenCommand,
} from '../commands/commands/set-frozen.command';
import { ScrollCommand, ScrollToCellCommand, SetScrollRelativeCommand } from '../commands/commands/set-scroll.command';
import {
    ExpandSelectionCommand,
    MoveSelectionCommand,
    MoveSelectionEnterAndTabCommand,
    SelectAllCommand,
} from '../commands/commands/set-selection.command';
import { ChangeZoomRatioCommand, SetZoomRatioCommand } from '../commands/commands/set-zoom-ratio.command';
import { ShowMenuListCommand } from '../commands/commands/unhide.command';
import { SetActivateCellEditOperation } from '../commands/operations/activate-cell-edit.operation';
import {
    SetCellEditVisibleArrowOperation,
    SetCellEditVisibleOperation,
    SetCellEditVisibleWithF2Operation,
} from '../commands/operations/cell-edit.operation';
import { RenameSheetOperation } from '../commands/operations/rename-sheet.operation';
import { SetScrollOperation } from '../commands/operations/scroll.operation';
import { SetFormatPainterOperation } from '../commands/operations/set-format-painter.operation';
import { SetZoomRatioOperation } from '../commands/operations/set-zoom-ratio.operation';
import { BorderPanel } from '../components/border-panel/BorderPanel';
import { BORDER_PANEL_COMPONENT } from '../components/border-panel/interface';
import { COLOR_PICKER_COMPONENT, ColorPicker } from '../components/color-picker';
import {
    FONT_FAMILY_COMPONENT,
    FONT_FAMILY_ITEM_COMPONENT,
    FontFamily,
    FontFamilyItem,
} from '../components/font-family';
import { FONT_SIZE_COMPONENT, FontSize } from '../components/font-size';
import { MENU_ITEM_INPUT_COMPONENT, MenuItemInput } from '../components/menu-item-input';
import { RenderSheetContent, RenderSheetFooter, RenderSheetHeader } from '../views/sheet-container/SheetContainer';
import { DEFINED_NAME_CONTAINER } from '../views/defined-name/component-name';
import { DefinedNameContainer } from '../views/defined-name/DefinedNameContainer';
import { SidebarDefinedNameOperation } from '../commands/operations/sidebar-defined-name.operation';
import { AutoClearContentCommand, AutoFillCommand } from '../commands/commands/auto-fill.command';

import { SheetPermissionOpenPanelOperation } from '../commands/operations/sheet-permission-open-panel.operation';
import { SheetPermissionOpenDialogOperation } from '../commands/operations/sheet-permission-open-dialog.operation';
import { AddRangeProtectionFromContextMenuCommand, AddRangeProtectionFromSheetBarCommand, AddRangeProtectionFromToolbarCommand, DeleteRangeProtectionFromContextMenuCommand, SetProtectionCommand, SetRangeProtectionFromContextMenuCommand, ViewSheetPermissionFromContextMenuCommand, ViewSheetPermissionFromSheetBarCommand } from '../commands/commands/range-protection.command';
import { AddWorksheetProtectionCommand, ChangeSheetProtectionFromSheetBarCommand, DeleteWorksheetProtectionCommand, DeleteWorksheetProtectionFormSheetBarCommand, SetWorksheetProtectionCommand } from '../commands/commands/worksheet-protection.command';
import { ScrollToRangeOperation } from '../commands/operations/scroll-to-range.operation';
import {
    ClearSelectionAllMenuItemFactory,
    ClearSelectionContentMenuItemFactory,
    ClearSelectionFormatMenuItemFactory,
    ClearSelectionMenuItemFactory,
} from './menu/clear.menu';
import {
    DeleteRangeMenuItemFactory,
    DeleteRangeMoveLeftMenuItemFactory,
    DeleteRangeMoveUpMenuItemFactory,
    RemoveColMenuItemFactory,
    RemoveRowMenuItemFactory,
} from './menu/delete.menu';
import {
    CellInsertMenuItemFactory,
    ColInsertMenuItemFactory,
    InsertColAfterMenuItemFactory,
    InsertColBeforeMenuItemFactory,
    InsertRangeMoveDownMenuItemFactory,
    InsertRangeMoveRightMenuItemFactory,
    InsertRowAfterMenuItemFactory,
    InsertRowBeforeMenuItemFactory,
    RowInsertMenuItemFactory,
} from './menu/insert.menu';
import {
    BackgroundColorSelectorMenuItemFactory,
    BoldMenuItemFactory,
    CancelFrozenMenuItemFactory,
    CopyMenuItemFactory,
    FitContentMenuItemFactory,
    FontFamilySelectorMenuItemFactory,
    FontSizeSelectorMenuItemFactory,
    FormatPainterMenuItemFactory,
    FrozenColMenuItemFactory,
    FrozenMenuItemFactory,
    FrozenRowMenuItemFactory,
    HideColMenuItemFactory,
    HideRowMenuItemFactory,
    HorizontalAlignMenuItemFactory,
    ItalicMenuItemFactory,
    PasteBesidesBorderMenuItemFactory,
    PasteColWidthMenuItemFactory,
    PasteFormatMenuItemFactory,
    PasteMenuItemFactory,
    PasteSpacialMenuItemFactory,
    PasteValueMenuItemFactory,
    ResetBackgroundColorMenuItemFactory,
    ResetTextColorMenuItemFactory,
    SetColWidthMenuItemFactory,
    SetRowHeightMenuItemFactory,
    SheetFrozenHeaderMenuItemFactory,
    SheetFrozenMenuItemFactory,
    ShowColMenuItemFactory,
    ShowRowMenuItemFactory,
    StrikeThroughMenuItemFactory,
    TextColorSelectorMenuItemFactory,
    TextRotateMenuItemFactory,
    UnderlineMenuItemFactory,
    VerticalAlignMenuItemFactory,
    WrapTextMenuItemFactory,
} from './menu/menu';

import {
    ChangeColorSheetMenuItemFactory,
    CopySheetMenuItemFactory,
    DeleteSheetMenuItemFactory,
    HideSheetMenuItemFactory,
    RenameSheetMenuItemFactory,
    ShowMenuItemFactory,
} from './menu/sheet.menu';
import {
    EditorBreakLineShortcut,
    EditorCursorEnterShortcut,
    EditorCursorEscShortcut,
    EditorCursorTabShortcut,
    EditorDeleteLeftShortcut,
    EditorDeleteLeftShortcutInActive,
    generateArrowSelectionShortCutItem,
    StartEditWithF2Shortcut,
} from './shortcuts/editor.shortcut';
import { SetColHiddenShortcutItem, SetRowHiddenShortcutItem } from './shortcuts/operation.shortcut';
import {
    ExpandSelectionDownShortcutItem,
    ExpandSelectionEndDownShortcutItem,
    ExpandSelectionEndLeftShortcutItem,
    ExpandSelectionEndRightShortcutItem,
    ExpandSelectionEndUpShortcutItem,
    ExpandSelectionLeftShortcutItem,
    ExpandSelectionRightShortcutItem,
    ExpandSelectionUpShortcutItem,
    // MoveBackSelectionShortcutItem,
    MoveSelectionDownShortcutItem,
    MoveSelectionEndDownShortcutItem,
    MoveSelectionEndLeftShortcutItem,
    MoveSelectionEndRightShortcutItem,
    MoveSelectionEndUpShortcutItem,
    MoveSelectionEnterShortcutItem,
    MoveSelectionEnterUpShortcutItem,
    MoveSelectionLeftShortcutItem,
    MoveSelectionRightShortcutItem,
    MoveSelectionTabLeftShortcutItem,
    MoveSelectionTabShortcutItem,
    MoveSelectionUpShortcutItem,
    SelectAllShortcutItem,
} from './shortcuts/selection.shortcut';
import {
    SetBoldShortcutItem,
    SetItalicShortcutItem,
    SetStrikeThroughShortcutItem,
    SetUnderlineShortcutItem,
} from './shortcuts/style.shortcut';
import { ClearSelectionValueShortcutItem } from './shortcuts/value.shortcut';
import {
    PreventDefaultResetZoomShortcutItem,
    PreventDefaultZoomInShortcutItem,
    PreventDefaultZoomOutShortcutItem,
    ResetZoomShortcutItem,
    ZoomInShortcutItem,
    ZoomOutShortcutItem,
} from './shortcuts/view.shortcut';
import { CellBorderSelectorMenuItemFactory } from './menu/border.menu';
import { CellMergeAllMenuItemFactory, CellMergeCancelMenuItemFactory, CellMergeHorizontalMenuItemFactory, CellMergeMenuItemFactory, CellMergeVerticalMenuItemFactory } from './menu/merge.menu';
import { sheetPermissionAddProtectContextMenuFactory, sheetPermissionChangeSheetPermissionSheetBarMenuFactory, sheetPermissionContextMenuFactory, sheetPermissionEditProtectContextMenuFactory, sheetPermissionProtectSheetInSheetBarMenuFactory, sheetPermissionRemoveProtectContextMenuFactory, sheetPermissionRemoveProtectionSheetBarMenuFactory, sheetPermissionToolbarMenuFactory, sheetPermissionViewAllProtectRuleContextMenuFactory, sheetPermissionViewAllProtectRuleSheetBarMenuFactory } from './menu/permission.menu';

export interface IUniverSheetsUIConfig {
    menu: MenuConfig;
    override?: DependencyOverride;
}

export const DefaultSheetUiConfig = {};

@OnLifecycle(LifecycleStages.Ready, SheetUIController)
export class SheetUIController extends Disposable {
    constructor(
        private readonly _config: Partial<IUniverSheetsUIConfig>,
        @Inject(Injector) private readonly _injector: Injector,
        @Inject(ComponentManager) private readonly _componentManager: ComponentManager,
        @ILayoutService private readonly _layoutService: ILayoutService,
        @ICommandService private readonly _commandService: ICommandService,
        @IShortcutService private readonly _shortcutService: IShortcutService,
        @IMenuService private readonly _menuService: IMenuService,
        @IUIPartsService private readonly _uiPartsService: IUIPartsService
    ) {
        super();

        this._init();
    }

    private _init(): void {
        this._initCustomComponents();
        this._initCommands();
        this._initMenus();
        this._initShortcuts();
        this._initWorkbenchParts();
        this._initFocusHandler();
    }

    private _initCustomComponents(): void {
        const componentManager = this._componentManager;
        this.disposeWithMe(componentManager.register(MENU_ITEM_INPUT_COMPONENT, MenuItemInput));
        this.disposeWithMe(componentManager.register(BORDER_PANEL_COMPONENT, BorderPanel));
        this.disposeWithMe(componentManager.register(COLOR_PICKER_COMPONENT, ColorPicker));
        this.disposeWithMe(componentManager.register(FONT_FAMILY_COMPONENT, FontFamily));
        this.disposeWithMe(componentManager.register(FONT_FAMILY_ITEM_COMPONENT, FontFamilyItem));
        this.disposeWithMe(componentManager.register(FONT_SIZE_COMPONENT, FontSize));
        this.disposeWithMe(componentManager.register(DEFINED_NAME_CONTAINER, DefinedNameContainer));
    }

    // eslint-disable-next-line max-lines-per-function
    private _initCommands(): void {
        [
            AddWorksheetMergeAllCommand,
            AddWorksheetMergeCommand,
            AddWorksheetMergeHorizontalCommand,
            AddWorksheetMergeVerticalCommand,
            ChangeZoomRatioCommand,
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
            SetRangeFontSizeCommand,
            SetRangeFontFamilyCommand,
            SetRangeTextColorCommand,
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
            ScrollToRangeOperation,
            CancelFrozenCommand,
            SetUnderlineCommand,
            SetZoomRatioCommand,
            SetZoomRatioOperation,
            ShowMenuListCommand,
            RefillCommand,
            InsertRangeMoveDownConfirmCommand,
            DeleteRangeMoveUpConfirmCommand,
            InsertRangeMoveRightConfirmCommand,
            DeleteRangeMoveLeftConfirmCommand,
            SidebarDefinedNameOperation,
            AutoFillCommand,
            AutoClearContentCommand,

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
            AddWorksheetProtectionCommand,
            DeleteWorksheetProtectionCommand,
            SetWorksheetProtectionCommand,
            DeleteWorksheetProtectionFormSheetBarCommand,
            SetProtectionCommand,
        ].forEach((c) => {
            this.disposeWithMe(this._commandService.registerCommand(c));
        });
    }

    // eslint-disable-next-line max-lines-per-function
    private _initMenus(): void {
        const { menu = {} } = this._config;

        (
            [
                // context menu
                CopyMenuItemFactory,
                PasteMenuItemFactory,
                PasteSpacialMenuItemFactory,
                PasteValueMenuItemFactory,
                PasteFormatMenuItemFactory,
                PasteColWidthMenuItemFactory,
                PasteBesidesBorderMenuItemFactory,
                ClearSelectionContentMenuItemFactory,
                ClearSelectionFormatMenuItemFactory,
                ClearSelectionAllMenuItemFactory,
                ClearSelectionMenuItemFactory,
                ColInsertMenuItemFactory,
                RowInsertMenuItemFactory,
                CellInsertMenuItemFactory,
                InsertRowBeforeMenuItemFactory,
                InsertRowAfterMenuItemFactory,
                InsertColBeforeMenuItemFactory,
                InsertColAfterMenuItemFactory,
                RemoveRowMenuItemFactory,
                HideRowMenuItemFactory,
                ShowRowMenuItemFactory,
                HideColMenuItemFactory,
                ShowColMenuItemFactory,
                RemoveColMenuItemFactory,
                SetRowHeightMenuItemFactory,
                FitContentMenuItemFactory,
                SetColWidthMenuItemFactory,
                DeleteRangeMenuItemFactory,
                DeleteRangeMoveLeftMenuItemFactory,
                DeleteRangeMoveUpMenuItemFactory,
                InsertRangeMoveRightMenuItemFactory,
                InsertRangeMoveDownMenuItemFactory,
                FrozenMenuItemFactory,
                FrozenRowMenuItemFactory,
                FrozenColMenuItemFactory,
                CancelFrozenMenuItemFactory,
                SheetFrozenMenuItemFactory,
                SheetFrozenHeaderMenuItemFactory,

                // toolbar
                FormatPainterMenuItemFactory,
                BoldMenuItemFactory,
                ItalicMenuItemFactory,
                UnderlineMenuItemFactory,
                StrikeThroughMenuItemFactory,
                FontFamilySelectorMenuItemFactory,
                FontSizeSelectorMenuItemFactory,
                ResetTextColorMenuItemFactory,
                TextColorSelectorMenuItemFactory,
                ResetBackgroundColorMenuItemFactory,
                BackgroundColorSelectorMenuItemFactory,
                CellBorderSelectorMenuItemFactory,
                CellMergeMenuItemFactory,
                CellMergeAllMenuItemFactory,
                CellMergeVerticalMenuItemFactory,
                CellMergeHorizontalMenuItemFactory,
                CellMergeCancelMenuItemFactory,
                HorizontalAlignMenuItemFactory,
                VerticalAlignMenuItemFactory,
                WrapTextMenuItemFactory,
                TextRotateMenuItemFactory,

                // sheetbar
                DeleteSheetMenuItemFactory,
                CopySheetMenuItemFactory,
                RenameSheetMenuItemFactory,
                ChangeColorSheetMenuItemFactory,
                HideSheetMenuItemFactory,
                ShowMenuItemFactory,

                // sheet protection
                sheetPermissionContextMenuFactory,
                sheetPermissionAddProtectContextMenuFactory,
                sheetPermissionEditProtectContextMenuFactory,
                sheetPermissionRemoveProtectContextMenuFactory,
                sheetPermissionViewAllProtectRuleContextMenuFactory,
                sheetPermissionProtectSheetInSheetBarMenuFactory,
                sheetPermissionRemoveProtectionSheetBarMenuFactory,
                sheetPermissionChangeSheetPermissionSheetBarMenuFactory,
                sheetPermissionViewAllProtectRuleSheetBarMenuFactory,
                sheetPermissionToolbarMenuFactory,
            ] as IMenuItemFactory[]
        ).forEach((factory) => {
            this.disposeWithMe(this._menuService.addMenuItem(this._injector.invoke(factory), menu));
        });
    }

    private _initShortcuts(): void {
        [
            // selection shortcuts
            MoveSelectionDownShortcutItem,
            MoveSelectionUpShortcutItem,
            MoveSelectionLeftShortcutItem,
            MoveSelectionRightShortcutItem,
            MoveSelectionTabShortcutItem,
            MoveSelectionTabLeftShortcutItem,
            MoveSelectionEnterShortcutItem,
            MoveSelectionEnterUpShortcutItem,
            // MoveBackSelectionShortcutItem,
            MoveSelectionEndDownShortcutItem,
            MoveSelectionEndUpShortcutItem,
            MoveSelectionEndLeftShortcutItem,
            MoveSelectionEndRightShortcutItem,
            ExpandSelectionDownShortcutItem,
            ExpandSelectionUpShortcutItem,
            ExpandSelectionLeftShortcutItem,
            ExpandSelectionRightShortcutItem,
            ExpandSelectionEndDownShortcutItem,
            ExpandSelectionEndUpShortcutItem,
            ExpandSelectionEndLeftShortcutItem,
            ExpandSelectionEndRightShortcutItem,
            SelectAllShortcutItem,

            // view shortcuts
            ZoomInShortcutItem,
            ZoomOutShortcutItem,
            ResetZoomShortcutItem,
            PreventDefaultResetZoomShortcutItem,
            PreventDefaultZoomInShortcutItem,
            PreventDefaultZoomOutShortcutItem,

            // toggle cell style shortcuts
            SetBoldShortcutItem,
            SetItalicShortcutItem,
            SetUnderlineShortcutItem,
            SetStrikeThroughShortcutItem,

            // cell content editing shortcuts
            ClearSelectionValueShortcutItem,
            ...generateArrowSelectionShortCutItem(),
            EditorCursorEnterShortcut,
            StartEditWithF2Shortcut,
            EditorCursorTabShortcut,
            EditorBreakLineShortcut,
            EditorDeleteLeftShortcut,
            EditorDeleteLeftShortcutInActive,
            EditorCursorEscShortcut,

            // operation shortcuts
            SetRowHiddenShortcutItem,
            SetColHiddenShortcutItem,
        ].forEach((item) => {
            this.disposeWithMe(this._shortcutService.registerShortcut(item));
        });
    }

    private _initWorkbenchParts(): void {
        const uiController = this._uiPartsService;
        const injector = this._injector;

        this.disposeWithMe(uiController.registerComponent(BuiltInUIPart.HEADER, () => connectInjector(RenderSheetHeader, injector)));
        this.disposeWithMe(uiController.registerComponent(BuiltInUIPart.FOOTER, () => connectInjector(RenderSheetFooter, injector)));
        this.disposeWithMe(uiController.registerComponent(BuiltInUIPart.CONTENT, () => connectInjector(RenderSheetContent, injector)));
    }

    private _initFocusHandler(): void {
        this.disposeWithMe(
            this._layoutService.registerFocusHandler(UniverInstanceType.UNIVER_SHEET, (_unitId: string) => {
                // DEBT: `_unitId` is not used hence we cannot support Univer mode now
                const textSelectionManagerService = this._injector.get(ITextSelectionRenderManager);
                textSelectionManagerService.focus();
            })
        );
    }
}

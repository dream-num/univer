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
    Disposable,
    ICommandService,
    IConfigService,
    Inject,
    Injector,
    IUniverInstanceService,
    UniverInstanceType,
} from '@univerjs/core';
import { DocSelectionRenderService } from '@univerjs/docs-ui';
import { getCurrentTypeOfRenderer, IRenderManagerService } from '@univerjs/engine-render';
import {
    AddImageIcon,
    AdjustHeightDoubleIcon,
    AdjustWidthDoubleIcon,
    AlignBottomIcon,
    AlignTopIcon,
    AllBorderIcon,
    AutoHeightDoubleIcon,
    AutoWidthDoubleIcon,
    AutowrapIcon,
    BackSlashDoubleIcon,
    BoldIcon,
    BrushIcon,
    CancelFreezeIcon,
    CancelMergeIcon,
    ClearFormatDoubleIcon,
    CodeIcon,
    CopyDoubleIcon,
    CutIcon,
    DeleteCellShiftLeftDoubleIcon,
    DeleteCellShiftUpDoubleIcon,
    DeleteColumnDoubleIcon,
    DeleteRowDoubleIcon,
    DownBorderDoubleIcon,
    DownloadImageIcon,
    EyeOutlineIcon,
    FontColorDoubleIcon,
    FontSizeIncreaseIcon,
    FontSizeReduceIcon,
    FreezeColumnIcon,
    FreezeRowIcon,
    FreezeToSelectedIcon,
    HideDoubleIcon,
    HideGridlinesDoubleIcon,
    HorizontalBorderDoubleIcon,
    HorizontallyIcon,
    HorizontalMergeIcon,
    InnerBorderDoubleIcon,
    InsertCellDownDoubleIcon,
    InsertCellShiftRightDoubleIcon,
    InsertDoubleIcon,
    InsertRowAboveDoubleIcon,
    InsertRowBelowDoubleIcon,
    ItalicIcon,
    LeftBorderDoubleIcon,
    LeftDoubleDiagonalDoubleIcon,
    LeftInsertColumnDoubleIcon,
    LeftJustifyingIcon,
    LeftRotationFortyFiveDegreesIcon,
    LeftRotationNinetyDegreesIcon,
    LeftTridiagonalDoubleIcon,
    LockIcon,
    MergeAllIcon,
    NoBorderIcon,
    NoColorDoubleIcon,
    NoRotationIcon,
    OuterBorderDoubleIcon,
    OverflowIcon,
    PaintBucketDoubleIcon,
    PasteSpecialDoubleIcon,
    PipingIcon,
    ProtectIcon,
    ReduceDoubleIcon,
    RightBorderDoubleIcon,
    RightDoubleDiagonalDoubleIcon,
    RightInsertColumnDoubleIcon,
    RightJustifyingIcon,
    RightRotationFortyFiveDegreesIcon,
    RightRotationNinetyDegreesIcon,
    SlashDoubleIcon,
    StrikethroughIcon,
    SubscriptIcon,
    SuperscriptIcon,
    TruncationIcon,
    UnderlineIcon,
    UpBorderDoubleIcon,
    VerticalBorderDoubleIcon,
    VerticalCenterIcon,
    VerticalIntegrationIcon,
    VerticalTextIcon,
} from '@univerjs/icons';
import {
    SetBoldCommand,
    SetFontFamilyCommand,
    SetFontSizeCommand,
    SetItalicCommand,
    SetStrikeThroughCommand,
    SetUnderlineCommand,
} from '@univerjs/sheets';
import { BuiltInUIPart, ComponentManager, connectInjector, IconManager, ILayoutService, IMenuManagerService, IShortcutService, IUIPartsService } from '@univerjs/ui';
import { DeleteRangeMoveLeftConfirmCommand } from '../commands/commands/delete-range-move-left-confirm.command';
import { DeleteRangeMoveUpConfirmCommand } from '../commands/commands/delete-range-move-up-confirm.command';
import { SetColumnHeaderHeightCommand, SetRowHeaderWidthCommand } from '../commands/commands/headersize-changed.command';
import { HideColConfirmCommand, HideRowConfirmCommand } from '../commands/commands/hide-row-col-confirm.command';
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
} from '../commands/commands/inline-format.command';
import { InsertRangeMoveDownConfirmCommand } from '../commands/commands/insert-range-move-down-confirm.command';
import { InsertRangeMoveRightConfirmCommand } from '../commands/commands/insert-range-move-right-confirm.command';
import { AddRangeProtectionFromContextMenuCommand, AddRangeProtectionFromSheetBarCommand, AddRangeProtectionFromToolbarCommand, DeleteRangeProtectionFromContextMenuCommand, SetRangeProtectionFromContextMenuCommand, ViewSheetPermissionFromContextMenuCommand, ViewSheetPermissionFromSheetBarCommand } from '../commands/commands/range-protection.command';
import { RemoveColConfirmCommand, RemoveRowConfirmCommand } from '../commands/commands/remove-row-col-confirm.command';
import { RemoveSheetConfirmCommand } from '../commands/commands/remove-sheet-confirm.command';
import { RepeatLastActionCommand } from '../commands/commands/repeat-last-action.command';
import {
    ApplyFormatPainterCommand,
    SetInfiniteFormatPainterCommand,
    SetOnceFormatPainterCommand,
} from '../commands/commands/set-format-painter.command';
import {
    SetColumnFrozenCommand,
    SetFirstColumnFrozenCommand,
    SetFirstRowFrozenCommand,
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
import { SetWorksheetColAutoWidthCommand } from '../commands/commands/set-worksheet-auto-col-width.command';
import { ChangeZoomRatioCommand, SetZoomRatioCommand } from '../commands/commands/set-zoom-ratio.command';
import { ShowMenuListCommand } from '../commands/commands/unhide.command';
import { ChangeSheetProtectionFromSheetBarCommand, DeleteWorksheetProtectionFormSheetBarCommand } from '../commands/commands/worksheet-protection.command';
import { SetActivateCellEditOperation } from '../commands/operations/activate-cell-edit.operation';
import {
    SetCellEditVisibleArrowOperation,
    SetCellEditVisibleOperation,
    SetCellEditVisibleWithF2Operation,
} from '../commands/operations/cell-edit.operation';
import { RenameSheetOperation } from '../commands/operations/rename-sheet.operation';
import { ScrollToRangeOperation } from '../commands/operations/scroll-to-range.operation';
import { SetScrollOperation } from '../commands/operations/scroll.operation';
import { SetFormatPainterOperation } from '../commands/operations/set-format-painter.operation';
import { SetZoomRatioOperation } from '../commands/operations/set-zoom-ratio.operation';
import { SheetPermissionOpenDialogOperation } from '../commands/operations/sheet-permission-open-dialog.operation';
import { SheetPermissionOpenPanelOperation } from '../commands/operations/sheet-permission-open-panel.operation';
import { SidebarDefinedNameOperation } from '../commands/operations/sidebar-defined-name.operation';
import { menuSchema } from '../menu/schema';
import { BorderPanel } from '../views/border-panel/BorderPanel';
import { BORDER_PANEL_COMPONENT } from '../views/border-panel/interface';
import { CELL_POPUP_COMPONENT_KEY } from '../views/cell-popup/config';
import { CellPopup } from '../views/CellPopup';
import { DEFINED_NAME_CONTAINER } from '../views/defined-name/component-name';
import { DefinedNameContainer } from '../views/defined-name/DefinedNameContainer';
import { MENU_ITEM_FROZEN_COMPONENT, MenuItemFrozen } from '../views/menu-item-frozen/index';
import { MENU_ITEM_INPUT_COMPONENT, MenuItemInput } from '../views/menu-item-input/index';
import { RenderSheetContent, RenderSheetFooter, RenderSheetHeader } from '../views/sheet-container/SheetContainer';
import { CopyDownShortcutItem, CopyRightShortcutItem } from './shortcuts/copy-fill.shortcut';
import {
    EditorBreakLineShortcut,
    EditorCursorCtrlEnterShortcut,
    EditorCursorEnterShortcut,
    EditorCursorEscShortcut,
    EditorCursorTabShortcut,
    EditorDeleteLeftShortcut,
    EditorDeleteLeftShortcutInActive,
    EditorDeleteRightShortcut,
    generateArrowSelectionShortCutItem,
    RepeatLastActionShortcut,
    ShiftEditorDeleteLeftShortcut,
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
    SetFontDecreaseShortcutItem,
    SetFontIncreaseShortcutItem,
    SetItalicShortcutItem,
    SetStrikeThroughShortcutItem,
    SetUnderlineShortcutItem,
} from './shortcuts/style.shortcut';
import { ClearSelectionValueShortcutItem, ClearSelectionValueShortcutItemMac, ShiftClearSelectionValueShortcutItem, ShiftDeleteSelectionValueShortcutItem } from './shortcuts/value.shortcut';
import {
    PreventDefaultResetZoomShortcutItem,
    PreventDefaultZoomInShortcutItem,
    PreventDefaultZoomOutShortcutItem,
    ResetZoomShortcutItem,
    ZoomInShortcutItem,
    ZoomOutShortcutItem,
} from './shortcuts/view.shortcut';

export class SheetUIController extends Disposable {
    constructor(
        @Inject(Injector) protected readonly _injector: Injector,
        @Inject(ComponentManager) protected readonly _componentManager: ComponentManager,
        @Inject(IconManager) protected readonly _iconManager: IconManager,
        @ILayoutService protected readonly _layoutService: ILayoutService,
        @ICommandService protected readonly _commandService: ICommandService,
        @IShortcutService protected readonly _shortcutService: IShortcutService,
        @IMenuManagerService protected readonly _menuManagerService: IMenuManagerService,
        @IUIPartsService protected readonly _uiPartsService: IUIPartsService,
        @IConfigService protected readonly _configService: IConfigService
    ) {
        super();

        this._init();
    }

    private _init(): void {
        this._initComponents();
        this._registerIcons();
        this._initCommands();
        this._initMenus();
        this._initShortcuts();
        this._initWorkbenchParts();
        this._initFocusHandler();
    }

    private _initComponents(): void {
        const componentManager = this._componentManager;

        // init custom components
        this.disposeWithMe(componentManager.register(MENU_ITEM_INPUT_COMPONENT, MenuItemInput));
        this.disposeWithMe(componentManager.register(MENU_ITEM_FROZEN_COMPONENT, MenuItemFrozen));
        this.disposeWithMe(componentManager.register(BORDER_PANEL_COMPONENT, BorderPanel));
        this.disposeWithMe(componentManager.register(DEFINED_NAME_CONTAINER, DefinedNameContainer));
        this.disposeWithMe(componentManager.register(CELL_POPUP_COMPONENT_KEY, CellPopup));
    }

    // eslint-disable-next-line max-lines-per-function
    private _registerIcons(): void {
        this.disposeWithMe(this._iconManager.register({
            AdjustHeightDoubleIcon,
            AdjustWidthDoubleIcon,
            AddImageIcon,
            AlignBottomIcon,
            AlignTopIcon,
            AllBorderIcon,
            AutoHeightDoubleIcon,
            AutoWidthDoubleIcon,
            AutowrapIcon,
            BackSlashDoubleIcon,
            BoldIcon,
            BrushIcon,
            CancelFreezeIcon,
            CancelMergeIcon,
            ClearFormatDoubleIcon,
            CodeIcon,
            CopyDoubleIcon,
            CutIcon,
            DeleteCellShiftLeftDoubleIcon,
            DeleteCellShiftUpDoubleIcon,
            DeleteColumnDoubleIcon,
            DeleteRowDoubleIcon,
            DownBorderDoubleIcon,
            DownloadImageIcon,
            EyeOutlineIcon,
            FontColorDoubleIcon,
            FontSizeIncreaseIcon,
            FontSizeReduceIcon,
            FreezeColumnIcon,
            FreezeRowIcon,
            FreezeToSelectedIcon,
            HideDoubleIcon,
            HideGridlinesDoubleIcon,
            HorizontalBorderDoubleIcon,
            HorizontalMergeIcon,
            HorizontallyIcon,
            InnerBorderDoubleIcon,
            InsertCellDownDoubleIcon,
            InsertCellShiftRightDoubleIcon,
            InsertDoubleIcon,
            InsertRowAboveDoubleIcon,
            InsertRowBelowDoubleIcon,
            ItalicIcon,
            LeftBorderDoubleIcon,
            LeftDoubleDiagonalDoubleIcon,
            LeftInsertColumnDoubleIcon,
            LeftJustifyingIcon,
            LeftRotationFortyFiveDegreesIcon,
            LeftRotationNinetyDegreesIcon,
            LeftTridiagonalDoubleIcon,
            LockIcon,
            MergeAllIcon,
            NoBorderIcon,
            NoColorDoubleIcon,
            NoRotationIcon,
            OuterBorderDoubleIcon,
            OverflowIcon,
            PaintBucketDoubleIcon,
            PasteSpecialDoubleIcon,
            PipingIcon,
            ProtectIcon,
            ReduceDoubleIcon,
            RightBorderDoubleIcon,
            RightDoubleDiagonalDoubleIcon,
            RightInsertColumnDoubleIcon,
            RightJustifyingIcon,
            RightRotationFortyFiveDegreesIcon,
            RightRotationNinetyDegreesIcon,
            SlashDoubleIcon,
            StrikethroughIcon,
            SubscriptIcon,
            SuperscriptIcon,
            TruncationIcon,
            UnderlineIcon,
            UpBorderDoubleIcon,
            VerticalBorderDoubleIcon,
            VerticalCenterIcon,
            VerticalIntegrationIcon,
            VerticalTextIcon,
        }));
    }

    private _initCommands(): void {
        [
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
            SetRangeFontIncreaseCommand,
            SetRangeFontDecreaseCommand,
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
            RepeatLastActionCommand,
        ].forEach((c) => {
            this.disposeWithMe(this._commandService.registerCommand(c));
        });
    }

    private _initMenus(): void {
        this._menuManagerService.mergeMenu(menuSchema);
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
            SetFontIncreaseShortcutItem,
            SetFontDecreaseShortcutItem,

            // cell content editing shortcuts
            ClearSelectionValueShortcutItem,
            ClearSelectionValueShortcutItemMac,
            ShiftClearSelectionValueShortcutItem,
            ShiftDeleteSelectionValueShortcutItem,
            ...generateArrowSelectionShortCutItem(),
            EditorCursorEnterShortcut,
            RepeatLastActionShortcut,
            StartEditWithF2Shortcut,
            EditorCursorTabShortcut,
            EditorBreakLineShortcut,
            EditorDeleteLeftShortcut,
            EditorDeleteRightShortcut,
            EditorDeleteLeftShortcutInActive,
            EditorCursorEscShortcut,
            EditorCursorCtrlEnterShortcut,
            ShiftEditorDeleteLeftShortcut,

            // copy fill shortcuts
            CopyDownShortcutItem,
            CopyRightShortcutItem,

            // operation shortcuts
            SetRowHiddenShortcutItem,
            SetColHiddenShortcutItem,
        ].forEach((item) => {
            this.disposeWithMe(this._shortcutService.registerShortcut(item));
        });
    }

    protected _initWorkbenchParts(): void {
        const uiController = this._uiPartsService;
        const injector = this._injector;

        this.disposeWithMe(uiController.registerComponent(BuiltInUIPart.HEADER, () => connectInjector(RenderSheetHeader, injector)));
        this.disposeWithMe(uiController.registerComponent(BuiltInUIPart.FOOTER, () => connectInjector(RenderSheetFooter, injector)));
        this.disposeWithMe(uiController.registerComponent(BuiltInUIPart.CONTENT, () => connectInjector(RenderSheetContent, injector)));
    }

    protected _initFocusHandler(): void {
        this.disposeWithMe(
            this._layoutService.registerFocusHandler(UniverInstanceType.UNIVER_SHEET, (_unitId: string) => {
                // DEBT: `_unitId` is not used hence we cannot support Univer mode now
                const renderManagerService = this._injector.get(IRenderManagerService);
                const instanceService = this._injector.get(IUniverInstanceService);
                const currentEditorRender = getCurrentTypeOfRenderer(UniverInstanceType.UNIVER_DOC, instanceService, renderManagerService);
                const docSelectionRenderService = currentEditorRender?.with(DocSelectionRenderService);

                docSelectionRenderService?.focus();
            })
        );
    }
}

import {
    ExpandSelectionCommand,
    MoveSelectionCommand,
    ScrollCommand,
    SelectAllCommand,
    SetBoldCommand,
    SetFontFamilyCommand,
    SetFontSizeCommand,
    SetItalicCommand,
    SetStrikeThroughCommand,
    SetUnderlineCommand,
} from '@univerjs/base-sheets';
import {
    ColorPicker,
    ComponentManager,
    IDesktopUIController,
    IMenuItemFactory,
    IMenuService,
    IShortcutService,
    IUIController,
} from '@univerjs/base-ui';
import { Disposable, ICommandService, LifecycleStages, OnLifecycle } from '@univerjs/core';
import { Inject, Injector } from '@wendellhu/redi';
import { connectInjector } from '@wendellhu/redi/react-bindings';

import { SHEET_UI_PLUGIN_NAME } from '../Basics';
import { RenameSheetCommand } from '../commands/commands/rename.command';
import { ShowMenuListCommand } from '../commands/commands/unhide.command';
import { QuitCellEditorCommand } from '../services/cell-editor/cell-editor.command';
import { RightMenuInput } from '../View/RightMenu/RightMenuInput';
import { RightMenuItem } from '../View/RightMenu/RightMenuItem';
import { RenderSheetFooter } from '../View/SheetContainer/SheetContainer';
import { CellBorderSelectorMenuItemFactory } from './menu/border.menu';
import {
    BackgroundColorSelectorMenuItemFactory,
    BoldMenuItemFactory,
    ChangeColorSheetMenuItemFactory,
    ClearSelectionMenuItemFactory,
    CONTEXT_MENU_INPUT_LABEL,
    CopyMenuItemFactory,
    CopySheetMenuItemFactory,
    DeleteRangeMenuItemFactory,
    DeleteRangeMoveLeftMenuItemFactory,
    DeleteRangeMoveUpMenuItemFactory,
    DeleteSheetMenuItemFactory,
    FontFamilySelectorMenuItemFactory,
    FontSizeSelectorMenuItemFactory,
    HideSheetMenuItemFactory,
    HorizontalAlignMenuItemFactory,
    InsertColAfterMenuItemFactory,
    InsertColBeforeMenuItemFactory,
    InsertRowAfterMenuItemFactory,
    InsertRowBeforeMenuItemFactory,
    ItalicMenuItemFactory,
    PasteMenuItemFactory,
    RedoMenuItemFactory,
    RemoveColMenuItemFactory,
    RemoveRowMenuItemFactory,
    RenameSheetMenuItemFactory,
    ResetBackgroundColorMenuItemFactory,
    ResetTextColorMenuItemFactory,
    SetBorderColorMenuItemFactory,
    SetBorderStyleMenuItemFactory,
    SetColWidthMenuItemFactory,
    SetRowHeightMenuItemFactory,
    StrikeThroughMenuItemFactory,
    TextColorSelectorMenuItemFactory,
    TextRotateMenuItemFactory,
    UnderlineMenuItemFactory,
    UndoMenuItemFactory,
    UnHideSheetMenuItemFactory,
    VerticalAlignMenuItemFactory,
    WrapTextMenuItemFactory,
} from './menu/menu';
import {
    CellMergeAllMenuItemFactory,
    CellMergeCancelMenuItemFactory,
    CellMergeHorizontalMenuItemFactory,
    CellMergeMenuItemFactory,
    CellMergeVerticalMenuItemFactory,
} from './menu/merge.menu';
import { QuitCellEditorShortcutItem } from './shortcuts/editor.shortcut';
import {
    ExpandSelectionDownShortcutItem,
    ExpandSelectionEndDownShortcutItem,
    ExpandSelectionEndLeftShortcutItem,
    ExpandSelectionEndRightShortcutItem,
    ExpandSelectionEndUpShortcutItem,
    ExpandSelectionLeftShortcutItem,
    ExpandSelectionRightShortcutItem,
    ExpandSelectionUpShortcutItem,
    MoveBackSelectionShortcutItem,
    MoveSelectionDownShortcutItem,
    MoveSelectionEndDownShortcutItem,
    MoveSelectionEndLeftShortcutItem,
    MoveSelectionEndRightShortcutItem,
    MoveSelectionEndUpShortcutItem,
    MoveSelectionLeftShortcutItem,
    MoveSelectionRightShortcutItem,
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

@OnLifecycle(LifecycleStages.Ready, SheetUIController)
export class SheetUIController extends Disposable {
    constructor(
        @Inject(Injector) private readonly _injector: Injector,
        @Inject(ComponentManager) private readonly _componentManager: ComponentManager,
        @ICommandService private readonly _commandService: ICommandService,
        @IShortcutService private readonly _shortcutService: IShortcutService,
        @IMenuService private readonly _menuService: IMenuService,
        @IUIController private readonly _uiController: IDesktopUIController
    ) {
        super();

        this._init();
    }

    private _init(): void {
        // init custom component
        const componentManager = this._componentManager;

        // FIXME: no dispose logic
        componentManager.register(CONTEXT_MENU_INPUT_LABEL, RightMenuInput);
        componentManager.register(RightMenuItem.name, RightMenuItem);
        componentManager.register(SHEET_UI_PLUGIN_NAME + ColorPicker.name, ColorPicker);

        // init commands
        [
            MoveSelectionCommand,
            ExpandSelectionCommand,
            SelectAllCommand,
            SetBoldCommand,
            SetItalicCommand,
            SetStrikeThroughCommand,
            SetUnderlineCommand,
            SetFontFamilyCommand,
            SetFontSizeCommand,
            ScrollCommand,

            QuitCellEditorCommand,

            ShowMenuListCommand,
            RenameSheetCommand,
        ].forEach((c) => {
            this.disposeWithMe(this._commandService.registerCommand(c));
        });

        // init menus
        (
            [
                // context menu
                CopyMenuItemFactory,
                PasteMenuItemFactory,

                ClearSelectionMenuItemFactory,
                InsertRowBeforeMenuItemFactory,
                InsertRowAfterMenuItemFactory,
                InsertColBeforeMenuItemFactory,
                InsertColAfterMenuItemFactory,
                RemoveRowMenuItemFactory,
                RemoveColMenuItemFactory,
                SetRowHeightMenuItemFactory,
                SetColWidthMenuItemFactory,
                DeleteRangeMenuItemFactory,
                DeleteRangeMoveLeftMenuItemFactory,
                DeleteRangeMoveUpMenuItemFactory,

                // toolbar
                UndoMenuItemFactory,
                RedoMenuItemFactory,
                BoldMenuItemFactory,
                ItalicMenuItemFactory,
                UnderlineMenuItemFactory,
                StrikeThroughMenuItemFactory,
                FontFamilySelectorMenuItemFactory,
                FontSizeSelectorMenuItemFactory,
                ResetTextColorMenuItemFactory,
                TextColorSelectorMenuItemFactory,
                BackgroundColorSelectorMenuItemFactory,
                ResetBackgroundColorMenuItemFactory,
                CellBorderSelectorMenuItemFactory,
                SetBorderColorMenuItemFactory,
                SetBorderStyleMenuItemFactory,
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
                UnHideSheetMenuItemFactory,
            ] as IMenuItemFactory[]
        ).forEach((factory) => {
            this.disposeWithMe(this._menuService.addMenuItem(this._injector.invoke(factory)));
        });

        // init shortcuts
        [
            // selection shortcuts
            MoveSelectionDownShortcutItem,
            MoveSelectionUpShortcutItem,
            MoveSelectionLeftShortcutItem,
            MoveSelectionRightShortcutItem,
            MoveSelectionTabShortcutItem,
            MoveBackSelectionShortcutItem,
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

            // toggle cell style shortcuts
            SetBoldShortcutItem,
            SetItalicShortcutItem,
            SetUnderlineShortcutItem,
            SetStrikeThroughShortcutItem,

            // cell content editing shortcuts
            ClearSelectionValueShortcutItem,
            QuitCellEditorShortcutItem,
        ].forEach((item) => {
            this.disposeWithMe(this._shortcutService.registerShortcut(item));
        });

        this.disposeWithMe(
            this._uiController.registerFooterComponent(() => connectInjector(RenderSheetFooter, this._injector))
        );
    }
}

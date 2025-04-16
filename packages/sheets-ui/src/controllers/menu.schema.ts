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

import type { MenuSchemaType } from '@univerjs/ui';
import {
    AddWorksheetMergeAllCommand,
    AddWorksheetMergeCommand,
    AddWorksheetMergeHorizontalCommand,
    AddWorksheetMergeVerticalCommand,
    CancelFrozenCommand,
    ClearSelectionAllCommand,
    ClearSelectionContentCommand,
    ClearSelectionFormatCommand,
    CopySheetCommand,
    InsertColBeforeCommand,
    InsertMultiColsLeftCommand,
    InsertMultiColsRightCommand,
    InsertMultiRowsAboveCommand,
    InsertMultiRowsAfterCommand,
    InsertRowBeforeCommand,
    RemoveWorksheetMergeCommand,
    ResetBackgroundColorCommand,
    ResetTextColorCommand,
    SetBackgroundColorCommand,
    SetBorderBasicCommand,
    SetColWidthCommand,
    SetHorizontalTextAlignCommand,
    SetRowHeightCommand,
    SetSelectedColsVisibleCommand,
    SetSelectedRowsVisibleCommand,
    SetTabColorCommand,
    SetTextRotationCommand,
    SetTextWrapCommand,
    SetVerticalTextAlignCommand,
    SetWorksheetHideCommand,
    SetWorksheetRowIsAutoHeightCommand,
    ToggleGridlinesCommand,
} from '@univerjs/sheets';
import { ContextMenuGroup, ContextMenuPosition, RibbonStartGroup } from '@univerjs/ui';
import {
    SheetCopyCommand,
    // SheetCutCommand,
    SheetPasteBesidesBorderCommand,
    SheetPasteColWidthCommand,
    SheetPasteCommand,
    SheetPasteFormatCommand,
    SheetPasteValueCommand,
} from '../commands/commands/clipboard.command';
import { DeleteRangeMoveLeftConfirmCommand } from '../commands/commands/delete-range-move-left-confirm.command';
import { DeleteRangeMoveUpConfirmCommand } from '../commands/commands/delete-range-move-up-confirm.command';
import { HideColConfirmCommand, HideRowConfirmCommand } from '../commands/commands/hide-row-col-confirm.command';
import {
    SetRangeBoldCommand,
    SetRangeFontFamilyCommand,
    SetRangeFontSizeCommand,
    SetRangeItalicCommand,
    SetRangeStrickThroughCommand,
    SetRangeTextColorCommand,
    SetRangeUnderlineCommand,
} from '../commands/commands/inline-format.command';
import { InsertRangeMoveDownConfirmCommand } from '../commands/commands/insert-range-move-down-confirm.command';
import { InsertRangeMoveRightConfirmCommand } from '../commands/commands/insert-range-move-right-confirm.command';
import {
    AddRangeProtectionFromContextMenuCommand,
    AddRangeProtectionFromSheetBarCommand,
    AddRangeProtectionFromToolbarCommand,
    DeleteRangeProtectionFromContextMenuCommand,
    SetRangeProtectionFromContextMenuCommand,
    ViewSheetPermissionFromContextMenuCommand,
    ViewSheetPermissionFromSheetBarCommand,
} from '../commands/commands/range-protection.command';
import { RemoveColConfirmCommand, RemoveRowConfirmCommand } from '../commands/commands/remove-row-col-confirm.command';
import { RemoveSheetConfirmCommand } from '../commands/commands/remove-sheet-confirm.command';
import { SetOnceFormatPainterCommand } from '../commands/commands/set-format-painter.command';
import { SetColumnFrozenCommand, SetRowFrozenCommand, SetSelectionFrozenCommand } from '../commands/commands/set-frozen.command';
import { SetWorksheetColAutoWidthCommand } from '../commands/commands/set-worksheet-auto-col-width.command';
import { ShowMenuListCommand } from '../commands/commands/unhide.command';
import {
    ChangeSheetProtectionFromSheetBarCommand,
    DeleteWorksheetProtectionFormSheetBarCommand,
} from '../commands/commands/worksheet-protection.command';
import { RenameSheetOperation } from '../commands/operations/rename-sheet.operation';
import { CellBorderSelectorMenuItemFactory } from './menu/border.menu';
import { CLEAR_SELECTION_MENU_ID, ClearSelectionAllMenuItemFactory, ClearSelectionContentMenuItemFactory, ClearSelectionFormatMenuItemFactory, ClearSelectionMenuItemFactory } from './menu/clear.menu';
import { DELETE_RANGE_MENU_ID, DeleteRangeMenuItemFactory, DeleteRangeMoveLeftMenuItemFactory, DeleteRangeMoveUpMenuItemFactory, RemoveColMenuItemFactory, RemoveRowMenuItemFactory } from './menu/delete.menu';
import { ToggleGridlinesMenuFactory } from './menu/gridlines.menu';
import {
    CELL_INSERT_MENU_ID,
    CellInsertMenuItemFactory,
    InsertColLeftCellMenuItemFactory,
    InsertMultiColsLeftHeaderMenuItemFactory,
    InsertMultiColsRightHeaderMenuItemFactory,
    InsertMultiRowsAboveHeaderMenuItemFactory,
    InsertMultiRowsAfterHeaderMenuItemFactory,
    InsertRangeMoveDownMenuItemFactory,
    InsertRangeMoveRightMenuItemFactory,
    InsertRowBeforeCellMenuItemFactory,
} from './menu/insert.menu';
import {
    BackgroundColorSelectorMenuItemFactory,
    BoldMenuItemFactory,
    CancelFrozenMenuItemFactory,
    ColAutoWidthMenuItemFactory,
    CopyMenuItemFactory,
    // CutMenuItemFactory,
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
    PASTE_SPECIAL_MENU_ID,
    PasteBesidesBorderMenuItemFactory,
    PasteColWidthMenuItemFactory,
    // PasteColWidthMenuItemFactory,
    PasteFormatMenuItemFactory,
    PasteMenuItemFactory,
    PasteSpacialMenuItemFactory,
    PasteValueMenuItemFactory,
    ResetBackgroundColorMenuItemFactory,
    ResetTextColorMenuItemFactory,
    SetColWidthMenuItemFactory,
    SetRowHeightMenuItemFactory,
    SHEET_FROZEN_HEADER_MENU_ID,
    SHEET_FROZEN_MENU_ID,
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
import { CellMergeAllMenuItemFactory, CellMergeCancelMenuItemFactory, CellMergeHorizontalMenuItemFactory, CellMergeMenuItemFactory, CellMergeVerticalMenuItemFactory } from './menu/merge.menu';
import {
    SHEET_PERMISSION_CONTEXT_MENU_ID,
    sheetPermissionAddProtectContextMenuFactory,
    sheetPermissionChangeSheetPermissionSheetBarMenuFactory,
    sheetPermissionContextMenuFactory,
    sheetPermissionEditProtectContextMenuFactory,
    sheetPermissionProtectSheetInSheetBarMenuFactory,
    sheetPermissionRemoveProtectContextMenuFactory,
    sheetPermissionRemoveProtectionSheetBarMenuFactory,
    sheetPermissionToolbarMenuFactory,
    sheetPermissionViewAllProtectRuleContextMenuFactory,
    sheetPermissionViewAllProtectRuleSheetBarMenuFactory,
} from './menu/permission.menu';
import {
    ChangeColorSheetMenuItemFactory,
    CopySheetMenuItemFactory,
    DeleteSheetMenuItemFactory,
    HideSheetMenuItemFactory,
    RenameSheetMenuItemFactory,
    ShowMenuItemFactory,
} from './menu/sheet.menu';

export const menuSchema: MenuSchemaType = {
    [RibbonStartGroup.FORMAT]: {
        [SetOnceFormatPainterCommand.id]: {
            order: 0,
            menuItemFactory: FormatPainterMenuItemFactory,
        },
        [SetRangeBoldCommand.id]: {
            order: 1,
            menuItemFactory: BoldMenuItemFactory,
        },
        [SetRangeItalicCommand.id]: {
            order: 2,
            menuItemFactory: ItalicMenuItemFactory,
        },
        [SetRangeUnderlineCommand.id]: {
            order: 3,
            menuItemFactory: UnderlineMenuItemFactory,
        },
        [SetRangeStrickThroughCommand.id]: {
            order: 4,
            menuItemFactory: StrikeThroughMenuItemFactory,
        },
        [SetRangeFontFamilyCommand.id]: {
            order: 5,
            menuItemFactory: FontFamilySelectorMenuItemFactory,
        },
        [SetRangeFontSizeCommand.id]: {
            order: 6,
            menuItemFactory: FontSizeSelectorMenuItemFactory,
        },
        [SetRangeTextColorCommand.id]: {
            order: 7,
            menuItemFactory: TextColorSelectorMenuItemFactory,
            [ResetTextColorCommand.id]: {
                order: 0,
                menuItemFactory: ResetTextColorMenuItemFactory,
            },
        },
        [SetBackgroundColorCommand.id]: {
            order: 9,
            menuItemFactory: BackgroundColorSelectorMenuItemFactory,
            [ResetBackgroundColorCommand.id]: {
                order: 0,
                menuItemFactory: ResetBackgroundColorMenuItemFactory,
            },
        },
        [SetBorderBasicCommand.id]: {
            order: 10,
            menuItemFactory: CellBorderSelectorMenuItemFactory,
        },
    },
    [RibbonStartGroup.LAYOUT]: {
        [AddWorksheetMergeCommand.id]: {
            order: 0,
            menuItemFactory: CellMergeMenuItemFactory,
            [AddWorksheetMergeAllCommand.id]: {
                order: 0,
                menuItemFactory: CellMergeAllMenuItemFactory,
            },
            [AddWorksheetMergeVerticalCommand.id]: {
                order: 1,
                menuItemFactory: CellMergeVerticalMenuItemFactory,
            },
            [AddWorksheetMergeHorizontalCommand.id]: {
                order: 2,
                menuItemFactory: CellMergeHorizontalMenuItemFactory,
            },
            [RemoveWorksheetMergeCommand.id]: {
                order: 3,
                menuItemFactory: CellMergeCancelMenuItemFactory,
            },
        },
        [SetHorizontalTextAlignCommand.id]: {
            order: 1,
            menuItemFactory: HorizontalAlignMenuItemFactory,
        },
        [SetVerticalTextAlignCommand.id]: {
            order: 1,
            menuItemFactory: VerticalAlignMenuItemFactory,
        },
        [SetTextWrapCommand.id]: {
            order: 2,
            menuItemFactory: WrapTextMenuItemFactory,
        },
        [SetTextRotationCommand.id]: {
            order: 3,
            menuItemFactory: TextRotateMenuItemFactory,
        },
    },
    [RibbonStartGroup.OTHERS]: {
        [AddRangeProtectionFromToolbarCommand.id]: {
            order: 0,
            menuItemFactory: sheetPermissionToolbarMenuFactory,
        },
    },
    [ContextMenuPosition.MAIN_AREA]: {
        [ContextMenuGroup.FORMAT]: {
            [SheetCopyCommand.name]: {
                order: 0,
                menuItemFactory: CopyMenuItemFactory,
            },
            // [SheetCutCommand.name]: {
            //     order: 1,
            //     menuItemFactory: CutMenuItemFactory,
            // },
            [SheetPasteCommand.name]: {
                order: 2,
                menuItemFactory: PasteMenuItemFactory,
            },
            [PASTE_SPECIAL_MENU_ID]: {
                order: 3,
                menuItemFactory: PasteSpacialMenuItemFactory,
                [SheetPasteValueCommand.id]: {
                    order: 0,
                    menuItemFactory: PasteValueMenuItemFactory,
                },
                [SheetPasteFormatCommand.id]: {
                    order: 1,
                    menuItemFactory: PasteFormatMenuItemFactory,
                },
                [SheetPasteColWidthCommand.id]: {
                    order: 2,
                    menuItemFactory: PasteColWidthMenuItemFactory,
                },
                [SheetPasteBesidesBorderCommand.id]: {
                    order: 3,
                    menuItemFactory: PasteBesidesBorderMenuItemFactory,
                },
            },
            [CLEAR_SELECTION_MENU_ID]: {
                order: 4,
                menuItemFactory: ClearSelectionMenuItemFactory,
                [ClearSelectionContentCommand.id]: {
                    order: 0,
                    menuItemFactory: ClearSelectionContentMenuItemFactory,
                },
                [ClearSelectionFormatCommand.id]: {
                    order: 1,
                    menuItemFactory: ClearSelectionFormatMenuItemFactory,
                },
                [ClearSelectionAllCommand.id]: {
                    order: 2,
                    menuItemFactory: ClearSelectionAllMenuItemFactory,
                },
            },
        },
        [ContextMenuGroup.LAYOUT]: {
            order: 1,
            [CELL_INSERT_MENU_ID]: {
                order: 0,
                menuItemFactory: CellInsertMenuItemFactory,
                [InsertRowBeforeCommand.id]: {
                    order: 0,
                    menuItemFactory: InsertRowBeforeCellMenuItemFactory,
                },
                [InsertColBeforeCommand.id]: {
                    order: 1,
                    menuItemFactory: InsertColLeftCellMenuItemFactory,
                },
                [InsertRangeMoveRightConfirmCommand.id]: {
                    order: 2,
                    menuItemFactory: InsertRangeMoveRightMenuItemFactory,
                },
                [InsertRangeMoveDownConfirmCommand.id]: {
                    order: 3,
                    menuItemFactory: InsertRangeMoveDownMenuItemFactory,
                },
            },
            [DELETE_RANGE_MENU_ID]: {
                order: 0,
                menuItemFactory: DeleteRangeMenuItemFactory,
                [RemoveColConfirmCommand.id]: {
                    order: 0,
                    menuItemFactory: RemoveColMenuItemFactory,
                },
                [RemoveRowConfirmCommand.id]: {
                    order: 1,
                    menuItemFactory: RemoveRowMenuItemFactory,
                },
                [DeleteRangeMoveLeftConfirmCommand.id]: {
                    order: 2,
                    menuItemFactory: DeleteRangeMoveLeftMenuItemFactory,
                },
                [DeleteRangeMoveUpConfirmCommand.id]: {
                    order: 3,
                    menuItemFactory: DeleteRangeMoveUpMenuItemFactory,
                },
            },
            [SHEET_FROZEN_MENU_ID]: {
                order: 2,
                menuItemFactory: SheetFrozenMenuItemFactory,
                [SetSelectionFrozenCommand.id]: {
                    order: 0,
                    menuItemFactory: FrozenMenuItemFactory,
                },
                [SetRowFrozenCommand.id]: {
                    order: 1,
                    menuItemFactory: FrozenRowMenuItemFactory,
                },
                [SetColumnFrozenCommand.id]: {
                    order: 2,
                    menuItemFactory: FrozenColMenuItemFactory,
                },
                [CancelFrozenCommand.id]: {
                    order: 3,
                    menuItemFactory: CancelFrozenMenuItemFactory,
                },
            },
            [SHEET_PERMISSION_CONTEXT_MENU_ID]: {
                order: 3,
                menuItemFactory: sheetPermissionContextMenuFactory,
                [AddRangeProtectionFromContextMenuCommand.id]: {
                    order: 0,
                    menuItemFactory: sheetPermissionAddProtectContextMenuFactory,
                },
                [SetRangeProtectionFromContextMenuCommand.id]: {
                    order: 1,
                    menuItemFactory: sheetPermissionEditProtectContextMenuFactory,
                },
                [DeleteRangeProtectionFromContextMenuCommand.id]: {
                    order: 2,
                    menuItemFactory: sheetPermissionRemoveProtectContextMenuFactory,
                },
                [ViewSheetPermissionFromContextMenuCommand.id]: {
                    order: 3,
                    menuItemFactory: sheetPermissionViewAllProtectRuleContextMenuFactory,
                },
            },
        },
        [ContextMenuGroup.DATA]: {
            order: 2,
        },
        [ContextMenuGroup.OTHERS]: {
            order: 3,
        },
    },
    [ContextMenuPosition.COL_HEADER]: {
        [ContextMenuGroup.FORMAT]: {
            [SheetCopyCommand.name]: {
                order: 0,
                menuItemFactory: CopyMenuItemFactory,
            },
            // [SheetCutCommand.name]: {
            //     order: 1,
            //     menuItemFactory: CutMenuItemFactory,
            // },
            [SheetPasteCommand.name]: {
                order: 2,
                menuItemFactory: PasteMenuItemFactory,
            },
            [PASTE_SPECIAL_MENU_ID]: {
                order: 3,
                menuItemFactory: PasteSpacialMenuItemFactory,
                [SheetPasteValueCommand.id]: {
                    order: 0,
                    menuItemFactory: PasteValueMenuItemFactory,
                },
                [SheetPasteFormatCommand.id]: {
                    order: 1,
                    menuItemFactory: PasteFormatMenuItemFactory,
                },
                [SheetPasteColWidthCommand.id]: {
                    order: 2,
                    menuItemFactory: PasteColWidthMenuItemFactory,
                },
                [SheetPasteBesidesBorderCommand.id]: {
                    order: 3,
                    menuItemFactory: PasteBesidesBorderMenuItemFactory,
                },
            },
            [CLEAR_SELECTION_MENU_ID]: {
                order: 4,
                menuItemFactory: ClearSelectionMenuItemFactory,
                [ClearSelectionContentCommand.id]: {
                    order: 0,
                    menuItemFactory: ClearSelectionContentMenuItemFactory,
                },
                [ClearSelectionFormatCommand.id]: {
                    order: 1,
                    menuItemFactory: ClearSelectionFormatMenuItemFactory,
                },
                [ClearSelectionAllCommand.id]: {
                    order: 2,
                    menuItemFactory: ClearSelectionAllMenuItemFactory,
                },
            },
        },
        [ContextMenuGroup.LAYOUT]: {
            order: 1,
            [InsertMultiColsLeftCommand.id]: {
                order: 0,
                menuItemFactory: InsertMultiColsLeftHeaderMenuItemFactory,
            },
            [InsertMultiColsRightCommand.id]: {
                order: 0,
                menuItemFactory: InsertMultiColsRightHeaderMenuItemFactory,
            },
            [HideColConfirmCommand.id]: {
                order: 1,
                menuItemFactory: HideColMenuItemFactory,
            },
            [SetSelectedColsVisibleCommand.id]: {
                order: 2,
                menuItemFactory: ShowColMenuItemFactory,
            },
            [RemoveColConfirmCommand.id]: {
                order: 2,
                menuItemFactory: RemoveColMenuItemFactory,
            },
            [SetColWidthCommand.id]: {
                order: 3,
                menuItemFactory: SetColWidthMenuItemFactory,
            },
            [SetWorksheetColAutoWidthCommand.id]: {
                order: 4,
                menuItemFactory: ColAutoWidthMenuItemFactory,
            },
            [SHEET_FROZEN_HEADER_MENU_ID]: {
                order: 5,
                menuItemFactory: SheetFrozenHeaderMenuItemFactory,
                [SetSelectionFrozenCommand.id]: {
                    order: 0,
                    menuItemFactory: FrozenMenuItemFactory,
                },
                [CancelFrozenCommand.id]: {
                    order: 3,
                    menuItemFactory: CancelFrozenMenuItemFactory,
                },
            },
            [SHEET_PERMISSION_CONTEXT_MENU_ID]: {
                order: 6,
                menuItemFactory: sheetPermissionContextMenuFactory,
                [AddRangeProtectionFromContextMenuCommand.id]: {
                    order: 0,
                    menuItemFactory: sheetPermissionAddProtectContextMenuFactory,
                },
                [SetRangeProtectionFromContextMenuCommand.id]: {
                    order: 1,
                    menuItemFactory: sheetPermissionEditProtectContextMenuFactory,
                },
                [DeleteRangeProtectionFromContextMenuCommand.id]: {
                    order: 2,
                    menuItemFactory: sheetPermissionRemoveProtectContextMenuFactory,
                },
                [ViewSheetPermissionFromContextMenuCommand.id]: {
                    order: 3,
                    menuItemFactory: sheetPermissionViewAllProtectRuleContextMenuFactory,
                },
            },
        },
        [ContextMenuGroup.DATA]: {
            order: 2,
        },
        [ContextMenuGroup.OTHERS]: {
            order: 3,
        },
    },
    [ContextMenuPosition.ROW_HEADER]: {
        [ContextMenuGroup.FORMAT]: {
            [SheetCopyCommand.name]: {
                order: 0,
                menuItemFactory: CopyMenuItemFactory,
            },
            // [SheetCutCommand.name]: {
            //     order: 1,
            //     menuItemFactory: CutMenuItemFactory,
            // },
            [SheetPasteCommand.name]: {
                order: 2,
                menuItemFactory: PasteMenuItemFactory,
            },
            [PASTE_SPECIAL_MENU_ID]: {
                order: 3,
                menuItemFactory: PasteSpacialMenuItemFactory,
                [SheetPasteValueCommand.id]: {
                    order: 0,
                    menuItemFactory: PasteValueMenuItemFactory,
                },
                [SheetPasteFormatCommand.id]: {
                    order: 1,
                    menuItemFactory: PasteFormatMenuItemFactory,
                },
                [SheetPasteColWidthCommand.id]: {
                    order: 2,
                    menuItemFactory: PasteColWidthMenuItemFactory,
                },
                [SheetPasteBesidesBorderCommand.id]: {
                    order: 3,
                    menuItemFactory: PasteBesidesBorderMenuItemFactory,
                },
            },
            [CLEAR_SELECTION_MENU_ID]: {
                order: 4,
                menuItemFactory: ClearSelectionMenuItemFactory,
                [ClearSelectionContentCommand.id]: {
                    order: 0,
                    menuItemFactory: ClearSelectionContentMenuItemFactory,
                },
                [ClearSelectionFormatCommand.id]: {
                    order: 1,
                    menuItemFactory: ClearSelectionFormatMenuItemFactory,
                },
                [ClearSelectionAllCommand.id]: {
                    order: 2,
                    menuItemFactory: ClearSelectionAllMenuItemFactory,
                },
            },
        },
        [ContextMenuGroup.LAYOUT]: {
            order: 1,
            [InsertMultiRowsAboveCommand.id]: {
                order: 0,
                menuItemFactory: InsertMultiRowsAboveHeaderMenuItemFactory,
            },
            [InsertMultiRowsAfterCommand.id]: {
                order: 1,
                menuItemFactory: InsertMultiRowsAfterHeaderMenuItemFactory,
            },
            [RemoveRowConfirmCommand.id]: {
                order: 1,
                menuItemFactory: RemoveRowMenuItemFactory,
            },
            [HideRowConfirmCommand.id]: {
                order: 2,
                menuItemFactory: HideRowMenuItemFactory,
            },
            [SetSelectedRowsVisibleCommand.id]: {
                order: 2,
                menuItemFactory: ShowRowMenuItemFactory,
            },
            [SetRowHeightCommand.id]: {
                order: 3,
                menuItemFactory: SetRowHeightMenuItemFactory,
            },
            [SetWorksheetRowIsAutoHeightCommand.id]: {
                order: 4,
                menuItemFactory: FitContentMenuItemFactory,
            },
            [SHEET_FROZEN_HEADER_MENU_ID]: {
                order: 5,
                menuItemFactory: SheetFrozenHeaderMenuItemFactory,
                [SetSelectionFrozenCommand.id]: {
                    order: 0,
                    menuItemFactory: FrozenMenuItemFactory,
                },
                [CancelFrozenCommand.id]: {
                    order: 3,
                    menuItemFactory: CancelFrozenMenuItemFactory,
                },
            },
            [SHEET_PERMISSION_CONTEXT_MENU_ID]: {
                order: 6,
                menuItemFactory: sheetPermissionContextMenuFactory,
                [AddRangeProtectionFromContextMenuCommand.id]: {
                    order: 0,
                    menuItemFactory: sheetPermissionAddProtectContextMenuFactory,
                },
                [SetRangeProtectionFromContextMenuCommand.id]: {
                    order: 1,
                    menuItemFactory: sheetPermissionEditProtectContextMenuFactory,
                },
                [DeleteRangeProtectionFromContextMenuCommand.id]: {
                    order: 2,
                    menuItemFactory: sheetPermissionRemoveProtectContextMenuFactory,
                },
                [ViewSheetPermissionFromContextMenuCommand.id]: {
                    order: 3,
                    menuItemFactory: sheetPermissionViewAllProtectRuleContextMenuFactory,
                },
            },
        },
        [ContextMenuGroup.DATA]: {
            order: 2,
        },
        [ContextMenuGroup.OTHERS]: {
            order: 3,
        },
    },
    [ContextMenuPosition.FOOTER_TABS]: {
        [ContextMenuGroup.OTHERS]: {
            order: 0,
            [RemoveSheetConfirmCommand.id]: {
                order: 0,
                menuItemFactory: DeleteSheetMenuItemFactory,
            },
            [CopySheetCommand.id]: {
                order: 1,
                menuItemFactory: CopySheetMenuItemFactory,
            },
            [RenameSheetOperation.id]: {
                order: 2,
                menuItemFactory: RenameSheetMenuItemFactory,
            },
            [SetTabColorCommand.id]: {
                order: 3,
                menuItemFactory: ChangeColorSheetMenuItemFactory,
            },
            [SetWorksheetHideCommand.id]: {
                order: 4,
                menuItemFactory: HideSheetMenuItemFactory,
            },
            // [SetWorksheetShowCommand.id]: {
            //     order: 5,
            //     menuItemFactory: UnHideSheetMenuItemFactory,
            // },
            [ShowMenuListCommand.id]: {
                order: 6,
                menuItemFactory: ShowMenuItemFactory,
            },
            [AddRangeProtectionFromSheetBarCommand.id]: {
                order: 7,
                menuItemFactory: sheetPermissionProtectSheetInSheetBarMenuFactory,
            },
            [DeleteWorksheetProtectionFormSheetBarCommand.id]: {
                order: 8,
                menuItemFactory: sheetPermissionRemoveProtectionSheetBarMenuFactory,
            },
            [ChangeSheetProtectionFromSheetBarCommand.id]: {
                order: 9,
                menuItemFactory: sheetPermissionChangeSheetPermissionSheetBarMenuFactory,
            },
            [ViewSheetPermissionFromSheetBarCommand.id]: {
                order: 10,
                menuItemFactory: sheetPermissionViewAllProtectRuleSheetBarMenuFactory,
            },
        },
    },
    [ContextMenuPosition.FOOTER_MENU]: {
        [ContextMenuGroup.OTHERS]: {
            [ToggleGridlinesCommand.id]: {
                order: 1,
                menuItemFactory: ToggleGridlinesMenuFactory,
            },
        },
    },
};

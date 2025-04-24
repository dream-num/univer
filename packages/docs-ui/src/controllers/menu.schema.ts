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
import { ContextMenuGroup, ContextMenuPosition, RibbonStartGroup } from '@univerjs/ui';
import { DocCopyCommand, DocCopyCurrentParagraphCommand, DocCutCommand, DocCutCurrentParagraphCommand, DocPasteCommand } from '../commands/commands/clipboard.command';
import { DeleteCurrentParagraphCommand, DeleteLeftCommand } from '../commands/commands/doc-delete.command';
import { OpenHeaderFooterPanelCommand } from '../commands/commands/doc-header-footer.command';
import { HorizontalLineCommand, InsertHorizontalLineBellowCommand } from '../commands/commands/doc-horizontal-line.command';

import { ResetInlineFormatTextBackgroundColorCommand, SetInlineFormatBoldCommand, SetInlineFormatFontFamilyCommand, SetInlineFormatFontSizeCommand, SetInlineFormatItalicCommand, SetInlineFormatStrikethroughCommand, SetInlineFormatSubscriptCommand, SetInlineFormatSuperscriptCommand, SetInlineFormatTextBackgroundColorCommand, SetInlineFormatTextColorCommand, SetInlineFormatUnderlineCommand } from '../commands/commands/inline-format.command';
import { BulletListCommand, CheckListCommand, InsertBulletListBellowCommand, InsertCheckListBellowCommand, InsertOrderListBellowCommand, OrderListCommand } from '../commands/commands/list.command';
import { AlignCenterCommand, AlignJustifyCommand, AlignLeftCommand, AlignRightCommand } from '../commands/commands/paragraph-align.command';
import { H1HeadingCommand, H2HeadingCommand, H3HeadingCommand, H4HeadingCommand, H5HeadingCommand, NormalTextHeadingCommand, SetParagraphNamedStyleCommand } from '../commands/commands/set-heading.command';
import { SwitchDocModeCommand } from '../commands/commands/switch-doc-mode.command';
import { DocTableDeleteColumnsCommand, DocTableDeleteRowsCommand, DocTableDeleteTableCommand } from '../commands/commands/table/doc-table-delete.command';
import { DocTableInsertColumnLeftCommand, DocTableInsertColumnRightCommand, DocTableInsertRowAboveCommand, DocTableInsertRowBellowCommand } from '../commands/commands/table/doc-table-insert.command';
import { DocCreateTableOperation } from '../commands/operations/doc-create-table.operation';
import { DocParagraphSettingPanelOperation } from '../commands/operations/doc-paragraph-setting-panel.operation';
import { DocOpenPageSettingCommand } from '../commands/operations/open-page-setting.operation';
import {
    CopyMenuFactory,
    CutMenuFactory,
    DeleteColumnsMenuItemFactory,
    DeleteMenuFactory,
    DeleteRowsMenuItemFactory,
    DeleteTableMenuItemFactory,
    InsertColumnLeftMenuItemFactory,
    InsertColumnRightMenuItemFactory,
    InsertRowAfterMenuItemFactory,
    InsertRowBeforeMenuItemFactory,
    ParagraphSettingMenuFactory,
    PasteMenuFactory,
    TABLE_DELETE_MENU_ID,
    TABLE_INSERT_MENU_ID,
    TableDeleteMenuItemFactory,
    TableInsertMenuItemFactory,
} from './menu/context-menu';
import {
    AlignCenterMenuItemFactory,
    AlignJustifyMenuItemFactory,
    AlignLeftMenuItemFactory,
    AlignRightMenuItemFactory,
    BackgroundColorSelectorMenuItemFactory,
    BoldMenuItemFactory,
    BulletListMenuItemFactory,
    CheckListMenuItemFactory,
    DocSwitchModeMenuItemFactory,
    FontFamilySelectorMenuItemFactory,
    FontSizeSelectorMenuItemFactory,
    HeaderFooterMenuItemFactory,
    HeadingSelectorMenuItemFactory,
    HorizontalLineFactory,
    InsertTableMenuFactory,
    ItalicMenuItemFactory,
    OrderListMenuItemFactory,
    PageSettingMenuItemFactory,
    ResetBackgroundColorMenuItemFactory,
    StrikeThroughMenuItemFactory,
    SubscriptMenuItemFactory,
    SuperscriptMenuItemFactory,
    TABLE_MENU_ID,
    TableMenuFactory,
    TextColorSelectorMenuItemFactory,
    UnderlineMenuItemFactory,
} from './menu/menu';
import { CopyCurrentParagraphMenuItemFactory, CutCurrentParagraphMenuItemFactory, DeleteCurrentParagraphMenuItemFactory, DocInsertBellowMenuItemFactory, H1HeadingMenuItemFactory, H2HeadingMenuItemFactory, H3HeadingMenuItemFactory, H4HeadingMenuItemFactory, H5HeadingMenuItemFactory, INSERT_BELLOW_MENU_ID, InsertBulletListBellowMenuItemFactory, InsertCheckListBellowMenuItemFactory, InsertHorizontalLineBellowMenuItemFactory, InsertOrderListBellowMenuItemFactory, NormalTextHeadingMenuItemFactory } from './menu/paragraph-menu';

export const menuSchema: MenuSchemaType = {
    [RibbonStartGroup.FORMAT]: {
        [SetInlineFormatBoldCommand.id]: {
            order: 0,
            menuItemFactory: BoldMenuItemFactory,
        },
        [SetInlineFormatItalicCommand.id]: {
            order: 1,
            menuItemFactory: ItalicMenuItemFactory,
        },
        [SetInlineFormatUnderlineCommand.id]: {
            order: 2,
            menuItemFactory: UnderlineMenuItemFactory,
        },
        [SetInlineFormatStrikethroughCommand.id]: {
            order: 3,
            menuItemFactory: StrikeThroughMenuItemFactory,
        },
        [SetInlineFormatSubscriptCommand.id]: {
            order: 4,
            menuItemFactory: SubscriptMenuItemFactory,
        },
        [SetInlineFormatSuperscriptCommand.id]: {
            order: 5,
            menuItemFactory: SuperscriptMenuItemFactory,
        },
        [SetParagraphNamedStyleCommand.id]: {
            order: 5.5,
            menuItemFactory: HeadingSelectorMenuItemFactory,
        },
        [SetInlineFormatFontSizeCommand.id]: {
            order: 6,
            menuItemFactory: FontSizeSelectorMenuItemFactory,
        },
        [SetInlineFormatFontFamilyCommand.id]: {
            order: 7,
            menuItemFactory: FontFamilySelectorMenuItemFactory,
        },
        [SetInlineFormatTextColorCommand.id]: {
            order: 8,
            menuItemFactory: TextColorSelectorMenuItemFactory,
        },
        [SetInlineFormatTextBackgroundColorCommand.id]: {
            order: 9,
            menuItemFactory: BackgroundColorSelectorMenuItemFactory,
            [ResetInlineFormatTextBackgroundColorCommand.id]: {
                order: 0,
                menuItemFactory: ResetBackgroundColorMenuItemFactory,
            },
        },
    },
    [RibbonStartGroup.LAYOUT]: {
        [TABLE_MENU_ID]: {
            order: 1,
            menuItemFactory: TableMenuFactory,
            [DocCreateTableOperation.id]: {
                order: 0,
                menuItemFactory: InsertTableMenuFactory,
            },
        },
        [AlignLeftCommand.id]: {
            order: 2,
            menuItemFactory: AlignLeftMenuItemFactory,
        },
        [AlignCenterCommand.id]: {
            order: 3,
            menuItemFactory: AlignCenterMenuItemFactory,
        },
        [AlignRightCommand.id]: {
            order: 4,
            menuItemFactory: AlignRightMenuItemFactory,
        },
        [AlignJustifyCommand.id]: {
            order: 5,
            menuItemFactory: AlignJustifyMenuItemFactory,
        },
        [HorizontalLineCommand.id]: {
            order: 6,
            menuItemFactory: HorizontalLineFactory,
        },
        [OrderListCommand.id]: {
            order: 7,
            menuItemFactory: OrderListMenuItemFactory,
        },
        [BulletListCommand.id]: {
            order: 8,
            menuItemFactory: BulletListMenuItemFactory,
        },
        [CheckListCommand.id]: {
            order: 9,
            menuItemFactory: CheckListMenuItemFactory,
        },
        [OpenHeaderFooterPanelCommand.id]: {
            order: 10,
            menuItemFactory: HeaderFooterMenuItemFactory,
        },
        [SwitchDocModeCommand.id]: {
            order: 11,
            menuItemFactory: DocSwitchModeMenuItemFactory,
        },
        [DocOpenPageSettingCommand.id]: {
            order: 12,
            menuItemFactory: PageSettingMenuItemFactory,
        },
    },
    [ContextMenuPosition.MAIN_AREA]: {
        [ContextMenuGroup.FORMAT]: {
            [DocCopyCommand.name]: {
                order: 0,
                menuItemFactory: CopyMenuFactory,
            },
            [DocCutCommand.id]: {
                order: 1,
                menuItemFactory: CutMenuFactory,
            },
            [DocPasteCommand.id]: {
                order: 2,
                menuItemFactory: PasteMenuFactory,
            },
            [DeleteLeftCommand.id]: {
                order: 3,
                menuItemFactory: DeleteMenuFactory,
            },
        },
        [ContextMenuGroup.LAYOUT]: {
            [DocParagraphSettingPanelOperation.id]: {
                order: 0,
                menuItemFactory: ParagraphSettingMenuFactory,
            },
            [TABLE_INSERT_MENU_ID]: {
                order: 1,
                menuItemFactory: TableInsertMenuItemFactory,
                [DocTableInsertRowAboveCommand.id]: {
                    order: 1,
                    menuItemFactory: InsertRowBeforeMenuItemFactory,
                },
                [DocTableInsertRowBellowCommand.id]: {
                    order: 2,
                    menuItemFactory: InsertRowAfterMenuItemFactory,
                },
                [DocTableInsertColumnLeftCommand.id]: {
                    order: 3,
                    menuItemFactory: InsertColumnLeftMenuItemFactory,
                },
                [DocTableInsertColumnRightCommand.id]: {
                    order: 4,
                    menuItemFactory: InsertColumnRightMenuItemFactory,
                },
            },
            [TABLE_DELETE_MENU_ID]: {
                order: 2,
                menuItemFactory: TableDeleteMenuItemFactory,
                [DocTableDeleteRowsCommand.id]: {
                    order: 1,
                    menuItemFactory: DeleteRowsMenuItemFactory,
                },
                [DocTableDeleteColumnsCommand.id]: {
                    order: 2,
                    menuItemFactory: DeleteColumnsMenuItemFactory,
                },
                [DocTableDeleteTableCommand.id]: {
                    order: 3,
                    menuItemFactory: DeleteTableMenuItemFactory,
                },
            },
        },
    },
    [ContextMenuPosition.PARAGRAPH]: {
        [ContextMenuGroup.QUICK]: {
            [H1HeadingCommand.id]: {
                order: 0,
                menuItemFactory: H1HeadingMenuItemFactory,
            },
            [H2HeadingCommand.id]: {
                order: 1,
                menuItemFactory: H2HeadingMenuItemFactory,
            },
            [H3HeadingCommand.id]: {
                order: 2,
                menuItemFactory: H3HeadingMenuItemFactory,
            },
            [H4HeadingCommand.id]: {
                order: 3,
                menuItemFactory: H4HeadingMenuItemFactory,
            },
            [H5HeadingCommand.id]: {
                order: 4,
                menuItemFactory: H5HeadingMenuItemFactory,
            },
            [NormalTextHeadingCommand.id]: {
                order: 5,
                menuItemFactory: NormalTextHeadingMenuItemFactory,
            },
            [OrderListCommand.id]: {
                order: 6,
                menuItemFactory: OrderListMenuItemFactory,
            },
            [BulletListCommand.id]: {
                order: 7,
                menuItemFactory: BulletListMenuItemFactory,
            },
            [CheckListCommand.id]: {
                order: 8,
                menuItemFactory: CheckListMenuItemFactory,
            },
        },
        [ContextMenuGroup.FORMAT]: {
            [DocCopyCurrentParagraphCommand.id]: {
                order: 0,
                menuItemFactory: CopyCurrentParagraphMenuItemFactory,
            },
            [DocCutCurrentParagraphCommand.id]: {
                order: 1,
                menuItemFactory: CutCurrentParagraphMenuItemFactory,
            },
            [DeleteCurrentParagraphCommand.id]: {
                order: 2,
                menuItemFactory: DeleteCurrentParagraphMenuItemFactory,
            },
        },
        [ContextMenuGroup.LAYOUT]: {
            // title: 'rightClick.insertBellow',
            [INSERT_BELLOW_MENU_ID]: {
                menuItemFactory: DocInsertBellowMenuItemFactory,
                [InsertBulletListBellowCommand.id]: {
                    order: 0,
                    menuItemFactory: InsertBulletListBellowMenuItemFactory,
                },
                [InsertOrderListBellowCommand.id]: {
                    order: 1,
                    menuItemFactory: InsertOrderListBellowMenuItemFactory,
                },
                [InsertCheckListBellowCommand.id]: {
                    order: 2,
                    menuItemFactory: InsertCheckListBellowMenuItemFactory,
                },
                [InsertHorizontalLineBellowCommand.id]: {
                    order: 3,
                    menuItemFactory: InsertHorizontalLineBellowMenuItemFactory,
                },
            },
        },
    },
};

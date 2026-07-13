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
import { ContextMenuGroup, ContextMenuPosition, RibbonInsertGroup, RibbonStartGroup } from '@univerjs/ui';
import {
    DocCopyCommand,
    DocCopyCurrentParagraphCommand,
    DocCutCommand,
    DocCutCurrentParagraphCommand,
    DocPasteCommand,
} from '../commands/commands/clipboard.command';
import { DeleteCurrentParagraphCommand, DeleteLeftCommand } from '../commands/commands/doc-delete.command';
import { OpenHeaderFooterPanelCommand } from '../commands/commands/doc-header-footer.command';
import {
    HorizontalLineCommand,
    InsertHorizontalLineBellowCommand,
} from '../commands/commands/doc-horizontal-line.command';
import {
    ResetInlineFormatTextBackgroundColorCommand,
    ResetInlineFormatTextColorCommand,
    SetInlineFormatBoldCommand,
    SetInlineFormatFontFamilyCommand,
    SetInlineFormatFontSizeCommand,
    SetInlineFormatItalicCommand,
    SetInlineFormatStrikethroughCommand,
    SetInlineFormatSubscriptCommand,
    SetInlineFormatSuperscriptCommand,
    SetInlineFormatTextBackgroundColorCommand,
    SetInlineFormatTextColorCommand,
    SetInlineFormatUnderlineCommand,
} from '../commands/commands/inline-format.command';
import {
    BulletListCommand,
    CheckListCommand,
    InsertBulletListBellowCommand,
    InsertCheckListBellowCommand,
    InsertOrderListBellowCommand,
    OrderListCommand,
} from '../commands/commands/list.command';
import { AlignOperationCommand } from '../commands/commands/paragraph-align.command';
import {
    H1HeadingCommand,
    H2HeadingCommand,
    H3HeadingCommand,
    H4HeadingCommand,
    H5HeadingCommand,
    NormalTextHeadingCommand,
    SetParagraphNamedStyleCommand,
    SubtitleHeadingCommand,
    TitleHeadingCommand,
} from '../commands/commands/set-heading.command';
import {
    DocTableDeleteColumnsCommand,
    DocTableDeleteRowsCommand,
    DocTableDeleteTableCommand,
} from '../commands/commands/table/doc-table-delete.command';
import {
    DocTableInsertColumnLeftCommand,
    DocTableInsertColumnRightCommand,
    DocTableInsertRowAboveCommand,
    DocTableInsertRowBellowCommand,
} from '../commands/commands/table/doc-table-insert.command';
import { DocCreateTableOperation } from '../commands/operations/doc-create-table.operation';
import { DocParagraphSettingPanelOperation } from '../commands/operations/doc-paragraph-setting-panel.operation';
import { DocSectionSettingPanelOperation } from '../commands/operations/doc-section-setting-panel.operation';
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
    SectionSettingMenuFactory,
    TABLE_DELETE_MENU_ID,
    TABLE_INSERT_MENU_ID,
    TableDeleteMenuItemFactory,
    TableInsertMenuItemFactory,
} from './context-menu';
import {
    AlignCenterMenuItemFactory,
    AlignJustifyMenuItemFactory,
    AlignLeftMenuItemFactory,
    AlignMenuItemFactory,
    AlignRightMenuItemFactory,
    BackgroundColorSelectorMenuItemFactory,
    BoldMenuItemFactory,
    BulletListMenuItemFactory,
    CheckListMenuItemFactory,
    // DocSwitchModeMenuItemFactory,
    FLOAT_TEXT_STYLE_MENU_ID,
    FLOAT_TOOLBAR_MENU_POSITION,
    FloatTextStyleMenuItemFactory,
    FontFamilySelectorMenuItemFactory,
    FontSizeSelectorMenuItemFactory,
    HeaderFooterMenuItemFactory,
    HeadingSelectorMenuItemFactory,
    HorizontalLineFactory,
    InsertDefaultTableMenuFactory,
    InsertTableMenuFactory,
    ItalicMenuItemFactory,
    OrderListMenuItemFactory,
    PageSettingMenuItemFactory,
    ResetBackgroundColorMenuItemFactory,
    ResetTextColorMenuItemFactory,
    StrikeThroughMenuItemFactory,
    SubscriptMenuItemFactory,
    SuperscriptMenuItemFactory,
    TABLE_MENU_ID,
    TableMenuFactory,
    TextColorSelectorMenuItemFactory,
    UnderlineMenuItemFactory,
} from './menu';
import {
    CopyCurrentParagraphMenuItemFactory,
    CutCurrentParagraphMenuItemFactory,
    DeleteCurrentParagraphMenuItemFactory,
    DOC_CONTENT_INSERT_MENU_ID,
    DOC_PARAGRAPH_T_ALIGN_MENU_ID,
    DOC_PARAGRAPH_T_COLORS_MENU_ID,
    DOC_PARAGRAPH_T_DIVIDER_MENU_ID,
    DOC_PARAGRAPH_T_EDIT_MENU_ID,
    DOC_PARAGRAPH_T_INDENT_DECREASE_ID,
    DOC_PARAGRAPH_T_INDENT_INCREASE_ID,
    DOC_PARAGRAPH_T_INSERT_BELOW_COMMAND_ID,
    DOC_PARAGRAPH_T_INSERT_BELOW_MENU_ID,
    DOC_PARAGRAPH_T_INSERT_MENU_ID,
    DOC_TABLE_BLOCK_MENU_ID,
    DocInsertBellowMenuItemFactory,
    EMPTY_PARAGRAPH_MENU_ID,
    EmptyParagraphBulletListMenuItemFactory,
    EmptyParagraphCheckListMenuItemFactory,
    EmptyParagraphH1MenuItemFactory,
    EmptyParagraphH2MenuItemFactory,
    EmptyParagraphH3MenuItemFactory,
    EmptyParagraphH4MenuItemFactory,
    EmptyParagraphH5MenuItemFactory,
    EmptyParagraphHorizontalLineMenuItemFactory,
    EmptyParagraphNormalTextMenuItemFactory,
    EmptyParagraphOrderListMenuItemFactory,
    H1HeadingMenuItemFactory,
    H2HeadingMenuItemFactory,
    H3HeadingMenuItemFactory,
    H4HeadingMenuItemFactory,
    H5HeadingMenuItemFactory,
    INSERT_BELLOW_MENU_ID,
    InsertBulletListBellowMenuItemFactory,
    InsertCheckListBellowMenuItemFactory,
    InsertHorizontalLineBellowMenuItemFactory,
    InsertOrderListBellowMenuItemFactory,
    NormalTextHeadingMenuItemFactory,
    ParagraphMenuAlignSubmenuItemFactory,
    ParagraphMenuBackgroundColorHeaderActionMenuItemFactory,
    ParagraphMenuBackgroundColorSwatchMenuItemFactories,
    ParagraphMenuColorsSubmenuItemFactory,
    ParagraphMenuIndentDecreaseMenuItemFactory,
    ParagraphMenuIndentIncreaseMenuItemFactory,
    ParagraphMenuInsertBelowHeadingH1MenuItemFactory,
    ParagraphMenuInsertBelowHeadingH2MenuItemFactory,
    ParagraphMenuInsertBelowHeadingH3MenuItemFactory,
    ParagraphMenuInsertBelowHeadingH4MenuItemFactory,
    ParagraphMenuInsertBelowHeadingH5MenuItemFactory,
    ParagraphMenuInsertBelowSubmenuItemFactory,
    ParagraphMenuInsertBelowTableMenuItemFactory,
    ParagraphMenuNoBackgroundMenuItemFactory,
    ParagraphMenuResetTextColorMenuItemFactory,
    ParagraphMenuTextColorHeaderActionMenuItemFactory,
    ParagraphMenuTextColorSwatchMenuItemFactories,
    SubtitleHeadingMenuItemFactory,
    TableBlockCopyMenuItemFactory,
    TableBlockDeleteMenuItemFactory,
    TableBlockPasteMenuItemFactory,
    TitleHeadingMenuItemFactory,
} from './paragraph-menu';

export const floatToolbarMenuSchema: MenuSchemaType = {
    [FLOAT_TOOLBAR_MENU_POSITION]: {
        [FLOAT_TEXT_STYLE_MENU_ID]: {
            order: 0,
            menuItemFactory: FloatTextStyleMenuItemFactory,
        },
    },
};

export const menuSchema: MenuSchemaType = {
    ...floatToolbarMenuSchema,
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
            [ResetInlineFormatTextColorCommand.id]: {
                order: 0,
                menuItemFactory: ResetTextColorMenuItemFactory,
            },
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
        [AlignOperationCommand.id]: {
            order: 2,
            menuItemFactory: AlignMenuItemFactory,
        },
        [OrderListCommand.id]: {
            order: 7,
            menuItemFactory: OrderListMenuItemFactory,
        },
        [BulletListCommand.id]: {
            order: 8,
            menuItemFactory: BulletListMenuItemFactory,
        },
        [OpenHeaderFooterPanelCommand.id]: {
            order: 10,
            menuItemFactory: HeaderFooterMenuItemFactory,
        },
        // [SwitchDocModeCommand.id]: {
        //     order: 11,
        //     menuItemFactory: DocSwitchModeMenuItemFactory,
        // },
        [DocOpenPageSettingCommand.id]: {
            order: 12,
            menuItemFactory: PageSettingMenuItemFactory,
        },
    },
    [RibbonInsertGroup.MEDIA]: {
        [TABLE_MENU_ID]: {
            order: 2,
            menuItemFactory: TableMenuFactory,
            [DocCreateTableOperation.id]: {
                order: 0,
                menuItemFactory: InsertTableMenuFactory,
            },
        },
        [HorizontalLineCommand.id]: {
            order: 3,
            menuItemFactory: HorizontalLineFactory,
        },
        [CheckListCommand.id]: {
            order: 4,
            menuItemFactory: CheckListMenuItemFactory,
        },
    },
    [ContextMenuPosition.MAIN_AREA]: {
        [ContextMenuGroup.QUICK]: ({
            quickLayout: 'tile',
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
        } as MenuSchemaType),
        [ContextMenuGroup.FORMAT]: {
            [DeleteLeftCommand.id]: {
                order: 0,
                menuItemFactory: DeleteMenuFactory,
            },
        },
        [ContextMenuGroup.LAYOUT]: {
            [DocParagraphSettingPanelOperation.id]: {
                order: 0,
                menuItemFactory: ParagraphSettingMenuFactory,
            },
            [DocSectionSettingPanelOperation.id]: {
                order: 1,
                menuItemFactory: SectionSettingMenuFactory,
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
            [TitleHeadingCommand.id]: {
                order: -1,
                menuItemFactory: TitleHeadingMenuItemFactory,
            },
            [SubtitleHeadingCommand.id]: {
                order: -1,
                menuItemFactory: SubtitleHeadingMenuItemFactory,
            },
            [NormalTextHeadingCommand.id]: {
                order: 5,
                menuItemFactory: NormalTextHeadingMenuItemFactory,
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
            [DocParagraphSettingPanelOperation.id]: {
                order: 0,
                menuItemFactory: ParagraphSettingMenuFactory,
            },
            [DocSectionSettingPanelOperation.id]: {
                order: 1,
                menuItemFactory: SectionSettingMenuFactory,
            },
            [INSERT_BELLOW_MENU_ID]: {
                order: 1,
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
                [DocCreateTableOperation.id]: {
                    order: 4,
                    menuItemFactory: InsertDefaultTableMenuFactory,
                },
            },
        },
        [DOC_CONTENT_INSERT_MENU_ID]: {
            [ContextMenuGroup.QUICK]: {
                order: -2,
                quickLayout: 'icon',
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
            },
            [ContextMenuGroup.LAYOUT]: {
                order: 1,
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
                [DocCreateTableOperation.id]: {
                    order: 4,
                    menuItemFactory: InsertDefaultTableMenuFactory,
                },
            },
        },
        [EMPTY_PARAGRAPH_MENU_ID]: {
            [ContextMenuGroup.QUICK]: {
                order: -1,
                quickLayout: 'icon',
                [H1HeadingCommand.id]: {
                    order: 0,
                    menuItemFactory: EmptyParagraphH1MenuItemFactory,
                },
                [H2HeadingCommand.id]: {
                    order: 1,
                    menuItemFactory: EmptyParagraphH2MenuItemFactory,
                },
                [H3HeadingCommand.id]: {
                    order: 2,
                    menuItemFactory: EmptyParagraphH3MenuItemFactory,
                },
                [H4HeadingCommand.id]: {
                    order: 3,
                    menuItemFactory: EmptyParagraphH4MenuItemFactory,
                },
                [H5HeadingCommand.id]: {
                    order: 4,
                    menuItemFactory: EmptyParagraphH5MenuItemFactory,
                },
                [NormalTextHeadingCommand.id]: {
                    order: 5,
                    menuItemFactory: EmptyParagraphNormalTextMenuItemFactory,
                },
            },
            [ContextMenuGroup.LAYOUT]: {
                order: 1,
                [DocParagraphSettingPanelOperation.id]: {
                    order: 0,
                    menuItemFactory: ParagraphSettingMenuFactory,
                },
                [DocSectionSettingPanelOperation.id]: {
                    order: 1,
                    menuItemFactory: SectionSettingMenuFactory,
                },
                [BulletListCommand.id]: {
                    order: 1,
                    menuItemFactory: EmptyParagraphBulletListMenuItemFactory,
                },
                [OrderListCommand.id]: {
                    order: 2,
                    menuItemFactory: EmptyParagraphOrderListMenuItemFactory,
                },
                [CheckListCommand.id]: {
                    order: 3,
                    menuItemFactory: EmptyParagraphCheckListMenuItemFactory,
                },
                [HorizontalLineCommand.id]: {
                    order: 4,
                    menuItemFactory: EmptyParagraphHorizontalLineMenuItemFactory,
                },
                [DocCreateTableOperation.id]: {
                    order: 5,
                    menuItemFactory: InsertDefaultTableMenuFactory,
                },
            },
        },
        [DOC_TABLE_BLOCK_MENU_ID]: {
            [ContextMenuGroup.FORMAT]: {
                [DocCopyCommand.name]: {
                    order: 0,
                    menuItemFactory: TableBlockCopyMenuItemFactory,
                },
                [DocPasteCommand.id]: {
                    order: 1,
                    menuItemFactory: TableBlockPasteMenuItemFactory,
                },
                [DocTableDeleteTableCommand.id]: {
                    order: 2,
                    menuItemFactory: TableBlockDeleteMenuItemFactory,
                },
            },
            [ContextMenuGroup.LAYOUT]: {
                [INSERT_BELLOW_MENU_ID]: {
                    order: 0,
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
                    [DocCreateTableOperation.id]: {
                        order: 4,
                        menuItemFactory: InsertDefaultTableMenuFactory,
                    },
                },
            },
        },
        [DOC_PARAGRAPH_T_INSERT_MENU_ID]: {
            quickTop: {
                order: 0,
                quickLayout: 'icon',
                [H1HeadingCommand.id]: {
                    order: 0,
                    menuItemFactory: EmptyParagraphH1MenuItemFactory,
                },
                [H2HeadingCommand.id]: {
                    order: 1,
                    menuItemFactory: EmptyParagraphH2MenuItemFactory,
                },
                [H3HeadingCommand.id]: {
                    order: 2,
                    menuItemFactory: EmptyParagraphH3MenuItemFactory,
                },
                [H4HeadingCommand.id]: {
                    order: 3,
                    menuItemFactory: EmptyParagraphH4MenuItemFactory,
                },
                [H5HeadingCommand.id]: {
                    order: 4,
                    menuItemFactory: EmptyParagraphH5MenuItemFactory,
                },
                [OrderListCommand.id]: {
                    order: 5,
                    menuItemFactory: EmptyParagraphOrderListMenuItemFactory,
                },
            },
            quickBottom: {
                order: 1,
                quickLayout: 'icon',
                [BulletListCommand.id]: {
                    order: 0,
                    menuItemFactory: EmptyParagraphBulletListMenuItemFactory,
                },
                [CheckListCommand.id]: {
                    order: 1,
                    menuItemFactory: EmptyParagraphCheckListMenuItemFactory,
                },
                [HorizontalLineCommand.id]: {
                    order: 5,
                    menuItemFactory: EmptyParagraphHorizontalLineMenuItemFactory,
                },
            },
            insert: {
                order: 2,
                [DocCreateTableOperation.id]: {
                    order: 0,
                    menuItemFactory: InsertDefaultTableMenuFactory,
                },
            },
        },
        [DOC_PARAGRAPH_T_INSERT_BELOW_MENU_ID]: {
            quickTop: {
                order: 0,
                quickLayout: 'icon',
                [`${DOC_PARAGRAPH_T_INSERT_BELOW_COMMAND_ID}.h1`]: {
                    order: 0,
                    menuItemFactory: ParagraphMenuInsertBelowHeadingH1MenuItemFactory,
                },
                [`${DOC_PARAGRAPH_T_INSERT_BELOW_COMMAND_ID}.h2`]: {
                    order: 1,
                    menuItemFactory: ParagraphMenuInsertBelowHeadingH2MenuItemFactory,
                },
                [`${DOC_PARAGRAPH_T_INSERT_BELOW_COMMAND_ID}.h3`]: {
                    order: 2,
                    menuItemFactory: ParagraphMenuInsertBelowHeadingH3MenuItemFactory,
                },
                [`${DOC_PARAGRAPH_T_INSERT_BELOW_COMMAND_ID}.h4`]: {
                    order: 3,
                    menuItemFactory: ParagraphMenuInsertBelowHeadingH4MenuItemFactory,
                },
                [`${DOC_PARAGRAPH_T_INSERT_BELOW_COMMAND_ID}.h5`]: {
                    order: 4,
                    menuItemFactory: ParagraphMenuInsertBelowHeadingH5MenuItemFactory,
                },
                [InsertOrderListBellowCommand.id]: {
                    order: 5,
                    menuItemFactory: InsertOrderListBellowMenuItemFactory,
                },
            },
            quickBottom: {
                order: 1,
                quickLayout: 'icon',
                [InsertBulletListBellowCommand.id]: {
                    order: 0,
                    menuItemFactory: InsertBulletListBellowMenuItemFactory,
                },
                [InsertCheckListBellowCommand.id]: {
                    order: 1,
                    menuItemFactory: InsertCheckListBellowMenuItemFactory,
                },
                [InsertHorizontalLineBellowCommand.id]: {
                    order: 5,
                    menuItemFactory: InsertHorizontalLineBellowMenuItemFactory,
                },
            },
            insert: {
                order: 2,
                [`${DocCreateTableOperation.id}.below`]: {
                    order: 0,
                    menuItemFactory: ParagraphMenuInsertBelowTableMenuItemFactory,
                },
            },
        },
        [DOC_PARAGRAPH_T_EDIT_MENU_ID]: {
            quickTop: {
                order: 0,
                quickLayout: 'icon',
                [NormalTextHeadingCommand.id]: {
                    order: 0,
                    menuItemFactory: NormalTextHeadingMenuItemFactory,
                },
                [H1HeadingCommand.id]: {
                    order: 1,
                    menuItemFactory: H1HeadingMenuItemFactory,
                },
                [H2HeadingCommand.id]: {
                    order: 2,
                    menuItemFactory: H2HeadingMenuItemFactory,
                },
                [H3HeadingCommand.id]: {
                    order: 3,
                    menuItemFactory: H3HeadingMenuItemFactory,
                },
                [H4HeadingCommand.id]: {
                    order: 4,
                    menuItemFactory: H4HeadingMenuItemFactory,
                },
                [H5HeadingCommand.id]: {
                    order: 5,
                    menuItemFactory: H5HeadingMenuItemFactory,
                },
                [TitleHeadingCommand.id]: {
                    order: 6,
                    menuItemFactory: TitleHeadingMenuItemFactory,
                },
                [SubtitleHeadingCommand.id]: {
                    order: 7,
                    menuItemFactory: SubtitleHeadingMenuItemFactory,
                },
            },
            quickBottom: {
                order: 1,
                quickLayout: 'icon',
                [OrderListCommand.id]: {
                    order: 0,
                    menuItemFactory: OrderListMenuItemFactory,
                },
                [BulletListCommand.id]: {
                    order: 1,
                    menuItemFactory: BulletListMenuItemFactory,
                },
                [CheckListCommand.id]: {
                    order: 2,
                    menuItemFactory: CheckListMenuItemFactory,
                },
            },
            layout: {
                order: 2,
                [DOC_PARAGRAPH_T_ALIGN_MENU_ID]: {
                    order: 0,
                    menuItemFactory: ParagraphMenuAlignSubmenuItemFactory,
                },
                [DOC_PARAGRAPH_T_COLORS_MENU_ID]: {
                    order: 1,
                    menuItemFactory: ParagraphMenuColorsSubmenuItemFactory,
                },
            },
            format: {
                order: 3,
                [DocCutCurrentParagraphCommand.id]: {
                    order: 0,
                    menuItemFactory: CutCurrentParagraphMenuItemFactory,
                },
                [DocCopyCurrentParagraphCommand.id]: {
                    order: 1,
                    menuItemFactory: CopyCurrentParagraphMenuItemFactory,
                },
                [DeleteCurrentParagraphCommand.id]: {
                    order: 2,
                    menuItemFactory: DeleteCurrentParagraphMenuItemFactory,
                },
            },
            others: {
                order: 4,
                [DOC_PARAGRAPH_T_INSERT_BELOW_MENU_ID]: {
                    order: 0,
                    menuItemFactory: ParagraphMenuInsertBelowSubmenuItemFactory,
                },
            },
        },
        [DOC_PARAGRAPH_T_DIVIDER_MENU_ID]: {
            layout: {
                order: 1,
                [DOC_PARAGRAPH_T_COLORS_MENU_ID]: {
                    order: 0,
                    menuItemFactory: ParagraphMenuColorsSubmenuItemFactory,
                },
            },
            format: {
                order: 2,
                [DocCutCurrentParagraphCommand.id]: {
                    order: 0,
                    menuItemFactory: CutCurrentParagraphMenuItemFactory,
                },
                [DocCopyCurrentParagraphCommand.id]: {
                    order: 1,
                    menuItemFactory: CopyCurrentParagraphMenuItemFactory,
                },
                [DeleteCurrentParagraphCommand.id]: {
                    order: 2,
                    menuItemFactory: DeleteCurrentParagraphMenuItemFactory,
                },
            },
            others: {
                order: 3,
                [DOC_PARAGRAPH_T_INSERT_BELOW_MENU_ID]: {
                    order: 0,
                    menuItemFactory: ParagraphMenuInsertBelowSubmenuItemFactory,
                },
            },
        },
        [DOC_PARAGRAPH_T_ALIGN_MENU_ID]: {
            align: {
                order: 0,
                title: 'docs-ui.paragraphMenu.align',
                quickLayout: 'icon',
                [AlignOperationCommand.id]: {
                    order: 0,
                    menuItemFactory: AlignLeftMenuItemFactory,
                },
                [`${AlignOperationCommand.id}.center`]: {
                    order: 1,
                    menuItemFactory: AlignCenterMenuItemFactory,
                },
                [`${AlignOperationCommand.id}.right`]: {
                    order: 2,
                    menuItemFactory: AlignRightMenuItemFactory,
                },
                [`${AlignOperationCommand.id}.justify`]: {
                    order: 3,
                    menuItemFactory: AlignJustifyMenuItemFactory,
                },
            },
            indent: {
                order: 1,
                title: 'docs-ui.paragraphMenu.indent',
                [DOC_PARAGRAPH_T_INDENT_INCREASE_ID]: {
                    order: 0,
                    menuItemFactory: ParagraphMenuIndentIncreaseMenuItemFactory,
                },
                [DOC_PARAGRAPH_T_INDENT_DECREASE_ID]: {
                    order: 1,
                    menuItemFactory: ParagraphMenuIndentDecreaseMenuItemFactory,
                },
            },
        },
        [DOC_PARAGRAPH_T_COLORS_MENU_ID]: {
            text: {
                order: 0,
                title: 'docs-ui.toolbar.textColor.main',
                headerActionMenuItemFactory: ParagraphMenuTextColorHeaderActionMenuItemFactory,
                quickLayout: 'icon',
                quickColumns: 8,
                quickLayoutVariant: 'compact',
                [ResetInlineFormatTextColorCommand.id]: {
                    order: 0,
                    menuItemFactory: ParagraphMenuResetTextColorMenuItemFactory,
                },
                ...ParagraphMenuTextColorSwatchMenuItemFactories,
            },
            backgroundTop: {
                order: 1,
                title: 'docs-ui.toolbar.fillColor.main',
                headerActionMenuItemFactory: ParagraphMenuBackgroundColorHeaderActionMenuItemFactory,
                quickLayout: 'icon',
                quickColumns: 8,
                quickLayoutVariant: 'compact',
                [ResetInlineFormatTextBackgroundColorCommand.id]: {
                    order: 0,
                    menuItemFactory: ParagraphMenuNoBackgroundMenuItemFactory,
                },
                ...Object.fromEntries(
                    Object.entries(ParagraphMenuBackgroundColorSwatchMenuItemFactories).filter(([, config]) => config.order < 7)
                ),
            },
            backgroundBottom: {
                order: 2,
                quickLayout: 'icon',
                quickColumns: 8,
                quickLayoutVariant: 'compact',
                ...Object.fromEntries(
                    Object.entries(ParagraphMenuBackgroundColorSwatchMenuItemFactories).filter(([, config]) => config.order >= 7)
                ),
            },
        },
    },
};

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

import type { IAccessor } from '@univerjs/core';
import type { IMenuButtonItem, IMenuItem, IMenuSelectorItem } from '@univerjs/ui';
import type { LocaleKey } from '../locale/types';
import { ICommandService, NamedStyleType, ThemeService, UniverInstanceType } from '@univerjs/core';
import { SetTextSelectionsOperation } from '@univerjs/docs';
import { getMenuHiddenObservable, MenuItemType } from '@univerjs/ui';
import { Observable } from 'rxjs';
import {
    DocCopyCommand,
    DocCopyCurrentParagraphCommand,
    DocCutCurrentParagraphCommand,
    DocPasteCommand,
} from '../commands/commands/clipboard.command';
import { DeleteCurrentParagraphCommand } from '../commands/commands/doc-delete.command';
import {
    HorizontalLineCommand,
    InsertHorizontalLineBellowCommand,
} from '../commands/commands/doc-horizontal-line.command';
import {
    ResetInlineFormatTextBackgroundColorCommand,
    ResetInlineFormatTextColorCommand,
    SetInlineFormatFontSizeCommand,
    SetInlineFormatTextBackgroundColorCommand,
    SetInlineFormatTextColorCommand,
} from '../commands/commands/inline-format.command';
import {
    BulletListCommand,
    CheckListCommand,
    InsertBulletListBellowCommand,
    InsertCheckListBellowCommand,
    InsertOrderListBellowCommand,
    OrderListCommand,
} from '../commands/commands/list.command';
import {
    H1HeadingCommand,
    H2HeadingCommand,
    H3HeadingCommand,
    H4HeadingCommand,
    H5HeadingCommand,
    NormalTextHeadingCommand,
    SubtitleHeadingCommand,
    TitleHeadingCommand,
} from '../commands/commands/set-heading.command';
import { DocTableDeleteTableCommand } from '../commands/commands/table/doc-table-delete.command';
import { DocCreateTableOperation } from '../commands/operations/doc-create-table.operation';
import { getHighlightBackgroundColor } from '../views/paragraph-menu/theme-color';
import {
    BackgroundColorSelectorMenuItemFactory,
    disableMenuWhenNoDocRange,
    getParagraphStyleAtCursor,
    shouldSuppressDocMenuStateRefresh,
    TextColorSelectorMenuItemFactory,
} from './menu';

export const TEXT_COLORS = ['#FE4B4B', '#FF8C51', '#A4DC16', '#2DAEFF', '#3A60F7', '#9E6DE3', '#F248A6'];
export const TEXT_COLOR_SWATCH_ICONS = [
    'DocParagraphTextColorSwatchIcon.0',
    'DocParagraphTextColorSwatchIcon.1',
    'DocParagraphTextColorSwatchIcon.2',
    'DocParagraphTextColorSwatchIcon.3',
    'DocParagraphTextColorSwatchIcon.4',
    'DocParagraphTextColorSwatchIcon.5',
    'DocParagraphTextColorSwatchIcon.6',
] as const;

export const BACKGROUND_COLOR_SWATCH_ICONS = [
    'DocParagraphBackgroundColorSwatchIcon.0',
    'DocParagraphBackgroundColorSwatchIcon.1',
    'DocParagraphBackgroundColorSwatchIcon.2',
    'DocParagraphBackgroundColorSwatchIcon.3',
    'DocParagraphBackgroundColorSwatchIcon.4',
    'DocParagraphBackgroundColorSwatchIcon.5',
    'DocParagraphBackgroundColorSwatchIcon.6',
    'DocParagraphBackgroundColorSwatchIcon.7',
    'DocParagraphBackgroundColorSwatchIcon.8',
    'DocParagraphBackgroundColorSwatchIcon.9',
    'DocParagraphBackgroundColorSwatchIcon.10',
    'DocParagraphBackgroundColorSwatchIcon.11',
    'DocParagraphBackgroundColorSwatchIcon.12',
    'DocParagraphBackgroundColorSwatchIcon.13',
    'DocParagraphBackgroundColorSwatchIcon.14',
    'DocParagraphBackgroundColorSwatchIcon.15',
] as const;

function getHeadingActivatedObservable(accessor: IAccessor, headingType: NamedStyleType): Observable<boolean> {
    const commandService = accessor.get(ICommandService);

    return new Observable((subscriber) => {
        const DEFAULT_TYPE = NamedStyleType.NORMAL_TEXT;
        const calc = () => {
            if (shouldSuppressDocMenuStateRefresh(accessor)) {
                return;
            }

            const paragraph = getParagraphStyleAtCursor(accessor);
            if (paragraph == null) {
                subscriber.next(DEFAULT_TYPE === headingType);
                return;
            }

            const namedStyleType = paragraph.paragraphStyle?.namedStyleType ?? DEFAULT_TYPE;
            subscriber.next(namedStyleType === headingType);
        };

        const disposable = commandService.onCommandExecuted((c) => {
            const id = c.id;

            if (id === SetTextSelectionsOperation.id || id === SetInlineFormatFontSizeCommand.id) {
                calc();
            }
        });

        calc();
        return disposable.dispose;
    });
}

export function H1HeadingMenuItemFactory(accessor: IAccessor): IMenuItem<LocaleKey> {
    return {
        id: H1HeadingCommand.id,
        type: MenuItemType.BUTTON,
        icon: 'H1Icon',
        title: 'docs-ui.toolbar.heading.leading1',
        tooltip: 'docs-ui.toolbar.heading.leading1',
        disabled$: disableMenuWhenNoDocRange(accessor),
        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_DOC),
        activated$: getHeadingActivatedObservable(accessor, NamedStyleType.HEADING_1),
    };
}

export function H2HeadingMenuItemFactory(accessor: IAccessor): IMenuItem<LocaleKey> {
    return {
        id: H2HeadingCommand.id,
        type: MenuItemType.BUTTON,
        icon: 'H2Icon',
        title: 'docs-ui.toolbar.heading.leading2',
        tooltip: 'docs-ui.toolbar.heading.leading2',
        disabled$: disableMenuWhenNoDocRange(accessor),
        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_DOC),
        activated$: getHeadingActivatedObservable(accessor, NamedStyleType.HEADING_2),
    };
}

export function H3HeadingMenuItemFactory(accessor: IAccessor): IMenuItem<LocaleKey> {
    return {
        id: H3HeadingCommand.id,
        type: MenuItemType.BUTTON,
        icon: 'H3Icon',
        title: 'docs-ui.toolbar.heading.leading3',
        tooltip: 'docs-ui.toolbar.heading.leading3',
        disabled$: disableMenuWhenNoDocRange(accessor),
        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_DOC),
        activated$: getHeadingActivatedObservable(accessor, NamedStyleType.HEADING_3),
    };
}

export function H4HeadingMenuItemFactory(accessor: IAccessor): IMenuItem<LocaleKey> {
    return {
        id: H4HeadingCommand.id,
        type: MenuItemType.BUTTON,
        icon: 'H4Icon',
        title: 'docs-ui.toolbar.heading.leading4',
        tooltip: 'docs-ui.toolbar.heading.leading4',
        disabled$: disableMenuWhenNoDocRange(accessor),
        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_DOC),
        activated$: getHeadingActivatedObservable(accessor, NamedStyleType.HEADING_4),
    };
}

export function H5HeadingMenuItemFactory(accessor: IAccessor): IMenuItem<LocaleKey> {
    return {
        id: H5HeadingCommand.id,
        type: MenuItemType.BUTTON,
        icon: 'H5Icon',
        title: 'docs-ui.toolbar.heading.leading5',
        tooltip: 'docs-ui.toolbar.heading.leading5',
        disabled$: disableMenuWhenNoDocRange(accessor),
        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_DOC),
        activated$: getHeadingActivatedObservable(accessor, NamedStyleType.HEADING_5),
    };
}

export function NormalTextHeadingMenuItemFactory(accessor: IAccessor): IMenuItem<LocaleKey> {
    return {
        id: NormalTextHeadingCommand.id,
        type: MenuItemType.BUTTON,
        icon: 'TextTypeIcon',
        title: 'docs-ui.toolbar.heading.normal',
        tooltip: 'docs-ui.toolbar.heading.normal',
        disabled$: disableMenuWhenNoDocRange(accessor),
        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_DOC),
        activated$: getHeadingActivatedObservable(accessor, NamedStyleType.NORMAL_TEXT),
    };
}

export function TitleHeadingMenuItemFactory(accessor: IAccessor): IMenuItem<LocaleKey> {
    return {
        id: TitleHeadingCommand.id,
        type: MenuItemType.BUTTON,
        icon: 'TitleTypeIcon',
        title: 'docs-ui.toolbar.heading.title',
        tooltip: 'docs-ui.toolbar.heading.title',
        disabled$: disableMenuWhenNoDocRange(accessor),
        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_DOC),
        activated$: getHeadingActivatedObservable(accessor, NamedStyleType.TITLE),
    };
}

export function SubtitleHeadingMenuItemFactory(accessor: IAccessor): IMenuItem<LocaleKey> {
    return {
        id: SubtitleHeadingCommand.id,
        type: MenuItemType.BUTTON,
        icon: 'SubtitleTypeIcon',
        title: 'docs-ui.toolbar.heading.subTitle',
        tooltip: 'docs-ui.toolbar.heading.subTitle',
        disabled$: disableMenuWhenNoDocRange(accessor),
        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_DOC),
        activated$: getHeadingActivatedObservable(accessor, NamedStyleType.SUBTITLE),
    };
}

export const EMPTY_PARAGRAPH_MENU_ID = 'doc.menu.empty-paragraph';
export function EmptyParagraphH1MenuItemFactory(): IMenuButtonItem<LocaleKey> {
    return {
        id: H1HeadingCommand.id,
        type: MenuItemType.BUTTON,
        icon: 'H1Icon',
        title: 'docs-ui.toolbar.heading.leading1',
        tooltip: 'docs-ui.toolbar.heading.leading1',
    };
}

export function EmptyParagraphH2MenuItemFactory(): IMenuButtonItem<LocaleKey> {
    return {
        id: H2HeadingCommand.id,
        type: MenuItemType.BUTTON,
        icon: 'H2Icon',
        title: 'docs-ui.toolbar.heading.leading2',
        tooltip: 'docs-ui.toolbar.heading.leading2',
    };
}

export function EmptyParagraphH3MenuItemFactory(): IMenuButtonItem<LocaleKey> {
    return {
        id: H3HeadingCommand.id,
        type: MenuItemType.BUTTON,
        icon: 'H3Icon',
        title: 'docs-ui.toolbar.heading.leading3',
        tooltip: 'docs-ui.toolbar.heading.leading3',
    };
}

export function EmptyParagraphH4MenuItemFactory(): IMenuButtonItem<LocaleKey> {
    return {
        id: H4HeadingCommand.id,
        type: MenuItemType.BUTTON,
        icon: 'H4Icon',
        title: 'docs-ui.toolbar.heading.leading4',
        tooltip: 'docs-ui.toolbar.heading.leading4',
    };
}

export function EmptyParagraphH5MenuItemFactory(): IMenuButtonItem<LocaleKey> {
    return {
        id: H5HeadingCommand.id,
        type: MenuItemType.BUTTON,
        icon: 'H5Icon',
        title: 'docs-ui.toolbar.heading.leading5',
        tooltip: 'docs-ui.toolbar.heading.leading5',
    };
}

export function EmptyParagraphNormalTextMenuItemFactory(): IMenuButtonItem<LocaleKey> {
    return {
        id: NormalTextHeadingCommand.id,
        type: MenuItemType.BUTTON,
        icon: 'TextTypeIcon',
        title: 'docs-ui.toolbar.heading.normal',
        tooltip: 'docs-ui.toolbar.heading.normal',
    };
}

export function EmptyParagraphOrderListMenuItemFactory(): IMenuButtonItem<LocaleKey> {
    return {
        id: OrderListCommand.id,
        type: MenuItemType.BUTTON,
        icon: 'OrderIcon',
        title: 'docs-ui.rightClick.orderList',
        tooltip: 'docs-ui.rightClick.orderList',
    };
}

export function EmptyParagraphBulletListMenuItemFactory(): IMenuButtonItem<LocaleKey> {
    return {
        id: BulletListCommand.id,
        type: MenuItemType.BUTTON,
        icon: 'UnorderIcon',
        title: 'docs-ui.rightClick.bulletList',
        tooltip: 'docs-ui.rightClick.bulletList',
    };
}

export function EmptyParagraphCheckListMenuItemFactory(): IMenuButtonItem<LocaleKey> {
    return {
        id: CheckListCommand.id,
        type: MenuItemType.BUTTON,
        icon: 'TodoListDoubleIcon',
        title: 'docs-ui.rightClick.checkList',
        tooltip: 'docs-ui.rightClick.checkList',
    };
}

export function EmptyParagraphHorizontalLineMenuItemFactory(): IMenuButtonItem<LocaleKey> {
    return {
        id: HorizontalLineCommand.id,
        type: MenuItemType.BUTTON,
        icon: 'ReduceIcon',
        title: 'docs-ui.toolbar.horizontalLine',
        tooltip: 'docs-ui.toolbar.horizontalLine',
    };
}

export function CopyCurrentParagraphMenuItemFactory(): IMenuItem<LocaleKey> {
    return {
        id: DocCopyCurrentParagraphCommand.id,
        type: MenuItemType.BUTTON,
        icon: 'CopyDoubleIcon',
        title: 'docs-ui.rightClick.copy',
    };
}

export function CutCurrentParagraphMenuItemFactory(): IMenuItem<LocaleKey> {
    return {
        id: DocCutCurrentParagraphCommand.id,
        type: MenuItemType.BUTTON,
        icon: 'CutIcon',
        title: 'docs-ui.rightClick.cut',
    };
}

export function DeleteCurrentParagraphMenuItemFactory(): IMenuItem<LocaleKey> {
    return {
        id: DeleteCurrentParagraphCommand.id,
        type: MenuItemType.BUTTON,
        icon: 'DeleteIcon',
        title: 'docs-ui.rightClick.delete',
    };
}

export function InsertBulletListBellowMenuItemFactory(): IMenuItem<LocaleKey> {
    return {
        id: InsertBulletListBellowCommand.id,
        type: MenuItemType.BUTTON,
        icon: 'UnorderIcon',
        title: 'docs-ui.rightClick.bulletList',
        tooltip: 'docs-ui.rightClick.bulletList',
    };
}

export function InsertOrderListBellowMenuItemFactory(): IMenuItem<LocaleKey> {
    return {
        id: InsertOrderListBellowCommand.id,
        type: MenuItemType.BUTTON,
        icon: 'OrderIcon',
        title: 'docs-ui.rightClick.orderList',
        tooltip: 'docs-ui.rightClick.orderList',
    };
}

export function InsertCheckListBellowMenuItemFactory(): IMenuItem<LocaleKey> {
    return {
        id: InsertCheckListBellowCommand.id,
        type: MenuItemType.BUTTON,
        icon: 'TodoListDoubleIcon',
        title: 'docs-ui.rightClick.checkList',
        tooltip: 'docs-ui.rightClick.checkList',
    };
}

export function InsertHorizontalLineBellowMenuItemFactory(): IMenuItem<LocaleKey> {
    return {
        id: InsertHorizontalLineBellowCommand.id,
        type: MenuItemType.BUTTON,
        icon: 'ReduceIcon',
        title: 'docs-ui.toolbar.horizontalLine',
        tooltip: 'docs-ui.toolbar.horizontalLine',
    };
}

export const INSERT_BELLOW_MENU_ID = 'doc.menu.insert-bellow';
export const DOC_CONTENT_INSERT_MENU_ID = 'doc.menu.content-insert';
export const DOC_TABLE_BLOCK_MENU_ID = 'doc.menu.table-block';
export const DOC_PARAGRAPH_T_INSERT_MENU_ID = 'doc.menu.paragraph-t.insert';
export const DOC_PARAGRAPH_T_EDIT_MENU_ID = 'doc.menu.paragraph-t.edit';
export const DOC_PARAGRAPH_T_DIVIDER_MENU_ID = 'doc.menu.paragraph-t.divider';
export const DOC_PARAGRAPH_T_ALIGN_MENU_ID = 'doc.menu.paragraph-t.align';
export const DOC_PARAGRAPH_T_COLORS_MENU_ID = 'doc.menu.paragraph-t.colors';
export const DOC_PARAGRAPH_T_INSERT_BELOW_MENU_ID = 'doc.menu.paragraph-t.insert-below';
export const DOC_PARAGRAPH_T_RESET_COLORS_ID = 'doc.menu.paragraph-t.reset-colors';
export const DOC_PARAGRAPH_T_INDENT_INCREASE_ID = 'doc.menu.paragraph-t.indent.increase';
export const DOC_PARAGRAPH_T_INDENT_DECREASE_ID = 'doc.menu.paragraph-t.indent.decrease';
export const DOC_PARAGRAPH_T_INSERT_BELOW_COMMAND_ID = 'doc.menu.paragraph-t.insert-below.command';

export function getDocBlockRangeMenuId(blockType: string): string {
    return `doc.block-range.${blockType}.menu`;
}

export function TableBlockCopyMenuItemFactory(): IMenuItem<LocaleKey> {
    return {
        id: DocCopyCommand.name,
        commandId: DocCopyCommand.id,
        type: MenuItemType.BUTTON,
        icon: 'CopyDoubleIcon',
        title: 'docs-ui.rightClick.copy',
    };
}

export function TableBlockPasteMenuItemFactory(): IMenuItem<LocaleKey> {
    return {
        id: DocPasteCommand.id,
        type: MenuItemType.BUTTON,
        icon: 'PasteSpecialDoubleIcon',
        title: 'docs-ui.rightClick.paste',
    };
}

export function TableBlockDeleteMenuItemFactory(): IMenuItem<LocaleKey> {
    return {
        id: DocTableDeleteTableCommand.id,
        type: MenuItemType.BUTTON,
        icon: 'DeleteIcon',
        title: 'docs-ui.rightClick.delete',
    };
}

export function DocInsertBellowMenuItemFactory(): IMenuSelectorItem<LocaleKey> {
    return {
        id: INSERT_BELLOW_MENU_ID,
        type: MenuItemType.SUBITEMS,
        title: 'docs-ui.rightClick.insertBellow',
    };
}

export function ParagraphMenuAlignSubmenuItemFactory(accessor: IAccessor): IMenuSelectorItem<LocaleKey> {
    return {
        id: DOC_PARAGRAPH_T_ALIGN_MENU_ID,
        type: MenuItemType.SUBITEMS,
        icon: 'LeftJustifyingIcon',
        title: 'docs-ui.paragraphMenu.alignAndIndent',
        tooltip: 'docs-ui.paragraphMenu.alignAndIndent',
        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_DOC),
    };
}

export function ParagraphMenuColorsSubmenuItemFactory(accessor: IAccessor): IMenuSelectorItem<LocaleKey> {
    return {
        id: DOC_PARAGRAPH_T_COLORS_MENU_ID,
        type: MenuItemType.SUBITEMS,
        icon: 'PaintBucketDoubleIcon',
        title: 'docs-ui.paragraphMenu.color',
        tooltip: 'docs-ui.paragraphMenu.color',
        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_DOC),
    };
}

export function ParagraphMenuTextColorHeaderActionMenuItemFactory(accessor: IAccessor): IMenuItem<LocaleKey> {
    const baseItem = TextColorSelectorMenuItemFactory(accessor);

    return {
        ...baseItem,
        icon: 'HeaderTextColorIcon',
        tooltip: undefined,
        title: undefined,
    };
}

export function ParagraphMenuBackgroundColorHeaderActionMenuItemFactory(accessor: IAccessor): IMenuItem<LocaleKey> {
    const baseItem = BackgroundColorSelectorMenuItemFactory(accessor);

    return {
        ...baseItem,
        icon: 'PaintBucketDoubleIcon',
        tooltip: undefined,
        title: undefined,
    };
}

export function ParagraphMenuInsertBelowSubmenuItemFactory(accessor: IAccessor): IMenuSelectorItem<LocaleKey> {
    return {
        id: DOC_PARAGRAPH_T_INSERT_BELOW_MENU_ID,
        type: MenuItemType.SUBITEMS,
        icon: 'TextTypeIcon',
        title: 'docs-ui.rightClick.insertBellow',
        tooltip: 'docs-ui.rightClick.insertBellow',
        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_DOC),
    };
}

export function ParagraphMenuInsertBelowHeadingH1MenuItemFactory(accessor: IAccessor): IMenuButtonItem<LocaleKey> {
    return {
        id: `${DOC_PARAGRAPH_T_INSERT_BELOW_COMMAND_ID}.h1`,
        commandId: DOC_PARAGRAPH_T_INSERT_BELOW_COMMAND_ID,
        type: MenuItemType.BUTTON,
        icon: 'H1Icon',
        title: 'docs-ui.toolbar.heading.leading1',
        tooltip: 'docs-ui.toolbar.heading.leading1',
        params: { commandId: H1HeadingCommand.id, paragraphMenuInsertMode: 'breakline' },
        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_DOC),
    };
}

export function ParagraphMenuInsertBelowHeadingH2MenuItemFactory(accessor: IAccessor): IMenuButtonItem<LocaleKey> {
    return {
        id: `${DOC_PARAGRAPH_T_INSERT_BELOW_COMMAND_ID}.h2`,
        commandId: DOC_PARAGRAPH_T_INSERT_BELOW_COMMAND_ID,
        type: MenuItemType.BUTTON,
        icon: 'H2Icon',
        title: 'docs-ui.toolbar.heading.leading2',
        tooltip: 'docs-ui.toolbar.heading.leading2',
        params: { commandId: H2HeadingCommand.id, paragraphMenuInsertMode: 'breakline' },
        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_DOC),
    };
}

export function ParagraphMenuInsertBelowHeadingH3MenuItemFactory(accessor: IAccessor): IMenuButtonItem<LocaleKey> {
    return {
        id: `${DOC_PARAGRAPH_T_INSERT_BELOW_COMMAND_ID}.h3`,
        commandId: DOC_PARAGRAPH_T_INSERT_BELOW_COMMAND_ID,
        type: MenuItemType.BUTTON,
        icon: 'H3Icon',
        title: 'docs-ui.toolbar.heading.leading3',
        tooltip: 'docs-ui.toolbar.heading.leading3',
        params: { commandId: H3HeadingCommand.id, paragraphMenuInsertMode: 'breakline' },
        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_DOC),
    };
}

export function ParagraphMenuInsertBelowHeadingH4MenuItemFactory(accessor: IAccessor): IMenuButtonItem<LocaleKey> {
    return {
        id: `${DOC_PARAGRAPH_T_INSERT_BELOW_COMMAND_ID}.h4`,
        commandId: DOC_PARAGRAPH_T_INSERT_BELOW_COMMAND_ID,
        type: MenuItemType.BUTTON,
        icon: 'H4Icon',
        title: 'docs-ui.toolbar.heading.leading4',
        tooltip: 'docs-ui.toolbar.heading.leading4',
        params: { commandId: H4HeadingCommand.id, paragraphMenuInsertMode: 'breakline' },
        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_DOC),
    };
}

export function ParagraphMenuInsertBelowHeadingH5MenuItemFactory(accessor: IAccessor): IMenuButtonItem<LocaleKey> {
    return {
        id: `${DOC_PARAGRAPH_T_INSERT_BELOW_COMMAND_ID}.h5`,
        commandId: DOC_PARAGRAPH_T_INSERT_BELOW_COMMAND_ID,
        type: MenuItemType.BUTTON,
        icon: 'H5Icon',
        title: 'docs-ui.toolbar.heading.leading5',
        tooltip: 'docs-ui.toolbar.heading.leading5',
        params: { commandId: H5HeadingCommand.id, paragraphMenuInsertMode: 'breakline' },
        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_DOC),
    };
}

export function ParagraphMenuInsertBelowTableMenuItemFactory(accessor: IAccessor): IMenuButtonItem<LocaleKey> {
    return {
        id: `${DocCreateTableOperation.id}.below`,
        commandId: DocCreateTableOperation.id,
        type: MenuItemType.BUTTON,
        icon: 'GridIcon',
        title: 'docs-ui.toolbar.table.insert',
        tooltip: 'docs-ui.toolbar.table.insert',
        params: { rowCount: 3, colCount: 5 },
        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_DOC),
    };
}

export function ParagraphMenuIndentIncreaseMenuItemFactory(accessor: IAccessor): IMenuButtonItem<LocaleKey> {
    return {
        id: DOC_PARAGRAPH_T_INDENT_INCREASE_ID,
        type: MenuItemType.BUTTON,
        icon: 'LineIndentIncreaseIcon',
        title: 'docs-ui.paragraphMenu.increase',
        tooltip: 'docs-ui.paragraphMenu.increaseIndent',
        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_DOC),
    };
}

export function ParagraphMenuIndentDecreaseMenuItemFactory(accessor: IAccessor): IMenuButtonItem<LocaleKey> {
    return {
        id: DOC_PARAGRAPH_T_INDENT_DECREASE_ID,
        type: MenuItemType.BUTTON,
        icon: 'LineIndentDecreaseIcon',
        title: 'docs-ui.paragraphMenu.decrease',
        tooltip: 'docs-ui.paragraphMenu.decreaseIndent',
        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_DOC),
    };
}

export function ParagraphMenuDefaultTextColorMenuItemFactory(accessor: IAccessor): IMenuButtonItem<LocaleKey> {
    return {
        id: `${SetInlineFormatTextColorCommand.id}.default`,
        commandId: SetInlineFormatTextColorCommand.id,
        type: MenuItemType.BUTTON,
        icon: 'DefaultTextColorIcon',
        title: 'docs-ui.paragraphMenu.defaultTextColor',
        params: { value: '#000000' },
        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_DOC),
    };
}

export function ParagraphMenuNoBackgroundMenuItemFactory(accessor: IAccessor): IMenuButtonItem<LocaleKey> {
    return {
        id: ResetInlineFormatTextBackgroundColorCommand.id,
        type: MenuItemType.BUTTON,
        icon: 'NoColorDoubleIcon',
        title: 'docs-ui.paragraphMenu.noBackground',
        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_DOC),
    };
}

export function ParagraphMenuResetTextColorMenuItemFactory(accessor: IAccessor): IMenuButtonItem<LocaleKey> {
    return {
        id: ResetInlineFormatTextColorCommand.id,
        type: MenuItemType.BUTTON,
        icon: 'NoColorDoubleIcon',
        title: 'docs-ui.toolbar.resetColor',
        tooltip: 'docs-ui.toolbar.resetColor',
        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_DOC),
    };
}

export function ParagraphMenuResetColorsMenuItemFactory(accessor: IAccessor): IMenuButtonItem<LocaleKey> {
    return {
        id: DOC_PARAGRAPH_T_RESET_COLORS_ID,
        type: MenuItemType.BUTTON,
        icon: 'PaintBucketDoubleIcon',
        title: 'docs-ui.toolbar.resetColor',
        tooltip: 'docs-ui.toolbar.resetColor',
        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_DOC),
    };
}

export const ParagraphMenuTextColorSwatchMenuItemFactories = TEXT_COLORS.reduce<Record<string, { order: number; menuItemFactory: (accessor: IAccessor) => IMenuButtonItem<LocaleKey> }>>((items, color, index) => {
    const id = `doc.menu.paragraph-t.text-color.${index}`;
    items[id] = {
        order: index,
        menuItemFactory: (accessor: IAccessor): IMenuButtonItem<LocaleKey> => ({
            id,
            commandId: SetInlineFormatTextColorCommand.id,
            type: MenuItemType.BUTTON,
            icon: TEXT_COLOR_SWATCH_ICONS[index],
            params: {
                value: color,
            },
            hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_DOC),
        }),
    };
    return items;
}, {});

export const ParagraphMenuBackgroundColorSwatchMenuItemFactories = BACKGROUND_COLOR_SWATCH_ICONS.reduce<Record<string, { order: number; menuItemFactory: (accessor: IAccessor) => IMenuButtonItem<LocaleKey> }>>((items, icon, index) => {
    const id = `doc.menu.paragraph-t.background-color.${index}`;
    items[id] = {
        order: index,
        menuItemFactory: (accessor: IAccessor): IMenuButtonItem<LocaleKey> => {
            const themeService = accessor.get(ThemeService);
            const color = getHighlightBackgroundColor(themeService, index);

            return {
                id,
                commandId: SetInlineFormatTextBackgroundColorCommand.id,
                type: MenuItemType.BUTTON,
                icon,
                params: {
                    value: color,
                },
                hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_DOC),
            };
        },
    };
    return items;
}, {});

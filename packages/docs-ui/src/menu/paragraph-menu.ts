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

import type { IAccessor, ICommand } from '@univerjs/core';
import type { IMenuButtonItem, IMenuItem, IMenuSelectorItem } from '@univerjs/ui';
import type { ComponentType } from 'react';
import { ICommandService, NamedStyleType, UniverInstanceType } from '@univerjs/core';
import { SetTextSelectionsOperation } from '@univerjs/docs';
import { H1Icon, H2Icon, H3Icon, H4Icon, H5Icon, TextTypeIcon } from '@univerjs/icons';
import { ComponentManager, getMenuHiddenObservable, MenuItemType } from '@univerjs/ui';
import { createElement } from 'react';
import { Observable } from 'rxjs';
import { DocCopyCommand, DocCopyCurrentParagraphCommand, DocCutCurrentParagraphCommand, DocPasteCommand } from '../commands/commands/clipboard.command';
import { DeleteCurrentParagraphCommand } from '../commands/commands/doc-delete.command';
import { HorizontalLineCommand, InsertHorizontalLineBellowCommand } from '../commands/commands/doc-horizontal-line.command';
import { SetInlineFormatFontSizeCommand } from '../commands/commands/inline-format.command';
import { BulletListCommand, CheckListCommand, InsertBulletListBellowCommand, InsertCheckListBellowCommand, InsertOrderListBellowCommand, OrderListCommand } from '../commands/commands/list.command';
import { H1HeadingCommand, H2HeadingCommand, H3HeadingCommand, H4HeadingCommand, H5HeadingCommand, NormalTextHeadingCommand, SubtitleHeadingCommand, TitleHeadingCommand } from '../commands/commands/set-heading.command';
import { DocTableDeleteTableCommand } from '../commands/commands/table/doc-table-delete.command';
import { disableMenuWhenNoDocRange, getParagraphStyleAtCursor } from './menu';

const HEADING_MAP: Record<NamedStyleType, ICommand> = {
    [NamedStyleType.HEADING_1]: H1HeadingCommand,
    [NamedStyleType.HEADING_2]: H2HeadingCommand,
    [NamedStyleType.HEADING_3]: H3HeadingCommand,
    [NamedStyleType.HEADING_4]: H4HeadingCommand,
    [NamedStyleType.HEADING_5]: H5HeadingCommand,
    [NamedStyleType.NORMAL_TEXT]: NormalTextHeadingCommand,
    [NamedStyleType.TITLE]: TitleHeadingCommand,
    [NamedStyleType.SUBTITLE]: SubtitleHeadingCommand,
    [NamedStyleType.NAMED_STYLE_TYPE_UNSPECIFIED]: NormalTextHeadingCommand,
};

const HEADING_TITLE_MAP: Partial<Record<NamedStyleType, string>> = {
    [NamedStyleType.HEADING_1]: 'toolbar.heading.1',
    [NamedStyleType.HEADING_2]: 'toolbar.heading.2',
    [NamedStyleType.HEADING_3]: 'toolbar.heading.3',
    [NamedStyleType.HEADING_4]: 'toolbar.heading.4',
    [NamedStyleType.HEADING_5]: 'toolbar.heading.5',
    [NamedStyleType.NORMAL_TEXT]: 'toolbar.heading.normal',
    [NamedStyleType.TITLE]: 'toolbar.heading.title',
    [NamedStyleType.SUBTITLE]: 'toolbar.heading.subTitle',
};

function TitleTypeIcon({ className }: { className: string }) {
    return createElement(
        'svg',
        {
            className,
            viewBox: '0 0 24 24',
            fill: 'currentColor',
            'aria-hidden': true,
        },
        createElement('text', {
            x: 2,
            y: 19,
            fontFamily: 'Arial, sans-serif',
            fontSize: 19,
            fontWeight: 500,
        }, 'T'),
        createElement('text', {
            x: 15,
            y: 19,
            fontFamily: 'Arial, sans-serif',
            fontSize: 13,
            fontWeight: 500,
        }, 't')
    );
}

function SubtitleTypeIcon({ className }: { className: string }) {
    return createElement(
        'svg',
        {
            className,
            viewBox: '0 0 24 24',
            fill: 'currentColor',
            'aria-hidden': true,
        },
        createElement('text', {
            x: 5,
            y: 19,
            fontFamily: 'Arial, sans-serif',
            fontSize: 19,
            fontWeight: 500,
        }, 'S')
    );
}

export const HEADING_ICON_MAP: Record<NamedStyleType, { key: string; component: ComponentType<{ className: string }> }> = {
    [NamedStyleType.HEADING_1]: { key: 'H1Icon', component: H1Icon },
    [NamedStyleType.HEADING_2]: { key: 'H2Icon', component: H2Icon },
    [NamedStyleType.HEADING_3]: { key: 'H3Icon', component: H3Icon },
    [NamedStyleType.HEADING_4]: { key: 'H4Icon', component: H4Icon },
    [NamedStyleType.HEADING_5]: { key: 'H5Icon', component: H5Icon },
    [NamedStyleType.NORMAL_TEXT]: { key: 'TextTypeIcon', component: TextTypeIcon },
    [NamedStyleType.TITLE]: { key: 'TitleTypeIcon', component: TitleTypeIcon },
    [NamedStyleType.SUBTITLE]: { key: 'SubtitleTypeIcon', component: SubtitleTypeIcon },
    [NamedStyleType.NAMED_STYLE_TYPE_UNSPECIFIED]: { key: 'TextTypeIcon', component: TextTypeIcon },
};

export function shouldShowParagraphHeadingOption(headingType: NamedStyleType, currentType = NamedStyleType.NORMAL_TEXT): boolean {
    if (headingType === NamedStyleType.HEADING_5) {
        return currentType !== NamedStyleType.TITLE && currentType !== NamedStyleType.SUBTITLE;
    }

    if (headingType === NamedStyleType.TITLE) {
        return currentType === NamedStyleType.TITLE;
    }

    if (headingType === NamedStyleType.SUBTITLE) {
        return currentType === NamedStyleType.SUBTITLE;
    }

    return true;
}

const createHeadingSelectorMenuItemFactory = (headingType: NamedStyleType) => (accessor: IAccessor): IMenuItem => {
    const commandService = accessor.get(ICommandService);
    const componentManager = accessor.get(ComponentManager);
    const icon = HEADING_ICON_MAP[headingType];
    if (!componentManager.get(icon.key)) {
        componentManager.register(icon.key, icon.component);
    }

    return {
        id: HEADING_MAP[headingType]!.id,
        type: MenuItemType.BUTTON,
        icon: icon.key,
        title: HEADING_TITLE_MAP[headingType],
        tooltip: 'docs-ui.toolbar.heading.tooltip',
        disabled$: disableMenuWhenNoDocRange(accessor),
        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_DOC),
        activated$: new Observable((subscriber) => {
            const DEFAULT_TYPE = NamedStyleType.NORMAL_TEXT;
            const calc = () => {
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
        }),
    };
};

export const H1HeadingMenuItemFactory = createHeadingSelectorMenuItemFactory(NamedStyleType.HEADING_1);
export const H2HeadingMenuItemFactory = createHeadingSelectorMenuItemFactory(NamedStyleType.HEADING_2);
export const H3HeadingMenuItemFactory = createHeadingSelectorMenuItemFactory(NamedStyleType.HEADING_3);
export const H4HeadingMenuItemFactory = createHeadingSelectorMenuItemFactory(NamedStyleType.HEADING_4);
export const H5HeadingMenuItemFactory = createHeadingSelectorMenuItemFactory(NamedStyleType.HEADING_5);
export const NormalTextHeadingMenuItemFactory = createHeadingSelectorMenuItemFactory(NamedStyleType.NORMAL_TEXT);
export const TitleHeadingMenuItemFactory = createHeadingSelectorMenuItemFactory(NamedStyleType.TITLE);
export const SubtitleHeadingMenuItemFactory = createHeadingSelectorMenuItemFactory(NamedStyleType.SUBTITLE);

const createEmptyParagraphButtonFactory = (
    command: ICommand,
    icon: string,
    title: string
) => (accessor: IAccessor): IMenuButtonItem => {
    const componentManager = accessor.get(ComponentManager);
    const headingIcon = Object.values(HEADING_ICON_MAP).find((item) => item.key === icon);
    if (headingIcon && !componentManager.get(headingIcon.key)) {
        componentManager.register(headingIcon.key, headingIcon.component);
    }

    return {
        id: command.id,
        type: MenuItemType.BUTTON,
        icon,
        title,
    };
};

export const EMPTY_PARAGRAPH_MENU_ID = 'doc.menu.empty-paragraph';
export const EmptyParagraphH1MenuItemFactory = createEmptyParagraphButtonFactory(H1HeadingCommand, 'H1Icon', 'toolbar.heading.1');
export const EmptyParagraphH2MenuItemFactory = createEmptyParagraphButtonFactory(H2HeadingCommand, 'H2Icon', 'toolbar.heading.2');
export const EmptyParagraphH3MenuItemFactory = createEmptyParagraphButtonFactory(H3HeadingCommand, 'H3Icon', 'toolbar.heading.3');
export const EmptyParagraphH4MenuItemFactory = createEmptyParagraphButtonFactory(H4HeadingCommand, 'H4Icon', 'toolbar.heading.4');
export const EmptyParagraphH5MenuItemFactory = createEmptyParagraphButtonFactory(H5HeadingCommand, 'H5Icon', 'toolbar.heading.5');
export const EmptyParagraphNormalTextMenuItemFactory = createEmptyParagraphButtonFactory(NormalTextHeadingCommand, 'TextTypeIcon', 'toolbar.heading.normal');
export const EmptyParagraphOrderListMenuItemFactory = createEmptyParagraphButtonFactory(OrderListCommand, 'OrderIcon', 'rightClick.orderList');
export const EmptyParagraphBulletListMenuItemFactory = createEmptyParagraphButtonFactory(BulletListCommand, 'UnorderIcon', 'rightClick.bulletList');
export const EmptyParagraphCheckListMenuItemFactory = createEmptyParagraphButtonFactory(CheckListCommand, 'TodoListDoubleIcon', 'rightClick.checkList');
export const EmptyParagraphHorizontalLineMenuItemFactory = createEmptyParagraphButtonFactory(HorizontalLineCommand, 'ReduceIcon', 'toolbar.horizontalLine');

export const CopyCurrentParagraphMenuItemFactory = (accessor: IAccessor): IMenuItem => {
    return {
        id: DocCopyCurrentParagraphCommand.id,
        type: MenuItemType.BUTTON,
        icon: 'CopyDoubleIcon',
        title: 'docs-ui.rightClick.copy',
    };
};

export const CutCurrentParagraphMenuItemFactory = (accessor: IAccessor): IMenuItem => {
    return {
        id: DocCutCurrentParagraphCommand.id,
        type: MenuItemType.BUTTON,
        icon: 'CutIcon',
        title: 'docs-ui.rightClick.cut',
    };
};

export const DeleteCurrentParagraphMenuItemFactory = (accessor: IAccessor): IMenuItem => {
    return {
        id: DeleteCurrentParagraphCommand.id,
        type: MenuItemType.BUTTON,
        icon: 'DeleteIcon',
        title: 'docs-ui.rightClick.delete',
    };
};

export const InsertBulletListBellowMenuItemFactory = (accessor: IAccessor): IMenuItem => {
    return {
        id: InsertBulletListBellowCommand.id,
        type: MenuItemType.BUTTON,
        icon: 'UnorderIcon',
        title: 'docs-ui.rightClick.bulletList',
    };
};

export const InsertOrderListBellowMenuItemFactory = (accessor: IAccessor): IMenuItem => {
    return {
        id: InsertOrderListBellowCommand.id,
        type: MenuItemType.BUTTON,
        icon: 'OrderIcon',
        title: 'docs-ui.rightClick.orderList',
    };
};

export const InsertCheckListBellowMenuItemFactory = (accessor: IAccessor): IMenuItem => {
    return {
        id: InsertCheckListBellowCommand.id,
        type: MenuItemType.BUTTON,
        icon: 'TodoListDoubleIcon',
        title: 'docs-ui.rightClick.checkList',
    };
};

export const InsertHorizontalLineBellowMenuItemFactory = (accessor: IAccessor): IMenuItem => {
    return {
        id: InsertHorizontalLineBellowCommand.id,
        type: MenuItemType.BUTTON,
        icon: 'ReduceIcon',
        title: 'docs-ui.toolbar.horizontalLine',
    };
};

export const INSERT_BELLOW_MENU_ID = 'doc.menu.insert-bellow';
export const DOC_CONTENT_INSERT_MENU_ID = 'doc.menu.content-insert';
export const DOC_TABLE_BLOCK_MENU_ID = 'doc.menu.table-block';

export function getDocBlockRangeMenuId(blockType: string): string {
    return `doc.block-range.${blockType}.menu`;
}

export const TableBlockCopyMenuItemFactory = (accessor: IAccessor): IMenuItem => {
    return {
        id: DocCopyCommand.name,
        commandId: DocCopyCommand.id,
        type: MenuItemType.BUTTON,
        icon: 'CopyDoubleIcon',
        title: 'rightClick.copy',
    };
};

export const TableBlockPasteMenuItemFactory = (accessor: IAccessor): IMenuItem => {
    return {
        id: DocPasteCommand.id,
        type: MenuItemType.BUTTON,
        icon: 'PasteSpecialDoubleIcon',
        title: 'rightClick.paste',
    };
};

export const TableBlockDeleteMenuItemFactory = (accessor: IAccessor): IMenuItem => {
    return {
        id: DocTableDeleteTableCommand.id,
        type: MenuItemType.BUTTON,
        icon: 'DeleteIcon',
        title: 'rightClick.delete',
    };
};

export function DocInsertBellowMenuItemFactory(accessor: IAccessor): IMenuSelectorItem<string> {
    return {
        id: INSERT_BELLOW_MENU_ID,
        type: MenuItemType.SUBITEMS,
        title: 'docs-ui.rightClick.insertBellow',
    };
}

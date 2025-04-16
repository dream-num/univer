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
import type { IMenuItem, IMenuSelectorItem } from '@univerjs/ui';
import { ICommandService, NamedStyleType, UniverInstanceType } from '@univerjs/core';
import { SetTextSelectionsOperation } from '@univerjs/docs';
import { H1Single, H2Single, H3Single, H4Single, H5Single, TextTypeSingle } from '@univerjs/icons';
import { ComponentManager, getMenuHiddenObservable, MenuItemType } from '@univerjs/ui';
import { Observable } from 'rxjs';
import { DocCopyCurrentParagraphCommand, DocCutCurrentParagraphCommand } from '../../commands/commands/clipboard.command';
import { DeleteCurrentParagraphCommand } from '../../commands/commands/doc-delete.command';
import { InsertHorizontalLineBellowCommand } from '../../commands/commands/doc-horizontal-line.command';
import { SetInlineFormatFontSizeCommand } from '../../commands/commands/inline-format.command';
import { InsertBulletListBellowCommand, InsertCheckListBellowCommand, InsertOrderListBellowCommand } from '../../commands/commands/list.command';
import { H1HeadingCommand, H2HeadingCommand, H3HeadingCommand, H4HeadingCommand, H5HeadingCommand, NormalTextHeadingCommand, SubtitleHeadingCommand, TitleHeadingCommand } from '../../commands/commands/set-heading.command';
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

export const HEADING_ICON_MAP: Record<NamedStyleType, { key: string; component: React.ComponentType<{ className: string }> }> = {
    [NamedStyleType.HEADING_1]: { key: 'H1Single', component: H1Single },
    [NamedStyleType.HEADING_2]: { key: 'H2Single', component: H2Single },
    [NamedStyleType.HEADING_3]: { key: 'H3Single', component: H3Single },
    [NamedStyleType.HEADING_4]: { key: 'H4Single', component: H4Single },
    [NamedStyleType.HEADING_5]: { key: 'H5Single', component: H5Single },
    [NamedStyleType.NORMAL_TEXT]: { key: 'TextTypeSingle', component: TextTypeSingle },
    [NamedStyleType.TITLE]: { key: 'TextTypeSingle', component: TextTypeSingle },
    [NamedStyleType.SUBTITLE]: { key: 'TextTypeSingle', component: TextTypeSingle },
    [NamedStyleType.NAMED_STYLE_TYPE_UNSPECIFIED]: { key: 'TextTypeSingle', component: TextTypeSingle },
};

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
        tooltip: 'toolbar.heading.tooltip',
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

export const CopyCurrentParagraphMenuItemFactory = (accessor: IAccessor): IMenuItem => {
    return {
        id: DocCopyCurrentParagraphCommand.id,
        type: MenuItemType.BUTTON,
        icon: 'Copy',
        title: 'rightClick.copy',
    };
};

export const CutCurrentParagraphMenuItemFactory = (accessor: IAccessor): IMenuItem => {
    return {
        id: DocCutCurrentParagraphCommand.id,
        type: MenuItemType.BUTTON,
        icon: 'CutSingle',
        title: 'rightClick.cut',
    };
};

export const DeleteCurrentParagraphMenuItemFactory = (accessor: IAccessor): IMenuItem => {
    return {
        id: DeleteCurrentParagraphCommand.id,
        type: MenuItemType.BUTTON,
        icon: 'DeleteSingle',
        title: 'rightClick.delete',
    };
};

export const InsertBulletListBellowMenuItemFactory = (accessor: IAccessor): IMenuItem => {
    return {
        id: InsertBulletListBellowCommand.id,
        type: MenuItemType.BUTTON,
        icon: 'UnorderSingle',
        title: 'rightClick.bulletList',
    };
};

export const InsertOrderListBellowMenuItemFactory = (accessor: IAccessor): IMenuItem => {
    return {
        id: InsertOrderListBellowCommand.id,
        type: MenuItemType.BUTTON,
        icon: 'OrderSingle',
        title: 'rightClick.orderList',
    };
};

export const InsertCheckListBellowMenuItemFactory = (accessor: IAccessor): IMenuItem => {
    return {
        id: InsertCheckListBellowCommand.id,
        type: MenuItemType.BUTTON,
        icon: 'TodoList',
        title: 'rightClick.checkList',
    };
};

export const InsertHorizontalLineBellowMenuItemFactory = (accessor: IAccessor): IMenuItem => {
    return {
        id: InsertHorizontalLineBellowCommand.id,
        type: MenuItemType.BUTTON,
        icon: 'ReduceSingle',
        title: 'toolbar.horizontalLine',
    };
};

export const INSERT_BELLOW_MENU_ID = 'doc.menu.insert-bellow';

export function DocInsertBellowMenuItemFactory(accessor: IAccessor): IMenuSelectorItem<string> {
    return {
        id: INSERT_BELLOW_MENU_ID,
        type: MenuItemType.SUBITEMS,
        title: 'rightClick.insertBellow',
    };
}

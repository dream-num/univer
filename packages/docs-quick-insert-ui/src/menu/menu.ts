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

import type { DocPopupMenu, IDocPopupMenuItem } from '../services/doc-quick-insert-popup.service';
import { InsertDocImageCommand } from '@univerjs/docs-drawing-ui';
import {
    BulletListCommand,
    DocCreateTableOperation,
    HorizontalLineCommand,
    OrderListCommand,
} from '@univerjs/docs-ui';

export enum QuickInsertMenuGroup {
    Basic = 'quick.insert.group.basic',
    Media = 'quick.insert.group.media',
}

export const textMenu: IDocPopupMenuItem = {
    id: 'quick-insert.text.menu',
    title: 'docs-quick-insert-ui.menu.text',
    icon: 'TextIcon',
    keywords: ['text'],
};

export const numberedListMenu: IDocPopupMenuItem = {
    id: OrderListCommand.id,
    title: 'docs-quick-insert-ui.menu.numberedList',
    icon: 'OrderIcon',
    keywords: ['numbered', 'list', 'ordered'],
};

export const bulletedListMenu: IDocPopupMenuItem = {
    id: BulletListCommand.id,
    title: 'docs-quick-insert-ui.menu.bulletedList',
    icon: 'UnorderIcon',
    keywords: ['bulleted', 'list', 'unordered'],
};

export const dividerMenu: IDocPopupMenuItem = {
    id: HorizontalLineCommand.id,
    title: 'docs-quick-insert-ui.menu.divider',
    icon: 'DividerIcon',
    keywords: ['divider', 'line', 'separate'],
};

export const tableMenu: IDocPopupMenuItem = {
    id: DocCreateTableOperation.id,
    title: 'docs-quick-insert-ui.menu.table',
    icon: 'GridIcon',
    keywords: ['table', 'grid', 'spreadsheet'],
};

export const imageMenu: IDocPopupMenuItem = {
    id: InsertDocImageCommand.id,
    title: 'docs-quick-insert-ui.menu.image',
    icon: 'AdditionAndSubtractionIcon',
    keywords: ['image', 'picture', 'photo'],
};

export const builtInMenus: DocPopupMenu[] = [
    {
        title: 'docs-quick-insert-ui.group.basics',
        id: QuickInsertMenuGroup.Basic,
        children: [
            textMenu,
            numberedListMenu,
            bulletedListMenu,
            dividerMenu,
            tableMenu,
            imageMenu,
        ],
    },
];

export const builtInMenuCommandIds = new Set([
    numberedListMenu.id,
    bulletedListMenu.id,
    dividerMenu.id,
    tableMenu.id,
    imageMenu.id,
]);

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
import { BulletListCommand, OrderListCommand } from '@univerjs/docs-ui';

export enum QuickInsertMenuGroup {
    Basic = 'quick.insert.group.basic',
    Media = 'quick.insert.group.media',
}

export const textMenu: IDocPopupMenuItem = {
    id: 'quick-insert.text.menu',
    title: 'docQuickInsert.menu.text',
    icon: 'text',
    keywords: ['text'],
};

export const numberedListMenu: IDocPopupMenuItem = {
    id: OrderListCommand.id,
    title: 'docQuickInsert.menu.numberedList',
    icon: 'numberedList',
    keywords: ['numbered', 'list', 'ordered'],
};

export const bulletedListMenu: IDocPopupMenuItem = {
    id: BulletListCommand.id,
    title: 'docQuickInsert.menu.bulletedList',
    icon: 'bulletedList',
    keywords: ['bulleted', 'list', 'unordered'],
};

export const dividerMenu: IDocPopupMenuItem = {
    id: 'quick-insert.divider.menu',
    title: 'docQuickInsert.menu.dividedLine',
    icon: 'divide',
    keywords: ['divider', 'line', 'separate'],
};

export const builtInMenus: DocPopupMenu[] = [
    {
        title: 'docQuickInsert.group.basics',
        id: QuickInsertMenuGroup.Basic,
        children: [
            textMenu,
            numberedListMenu,
            bulletedListMenu,
            dividerMenu,
        ],
    },
];

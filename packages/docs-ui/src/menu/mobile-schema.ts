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
import { ContextMenuGroup, ContextMenuPosition } from '@univerjs/ui';
import { DocPasteCommand } from '../commands/commands/clipboard.command';
import { DocSelectAllCommand, DocSelectWordCommand } from '../commands/commands/doc-select-all.command';
import { DOC_CARET_MENU_ID } from '../consts/mobile-context';
import { PasteMenuFactory, SelectAllMenuFactory, SelectWordMenuFactory } from './context-menu';

export const mobileMenuSchema: MenuSchemaType = {
    [ContextMenuPosition.MAIN_AREA]: {
        [ContextMenuGroup.QUICK]: {
            [DocSelectWordCommand.id]: { order: 3, menuItemFactory: SelectWordMenuFactory },
            [DocSelectAllCommand.id]: { order: 4, menuItemFactory: SelectAllMenuFactory },
        },
    },
    [DOC_CARET_MENU_ID]: {
        [ContextMenuGroup.QUICK]: {
            quickLayout: 'tile',
            [DocPasteCommand.id]: {
                order: 0,
                menuItemFactory: PasteMenuFactory,
            },
            [DocSelectWordCommand.id]: {
                order: 1,
                menuItemFactory: SelectWordMenuFactory,
            },
            [DocSelectAllCommand.id]: {
                order: 2,
                menuItemFactory: SelectAllMenuFactory,
            },
        },
    },

};

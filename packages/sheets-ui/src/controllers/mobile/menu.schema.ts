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
import {
    SheetCopyCommand,
} from '../../commands/commands/clipboard.command';
import { CopyMenuItemFactory } from '../menu/menu';

export const menuSchema: MenuSchemaType = {
    [ContextMenuPosition.MAIN_AREA]: {
        [ContextMenuGroup.FORMAT]: {
            [SheetCopyCommand.name]: {
                order: 0,
                menuItemFactory: CopyMenuItemFactory,
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
        },
        [ContextMenuGroup.LAYOUT]: {
            order: 1,
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
        },
        [ContextMenuGroup.LAYOUT]: {
            order: 1,
        },
        [ContextMenuGroup.DATA]: {
            order: 2,
        },
        [ContextMenuGroup.OTHERS]: {
            order: 3,
        },
    },
};

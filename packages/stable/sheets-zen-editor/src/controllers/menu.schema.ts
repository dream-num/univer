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
import { OpenZenEditorCommand } from '../commands/commands/zen-editor.command';
import { ZenEditorMenuItemFactory } from '../views/menu';

export const menuSchema: MenuSchemaType = {
    [ContextMenuPosition.MAIN_AREA]: {
        [ContextMenuGroup.OTHERS]: {
            [OpenZenEditorCommand.id]: {
                order: 2,
                menuItemFactory: ZenEditorMenuItemFactory,
            },
        },
    },
};

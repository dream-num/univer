/**
 * Copyright 2023-present DreamNum Inc.
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

import type { IMenu2Item } from '@univerjs/ui';
import { ContextMenuGroup, ContextMenuPosition } from '@univerjs/ui';
import { OpenZenEditorOperation } from '../commands/operations/zen-editor.operation';
import { ZenEditorMenuItemFactory } from '../views/menu';

export const menuSchema: IMenu2Item = {
    [ContextMenuPosition.MAIN_AREA]: {
        [ContextMenuGroup.OTHERS]: {
            [OpenZenEditorOperation.id]: {
                order: 2,
                menuItemFactory: ZenEditorMenuItemFactory,
            },
        },
    },
};

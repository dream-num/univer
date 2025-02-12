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

import type { MenuSchemaType } from '../../services/menu/menu-manager.service';
import { RedoCommand, UndoCommand } from '@univerjs/core';
import { ToggleShortcutPanelOperation } from '../../commands/operations/toggle-shortcut-panel.operation';
import { RibbonStartGroup } from '../../services/menu/types';
import { ShortcutPanelMenuItemFactory } from '../shortcut-display/menu';
import { RedoMenuItemFactory, UndoMenuItemFactory } from './menus';

export const menuSchema: MenuSchemaType = {
    [RibbonStartGroup.HISTORY]: {
        [UndoCommand.id]: {
            order: 0,
            menuItemFactory: UndoMenuItemFactory,
        },
        [RedoCommand.id]: {
            order: 1,
            menuItemFactory: RedoMenuItemFactory,
        },
    },
    [RibbonStartGroup.OTHERS]: {
        [ToggleShortcutPanelOperation.id]: {
            order: 99,
            menuItemFactory: ShortcutPanelMenuItemFactory,
        },
    },
};

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
import { SheetDeleteNoteCommand, SheetToggleNotePopupCommand } from '@univerjs/sheets-note';
import { ContextMenuGroup, ContextMenuPosition } from '@univerjs/ui';
import { AddNotePopupOperation } from '../commands/operations/add-note-popup.operation';
import { sheetDeleteNoteMenuFactory, sheetNoteContextMenuFactory, sheetNoteToggleMenuFactory } from './note.menu';

export const menuSchema: MenuSchemaType = {
    [ContextMenuPosition.MAIN_AREA]: {
        [ContextMenuGroup.OTHERS]: {
            order: 0,
            [AddNotePopupOperation.id]: {
                order: 0,
                menuItemFactory: sheetNoteContextMenuFactory,
            },
            [SheetDeleteNoteCommand.id]: {
                order: 0,
                menuItemFactory: sheetDeleteNoteMenuFactory,
            },
            [SheetToggleNotePopupCommand.id]: {
                order: 0,
                menuItemFactory: sheetNoteToggleMenuFactory,
            },
        },
    },
};

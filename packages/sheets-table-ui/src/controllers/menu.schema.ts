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
import { SheetTableInsertColCommand, SheetTableInsertRowCommand, SheetTableRemoveColCommand, SheetTableRemoveRowCommand } from '@univerjs/sheets-table';
import { ContextMenuGroup, ContextMenuPosition, RibbonStartGroup } from '@univerjs/ui';
import { OpenTableSelectorOperation } from '../commands/operations/open-table-selector.operation';
import { SHEET_TABLE_CONTEXT_INSERT_MENU_ID, SHEET_TABLE_CONTEXT_REMOVE_MENU_ID, SheetTableInsertColMenuFactory, SheetTableInsertContextMenuFactory, SheetTableInsertRowMenuFactory, SheetTableRemoveColMenuFactory, SheetTableRemoveContextMenuFactory, SheetTableRemoveRowMenuFactory, sheetTableToolbarInsertMenuFactory } from '../views/menu';

export const menuSchema: MenuSchemaType = {
    [RibbonStartGroup.FORMULAS_VIEW]: {
        [OpenTableSelectorOperation.id]: {
            order: 0,
            menuItemFactory: sheetTableToolbarInsertMenuFactory,
        },
    },
    [ContextMenuPosition.MAIN_AREA]: {
        [ContextMenuGroup.LAYOUT]: {
            [SHEET_TABLE_CONTEXT_INSERT_MENU_ID]: {
                order: 5,
                menuItemFactory: SheetTableInsertContextMenuFactory,
                [SheetTableInsertRowCommand.id]: {
                    order: 1,
                    menuItemFactory: SheetTableInsertRowMenuFactory,
                },
                [SheetTableInsertColCommand.id]: {
                    order: 2,
                    menuItemFactory: SheetTableInsertColMenuFactory,
                },
            },
            [SHEET_TABLE_CONTEXT_REMOVE_MENU_ID]: {
                order: 6,
                menuItemFactory: SheetTableRemoveContextMenuFactory,
                [SheetTableRemoveRowCommand.id]: {
                    order: 1,
                    menuItemFactory: SheetTableRemoveRowMenuFactory,
                },
                [SheetTableRemoveColCommand.id]: {
                    order: 2,
                    menuItemFactory: SheetTableRemoveColMenuFactory,
                },
            },
        },
    },
};

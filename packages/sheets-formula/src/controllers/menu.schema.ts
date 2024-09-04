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
import { RibbonStartGroup } from '@univerjs/ui';
import { PASTE_SPECIAL_MENU_ID } from '@univerjs/sheets-ui';
import { InsertFunctionOperation } from '../commands/operations/insert-function.operation';
import { MoreFunctionsOperation } from '../commands/operations/more-functions.operation';
import { SheetOnlyPasteFormulaCommand } from '../commands/commands/formula-clipboard.command';
import { InsertFunctionMenuItemFactory, MoreFunctionsMenuItemFactory, PasteFormulaMenuItemFactory } from './menu';

export const menuSchema: IMenu2Item = {
    [RibbonStartGroup.FORMULAS_INSERT]: {
        [InsertFunctionOperation.id]: {
            order: 1,
            menuItemFactory: InsertFunctionMenuItemFactory,
            [MoreFunctionsOperation.id]: {
                order: 1,
                menuItemFactory: MoreFunctionsMenuItemFactory,
            },
        },
    },
    [PASTE_SPECIAL_MENU_ID]: {
        [SheetOnlyPasteFormulaCommand.id]: {
            order: 4,
            menuItemFactory: PasteFormulaMenuItemFactory,
        },
    },
};

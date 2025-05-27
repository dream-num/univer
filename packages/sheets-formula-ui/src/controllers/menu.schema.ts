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
import { PASTE_SPECIAL_MENU_ID } from '@univerjs/sheets-ui';
import { RibbonFormulasGroup } from '@univerjs/ui';
import { SheetOnlyPasteFormulaCommand } from '../commands/commands/formula-clipboard.command';
import { InsertFunctionOperation } from '../commands/operations/insert-function.operation';
import { MoreFunctionsOperation } from '../commands/operations/more-functions.operation';
import {
    InsertAVERAGEFunctionMenuItemFactory,
    InsertCOUNTFunctionMenuItemFactory,
    InsertMAXFunctionMenuItemFactory,
    InsertMINFunctionMenuItemFactory,
    InsertSUMFunctionMenuItemFactory,
    MoreFunctionsMenuItemFactory,
    PasteFormulaMenuItemFactory,
} from './menu';

export const menuSchema: MenuSchemaType = {
    [RibbonFormulasGroup.BASIC]: {
        [`${InsertFunctionOperation.id}.sum`]: {
            order: 0,
            menuItemFactory: InsertSUMFunctionMenuItemFactory,
        },
        [`${InsertFunctionOperation.id}.count`]: {
            order: 1,
            menuItemFactory: InsertCOUNTFunctionMenuItemFactory,
        },
        [`${InsertFunctionOperation.id}.average`]: {
            order: 2,
            menuItemFactory: InsertAVERAGEFunctionMenuItemFactory,
        },
        [`${InsertFunctionOperation.id}.max`]: {
            order: 3,
            menuItemFactory: InsertMAXFunctionMenuItemFactory,
        },
        [`${InsertFunctionOperation.id}.min`]: {
            order: 4,
            menuItemFactory: InsertMINFunctionMenuItemFactory,
        },
    },
    [RibbonFormulasGroup.OTHERS]: {
        [MoreFunctionsOperation.id]: {
            order: 0,
            menuItemFactory: MoreFunctionsMenuItemFactory,
        },
    },
    [PASTE_SPECIAL_MENU_ID]: {
        [SheetOnlyPasteFormulaCommand.id]: {
            order: 4,
            menuItemFactory: PasteFormulaMenuItemFactory,
        },
    },
};

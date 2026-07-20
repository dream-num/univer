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
import { RibbonDataGroup, RibbonInsertGroup } from '@univerjs/ui';
import {
    AddSheetDataValidationAndOpenCommand,
    InsertQuickSheetDataValidationCommand,
} from '../commands/commands/data-validation-ui.command';
import { OpenValidationPanelOperation } from '../commands/operations/data-validation.operation';
import {
    addDataValidationMenuFactory,
    DATA_VALIDATION_MENU_ID,
    dataValidationMenuFactory,
    openDataValidationMenuFactory,
    QUICK_DATE_MENU_ID,
    QUICK_DROPDOWN_MENU_ID,
    quickCheckboxMenuFactory,
    quickDateMenuFactory,
    quickDropdownMenuFactory,
} from './dv.menu';

export const menuSchema: MenuSchemaType = {
    [RibbonInsertGroup.CELL]: {
        [InsertQuickSheetDataValidationCommand.id]: {
            order: 0,
            menuItemFactory: quickCheckboxMenuFactory,
        },
        [QUICK_DROPDOWN_MENU_ID]: {
            order: 1,
            menuItemFactory: quickDropdownMenuFactory,
        },
        [QUICK_DATE_MENU_ID]: {
            order: 2,
            menuItemFactory: quickDateMenuFactory,
        },
    },
    [RibbonDataGroup.RULES]: {
        [DATA_VALIDATION_MENU_ID]: {
            order: 0,
            gridLayout: { row: 1, column: 1, showLabel: true },
            menuItemFactory: dataValidationMenuFactory,
            [OpenValidationPanelOperation.id]: {
                order: 0,
                menuItemFactory: openDataValidationMenuFactory,
            },
            [AddSheetDataValidationAndOpenCommand.id]: {
                order: 1,
                menuItemFactory: addDataValidationMenuFactory,
            },
        },
    },
};

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
import { RibbonStartGroup } from '@univerjs/ui';
import { AddSheetDataValidationAndOpenCommand } from '../commands/commands/data-validation-ui.command';
import { OpenValidationPanelOperation } from '../commands/operations/data-validation.operation';
import {
    addDataValidationMenuFactory,
    DATA_VALIDATION_MENU_ID,
    dataValidationMenuFactory,
    openDataValidationMenuFactory,
} from './dv.menu';

export const menuSchema: MenuSchemaType = {
    [RibbonStartGroup.FORMULAS_INSERT]: {
        [DATA_VALIDATION_MENU_ID]: {
            order: 9,
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

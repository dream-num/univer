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
import {
    ClearSheetsFilterCriteriaCommand,
    ReCalcSheetsFilterCommand,
    SmartToggleSheetsFilterCommand,
} from '@univerjs/sheets-filter';
import { RibbonDataGroup } from '@univerjs/ui';
import {
    ClearFilterCriteriaMenuItemFactory,
    ReCalcFilterMenuItemFactory,
    SmartToggleFilterMenuItemFactory,
} from './sheets-filter.menu';

export const menuSchema: MenuSchemaType = {
    [RibbonDataGroup.ORGANIZATION]: {
        [SmartToggleSheetsFilterCommand.id]: {
            order: 2,
            menuItemFactory: SmartToggleFilterMenuItemFactory,
            [ClearSheetsFilterCriteriaCommand.id]: {
                order: 0,
                menuItemFactory: ClearFilterCriteriaMenuItemFactory,
            },
            [ReCalcSheetsFilterCommand.id]: {
                order: 1,
                menuItemFactory: ReCalcFilterMenuItemFactory,
            },
        },
    },
};

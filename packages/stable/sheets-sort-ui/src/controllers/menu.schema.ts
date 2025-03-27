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
import { ContextMenuGroup, ContextMenuPosition, RibbonStartGroup } from '@univerjs/ui';
import {
    SortRangeAscCommand,
    SortRangeAscExtCommand,
    SortRangeAscExtInCtxMenuCommand,
    SortRangeAscInCtxMenuCommand,
    SortRangeCustomCommand,
    SortRangeCustomInCtxMenuCommand,
    SortRangeDescCommand,
    SortRangeDescExtCommand,
    SortRangeDescExtInCtxMenuCommand,
    SortRangeDescInCtxMenuCommand,
} from '../commands/commands/sheets-sort.command';
import {
    SHEETS_SORT_CTX_MENU_ID,
    SHEETS_SORT_MENU_ID,
    sortRangeAscCtxMenuFactory,
    sortRangeAscExtCtxMenuFactory,
    sortRangeAscExtMenuFactory,
    sortRangeAscMenuFactory,
    sortRangeCtxMenuFactory,
    sortRangeCustomCtxMenuFactory,
    sortRangeCustomMenuFactory,
    sortRangeDescCtxMenuFactory,
    sortRangeDescExtCtxMenuFactory,
    sortRangeDescExtMenuFactory,
    sortRangeDescMenuFactory,
    sortRangeMenuFactory,
} from './sheets-sort.menu';

export const menuSchema: MenuSchemaType = {
    [RibbonStartGroup.FORMULAS_INSERT]: {
        [SHEETS_SORT_MENU_ID]: {
            order: 2,
            menuItemFactory: sortRangeMenuFactory,
            [SortRangeAscCommand.id]: {
                order: 0,
                menuItemFactory: sortRangeAscMenuFactory,
            },
            [SortRangeAscExtCommand.id]: {
                order: 1,
                menuItemFactory: sortRangeAscExtMenuFactory,
            },
            [SortRangeDescCommand.id]: {
                order: 2,
                menuItemFactory: sortRangeDescMenuFactory,
            },
            [SortRangeDescExtCommand.id]: {
                order: 3,
                menuItemFactory: sortRangeDescExtMenuFactory,
            },
            [SortRangeCustomCommand.id]: {
                order: 4,
                menuItemFactory: sortRangeCustomMenuFactory,
            },
        },
    },
    [ContextMenuPosition.MAIN_AREA]: {
        [ContextMenuGroup.DATA]: {
            [SHEETS_SORT_CTX_MENU_ID]: {
                order: 0,
                menuItemFactory: sortRangeCtxMenuFactory,
                [SortRangeAscInCtxMenuCommand.id]: {
                    order: 0,
                    menuItemFactory: sortRangeAscCtxMenuFactory,
                },
                [SortRangeAscExtInCtxMenuCommand.id]: {
                    order: 1,
                    menuItemFactory: sortRangeAscExtCtxMenuFactory,
                },
                [SortRangeDescInCtxMenuCommand.id]: {
                    order: 2,
                    menuItemFactory: sortRangeDescCtxMenuFactory,
                },
                [SortRangeDescExtInCtxMenuCommand.id]: {
                    order: 3,
                    menuItemFactory: sortRangeDescExtCtxMenuFactory,
                },
                [SortRangeCustomInCtxMenuCommand.id]: {
                    order: 4,
                    menuItemFactory: sortRangeCustomCtxMenuFactory,
                },
            },
        },
    },
};

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

import { type IMenu2Item, RibbonStartGroup } from '@univerjs/ui';
import { FONT_GROUP_MENU_ID, UNI_MENU_POSITIONS } from '@univerjs/uniui';
import { menuSchema as sheetsUIMenuSchema } from '@univerjs/sheets-ui';
import {
    SHEET_BOLD_MUTATION_ID,
    SHEET_ITALIC_MUTATION_ID,
    SHEET_STRIKE_MUTATION_ID,
    SHEET_UNDERLINE_MUTATION_ID,
    SheetBoldMenuItemFactory,
    SheetItalicMenuItemFactory,
    SheetStrikeThroughMenuItemFactory,
    SheetUnderlineMenuItemFactory,
} from './menu';

export const menuSchema: IMenu2Item = {
    [UNI_MENU_POSITIONS.TOOLBAR_MAIN]: (sheetsUIMenuSchema as any)[RibbonStartGroup.FORMAT],
    [FONT_GROUP_MENU_ID]: {
        [SHEET_BOLD_MUTATION_ID]: {
            order: 0,
            menuItemFactory: SheetBoldMenuItemFactory,
        },
        [SHEET_ITALIC_MUTATION_ID]: {
            order: 1,
            menuItemFactory: SheetItalicMenuItemFactory,
        },
        [SHEET_UNDERLINE_MUTATION_ID]: {
            order: 2,
            menuItemFactory: SheetUnderlineMenuItemFactory,
        },
        [SHEET_STRIKE_MUTATION_ID]: {
            order: 3,
            menuItemFactory: SheetStrikeThroughMenuItemFactory,
        },
    },
};

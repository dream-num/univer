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
import { FONT_GROUP_MENU_ID } from '@univerjs/uniui';
import {
    FAKE_BG_COLOR_MENU_ID,
    FAKE_FONT_COLOR_MENU_ID,
    FAKE_FONT_FAMILY_MENU_ID,
    FAKE_FONT_GROUP_MENU_ID,
    FAKE_FONT_SIZE_MENU_ID,
    FAKE_IMAGE_MENU_ID,
    FAKE_ORDER_LIST_MENU_ID,
    FAKE_TABLE_MENU_ID,
    FAKE_UNORDER_LIST_MENU_ID,
    FakeBackgroundColorSelectorMenuItemFactory,
    FakeFontFamilySelectorMenuItemFactory,
    FakeFontGroupMenuItemFactory,
    FakeFontSizeSelectorMenuItemFactory,
    FakeImageMenuFactory,
    FakeOrderListMenuItemFactory,
    FakePivotTableMenuItemFactory,
    FakeTextColorSelectorMenuItemFactory,
    FakeUnorderListMenuItemFactory,
    FontGroupMenuItemFactory,
    UNI_MENU_POSITIONS,
} from './menu';

export const menuSchema: IMenu2Item = {
    [UNI_MENU_POSITIONS.TOOLBAR_MAIN]: {
        [FAKE_FONT_FAMILY_MENU_ID]: {
            menuItemFactory: FakeFontFamilySelectorMenuItemFactory,
        },
        [FAKE_FONT_SIZE_MENU_ID]: {
            menuItemFactory: FakeFontSizeSelectorMenuItemFactory,
        },
        [FAKE_FONT_COLOR_MENU_ID]: {
            menuItemFactory: FakeTextColorSelectorMenuItemFactory,
        },
        [FAKE_BG_COLOR_MENU_ID]: {
            menuItemFactory: FakeBackgroundColorSelectorMenuItemFactory,
        },
        [FAKE_IMAGE_MENU_ID]: {
            menuItemFactory: FakeImageMenuFactory,
        },
        [FAKE_UNORDER_LIST_MENU_ID]: {
            menuItemFactory: FakeUnorderListMenuItemFactory,
        },
        [FAKE_ORDER_LIST_MENU_ID]: {
            menuItemFactory: FakeOrderListMenuItemFactory,
        },
        [FONT_GROUP_MENU_ID]: {
            menuItemFactory: FontGroupMenuItemFactory,
        },
        [FAKE_FONT_GROUP_MENU_ID]: {
            menuItemFactory: FakeFontGroupMenuItemFactory,
        },
        [FAKE_TABLE_MENU_ID]: {
            menuItemFactory: FakePivotTableMenuItemFactory,
        },
    },
};

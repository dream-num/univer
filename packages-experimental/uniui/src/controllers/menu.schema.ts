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
import { RibbonStartGroup, UIMenuSchema } from '@univerjs/ui';
import { FONT_GROUP_MENU_ID } from '@univerjs/uniui';
import {
    DELETE_MENU_ID,
    DeleteMenuItemFactory,
    DOWNLOAD_MENU_ID,
    DownloadMenuItemFactory,
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
    // LOCK_MENU_ID,
    // LockMenuItemFactory,
    PRINT_MENU_ID,
    PrintMenuItemFactory,
    SHARE_MENU_ID,
    ShareMenuItemFactory,
    UNI_MENU_POSITIONS,
    ZEN_MENU_ID,
    ZenMenuItemFactory,
} from './menu';

export const menuSchema: MenuSchemaType = {
    [UNI_MENU_POSITIONS.TOOLBAR_MAIN]: {
        ...(UIMenuSchema as any)[RibbonStartGroup.HISTORY],
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
    [UNI_MENU_POSITIONS.TOOLBAR_FLOAT]: {
        [DOWNLOAD_MENU_ID]: {
            menuItemFactory: DownloadMenuItemFactory,
        },
        [SHARE_MENU_ID]: {
            menuItemFactory: ShareMenuItemFactory,
        },
        // [LOCK_MENU_ID]: {
        //     menuItemFactory: LockMenuItemFactory,
        // },
        [PRINT_MENU_ID]: {
            menuItemFactory: PrintMenuItemFactory,
        },
        [ZEN_MENU_ID]: {
            menuItemFactory: ZenMenuItemFactory,
        },
        [DELETE_MENU_ID]: {
            menuItemFactory: DeleteMenuItemFactory,
        },
    },
};

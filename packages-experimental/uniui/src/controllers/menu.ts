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

import { type IAccessor, IUniverInstanceService, UniverInstanceType } from '@univerjs/core';
import { type IMenuButtonItem, type IMenuItem, type IMenuSelectorItem, MenuItemType } from '@univerjs/ui';
import { Observable } from 'rxjs';
import { DisposeUnitOperation } from '../commands/operations/uni.operation';

export const UNIT_LINE_COLOR_MENU_ID = 'UNIT_LINE_COLOR_MENU_ID';
export const DOWNLOAD_MENU_ID = 'DOWNLOAD_MENU_ID';
export const SHARE_MENU_ID = 'SHARE_MENU_ID';
export const LOCK_MENU_ID = 'LOCK_MENU_ID';
export const PRINT_MENU_ID = 'PRINT_MENU_ID';
export const ZEN_MENU_ID = 'ZEN_MENU_ID';
export const DELETE_MENU_ID = DisposeUnitOperation.id;
export const FRAME_SIZE_MENU_ID = 'FRAME_SIZE_MENU_ID';

export const FONT_GROUP_MENU_ID = 'FONT_GROUP_MENU_ID';

export const FAKE_FONT_FAMILY_MENU_ID = 'FAKE_FONT_FAMILY_MENU_ID';
export const FAKE_FONT_SIZE_MENU_ID = 'FAKE_FONT_SIZE_MENU_ID';
export const FAKE_FONT_COLOR_MENU_ID = 'FAKE_FONT_COLOR_MENU_ID';
export const FAKE_BG_COLOR_MENU_ID = 'FAKE_BG_COLOR_MENU_ID';
export const FAKE_IMAGE_MENU_ID = 'FAKE_IMAGE_MENU_ID';
export const FAKE_FONT_GROUP_MENU_ID = 'FAKE_FONT_GROUP_MENU_ID';
export const FAKE_TABLE_MENU_ID = 'FAKE_TABLE_MENU_ID';
export const FAKE_UNORDER_LIST_MENU_ID = 'FAKE_UNORDER_LIST_MENU_ID';
export const FAKE_ORDER_LIST_MENU_ID = 'FAKE_ORDER_LIST_MENU_ID';

export enum UNI_MENU_POSITIONS {
    TOOLBAR_MAIN = 'toolbar_main',
    TOOLBAR_FLOAT = 'toolbar_float',
}

export function FakeFontFamilySelectorMenuItemFactory(accessor: IAccessor): IMenuSelectorItem<string> {
    return {
        id: FAKE_FONT_FAMILY_MENU_ID,
        tooltip: 'toolbar.font',
        type: MenuItemType.SELECTOR,
        label: 'UI_PLUGIN_DOCS_FONT_FAMILY_COMPONENT',
        selections: [],
        disabled$: new Observable((subscriber) => { subscriber.next(true); }),
    };
}

export function FakeFontSizeSelectorMenuItemFactory(accessor: IAccessor): IMenuSelectorItem<number> {
    return {
        id: FAKE_FONT_SIZE_MENU_ID,
        type: MenuItemType.SELECTOR,
        tooltip: 'toolbar.fontSize',
        label: {
            name: 'UI_PLUGIN_DOCS_FONT_SIZE_COMPONENT',
            props: {
                min: 1,
                max: 400,
            },
        },
        selections: [],
        disabled$: new Observable((subscriber) => { subscriber.next(true); }),
    };
}

export function FakeTextColorSelectorMenuItemFactory(accessor: IAccessor): IMenuSelectorItem<string> {
    return {
        id: FAKE_FONT_COLOR_MENU_ID,
        icon: 'FontColor',
        tooltip: 'toolbar.textColor.main',
        type: MenuItemType.BUTTON_SELECTOR,
        selections: [],
        disabled$: new Observable((subscriber) => { subscriber.next(true); }),
    };
}

export function FakeBackgroundColorSelectorMenuItemFactory(accessor: IAccessor): IMenuSelectorItem<string> {
    return {
        id: FAKE_BG_COLOR_MENU_ID,
        tooltip: 'toolbar.fillColor.main',
        type: MenuItemType.BUTTON_SELECTOR,
        icon: 'PaintBucket',
        selections: [],
        disabled$: new Observable((subscriber) => { subscriber.next(true); }),
    };
}

export function FakeImageMenuFactory(accessor: IAccessor): IMenuItem {
    return {
        id: FAKE_IMAGE_MENU_ID,
        type: MenuItemType.SUBITEMS,
        icon: 'addition-and-subtraction-single',
        tooltip: 'sheetImage.title',
        disabled$: new Observable((subscriber) => { subscriber.next(true); }),
    };
}

export function FakeUnorderListMenuItemFactory(accessor: IAccessor): IMenuItem {
    return {
        id: FAKE_UNORDER_LIST_MENU_ID,
        type: MenuItemType.BUTTON_SELECTOR,
        icon: 'UnorderSingle',
        tooltip: 'toolbar.unorder',
        disabled$: new Observable((subscriber) => { subscriber.next(true); }),
    };
}

export function FakeOrderListMenuItemFactory(accessor: IAccessor): IMenuItem {
    return {
        id: FAKE_ORDER_LIST_MENU_ID,
        type: MenuItemType.BUTTON_SELECTOR,
        icon: 'OrderSingle',
        tooltip: 'toolbar.order',
        disabled$: new Observable((subscriber) => { subscriber.next(true); }),
    };
}

export function FontGroupMenuItemFactory(accessor: IAccessor): IMenuSelectorItem {
    const univerInstanceService = accessor.get(IUniverInstanceService);
    return {
        id: FONT_GROUP_MENU_ID,
        type: MenuItemType.SUBITEMS,
        tooltip: 'Font group',
        icon: 'BoldSingle',
        hidden$: new Observable((subscriber) => {
            const subscription = univerInstanceService.focused$.subscribe((unitId) => {
                if (unitId == null) {
                    return subscriber.next(true);
                }
                const univerType = univerInstanceService.getUnitType(unitId);

                subscriber.next(univerType === UniverInstanceType.UNIVER_SLIDE);
            });

            const focusedUniverInstance = univerInstanceService.getFocusedUnit();

            if (focusedUniverInstance == null) {
                return subscriber.next(true);
            }

            const univerType = univerInstanceService.getUnitType(focusedUniverInstance.getUnitId());
            subscriber.next(univerType === UniverInstanceType.UNIVER_SLIDE);

            return () => subscription.unsubscribe();
        }),
    };
}

export function FakeFontGroupMenuItemFactory(accessor: IAccessor): IMenuSelectorItem {
    return {
        id: FAKE_FONT_GROUP_MENU_ID,
        type: MenuItemType.SUBITEMS,
        tooltip: 'Font group',
        icon: 'BoldSingle',
        disabled$: new Observable((subscriber) => { subscriber.next(true); }),
    };
}

export function FakePivotTableMenuItemFactory(accessor: IAccessor): IMenuItem {
    return {
        id: FAKE_TABLE_MENU_ID,
        type: MenuItemType.BUTTON,
        icon: 'PivotTableSingle',
        tooltip: 'PivotTable',
        disabled$: new Observable((subscriber) => { subscriber.next(true); }),
    };
}

export function UnitLineColorMenuItemFactory(accessor: IAccessor): IMenuButtonItem {
    return {
        id: UNIT_LINE_COLOR_MENU_ID,
        type: MenuItemType.BUTTON,
        title: '',
        icon: '',
    };
}

export function DownloadMenuItemFactory(accessor: IAccessor): IMenuButtonItem {
    return {
        id: DOWNLOAD_MENU_ID,
        type: MenuItemType.BUTTON,
        title: '',
        tooltip: 'Download',
        icon: 'DownloadSingle',
    };
}

export function ShareMenuItemFactory(accessor: IAccessor): IMenuButtonItem {
    return {
        id: SHARE_MENU_ID,
        type: MenuItemType.BUTTON,
        title: '',
        tooltip: 'Share',
        icon: 'ShareSingle',
    };
}

export function LockMenuItemFactory(accessor: IAccessor): IMenuButtonItem {
    return {
        id: LOCK_MENU_ID,
        type: MenuItemType.BUTTON,
        title: '',
        tooltip: 'Lock',
        icon: 'LockSingle',
    };
}

export function PrintMenuItemFactory(accessor: IAccessor): IMenuButtonItem {
    return {
        id: PRINT_MENU_ID,
        type: MenuItemType.BUTTON,
        title: '',
        tooltip: 'Print',
        icon: 'PrintSingle',
    };
}

export function ZenMenuItemFactory(accessor: IAccessor): IMenuButtonItem {
    return {
        id: ZEN_MENU_ID,
        type: MenuItemType.BUTTON,
        title: '',
        icon: 'ZenSingle',
        tooltip: 'Full screen',
    };
}

export function DeleteMenuItemFactory(accessor: IAccessor): IMenuButtonItem {
    return {
        id: DELETE_MENU_ID,
        type: MenuItemType.BUTTON,
        title: 'Delete',
        tooltip: 'Delete',
        icon: 'DeleteSingle',
    };
}

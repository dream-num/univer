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

import type { IAccessor } from '@univerjs/core';
import { type IMenuButtonItem, MenuGroup, MenuItemType } from '@univerjs/ui';
import { BehaviorSubject, Observable } from 'rxjs';

export const UNIT_LINE_COLOR_MENU_ID = 'UNIT_LINE_COLOR_MENU_ID';
export const DOWNLOAD_MENU_ID = 'DOWNLOAD_MENU_ID';
export const SHARE_MENU_ID = 'SHARE_MENU_ID';
export const LOCK_MENU_ID = 'LOCK_MENU_ID';
export const PRINT_MENU_ID = 'PRINT_MENU_ID';
export const ZEN_MENU_ID = 'ZEN_MENU_ID';
export const FRAME_SIZE_MENU_ID = 'FRAME_SIZE_MENU_ID';

export enum UNI_MENU_POSITIONS {
    TOOLBAR_MAIN = 'toolbar_main',
    TOOLBAR_FLOAT = 'toolbar_float',
}

export function UnitLineColorMenuItemFactory(accessor: IAccessor): IMenuButtonItem {
    return {
        id: UNIT_LINE_COLOR_MENU_ID,
        type: MenuItemType.BUTTON,
        title: '',
        icon: '',
        positions: [
            UNI_MENU_POSITIONS.TOOLBAR_FLOAT,
        ],
        disabled$: new BehaviorSubject<boolean>(false).asObservable(),
        hidden$: new BehaviorSubject<boolean>(false).asObservable(),
    };
}

export function DownloadMenuItemFactory(accessor: IAccessor): IMenuButtonItem {
    return {
        id: DOWNLOAD_MENU_ID,
        type: MenuItemType.BUTTON,
        group: MenuGroup.TOOLBAR_OTHERS,
        title: '',
        icon: 'DownloadSingle',
        positions: [
            UNI_MENU_POSITIONS.TOOLBAR_FLOAT,
        ],
        disabled$: new BehaviorSubject<boolean>(false).asObservable(),
        hidden$: new BehaviorSubject<boolean>(false).asObservable(),
    };
}

export function ShareMenuItemFactory(accessor: IAccessor): IMenuButtonItem {
    return {
        id: SHARE_MENU_ID,
        type: MenuItemType.BUTTON,
        group: MenuGroup.TOOLBAR_OTHERS,
        title: '',
        icon: 'ShareSingle',
        positions: [
            UNI_MENU_POSITIONS.TOOLBAR_FLOAT,
        ],
        disabled$: new Observable<boolean>(),
        hidden$: new Observable<boolean>(),
    };
}

export function LockMenuItemFactory(accessor: IAccessor): IMenuButtonItem {
    return {
        id: LOCK_MENU_ID,
        type: MenuItemType.BUTTON,
        group: MenuGroup.TOOLBAR_OTHERS,
        title: '',
        icon: 'LockSingle',
        positions: [
            UNI_MENU_POSITIONS.TOOLBAR_FLOAT,
        ],
        disabled$: new Observable<boolean>(),
        hidden$: new Observable<boolean>(),
    };
}

export function PrintMenuItemFactory(accessor: IAccessor): IMenuButtonItem {
    return {
        id: SHARE_MENU_ID,
        type: MenuItemType.BUTTON,
        group: MenuGroup.TOOLBAR_OTHERS,
        title: '',
        icon: 'PrintSingle',
        positions: [
            UNI_MENU_POSITIONS.TOOLBAR_FLOAT,
        ],
        disabled$: new Observable<boolean>(),
        hidden$: new Observable<boolean>(),
    };
}

export function ZenMenuItemFactory(accessor: IAccessor): IMenuButtonItem {
    return {
        id: SHARE_MENU_ID,
        type: MenuItemType.BUTTON,
        title: '',
        icon: 'ZenSingle',
        group: MenuGroup.TOOLBAR_OTHERS,
        positions: [
            UNI_MENU_POSITIONS.TOOLBAR_FLOAT,
        ],
        disabled$: new Observable<boolean>(),
        hidden$: new Observable<boolean>(),
    };
}

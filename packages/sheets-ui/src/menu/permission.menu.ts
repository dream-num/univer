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

import type { IAccessor } from '@univerjs/core';
import type { IMenuButtonItem, IMenuItem, IMenuSelectorItem } from '@univerjs/ui';
import type { LocaleKey } from '../locale/types';
import { UniverInstanceType } from '@univerjs/core';
import { getMenuHiddenObservable, MenuItemType } from '@univerjs/ui';
import {
    AddRangeProtectionFromContextMenuCommand,
    AddRangeProtectionFromSheetBarCommand,
    AddRangeProtectionFromToolbarCommand,
    DeleteRangeProtectionFromContextMenuCommand,
    SetRangeProtectionFromContextMenuCommand,
    ViewSheetPermissionFromContextMenuCommand,
    ViewSheetPermissionFromSheetBarCommand,
} from '../commands/commands/range-protection.command';
import {
    ChangeSheetProtectionFromSheetBarCommand,
    DeleteWorksheetProtectionFormSheetBarCommand,
} from '../commands/commands/worksheet-protection.command';
import {
    getAddPermissionDisableBase$,
    getAddPermissionFromSheetBarDisable$,
    getAddPermissionHidden$,
    getEditPermissionHidden$,
    getPermissionDisableBase$,
    getRemovePermissionDisable$,
    getRemovePermissionFromSheetBarDisable$,
    getSetPermissionFromSheetBarDisable$,
    getViewPermissionDisable$,
} from './permission-menu-util';

export const SHEET_PERMISSION_CONTEXT_MENU_ID = 'sheet.contextMenu.permission';

export function sheetPermissionToolbarMenuFactory(accessor: IAccessor): IMenuItem<LocaleKey> {
    return {
        id: AddRangeProtectionFromToolbarCommand.id,
        type: MenuItemType.BUTTON,
        icon: 'ProtectIcon',
        tooltip: 'sheets-ui.permission.toolbarMenu',
        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_SHEET),
        disabled$: getAddPermissionDisableBase$(accessor),
    };
}

export function sheetPermissionContextMenuFactory(accessor: IAccessor): IMenuSelectorItem<LocaleKey> {
    return {
        id: SHEET_PERMISSION_CONTEXT_MENU_ID,
        type: MenuItemType.SUBITEMS,
        title: 'sheets-ui.rightClick.protectRange',
        icon: 'LockIcon',
        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_SHEET),
    };
}

export function sheetPermissionAddProtectContextMenuFactory(accessor: IAccessor): IMenuButtonItem<LocaleKey> {
    return {
        id: AddRangeProtectionFromContextMenuCommand.id,
        type: MenuItemType.BUTTON,
        title: 'sheets-ui.rightClick.turnOnProtectRange',
        hidden$: getAddPermissionHidden$(accessor),
        disabled$: getAddPermissionDisableBase$(accessor),
    };
}

export function sheetPermissionEditProtectContextMenuFactory(accessor: IAccessor): IMenuButtonItem<LocaleKey> {
    return {
        id: SetRangeProtectionFromContextMenuCommand.id,
        type: MenuItemType.BUTTON,
        title: 'sheets-ui.rightClick.editProtectRange',
        disabled$: getPermissionDisableBase$(accessor),
        hidden$: getEditPermissionHidden$(accessor),
    };
}

export function sheetPermissionRemoveProtectContextMenuFactory(accessor: IAccessor): IMenuButtonItem<LocaleKey> {
    return {
        id: DeleteRangeProtectionFromContextMenuCommand.id,
        type: MenuItemType.BUTTON,
        title: 'sheets-ui.rightClick.removeProtectRange',
        disabled$: getRemovePermissionDisable$(accessor),
        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_SHEET),
    };
}

export function sheetPermissionViewAllProtectRuleContextMenuFactory(accessor: IAccessor): IMenuButtonItem<LocaleKey> {
    return {
        id: ViewSheetPermissionFromContextMenuCommand.id,
        type: MenuItemType.BUTTON,
        title: 'sheets-ui.rightClick.viewAllProtectArea',
        disabled$: getViewPermissionDisable$(accessor),
        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_SHEET),
    };
}

export function sheetPermissionProtectSheetInSheetBarMenuFactory(accessor: IAccessor): IMenuButtonItem<LocaleKey> {
    return {
        id: AddRangeProtectionFromSheetBarCommand.id,
        type: MenuItemType.BUTTON,
        title: 'sheets-ui.sheetConfig.addProtectSheet',
        disabled$: getAddPermissionFromSheetBarDisable$(accessor),
        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_SHEET),
    };
}

export function sheetPermissionRemoveProtectionSheetBarMenuFactory(accessor: IAccessor): IMenuButtonItem<LocaleKey> {
    return {
        id: DeleteWorksheetProtectionFormSheetBarCommand.id,
        type: MenuItemType.BUTTON,
        title: 'sheets-ui.sheetConfig.removeProtectSheet',
        disabled$: getRemovePermissionFromSheetBarDisable$(accessor),
        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_SHEET),
    };
}

export function sheetPermissionChangeSheetPermissionSheetBarMenuFactory(accessor: IAccessor): IMenuButtonItem<LocaleKey> {
    return {
        id: ChangeSheetProtectionFromSheetBarCommand.id,
        type: MenuItemType.BUTTON,
        title: 'sheets-ui.sheetConfig.changeSheetPermission',
        disabled$: getSetPermissionFromSheetBarDisable$(accessor),
        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_SHEET),
    };
}

export function sheetPermissionViewAllProtectRuleSheetBarMenuFactory(accessor: IAccessor): IMenuButtonItem<LocaleKey> {
    return {
        id: ViewSheetPermissionFromSheetBarCommand.id,
        type: MenuItemType.BUTTON,
        title: 'sheets-ui.sheetConfig.viewAllProtectArea',
        disabled$: getViewPermissionDisable$(accessor),
        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_SHEET),
    };
}

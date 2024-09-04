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

import type { IMenuButtonItem, IMenuItem, IMenuSelectorItem } from '@univerjs/ui';
import { getMenuHiddenObservable, MenuGroup, MenuItemType, MenuPosition } from '@univerjs/ui';
import type { IAccessor } from '@univerjs/core';

import { UniverInstanceType } from '@univerjs/core';
import { AddRangeProtectionFromContextMenuCommand, AddRangeProtectionFromSheetBarCommand, AddRangeProtectionFromToolbarCommand, DeleteRangeProtectionFromContextMenuCommand, SetRangeProtectionFromContextMenuCommand, ViewSheetPermissionFromContextMenuCommand, ViewSheetPermissionFromSheetBarCommand } from '../../commands/commands/range-protection.command';
import { permissionLockIconKey, permissionMenuIconKey } from '../../consts/permission';
import { ChangeSheetProtectionFromSheetBarCommand, DeleteWorksheetProtectionFormSheetBarCommand } from '../../commands/commands/worksheet-protection.command';
import { getAddPermissionDisableBase$, getAddPermissionFromSheetBarDisable$, getAddPermissionHidden$, getEditPermissionHidden$, getPermissionDisableBase$, getRemovePermissionDisable$, getRemovePermissionFromSheetBarDisable$, getSetPermissionFromSheetBarDisable$, getViewPermissionDisable$ } from './permission-menu-util';
import { SheetMenuPosition } from './menu';

export const SHEET_PERMISSION_CONTEXT_MENU_ID = 'sheet.contextMenu.permission';

export function sheetPermissionToolbarMenuFactory(accessor: IAccessor): IMenuItem {
    return {
        id: AddRangeProtectionFromToolbarCommand.id,
        type: MenuItemType.BUTTON,
        positions: [
            MenuPosition.TOOLBAR_START,
        ],
        group: MenuGroup.TOOLBAR_OTHERS,
        icon: permissionMenuIconKey,
        tooltip: 'permission.toolbarMenu',
        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_SHEET),
        disabled$: getAddPermissionDisableBase$(accessor),
    };
}

export function sheetPermissionContextMenuFactory(accessor: IAccessor): IMenuSelectorItem<string> {
    return {
        id: SHEET_PERMISSION_CONTEXT_MENU_ID,
        group: MenuGroup.CONTEXT_MENU_LAYOUT,
        type: MenuItemType.SUBITEMS,
        title: 'rightClick.protectRange',
        icon: permissionLockIconKey,
        positions: [MenuPosition.CONTEXT_MENU, SheetMenuPosition.ROW_HEADER_CONTEXT_MENU, SheetMenuPosition.COL_HEADER_CONTEXT_MENU],
        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_SHEET),
    };
}

export function sheetPermissionAddProtectContextMenuFactory(accessor: IAccessor): IMenuButtonItem {
    return {
        id: AddRangeProtectionFromContextMenuCommand.id,
        type: MenuItemType.BUTTON,
        title: 'rightClick.turnOnProtectRange',
        positions: [SHEET_PERMISSION_CONTEXT_MENU_ID],
        hidden$: getAddPermissionHidden$(accessor),
        disabled$: getAddPermissionDisableBase$(accessor),
    };
}

export function sheetPermissionEditProtectContextMenuFactory(accessor: IAccessor): IMenuButtonItem {
    return {
        id: SetRangeProtectionFromContextMenuCommand.id,
        type: MenuItemType.BUTTON,
        title: 'rightClick.editProtectRange',
        positions: [SHEET_PERMISSION_CONTEXT_MENU_ID],
        hidden$: getEditPermissionHidden$(accessor),
        disabled$: getPermissionDisableBase$(accessor),
    };
}

export function sheetPermissionRemoveProtectContextMenuFactory(accessor: IAccessor): IMenuButtonItem {
    return {
        id: DeleteRangeProtectionFromContextMenuCommand.id,
        type: MenuItemType.BUTTON,
        title: 'rightClick.removeProtectRange',
        positions: [SHEET_PERMISSION_CONTEXT_MENU_ID],
        disabled$: getRemovePermissionDisable$(accessor),
        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_SHEET),
    };
}

export function sheetPermissionViewAllProtectRuleContextMenuFactory(accessor: IAccessor): IMenuButtonItem {
    return {
        id: ViewSheetPermissionFromContextMenuCommand.id,
        type: MenuItemType.BUTTON,
        title: 'rightClick.viewAllProtectArea',
        positions: [SHEET_PERMISSION_CONTEXT_MENU_ID],
        disabled$: getViewPermissionDisable$(accessor),
        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_SHEET),
    };
}

export function sheetPermissionProtectSheetInSheetBarMenuFactory(accessor: IAccessor): IMenuButtonItem {
    return {
        id: AddRangeProtectionFromSheetBarCommand.id,
        type: MenuItemType.BUTTON,
        positions: [SheetMenuPosition.SHEET_BAR],
        title: 'sheetConfig.addProtectSheet',
        disabled$: getAddPermissionFromSheetBarDisable$(accessor),
        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_SHEET),
    };
}

export function sheetPermissionRemoveProtectionSheetBarMenuFactory(accessor: IAccessor): IMenuButtonItem {
    return {
        id: DeleteWorksheetProtectionFormSheetBarCommand.id,
        type: MenuItemType.BUTTON,
        positions: [SheetMenuPosition.SHEET_BAR],
        title: 'sheetConfig.removeProtectSheet',
        disabled$: getRemovePermissionFromSheetBarDisable$(accessor),
        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_SHEET),
    };
}

export function sheetPermissionChangeSheetPermissionSheetBarMenuFactory(accessor: IAccessor): IMenuButtonItem {
    return {
        id: ChangeSheetProtectionFromSheetBarCommand.id,
        type: MenuItemType.BUTTON,
        positions: [SheetMenuPosition.SHEET_BAR],
        title: 'sheetConfig.changeSheetPermission',
        disabled$: getSetPermissionFromSheetBarDisable$(accessor),
        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_SHEET),
    };
}

export function sheetPermissionViewAllProtectRuleSheetBarMenuFactory(accessor: IAccessor): IMenuButtonItem {
    return {
        id: ViewSheetPermissionFromSheetBarCommand.id,
        type: MenuItemType.BUTTON,
        positions: [SheetMenuPosition.SHEET_BAR],
        title: 'sheetConfig.viewAllProtectArea',
        disabled$: getViewPermissionDisable$(accessor),
        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_SHEET),
    };
}

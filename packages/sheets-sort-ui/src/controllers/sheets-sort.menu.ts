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
import type { IMenuItem } from '@univerjs/ui';
import { UniverInstanceType } from '@univerjs/core';
import { RangeProtectionPermissionEditPoint, WorkbookEditablePermission, WorksheetEditPermission, WorksheetSortPermission } from '@univerjs/sheets';
import { getCurrentExclusiveRangeInterest$, getCurrentRangeDisable$ } from '@univerjs/sheets-ui';
import { getMenuHiddenObservable, MenuItemType } from '@univerjs/ui';
import { SortRangeAscCommand, SortRangeAscExtCommand, SortRangeAscExtInCtxMenuCommand, SortRangeAscInCtxMenuCommand, SortRangeCustomCommand, SortRangeCustomInCtxMenuCommand, SortRangeDescCommand, SortRangeDescExtCommand, SortRangeDescExtInCtxMenuCommand, SortRangeDescInCtxMenuCommand } from '../commands/commands/sheets-sort.command';

export const SHEETS_SORT_MENU_ID = 'sheet.menu.sheets-sort';
export const SHEETS_SORT_CTX_MENU_ID = 'sheet.menu.sheets-sort-ctx';

export const SHEETS_SORT_ASC_ICON = 'AscendingSingle';
export const SHEETS_SORT_ASC_EXT_ICON = 'ExpandAscendingSingle';
export const SHEETS_SORT_DESC_ICON = 'DescendingSingle';
export const SHEETS_SORT_DESC_EXT_ICON = 'ExpandDescendingSingle';
export const SHEETS_SORT_CUSTOM_ICON = 'CustomSortSingle';

export function sortRangeMenuFactory(accessor: IAccessor): IMenuItem {
    return {
        id: SHEETS_SORT_MENU_ID,
        type: MenuItemType.SUBITEMS,
        icon: SHEETS_SORT_ASC_ICON,
        tooltip: 'sheets-sort.general.sort',
        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_SHEET),
        disabled$: getCurrentRangeDisable$(accessor, { workbookTypes: [WorkbookEditablePermission], worksheetTypes: [WorksheetSortPermission, WorksheetEditPermission], rangeTypes: [RangeProtectionPermissionEditPoint] }),
    };
}

export function sortRangeAscMenuFactory(_accessor: IAccessor): IMenuItem {
    return {
        id: SortRangeAscCommand.id,
        icon: SHEETS_SORT_ASC_ICON,
        title: 'sheets-sort.general.sort-asc-cur',
        type: MenuItemType.BUTTON,
        hidden$: getCurrentExclusiveRangeInterest$(_accessor),
    };
}

export function sortRangeAscExtMenuFactory(_accessor: IAccessor): IMenuItem {
    return {
        id: SortRangeAscExtCommand.id,
        title: 'sheets-sort.general.sort-asc-ext',
        icon: SHEETS_SORT_ASC_EXT_ICON,
        type: MenuItemType.BUTTON,
    };
}

export function sortRangeDescMenuFactory(_accessor: IAccessor): IMenuItem {
    return {
        id: SortRangeDescCommand.id,
        title: 'sheets-sort.general.sort-desc-cur',
        icon: SHEETS_SORT_DESC_ICON,
        type: MenuItemType.BUTTON,
    };
}

export function sortRangeDescExtMenuFactory(_accessor: IAccessor): IMenuItem {
    return {
        id: SortRangeDescExtCommand.id,
        title: 'sheets-sort.general.sort-desc-ext',
        icon: SHEETS_SORT_DESC_EXT_ICON,
        type: MenuItemType.BUTTON,
    };
}

export function sortRangeCustomMenuFactory(_accessor: IAccessor): IMenuItem {
    return {
        id: SortRangeCustomCommand.id,
        title: 'sheets-sort.general.sort-custom',
        type: MenuItemType.BUTTON,
        icon: SHEETS_SORT_CUSTOM_ICON,
    };
}

export function sortRangeCtxMenuFactory(accessor: IAccessor): IMenuItem {
    return {
        id: SHEETS_SORT_CTX_MENU_ID,
        title: 'sheets-sort.general.sort',
        type: MenuItemType.SUBITEMS,
        icon: SHEETS_SORT_ASC_ICON,
        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_SHEET),
        disabled$: getCurrentRangeDisable$(accessor, {
            workbookTypes: [WorkbookEditablePermission],
            worksheetTypes: [WorksheetSortPermission, WorksheetEditPermission],
            rangeTypes: [RangeProtectionPermissionEditPoint],
        }),
    };
}

export function sortRangeAscCtxMenuFactory(_accessor: IAccessor): IMenuItem {
    return {
        id: SortRangeAscInCtxMenuCommand.id,
        title: 'sheets-sort.general.sort-asc-cur',
        type: MenuItemType.BUTTON,
        icon: SHEETS_SORT_ASC_ICON,
        disabled$: getCurrentRangeDisable$(_accessor, { workbookTypes: [WorkbookEditablePermission], worksheetTypes: [WorksheetSortPermission, WorksheetEditPermission], rangeTypes: [RangeProtectionPermissionEditPoint] }),
    };
}

export function sortRangeAscExtCtxMenuFactory(_accessor: IAccessor): IMenuItem {
    return {
        id: SortRangeAscExtInCtxMenuCommand.id,
        title: 'sheets-sort.general.sort-asc-ext',
        type: MenuItemType.BUTTON,
        icon: SHEETS_SORT_ASC_EXT_ICON,
        disabled$: getCurrentRangeDisable$(_accessor, { workbookTypes: [WorkbookEditablePermission], worksheetTypes: [WorksheetSortPermission, WorksheetEditPermission], rangeTypes: [RangeProtectionPermissionEditPoint] }),
    };
}

export function sortRangeDescCtxMenuFactory(_accessor: IAccessor): IMenuItem {
    return {
        id: SortRangeDescInCtxMenuCommand.id,
        title: 'sheets-sort.general.sort-desc-cur',
        type: MenuItemType.BUTTON,
        icon: SHEETS_SORT_DESC_ICON,
        disabled$: getCurrentRangeDisable$(_accessor, { workbookTypes: [WorkbookEditablePermission], worksheetTypes: [WorksheetSortPermission, WorksheetEditPermission], rangeTypes: [RangeProtectionPermissionEditPoint] }),
    };
}

export function sortRangeDescExtCtxMenuFactory(_accessor: IAccessor): IMenuItem {
    return {
        id: SortRangeDescExtInCtxMenuCommand.id,
        title: 'sheets-sort.general.sort-desc-ext',
        type: MenuItemType.BUTTON,
        icon: SHEETS_SORT_DESC_EXT_ICON,
        disabled$: getCurrentRangeDisable$(_accessor, { workbookTypes: [WorkbookEditablePermission], worksheetTypes: [WorksheetSortPermission, WorksheetEditPermission], rangeTypes: [RangeProtectionPermissionEditPoint] }),
    };
}

export function sortRangeCustomCtxMenuFactory(_accessor: IAccessor): IMenuItem {
    return {
        id: SortRangeCustomInCtxMenuCommand.id,
        title: 'sheets-sort.general.sort-custom',
        type: MenuItemType.BUTTON,
        icon: SHEETS_SORT_CUSTOM_ICON,
        disabled$: getCurrentRangeDisable$(_accessor, { workbookTypes: [WorkbookEditablePermission], worksheetTypes: [WorksheetSortPermission, WorksheetEditPermission], rangeTypes: [RangeProtectionPermissionEditPoint] }),
    };
}

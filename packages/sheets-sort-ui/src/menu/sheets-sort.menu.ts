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
import { IUniverInstanceService, UniverInstanceType } from '@univerjs/core';
import {
    getSheetCommandTarget,
    RangeProtectionPermissionEditPoint,
    SheetsSelectionsService,
    WorkbookEditablePermission,
    WorksheetEditPermission,
    WorksheetSortPermission,
} from '@univerjs/sheets';
import { SheetsSortService } from '@univerjs/sheets-sort';
import { getCurrentExclusiveRangeInterest$, getCurrentRangeDisable$ } from '@univerjs/sheets-ui';
import { getMenuHiddenObservable, MenuItemType } from '@univerjs/ui';
import { combineLatest, map, startWith } from 'rxjs';
import type { LocaleKey } from '../locale/types';
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

export const SHEETS_SORT_MENU_ID = 'sheet.menu.sheets-sort';
export const SHEETS_SORT_CTX_MENU_ID = 'sheet.menu.sheets-sort-ctx';

function getSortRangeDisabled$(accessor: IAccessor, permissions: Parameters<typeof getCurrentRangeDisable$>[1]) {
    const sorts = accessor.get(SheetsSortService);
    const instances = accessor.get(IUniverInstanceService);
    const selections = accessor.get(SheetsSelectionsService);
    return combineLatest([getCurrentRangeDisable$(accessor, permissions), sorts.sortGuardsChanged$.pipe(startWith(0))]).pipe(
        map(([disabled]) => {
            const target = getSheetCommandTarget(instances);
            const range = selections.getCurrentLastSelection()?.range;
            return disabled || (!!target && !!range && !sorts.canSort({ ...target, range }));
        })
    );
}

export function sortRangeMenuFactory(accessor: IAccessor): IMenuItem<LocaleKey> {
    return {
        id: SHEETS_SORT_MENU_ID,
        type: MenuItemType.SUBITEMS,
        icon: 'AscendingIcon',
        tooltip: 'sheets-sort-ui.general.sort',
        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_SHEET),
        disabled$: getSortRangeDisabled$(accessor, {
            workbookTypes: [WorkbookEditablePermission],
            worksheetTypes: [WorksheetSortPermission, WorksheetEditPermission],
            rangeTypes: [RangeProtectionPermissionEditPoint],
        }),
    };
}

export function sortRangeAscMenuFactory(accessor: IAccessor): IMenuItem<LocaleKey> {
    return {
        id: SortRangeAscCommand.id,
        icon: 'AscendingIcon',
        title: 'sheets-sort-ui.general.sort-asc-cur',
        type: MenuItemType.BUTTON,
        hidden$: getCurrentExclusiveRangeInterest$(accessor),
    };
}

export function sortRangeAscExtMenuFactory(): IMenuItem<LocaleKey> {
    return {
        id: SortRangeAscExtCommand.id,
        title: 'sheets-sort-ui.general.sort-asc-ext',
        icon: 'ExpandAscendingIcon',
        type: MenuItemType.BUTTON,
    };
}

export function sortRangeDescMenuFactory(): IMenuItem<LocaleKey> {
    return {
        id: SortRangeDescCommand.id,
        title: 'sheets-sort-ui.general.sort-desc-cur',
        icon: 'DescendingIcon',
        type: MenuItemType.BUTTON,
    };
}

export function sortRangeDescExtMenuFactory(): IMenuItem<LocaleKey> {
    return {
        id: SortRangeDescExtCommand.id,
        title: 'sheets-sort-ui.general.sort-desc-ext',
        icon: 'ExpandDescendingIcon',
        type: MenuItemType.BUTTON,
    };
}

export function sortRangeCustomMenuFactory(): IMenuItem<LocaleKey> {
    return {
        id: SortRangeCustomCommand.id,
        title: 'sheets-sort-ui.general.sort-custom',
        type: MenuItemType.BUTTON,
        icon: 'CustomSortIcon',
    };
}

export function sortRangeCtxMenuFactory(accessor: IAccessor): IMenuItem<LocaleKey> {
    return {
        id: SHEETS_SORT_CTX_MENU_ID,
        title: 'sheets-sort-ui.general.sort',
        type: MenuItemType.SUBITEMS,
        icon: 'AscendingIcon',
        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_SHEET),
        disabled$: getSortRangeDisabled$(accessor, {
            workbookTypes: [WorkbookEditablePermission],
            worksheetTypes: [WorksheetSortPermission, WorksheetEditPermission],
            rangeTypes: [RangeProtectionPermissionEditPoint],
        }),
    };
}

export function sortRangeAscCtxMenuFactory(accessor: IAccessor): IMenuItem<LocaleKey> {
    return {
        id: SortRangeAscInCtxMenuCommand.id,
        title: 'sheets-sort-ui.general.sort-asc-cur',
        type: MenuItemType.BUTTON,
        icon: 'AscendingIcon',
        disabled$: getSortRangeDisabled$(accessor, {
            workbookTypes: [WorkbookEditablePermission],
            worksheetTypes: [WorksheetSortPermission, WorksheetEditPermission],
            rangeTypes: [RangeProtectionPermissionEditPoint],
        }),
    };
}

export function sortRangeAscExtCtxMenuFactory(accessor: IAccessor): IMenuItem<LocaleKey> {
    return {
        id: SortRangeAscExtInCtxMenuCommand.id,
        title: 'sheets-sort-ui.general.sort-asc-ext',
        type: MenuItemType.BUTTON,
        icon: 'ExpandAscendingIcon',
        disabled$: getSortRangeDisabled$(accessor, {
            workbookTypes: [WorkbookEditablePermission],
            worksheetTypes: [WorksheetSortPermission, WorksheetEditPermission],
            rangeTypes: [RangeProtectionPermissionEditPoint],
        }),
    };
}

export function sortRangeDescCtxMenuFactory(accessor: IAccessor): IMenuItem<LocaleKey> {
    return {
        id: SortRangeDescInCtxMenuCommand.id,
        title: 'sheets-sort-ui.general.sort-desc-cur',
        type: MenuItemType.BUTTON,
        icon: 'DescendingIcon',
        disabled$: getSortRangeDisabled$(accessor, {
            workbookTypes: [WorkbookEditablePermission],
            worksheetTypes: [WorksheetSortPermission, WorksheetEditPermission],
            rangeTypes: [RangeProtectionPermissionEditPoint],
        }),
    };
}

export function sortRangeDescExtCtxMenuFactory(accessor: IAccessor): IMenuItem<LocaleKey> {
    return {
        id: SortRangeDescExtInCtxMenuCommand.id,
        title: 'sheets-sort-ui.general.sort-desc-ext',
        type: MenuItemType.BUTTON,
        icon: 'ExpandDescendingIcon',
        disabled$: getSortRangeDisabled$(accessor, {
            workbookTypes: [WorkbookEditablePermission],
            worksheetTypes: [WorksheetSortPermission, WorksheetEditPermission],
            rangeTypes: [RangeProtectionPermissionEditPoint],
        }),
    };
}

export function sortRangeCustomCtxMenuFactory(accessor: IAccessor): IMenuItem<LocaleKey> {
    return {
        id: SortRangeCustomInCtxMenuCommand.id,
        title: 'sheets-sort-ui.general.sort-custom',
        type: MenuItemType.BUTTON,
        icon: 'CustomSortIcon',
        disabled$: getSortRangeDisabled$(accessor, {
            workbookTypes: [WorkbookEditablePermission],
            worksheetTypes: [WorksheetSortPermission, WorksheetEditPermission],
            rangeTypes: [RangeProtectionPermissionEditPoint],
        }),
    };
}

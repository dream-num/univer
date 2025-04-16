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
import type { IMenuButtonItem, IMenuSelectorItem } from '@univerjs/ui';
import { UniverInstanceType } from '@univerjs/core';
import { RangeProtectionPermissionViewPoint, WorksheetFilterPermission, WorksheetViewPermission } from '@univerjs/sheets';
import { ClearSheetsFilterCriteriaCommand, ReCalcSheetsFilterCommand, SheetsFilterService, SmartToggleSheetsFilterCommand } from '@univerjs/sheets-filter';

import { getCurrentRangeDisable$, getObservableWithExclusiveRange$ } from '@univerjs/sheets-ui';
import { getMenuHiddenObservable, MenuItemType } from '@univerjs/ui';
import { map, of, switchMap } from 'rxjs';

export function SmartToggleFilterMenuItemFactory(accessor: IAccessor): IMenuSelectorItem {
    const sheetsFilterService = accessor.get(SheetsFilterService);

    return {
        id: SmartToggleSheetsFilterCommand.id,
        type: MenuItemType.BUTTON_SELECTOR,
        icon: 'FilterSingle',
        tooltip: 'sheets-filter.toolbar.smart-toggle-filter-tooltip',
        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_SHEET),
        activated$: sheetsFilterService.activeFilterModel$.pipe(map((model) => !!model)),
        disabled$: getObservableWithExclusiveRange$(accessor, getCurrentRangeDisable$(accessor, { worksheetTypes: [WorksheetFilterPermission, WorksheetViewPermission], rangeTypes: [RangeProtectionPermissionViewPoint] })),
    };
}

export function ClearFilterCriteriaMenuItemFactory(accessor: IAccessor): IMenuButtonItem {
    const sheetsFilterService = accessor.get(SheetsFilterService);

    return {
        id: ClearSheetsFilterCriteriaCommand.id,
        type: MenuItemType.BUTTON,
        title: 'sheets-filter.toolbar.clear-filter-criteria',
        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_SHEET),
        disabled$: sheetsFilterService.activeFilterModel$.pipe(switchMap((model) => model?.hasCriteria$.pipe(map((m) => !m)) ?? of(true))),
    };
}

export function ReCalcFilterMenuItemFactory(accessor: IAccessor): IMenuButtonItem {
    const sheetsFilterService = accessor.get(SheetsFilterService);

    return {
        id: ReCalcSheetsFilterCommand.id,
        type: MenuItemType.BUTTON,
        title: 'sheets-filter.toolbar.re-calc-filter-conditions',
        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_SHEET),
        disabled$: sheetsFilterService.activeFilterModel$.pipe(switchMap((model) => model?.hasCriteria$.pipe(map((m) => !m)) ?? of(true))),
    };
}

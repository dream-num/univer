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
import {
    RangeProtectionPermissionViewPoint,
    WorksheetFilterPermission,
    WorksheetViewPermission,
} from '@univerjs/sheets';
import {
    ClearSheetsFilterCriteriaCommand,
    ReCalcSheetsFilterCommand,
    SheetsFilterService,
    SmartToggleSheetsFilterCommand,
} from '@univerjs/sheets-filter';
import { getCurrentRangeDisable$, getObservableWithExclusiveRange$ } from '@univerjs/sheets-ui';
import { getMenuHiddenObservable, MenuItemType } from '@univerjs/ui';
import { combineLatest, map, of, switchMap } from 'rxjs';
import type { LocaleKey } from '../locale/types';

export function SmartToggleFilterMenuItemFactory(accessor: IAccessor): IMenuSelectorItem<LocaleKey> {
    const sheetsFilterService = accessor.get(SheetsFilterService);

    return {
        id: SmartToggleSheetsFilterCommand.id,
        type: MenuItemType.BUTTON_SELECTOR,
        icon: 'FilterIcon',
        tooltip: 'sheets-filter-ui.toolbar.smart-toggle-filter-tooltip',
        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_SHEET),
        activated$: sheetsFilterService.activeFilterModel$.pipe(map((model) => !!model)),
        disabled$: getFilterRangeDisabled$(accessor),
    };
}

export function ClearFilterCriteriaMenuItemFactory(accessor: IAccessor): IMenuButtonItem<LocaleKey> {
    const sheetsFilterService = accessor.get(SheetsFilterService);

    return {
        id: ClearSheetsFilterCriteriaCommand.id,
        type: MenuItemType.BUTTON,
        title: 'sheets-filter-ui.toolbar.clear-filter-criteria',
        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_SHEET),
        disabled$: combineLatest([
            sheetsFilterService.activeFilterModel$.pipe(
                switchMap((model) => model?.hasCriteria$.pipe(map((hasCriteria) => !hasCriteria)) ?? of(true))
            ),
            getFilterRangeDisabled$(accessor),
        ]).pipe(map(([criteriaDisabled, rangeDisabled]) => criteriaDisabled || rangeDisabled)),
    };
}

export function ReCalcFilterMenuItemFactory(accessor: IAccessor): IMenuButtonItem<LocaleKey> {
    const sheetsFilterService = accessor.get(SheetsFilterService);

    return {
        id: ReCalcSheetsFilterCommand.id,
        type: MenuItemType.BUTTON,
        title: 'sheets-filter-ui.toolbar.re-calc-filter-conditions',
        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_SHEET),
        disabled$: combineLatest([
            sheetsFilterService.activeFilterModel$.pipe(
                switchMap((model) => model?.hasCriteria$.pipe(map((hasCriteria) => !hasCriteria)) ?? of(true))
            ),
            getFilterRangeDisabled$(accessor),
        ]).pipe(map(([criteriaDisabled, rangeDisabled]) => criteriaDisabled || rangeDisabled)),
    };
}

function getFilterRangeDisabled$(accessor: IAccessor) {
    return getObservableWithExclusiveRange$(
        accessor,
        getCurrentRangeDisable$(accessor, {
            worksheetTypes: [WorksheetFilterPermission, WorksheetViewPermission],
            rangeTypes: [RangeProtectionPermissionViewPoint],
        })
    );
}

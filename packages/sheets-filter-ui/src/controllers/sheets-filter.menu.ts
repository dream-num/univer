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

import { getMenuHiddenObservable, IMenuService, MenuGroup, MenuItemType, MenuPosition, mergeMenuConfigs } from '@univerjs/ui';
import type { IMenuButtonItem, IMenuSelectorItem } from '@univerjs/ui';
import type { IAccessor } from '@wendellhu/redi';
import { SheetsFilterService } from '@univerjs/sheets-filter';
import { UniverInstanceType } from '@univerjs/core';

import { map, of, switchMap } from 'rxjs';
import { ClearSheetsFilterCriteriaCommand, ReCalcSheetsFilterCommand, SmartToggleSheetsFilterCommand } from '../commands/sheets-filter.command';

export function SmartToggleFilterMenuItemFactory(accessor: IAccessor): IMenuSelectorItem {
    const sheetsFilterService = accessor.get(SheetsFilterService);
    const menuService = accessor.get(IMenuService);

    const menuItemConfig = menuService.getMenuConfig(SmartToggleSheetsFilterCommand.id);

    return mergeMenuConfigs({
        id: SmartToggleSheetsFilterCommand.id,
        group: MenuGroup.TOOLBAR_FORMULAS_INSERT,
        type: MenuItemType.BUTTON_SELECTOR,
        icon: 'FilterSingle',
        tooltip: 'sheets-filter.toolbar.smart-toggle-filter-tooltip',
        positions: [MenuPosition.TOOLBAR_START],
        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_SHEET),
        activated$: sheetsFilterService.activeFilterModel$.pipe(map((model) => !!model)),
    }, menuItemConfig);
}

export function ClearFilterCriteriaMenuItemFactory(accessor: IAccessor): IMenuButtonItem {
    const sheetsFilterService = accessor.get(SheetsFilterService);
    const menuService = accessor.get(IMenuService);

    const menuItemConfig = menuService.getMenuConfig(ClearSheetsFilterCriteriaCommand.id);

    return mergeMenuConfigs({
        id: ClearSheetsFilterCriteriaCommand.id,
        group: MenuGroup.TOOLBAR_OTHERS,
        type: MenuItemType.BUTTON,
        title: 'sheets-filter.toolbar.clear-filter-criteria',
        positions: [SmartToggleSheetsFilterCommand.id],
        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_SHEET),
        disabled$: sheetsFilterService.activeFilterModel$.pipe(switchMap((model) => model?.hasCriteria$.pipe(map((m) => !m)) ?? of(true))),
    }, menuItemConfig);
}

export function ReCalcFilterMenuItemFactory(accessor: IAccessor): IMenuButtonItem {
    const sheetsFilterService = accessor.get(SheetsFilterService);
    const menuService = accessor.get(IMenuService);

    const menuItemConfig = menuService.getMenuConfig(ReCalcSheetsFilterCommand.id);

    return mergeMenuConfigs({
        id: ReCalcSheetsFilterCommand.id,
        group: MenuGroup.TOOLBAR_OTHERS,
        type: MenuItemType.BUTTON,
        title: 'sheets-filter.toolbar.re-calc-filter-conditions',
        positions: [SmartToggleSheetsFilterCommand.id],
        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_SHEET),
        disabled$: sheetsFilterService.activeFilterModel$.pipe(switchMap((model) => model?.hasCriteria$.pipe(map((m) => !m)) ?? of(true))),
    }, menuItemConfig);
}

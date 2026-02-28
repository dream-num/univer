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
import type { ISelectionWithStyle } from '@univerjs/sheets';
import type { IMenuButtonItem, IMenuSelectorItem } from '@univerjs/ui';
import { UniverInstanceType } from '@univerjs/core';
import { CancelFrozenCommand, SheetsSelectionsService } from '@univerjs/sheets';
import { getMenuHiddenObservable, MenuItemType } from '@univerjs/ui';
import { combineLatest, map, Observable } from 'rxjs';
import { SetColumnFrozenCommand, SetFirstColumnFrozenCommand, SetFirstRowFrozenCommand, SetRowFrozenCommand, SetSelectionFrozenCommand } from '../../commands/commands/set-frozen.command';
import { MENU_ITEM_FROZEN_COMPONENT } from '../../components/menu-item-frozen';

const getMenuHiddenByCurrentSelectionChangedObservable$ = (accessor: IAccessor, type: 'row' | 'col' | 'all'): Observable<boolean> => {
    const selectionManagerService = accessor.get(SheetsSelectionsService);

    return new Observable((subscriber) => {
        const update = (selection: ISelectionWithStyle) => {
            if (!selection) {
                return subscriber.next(true);
            }

            const { primary, range } = selection;

            const row = primary?.startRow ?? range.startRow;
            const col = primary?.startColumn ?? range.startColumn;

            if (type === 'row' && row <= 0) {
                return subscriber.next(true);
            }

            if (type === 'col' && col <= 0) {
                return subscriber.next(true);
            }

            subscriber.next(false);
        };

        const subscription = selectionManagerService.selectionChanged$.subscribe((selections) => {
            if (!selections || selections.length === 0) {
                return subscriber.next(true);
            }

            update(selections[selections.length - 1]);
        });

        update(selectionManagerService.getCurrentLastSelection() as ISelectionWithStyle);

        return () => subscription.unsubscribe();
    });
};

export const SHEET_FROZEN_MENU_ID = 'sheet.menu.sheet-frozen';

export function SheetFrozenMenuItemFactory(accessor: IAccessor): IMenuSelectorItem<string> {
    return {
        id: SHEET_FROZEN_MENU_ID,
        type: MenuItemType.SUBITEMS,
        title: 'rightClick.freeze',
        icon: 'FreezeToSelectedIcon',
        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_SHEET),
    };
}

export const SHEET_FROZEN_COLUMN_HEADER_MENU_ID = 'sheet.column-header-menu.sheet-frozen';

export function SheetFrozenColumnHeaderMenuItemFactory(accessor: IAccessor): IMenuSelectorItem<string> {
    return {
        id: SHEET_FROZEN_COLUMN_HEADER_MENU_ID,
        type: MenuItemType.SUBITEMS,
        title: 'rightClick.freeze',
        icon: 'FreezeToSelectedIcon',
        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_SHEET),
    };
}

export const SHEET_FROZEN_ROW_HEADER_MENU_ID = 'sheet.row-header-menu.sheet-frozen';

export function SheetFrozenRowHeaderMenuItemFactory(accessor: IAccessor): IMenuSelectorItem<string> {
    return {
        id: SHEET_FROZEN_ROW_HEADER_MENU_ID,
        type: MenuItemType.SUBITEMS,
        title: 'rightClick.freeze',
        icon: 'FreezeToSelectedIcon',
        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_SHEET),
    };
}

export function FrozenMenuItemFactory(accessor: IAccessor): IMenuButtonItem {
    return {
        id: SetSelectionFrozenCommand.id,
        type: MenuItemType.BUTTON,
        icon: 'FreezeToSelectedIcon',
        label: {
            name: MENU_ITEM_FROZEN_COMPONENT,
            props: {
                type: 'all',
            },
        },
        hidden$: combineLatest([getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_SHEET), getMenuHiddenByCurrentSelectionChangedObservable$(accessor, 'all')]).pipe(
            map(([menuHidden, selectionHidden]) => menuHidden || selectionHidden)
        ),
    };
}

export function FrozenRowMenuItemFactory(accessor: IAccessor): IMenuButtonItem {
    return {
        id: SetRowFrozenCommand.id,
        type: MenuItemType.BUTTON,
        icon: 'FreezeRowIcon',
        label: {
            name: MENU_ITEM_FROZEN_COMPONENT,
            props: {
                type: 'row',
            },
        },
        hidden$: combineLatest([getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_SHEET), getMenuHiddenByCurrentSelectionChangedObservable$(accessor, 'row')]).pipe(
            map(([menuHidden, selectionHidden]) => menuHidden || selectionHidden)
        ),
    };
}

export function FrozenColMenuItemFactory(accessor: IAccessor): IMenuButtonItem {
    return {
        id: SetColumnFrozenCommand.id,
        type: MenuItemType.BUTTON,
        icon: 'FreezeColumnIcon',
        label: {
            name: MENU_ITEM_FROZEN_COMPONENT,
            props: {
                type: 'col',
            },
        },
        hidden$: combineLatest([getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_SHEET), getMenuHiddenByCurrentSelectionChangedObservable$(accessor, 'col')]).pipe(
            map(([menuHidden, selectionHidden]) => menuHidden || selectionHidden)
        ),
    };
}

export function FrozenFirstRowMenuItemFactory(accessor: IAccessor): IMenuButtonItem {
    return {
        id: SetFirstRowFrozenCommand.id,
        type: MenuItemType.BUTTON,
        title: 'rightClick.freezeFirstRow',
        icon: 'FreezeRowIcon',
        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_SHEET),
    };
}

export function FrozenFirstColMenuItemFactory(accessor: IAccessor): IMenuButtonItem {
    return {
        id: SetFirstColumnFrozenCommand.id,
        type: MenuItemType.BUTTON,
        title: 'rightClick.freezeFirstCol',
        icon: 'FreezeColumnIcon',
        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_SHEET),
    };
}

export function CancelFrozenMenuItemFactory(accessor: IAccessor): IMenuButtonItem {
    return {
        id: CancelFrozenCommand.id,
        type: MenuItemType.BUTTON,
        title: 'rightClick.cancelFreeze',
        icon: 'CancelFreezeIcon',
        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_SHEET),
    };
}

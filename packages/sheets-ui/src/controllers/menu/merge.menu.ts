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
import { FOCUSING_COMMON_DRAWINGS, IContextService, UniverInstanceType } from '@univerjs/core';
import {
    AddWorksheetMergeAllCommand,
    AddWorksheetMergeCommand,
    AddWorksheetMergeHorizontalCommand,
    AddWorksheetMergeVerticalCommand,
    RangeProtectionPermissionEditPoint,
    RemoveWorksheetMergeCommand,
    WorkbookEditablePermission,
    WorksheetEditPermission,
    WorksheetSetCellStylePermission,
    WorksheetSetCellValuePermission,
} from '@univerjs/sheets';
import { getMenuHiddenObservable, MenuItemType } from '@univerjs/ui';
import { combineLatest, combineLatestWith, map, startWith } from 'rxjs';
import { getSheetSelectionsDisabled$ } from '../utils/selections-tools';
import { getCurrentRangeDisable$, getObservableWithExclusiveRange$ } from './menu-util';

export function CellMergeMenuItemFactory(accessor: IAccessor): IMenuSelectorItem<string> {
    const editDisabled$ = getObservableWithExclusiveRange$(accessor, getCurrentRangeDisable$(accessor, { workbookTypes: [WorkbookEditablePermission], worksheetTypes: [WorksheetEditPermission, WorksheetSetCellValuePermission, WorksheetSetCellStylePermission], rangeTypes: [RangeProtectionPermissionEditPoint] }));
    const selectionsHasCross$ = getSheetSelectionsDisabled$(accessor);

    return {
        id: AddWorksheetMergeCommand.id,
        icon: 'MergeAllIcon',
        tooltip: 'toolbar.mergeCell.main',
        type: MenuItemType.SUBITEMS,
        // selections: [...MERGE_CHILDREN],
        hidden$: combineLatest([
            getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_SHEET),
            accessor.get(IContextService).subscribeContextValue$(FOCUSING_COMMON_DRAWINGS).pipe(startWith(false)),
        ]).pipe(map(([hidden, focusingDrawing]) => hidden || focusingDrawing)),
        disabled$: editDisabled$.pipe(
            combineLatestWith(selectionsHasCross$),
            map(([disable, hasCross]) => disable || hasCross)
        ),
    };
}

export function CellMergeAllMenuItemFactory(accessor: IAccessor): IMenuButtonItem<string> {
    return {
        id: AddWorksheetMergeAllCommand.id,
        type: MenuItemType.BUTTON,
        title: 'merge.all',
        icon: 'MergeAllIcon',
        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_SHEET),
    };
}

export function CellMergeVerticalMenuItemFactory(accessor: IAccessor): IMenuButtonItem<string> {
    return {
        id: AddWorksheetMergeVerticalCommand.id,
        type: MenuItemType.BUTTON,
        title: 'merge.vertical',
        icon: 'VerticalIntegrationIcon',
        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_SHEET),
    };
}

export function CellMergeHorizontalMenuItemFactory(accessor: IAccessor): IMenuButtonItem<string> {
    return {
        id: AddWorksheetMergeHorizontalCommand.id,
        type: MenuItemType.BUTTON,
        title: 'merge.horizontal',
        icon: 'HorizontalMergeIcon',
        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_SHEET),
    };
}

export function CellMergeCancelMenuItemFactory(accessor: IAccessor): IMenuButtonItem<string> {
    return {
        id: RemoveWorksheetMergeCommand.id,
        type: MenuItemType.BUTTON,
        title: 'merge.cancel',
        icon: 'CancelMergeIcon',
        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_SHEET),
    };
}

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
import type { LocaleKey } from '../locale/types';
import {
    FOCUSING_COMMON_DRAWINGS,
    ICommandService,
    IContextService,
    IUniverInstanceService,
    UniverInstanceType,
} from '@univerjs/core';
import {
    AddWorksheetMergeAllCommand,
    AddWorksheetMergeCommand,
    AddWorksheetMergeHorizontalCommand,
    AddWorksheetMergeMutation,
    AddWorksheetMergeVerticalCommand,
    RangeProtectionPermissionEditPoint,
    RemoveWorksheetMergeCommand,
    RemoveWorksheetMergeMutation,
    SheetsSelectionsService,
    WorkbookEditablePermission,
    WorksheetEditPermission,
    WorksheetSetCellStylePermission,
    WorksheetSetCellValuePermission,
} from '@univerjs/sheets';
import { getMenuHiddenObservable, MenuItemType } from '@univerjs/ui';
import { combineLatest, combineLatestWith, distinctUntilChanged, map, Observable, startWith } from 'rxjs';
import { getSheetSelectionsDisabled$ } from '../controllers/utils/selections-tools';
import { deriveStateFromActiveSheet$, getCurrentRangeDisable$, getObservableWithExclusiveRange$ } from './menu-util';

export function CellMergeMenuItemFactory(accessor: IAccessor): IMenuSelectorItem<LocaleKey> {
    const commandService = accessor.get(ICommandService);
    const instanceService = accessor.get(IUniverInstanceService);
    const selectionService = accessor.get(SheetsSelectionsService);
    const editDisabled$ = getObservableWithExclusiveRange$(accessor, getCurrentRangeDisable$(accessor, {
        workbookTypes: [WorkbookEditablePermission],
        worksheetTypes: [WorksheetEditPermission, WorksheetSetCellValuePermission, WorksheetSetCellStylePermission],
        rangeTypes: [RangeProtectionPermissionEditPoint],
    }));
    const selectionsHasCross$ = getSheetSelectionsDisabled$(accessor);

    return {
        id: AddWorksheetMergeCommand.id,
        icon: 'MergeAllIcon',
        tooltip: 'sheets-ui.toolbar.mergeCell.main',
        type: MenuItemType.SUBITEMS,
        activated$: deriveStateFromActiveSheet$(instanceService, false, ({ worksheet }) => new Observable<boolean>((subscriber) => {
            const update = () => {
                const primary = selectionService.getCurrentLastSelection()?.primary;
                subscriber.next(!!primary && !!worksheet.getMergedCell(primary.actualRow, primary.actualColumn));
            };
            const selectionSubscription = selectionService.selectionChanged$.subscribe(update);
            const commandDisposable = commandService.onCommandExecuted((command) => {
                if (command.id === AddWorksheetMergeMutation.id || command.id === RemoveWorksheetMergeMutation.id) {
                    update();
                }
            });
            update();

            return () => {
                selectionSubscription.unsubscribe();
                commandDisposable.dispose();
            };
        })).pipe(distinctUntilChanged()),
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

export function CellMergeAllMenuItemFactory(accessor: IAccessor): IMenuButtonItem<LocaleKey> {
    return {
        id: AddWorksheetMergeAllCommand.id,
        type: MenuItemType.BUTTON,
        title: 'sheets-ui.merge.all',
        icon: 'MergeAllIcon',
        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_SHEET),
    };
}

export function CellMergeVerticalMenuItemFactory(accessor: IAccessor): IMenuButtonItem<LocaleKey> {
    return {
        id: AddWorksheetMergeVerticalCommand.id,
        type: MenuItemType.BUTTON,
        title: 'sheets-ui.merge.vertical',
        icon: 'VerticalIntegrationIcon',
        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_SHEET),
    };
}

export function CellMergeHorizontalMenuItemFactory(accessor: IAccessor): IMenuButtonItem<LocaleKey> {
    return {
        id: AddWorksheetMergeHorizontalCommand.id,
        type: MenuItemType.BUTTON,
        title: 'sheets-ui.merge.horizontal',
        icon: 'HorizontalMergeIcon',
        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_SHEET),
    };
}

export function CellMergeCancelMenuItemFactory(accessor: IAccessor): IMenuButtonItem<LocaleKey> {
    return {
        id: RemoveWorksheetMergeCommand.id,
        type: MenuItemType.BUTTON,
        title: 'sheets-ui.merge.cancel',
        icon: 'CancelMergeIcon',
        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_SHEET),
    };
}

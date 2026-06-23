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

import type { IAccessor, Workbook } from '@univerjs/core';
import type { IMenuItem, IMenuSelectorItem } from '@univerjs/ui';
import type { Observable } from 'rxjs';
import type { LocaleKey } from '../locale/types';
import { IUniverInstanceService, UniverInstanceType } from '@univerjs/core';
import { SheetsSelectionsService } from '@univerjs/sheets';
import {
    SheetsTableController,
    SheetTableInsertColCommand,
    SheetTableInsertRowCommand,
    SheetTableRemoveColCommand,
    SheetTableRemoveRowCommand,
} from '@univerjs/sheets-table';
import { getCurrentRangeDisable$ } from '@univerjs/sheets-ui';
import { getMenuHiddenObservable, MenuItemType } from '@univerjs/ui';
import { of, switchMap } from 'rxjs';
import { OpenTableSelectorOperation } from '../commands/operations/open-table-selector.operation';

export const SHEET_TABLE_CONTEXT_INSERT_MENU_ID = 'sheet.table.context-insert_menu-id';
export const SHEET_TABLE_CONTEXT_REMOVE_MENU_ID = 'sheet.table.context-remove_menu-id';

export function sheetTableToolbarInsertMenuFactory(accessor: IAccessor): IMenuItem<LocaleKey> {
    return {
        id: OpenTableSelectorOperation.id,
        type: MenuItemType.BUTTON,
        icon: 'TableIcon',
        tooltip: 'sheets-table-ui.title',
        title: 'sheets-table-ui.title',
        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_SHEET),
        disabled$: getCurrentRangeDisable$(accessor, {}, true),
    };
}

export function SheetTableInsertContextMenuFactory(accessor: IAccessor): IMenuSelectorItem<LocaleKey> {
    return {
        id: SHEET_TABLE_CONTEXT_INSERT_MENU_ID,
        type: MenuItemType.SUBITEMS,
        icon: 'InsertDoubleIcon',
        title: 'sheets-table-ui.insert.main',
        hidden$: getSheetTableRowColOperationHidden$(accessor),
    };
}

export function SheetTableRemoveContextMenuFactory(accessor: IAccessor): IMenuSelectorItem<LocaleKey> {
    return {
        id: SHEET_TABLE_CONTEXT_REMOVE_MENU_ID,
        type: MenuItemType.SUBITEMS,
        icon: 'ReduceDoubleIcon',
        title: 'sheets-table-ui.remove.main',
        hidden$: getSheetTableRowColOperationHidden$(accessor),
    };
}

export function SheetTableInsertRowMenuFactory(accessor: IAccessor) {
    return {
        id: SheetTableInsertRowCommand.id,
        type: MenuItemType.BUTTON,
        title: 'sheets-table-ui.insert.row',
        hidden$: getSheetTableHeaderOperationHidden$(accessor),
    };
}

export function SheetTableInsertColMenuFactory() {
    return {
        id: SheetTableInsertColCommand.id,
        title: 'sheets-table-ui.insert.col',
        type: MenuItemType.BUTTON,
    };
}

export function SheetTableRemoveRowMenuFactory(accessor: IAccessor) {
    return {
        id: SheetTableRemoveRowCommand.id,
        type: MenuItemType.BUTTON,
        title: 'sheets-table-ui.remove.row',
        hidden$: getSheetTableHeaderOperationHidden$(accessor),
    };
}

export function SheetTableRemoveColMenuFactory() {
    return {
        id: SheetTableRemoveColCommand.id,
        title: 'sheets-table-ui.remove.col',
        type: MenuItemType.BUTTON,
    };
}

export function getSheetTableRowColOperationHidden$(accessor: IAccessor): Observable<boolean> {
    const sheetsSelectionsService = accessor.get(SheetsSelectionsService);
    const univerInstanceService = accessor.get(IUniverInstanceService);
    const workbook$ = univerInstanceService.getCurrentTypeOfUnit$<Workbook>(UniverInstanceType.UNIVER_SHEET);

    return workbook$.pipe(
        switchMap((workbook) => {
            if (!workbook) return of(true);
            return workbook.activeSheet$.pipe(
                switchMap((sheet) => {
                    if (!sheet) return of(true);
                    return sheetsSelectionsService.selectionMoveEnd$.pipe(
                        switchMap((selections) => {
                            if (!selections.length || selections.length > 1) return of(true);
                            const selection = selections[0];
                            const range = selection.range;
                            const sheetsTableController = accessor.get(SheetsTableController);

                            const isInTable = sheetsTableController.getContainerTableWithRange(
                                workbook.getUnitId(),
                                sheet.getSheetId(),
                                range
                            );
                            return of(!isInTable);
                        })
                    );
                })
            );
        })
    );
}

export function getSheetTableHeaderOperationHidden$(accessor: IAccessor): Observable<boolean> {
    const sheetsSelectionsService = accessor.get(SheetsSelectionsService);
    const univerInstanceService = accessor.get(IUniverInstanceService);
    const workbook$ = univerInstanceService.getCurrentTypeOfUnit$<Workbook>(UniverInstanceType.UNIVER_SHEET);

    return workbook$.pipe(
        switchMap((workbook) => {
            if (!workbook) return of(true);
            return workbook.activeSheet$.pipe(
                switchMap((sheet) => {
                    if (!sheet) return of(true);
                    return sheetsSelectionsService.selectionMoveEnd$.pipe(
                        switchMap((selections) => {
                            if (!selections.length || selections.length > 1) return of(true);
                            const selection = selections[0];
                            const range = selection.range;
                            const sheetsTableController = accessor.get(SheetsTableController);

                            const isInTable = sheetsTableController.getContainerTableWithRange(
                                workbook.getUnitId(),
                                sheet.getSheetId(),
                                range
                            );
                            if (!isInTable) {
                                return of(true);
                            }
                            const tableRange = isInTable.getRange();
                            if (range.startRow === tableRange.startRow) {
                                return of(true);
                            }
                            return of(false);
                        })
                    );
                })
            );
        })
    );
}

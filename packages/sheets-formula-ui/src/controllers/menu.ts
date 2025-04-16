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
import type { IMenuItem } from '@univerjs/ui';
import { IUniverInstanceService, UniverInstanceType } from '@univerjs/core';
import { RangeProtectionPermissionEditPoint, WorkbookEditablePermission, WorksheetEditPermission, WorksheetSetCellValuePermission } from '@univerjs/sheets';
import { getCurrentRangeDisable$ } from '@univerjs/sheets-ui';
import { getMenuHiddenObservable, IClipboardInterfaceService, MenuItemType } from '@univerjs/ui';

import { combineLatestWith, map, Observable, of, switchMap } from 'rxjs';
import { SheetOnlyPasteFormulaCommand } from '../commands/commands/formula-clipboard.command';
import { InsertFunctionOperation } from '../commands/operations/insert-function.operation';
import { MoreFunctionsOperation } from '../commands/operations/more-functions.operation';

export function InsertFunctionMenuItemFactory(accessor: IAccessor): IMenuItem {
    return {
        id: InsertFunctionOperation.id,
        icon: 'FunctionSingle',
        tooltip: 'formula.insert.tooltip',
        type: MenuItemType.SELECTOR,
        selections: [
            {
                label: {
                    name: 'SUM',
                    selectable: false,
                },
                value: 'SUM',
                icon: 'SumSingle',
            },
            {
                label: {
                    name: 'AVERAGE',
                    selectable: false,
                },
                value: 'AVERAGE',
                icon: 'AvgSingle',
            },
            {
                label: {
                    name: 'COUNT',
                    selectable: false,
                },
                value: 'COUNT',
                icon: 'CntSingle',
            },
            {
                label: {
                    name: 'MAX',
                    selectable: false,
                },
                value: 'MAX',
                icon: 'MaxSingle',
            },
            {
                label: {
                    name: 'MIN',
                    selectable: false,
                },
                value: 'MIN',
                icon: 'MinSingle',
            },
        ],
        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_SHEET),
        disabled$: getCurrentRangeDisable$(accessor, { workbookTypes: [WorkbookEditablePermission], worksheetTypes: [WorksheetEditPermission, WorksheetSetCellValuePermission], rangeTypes: [RangeProtectionPermissionEditPoint] }),
    };
}

export function MoreFunctionsMenuItemFactory(accessor: IAccessor): IMenuItem {
    return {
        id: MoreFunctionsOperation.id,
        title: 'formula.insert.more',
        type: MenuItemType.BUTTON,
    };
}

function menuClipboardDisabledObservable(injector: IAccessor): Observable<boolean> {
    const univerInstanceService = injector.get(IUniverInstanceService);
    const workbook$ = univerInstanceService.getCurrentTypeOfUnit$<Workbook>(UniverInstanceType.UNIVER_SHEET);
    return workbook$.pipe(
        switchMap((workbook) => {
            if (!workbook) {
                return of(true);
            }
            const clipboardInterfaceService = injector.get(IClipboardInterfaceService);
            if (clipboardInterfaceService) {
                return new Observable((subscriber) => subscriber.next(!injector.get(IClipboardInterfaceService).supportClipboard)) as Observable<boolean>;
            }
            return of(true);
        })
    );
}

export function PasteFormulaMenuItemFactory(accessor: IAccessor): IMenuItem {
    return {
        id: SheetOnlyPasteFormulaCommand.id,
        type: MenuItemType.BUTTON,
        title: 'formula.operation.pasteFormula',
        disabled$: menuClipboardDisabledObservable(accessor).pipe(
            combineLatestWith(getCurrentRangeDisable$(accessor, { workbookTypes: [WorkbookEditablePermission], rangeTypes: [RangeProtectionPermissionEditPoint], worksheetTypes: [WorksheetSetCellValuePermission, WorksheetEditPermission] })),
            map(([d1, d2]) => d1 || d2)
        ),
    };
}

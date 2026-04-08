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
import type { ISelectionWithStyle } from '@univerjs/sheets';
import type { IMenuButtonItem } from '@univerjs/ui';
import { CellValueType, isRealNum, isTextFormat, IUniverInstanceService, UniverInstanceType } from '@univerjs/core';
import {
    RangeProtectionPermissionEditPoint,
    SheetsSelectionsService,
    TextToNumberCommand,
    WorkbookEditablePermission,
    WorksheetEditPermission,
    WorksheetSetCellValuePermission,
} from '@univerjs/sheets';
import { getMenuHiddenObservable, MenuItemType } from '@univerjs/ui';
import { combineLatest, map, Observable } from 'rxjs';
import { getCurrentRangeDisable$, getObservableWithExclusiveRange$ } from './menu-util';

const getMenuHiddenByCurrentSelectionChangedObservable$ = (accessor: IAccessor): Observable<boolean> => {
    const selectionManagerService = accessor.get(SheetsSelectionsService);
    const univerInstanceService = accessor.get(IUniverInstanceService);
    const worksheet = univerInstanceService.getCurrentUnitOfType<Workbook>(UniverInstanceType.UNIVER_SHEET)?.getActiveSheet();

    return new Observable((subscriber) => {
        const update = (selections?: ISelectionWithStyle[]) => {
            if (!worksheet || !selections || selections.length === 0) {
                return subscriber.next(true);
            }

            for (let i = 0; i < selections.length; i++) {
                const { range } = selections[i];

                for (let r = range.startRow; r <= range.endRow; r++) {
                    for (let c = range.startColumn; c <= range.endColumn; c++) {
                        const cell = worksheet.getCellRaw(r, c);
                        const pattern = typeof cell?.s === 'string' ? worksheet.getStyleDataByHash(cell.s)?.n?.pattern : cell?.s?.n?.pattern;

                        if (cell && cell.v && (cell.t !== CellValueType.NUMBER || isTextFormat(pattern)) && isRealNum(cell.v)) {
                            return subscriber.next(false);
                        }
                    }
                }
            }

            subscriber.next(true);
        };

        const subscription = selectionManagerService.selectionChanged$.subscribe((selections) => {
            if (!selections || selections.length === 0) {
                return subscriber.next(true);
            }

            update(selections);
        });

        update(selectionManagerService.getCurrentSelections() as ISelectionWithStyle[]);

        return () => subscription.unsubscribe();
    });
};

export const TEXT_TO_NUMBER_TOOLBAR_MENU_ID = 'sheet.toolbar.text-to-number';
export function Text2NumberToolbarMenuItemFactory(accessor: IAccessor): IMenuButtonItem<string> {
    return {
        id: TEXT_TO_NUMBER_TOOLBAR_MENU_ID,
        commandId: TextToNumberCommand.id,
        type: MenuItemType.BUTTON,
        title: 'toolbar.textToNumber',
        disabled$: getObservableWithExclusiveRange$(accessor, getCurrentRangeDisable$(accessor, {
            workbookTypes: [WorkbookEditablePermission],
            worksheetTypes: [WorksheetEditPermission, WorksheetSetCellValuePermission],
            rangeTypes: [RangeProtectionPermissionEditPoint],
        })),
        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_SHEET),
    };
}

export const TEXT_TO_NUMBER_CONTEXT_MENU_ID = 'sheet.contextMenu.text-to-number';
export function Text2NumberContextMenuItemFactory(accessor: IAccessor): IMenuButtonItem<string> {
    return {
        id: TEXT_TO_NUMBER_CONTEXT_MENU_ID,
        commandId: TextToNumberCommand.id,
        type: MenuItemType.BUTTON,
        title: 'rightClick.textToNumber',
        icon: 'PipingIcon',
        disabled$: getObservableWithExclusiveRange$(accessor, getCurrentRangeDisable$(accessor, {
            workbookTypes: [WorkbookEditablePermission],
            worksheetTypes: [WorksheetEditPermission, WorksheetSetCellValuePermission],
            rangeTypes: [RangeProtectionPermissionEditPoint],
        })),
        hidden$: combineLatest([getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_SHEET), getMenuHiddenByCurrentSelectionChangedObservable$(accessor)]).pipe(
            map(([menuHidden, selectionHidden]) => menuHidden || selectionHidden)
        ),
    };
}

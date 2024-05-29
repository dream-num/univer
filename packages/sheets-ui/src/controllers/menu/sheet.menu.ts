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

import type { Workbook } from '@univerjs/core';
import { BooleanNumber, ICommandService, IUniverInstanceService, UniverInstanceType } from '@univerjs/core';
import {
    CopySheetCommand,
    InsertSheetMutation,
    RemoveSheetMutation,
    SetTabColorCommand,
    SetWorksheetHideCommand,
    SetWorksheetHideMutation,
    SetWorksheetShowCommand,
    WorkbookPermissionService,
    WorksheetProtectionRuleModel,
} from '@univerjs/sheets';
import type { IMenuButtonItem, IMenuSelectorItem } from '@univerjs/ui';
import { MenuItemType } from '@univerjs/ui';
import type { IAccessor } from '@wendellhu/redi';
import { combineLatest, combineLatestWith, map, Observable } from 'rxjs';

import { RemoveSheetConfirmCommand } from '../../commands/commands/remove-sheet-confirm.command';
import { ShowMenuListCommand } from '../../commands/commands/unhide.command';
import { RenameSheetOperation } from '../../commands/operations/rename-sheet.operation';
import { COLOR_PICKER_COMPONENT } from '../../components/color-picker';
import { SheetMenuPosition } from './menu';
import { getWorkbookPermissionDisable$ } from './menu-util';

export function DeleteSheetMenuItemFactory(accessor: IAccessor): IMenuButtonItem {
    const univerInstanceService = accessor.get(IUniverInstanceService);
    const commandService = accessor.get(ICommandService);
    const workbookPermissionService = accessor.get(WorkbookPermissionService);
    const worksheetRuleModel = accessor.get(WorksheetProtectionRuleModel);
    const workbook = univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET)!;
    const unitId = workbook.getUnitId();
    const defaultDisable$ = new Observable<boolean>((subscriber) => {
        const disposable = commandService.onCommandExecuted((c) => {
            const id = c.id;
            if (
                id === RemoveSheetMutation.id ||
                id === InsertSheetMutation.id ||
                id === SetWorksheetHideMutation.id
            ) {
                const worksheets = univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET)!.getWorksheets();
                // loop through all worksheets Map to see if there is more than one visible sheet
                const visibleSheets = Array.from(worksheets.values()).filter(
                    (sheet) => sheet.getConfig().hidden === BooleanNumber.FALSE
                );

                subscriber.next(visibleSheets.length === 1);
            }
        });
        subscriber.next(false);
        return disposable.dispose;
    });
    const permissionDisable$ = getWorkbookPermissionDisable$(accessor);

    return {
        id: RemoveSheetConfirmCommand.id,
        type: MenuItemType.BUTTON,
        positions: [SheetMenuPosition.SHEET_BAR],
        title: 'sheetConfig.delete',
        disabled$: combineLatest([defaultDisable$, permissionDisable$]).pipe(
            map(([defaultDisabled, permissionDisabled]) => {
                return defaultDisabled || permissionDisabled;
            })
        ),
    };
}

export function CopySheetMenuItemFactory(accessor: IAccessor): IMenuButtonItem {
    return {
        id: CopySheetCommand.id,
        type: MenuItemType.BUTTON,
        positions: [SheetMenuPosition.SHEET_BAR],
        title: 'sheetConfig.copy',
        disabled$: getWorkbookPermissionDisable$(accessor),
    };
}

export function RenameSheetMenuItemFactory(accessor: IAccessor): IMenuButtonItem {
    return {
        id: RenameSheetOperation.id,
        type: MenuItemType.BUTTON,
        positions: [SheetMenuPosition.SHEET_BAR],
        title: 'sheetConfig.rename',
        disabled$: getWorkbookPermissionDisable$(accessor),
    };
}

export function ChangeColorSheetMenuItemFactory(accessor: IAccessor): IMenuSelectorItem<string> {
    return {
        id: SetTabColorCommand.id,
        title: 'sheetConfig.changeColor',
        positions: [SheetMenuPosition.SHEET_BAR],
        type: MenuItemType.SELECTOR,
        selections: [
            {
                label: {
                    name: COLOR_PICKER_COMPONENT,
                    hoverable: false,
                },
            },
        ],
        hidden$: getWorkbookPermissionDisable$(accessor),
    };
}

export function HideSheetMenuItemFactory(accessor: IAccessor): IMenuButtonItem {
    const univerInstanceService = accessor.get(IUniverInstanceService);
    const commandService = accessor.get(ICommandService);

    return {
        id: SetWorksheetHideCommand.id,
        type: MenuItemType.BUTTON,
        positions: [SheetMenuPosition.SHEET_BAR],
        title: 'sheetConfig.hide',
        disabled$: new Observable<boolean>((subscriber) => {
            const disposable = commandService.onCommandExecuted((c) => {
                const id = c.id;
                if (
                    id === RemoveSheetMutation.id ||
                    id === InsertSheetMutation.id ||
                    id === SetWorksheetHideMutation.id
                ) {
                    const worksheets = univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET)!.getWorksheets();
                    // loop through all worksheets Map to see if there is more than one visible sheet
                    const visibleSheets = Array.from(worksheets.values()).filter(
                        (sheet) => sheet.getConfig().hidden === BooleanNumber.FALSE
                    );

                    subscriber.next(visibleSheets.length === 1);
                }
            });
            subscriber.next(false);
            return disposable.dispose;
        }).pipe(
            combineLatestWith(getWorkbookPermissionDisable$(accessor)),
            map(([defaultDisabled, permissionDisabled]) => defaultDisabled || permissionDisabled)
        ),
    };
}

export function UnHideSheetMenuItemFactory(accessor: IAccessor): IMenuSelectorItem<any> {
    const univerInstanceService = accessor.get(IUniverInstanceService);
    const commandService = accessor.get(ICommandService);

    const workbook = univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET)!;
    const hiddenList = workbook.getHiddenWorksheets().map((s) => ({
        label: workbook.getSheetBySheetId(s)?.getName() || '',
        value: s,
    }));

    const defaultDisable$: Observable<boolean> = new Observable((subscriber) => {
        const disposable = commandService.onCommandExecuted((c) => {
            if (c.id !== SetWorksheetHideCommand.id && c.id !== SetWorksheetShowCommand.id) {
                return;
            }
            const newList = workbook.getHiddenWorksheets();
            const isEmpty = newList.length === 0;
            subscriber.next(isEmpty);
        });
        subscriber.next(hiddenList.length === 0);
        return disposable.dispose;
    });
    return {
        id: SetWorksheetShowCommand.id,
        type: MenuItemType.SELECTOR,
        positions: [SheetMenuPosition.SHEET_BAR],
        title: 'sheetConfig.unhide',
        disabled$: defaultDisable$.pipe(
            combineLatestWith(getWorkbookPermissionDisable$(accessor)),
            map(([defaultDisabled, permissionDisabled]) => defaultDisabled || permissionDisabled)
        ),
        selections: new Observable((subscriber) => {
            const disposable = commandService.onCommandExecuted((c) => {
                if (c.id !== SetWorksheetHideCommand.id && c.id !== SetWorksheetShowCommand.id) {
                    return;
                }
                const newList = workbook.getHiddenWorksheets().map((s) => ({
                    label: workbook.getSheetBySheetId(s)?.getName() || '',
                    value: s,
                }));
                subscriber.next(newList);
            });
            subscriber.next(hiddenList);
            return disposable.dispose;
        }),
    };
}

export function ShowMenuItemFactory(accessor: IAccessor): IMenuButtonItem {
    const univerInstanceService = accessor.get(IUniverInstanceService);
    const commandService = accessor.get(ICommandService);

    return {
        id: ShowMenuListCommand.id,
        type: MenuItemType.BUTTON,
        positions: [SheetMenuPosition.SHEET_BAR],
        title: 'sheetConfig.unhide',
        disabled$: new Observable<boolean>((subscriber) => {
            const disposable = commandService.onCommandExecuted((c) => {
                const id = c.id;
                if (
                    id === RemoveSheetMutation.id ||
                    id === InsertSheetMutation.id ||
                    id === SetWorksheetHideMutation.id
                ) {
                    const worksheets = univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET)!.getWorksheets();
                    // loop through all worksheets Map to see if there is more than one sheet
                    const visibleSheets = Array.from(worksheets.values());

                    subscriber.next(visibleSheets.length === 1);
                }
            });
            subscriber.next(false);
            return disposable.dispose;
        }).pipe(
            combineLatestWith(getWorkbookPermissionDisable$(accessor)),
            map(([defaultDisabled, permissionDisabled]) => defaultDisabled || permissionDisabled
            )),
    };
}

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
import { ICommandService, IUniverInstanceService } from '@univerjs/core';
import {
    InsertColAfterCommand,
    InsertColBeforeCommand,
    InsertMultiColsLeftCommand,
    InsertMultiColsRightCommand,
    InsertMultiRowsAboveCommand,
    InsertMultiRowsAfterCommand,
    InsertRowAfterCommand,
    InsertRowBeforeCommand,
    RangeProtectionPermissionEditPoint,
    SetSelectionsOperation,
    SheetsSelectionsService,
    WorkbookEditablePermission,
    WorksheetEditPermission,
    WorksheetInsertColumnPermission,
    WorksheetInsertRowPermission,
} from '@univerjs/sheets';

import { MenuItemType } from '@univerjs/ui';
import { Observable } from 'rxjs';
import { InsertRangeMoveDownConfirmCommand } from '../../commands/commands/insert-range-move-down-confirm.command';
import { InsertRangeMoveRightConfirmCommand } from '../../commands/commands/insert-range-move-right-confirm.command';
import { MENU_ITEM_INPUT_COMPONENT } from '../../components/menu-item-input';
import { deriveStateFromActiveSheet$, getBaseRangeMenuHidden$, getCellMenuHidden$, getCurrentRangeDisable$, getInsertAfterMenuHidden$, getInsertBeforeMenuHidden$, getObservableWithExclusiveRange$ } from './menu-util';

export const COL_INSERT_MENU_ID = 'sheet.menu.col-insert';
export function ColInsertMenuItemFactory(accessor: IAccessor): IMenuSelectorItem<string> {
    return {
        id: COL_INSERT_MENU_ID,
        type: MenuItemType.SUBITEMS,
        title: 'rightClick.insert',
        icon: 'Insert',
        hidden$: getBaseRangeMenuHidden$(accessor),
        disabled$: getCurrentRangeDisable$(accessor, { workbookTypes: [WorkbookEditablePermission], worksheetTypes: [WorksheetEditPermission, WorksheetInsertColumnPermission] }),
    };
}

export const ROW_INSERT_MENU_ID = 'sheet.menu.row-insert';
export function RowInsertMenuItemFactory(accessor: IAccessor): IMenuSelectorItem<string> {
    return {
        id: ROW_INSERT_MENU_ID,
        type: MenuItemType.SUBITEMS,
        title: 'rightClick.insert',
        icon: 'Insert',
        hidden$: getBaseRangeMenuHidden$(accessor),
        disabled$: getCurrentRangeDisable$(accessor, { workbookTypes: [WorkbookEditablePermission], worksheetTypes: [WorksheetInsertRowPermission, WorksheetEditPermission], rangeTypes: [RangeProtectionPermissionEditPoint] }),
    };
}

export const CELL_INSERT_MENU_ID = 'sheet.menu.cell-insert';
export function CellInsertMenuItemFactory(accessor: IAccessor): IMenuSelectorItem<string> {
    return {
        id: CELL_INSERT_MENU_ID,
        type: MenuItemType.SUBITEMS,
        title: 'rightClick.insert',
        icon: 'Insert',
        hidden$: getObservableWithExclusiveRange$(accessor, getBaseRangeMenuHidden$(accessor)),
        disabled$: getCurrentRangeDisable$(accessor, { workbookTypes: [WorkbookEditablePermission], worksheetTypes: [WorksheetInsertColumnPermission, WorksheetEditPermission], rangeTypes: [RangeProtectionPermissionEditPoint] }),
    };
}

/**
 * context menu when right click cell
 * @param accessor
 * @returns
 */
export function InsertRowBeforeMenuItemFactory(accessor: IAccessor): IMenuButtonItem {
    return {
        id: InsertRowBeforeCommand.id,
        type: MenuItemType.BUTTON,
        title: 'rightClick.insertRowBefore',
        icon: 'InsertRowAbove',
        disabled$: getCurrentRangeDisable$(accessor, { workbookTypes: [WorkbookEditablePermission], worksheetTypes: [WorksheetInsertRowPermission, WorksheetEditPermission], rangeTypes: [RangeProtectionPermissionEditPoint] }),
        hidden$: getInsertBeforeMenuHidden$(accessor, 'row'),
    };
}

/**
 * context menu when right click cell
 * @param accessor
 * @returns
 */
export function InsertRowBeforeCellMenuItemFactory(accessor: IAccessor): IMenuButtonItem<number> {
    const univerInstanceService = accessor.get(IUniverInstanceService);
    const selectionManagerService = accessor.get(SheetsSelectionsService);
    const commandService = accessor.get(ICommandService);
    const defaultValue = 1;
    return {
        id: InsertRowBeforeCommand.id,
        type: MenuItemType.BUTTON,
        icon: 'InsertRowAbove',
        label: {
            name: MENU_ITEM_INPUT_COMPONENT,
            props: {
                prefix: 'rightClick.insertRowsAbove',
                min: 1,
                max: 1000,
                suffix: 'rightClick.insertRowsAboveSuffix',
            },
        },
        value$: deriveStateFromActiveSheet$(univerInstanceService, defaultValue, () => new Observable((subscriber) => {
            function update() {
                const range = selectionManagerService.getCurrentLastSelection()?.range;
                let countSelectedRange = defaultValue;
                if (range) {
                    countSelectedRange = range?.endRow - range?.startRow + 1;
                }

                subscriber.next(countSelectedRange);
            }

            const disposable = commandService.onCommandExecuted((c) => {
                const id = c.id;
                if (id === SetSelectionsOperation.id) {
                    return update();
                }
            });

            update();
            return disposable.dispose;
        })),
        disabled$: getCurrentRangeDisable$(accessor, { workbookTypes: [WorkbookEditablePermission], worksheetTypes: [WorksheetInsertRowPermission, WorksheetEditPermission], rangeTypes: [RangeProtectionPermissionEditPoint] }),
        hidden$: getInsertBeforeMenuHidden$(accessor, 'row'),
    };
}

export function InsertRowAfterMenuItemFactory(accessor: IAccessor): IMenuButtonItem {
    return {
        id: InsertRowAfterCommand.id,
        type: MenuItemType.BUTTON,
        title: 'rightClick.insertRow',
        icon: 'InsertRowBelow',
        disabled$: getCurrentRangeDisable$(accessor, { workbookTypes: [WorkbookEditablePermission], worksheetTypes: [WorksheetInsertRowPermission, WorksheetEditPermission], rangeTypes: [RangeProtectionPermissionEditPoint] }),
        hidden$: getInsertAfterMenuHidden$(accessor, 'row'),
    };
}

/**
 * context menu when right click cell
 * @param accessor
 */
export function InsertColLeftCellMenuItemFactory(accessor: IAccessor): IMenuButtonItem<number> {
    const univerInstanceService = accessor.get(IUniverInstanceService);
    const selectionManagerService = accessor.get(SheetsSelectionsService);
    const commandService = accessor.get(ICommandService);
    const defaultValue = 1;
    return {
        id: InsertColBeforeCommand.id,
        type: MenuItemType.BUTTON,
        icon: 'LeftInsertColumn',
        label: {
            name: MENU_ITEM_INPUT_COMPONENT,
            props: {
                prefix: 'rightClick.insertColsLeft',
                min: 1,
                max: 1000,
                suffix: 'rightClick.insertColsLeftSuffix',
            },
        },
        value$: deriveStateFromActiveSheet$(univerInstanceService, defaultValue, () => new Observable((subscriber) => {
            function update() {
                const range = selectionManagerService.getCurrentLastSelection()?.range;
                let countSelectedRange = defaultValue;
                if (range) {
                    countSelectedRange = range?.endColumn - range?.startColumn + 1;
                }

                subscriber.next(countSelectedRange);
            }

            const disposable = commandService.onCommandExecuted((c) => {
                const id = c.id;
                if (id === SetSelectionsOperation.id) {
                    return update();
                }
            });

            update();
            return disposable.dispose;
        })),
        disabled$: getCurrentRangeDisable$(accessor, { workbookTypes: [WorkbookEditablePermission], worksheetTypes: [WorksheetInsertColumnPermission, WorksheetEditPermission], rangeTypes: [RangeProtectionPermissionEditPoint] }),
        hidden$: getInsertBeforeMenuHidden$(accessor, 'col'),
    };
}

export function InsertColBeforeMenuItemFactory(accessor: IAccessor): IMenuButtonItem {
    return {
        id: InsertColBeforeCommand.id,
        type: MenuItemType.BUTTON,
        title: 'rightClick.insertColumnBefore',
        icon: 'LeftInsertColumn',
        disabled$: getCurrentRangeDisable$(accessor, { workbookTypes: [WorkbookEditablePermission], worksheetTypes: [WorksheetInsertColumnPermission, WorksheetEditPermission], rangeTypes: [RangeProtectionPermissionEditPoint] }),
        hidden$: getInsertBeforeMenuHidden$(accessor, 'col'),
    };
}

export function InsertColAfterMenuItemFactory(accessor: IAccessor): IMenuButtonItem {
    return {
        id: InsertColAfterCommand.id,
        type: MenuItemType.BUTTON,
        title: 'rightClick.insertColumn',
        icon: 'RightInsertColumn',
        disabled$: getCurrentRangeDisable$(accessor, { workbookTypes: [WorkbookEditablePermission], worksheetTypes: [WorksheetInsertColumnPermission, WorksheetEditPermission], rangeTypes: [RangeProtectionPermissionEditPoint] }),
        hidden$: getInsertAfterMenuHidden$(accessor, 'col'),
    };
}

export function InsertRangeMoveRightMenuItemFactory(accessor: IAccessor): IMenuButtonItem {
    return {
        id: InsertRangeMoveRightConfirmCommand.id,
        type: MenuItemType.BUTTON,
        title: 'rightClick.moveRight',
        icon: 'InsertCellShiftRight',
        disabled$: getCurrentRangeDisable$(accessor, { workbookTypes: [WorkbookEditablePermission], worksheetTypes: [WorksheetEditPermission], rangeTypes: [RangeProtectionPermissionEditPoint] }),
        hidden$: getCellMenuHidden$(accessor, 'col'),
    };
}

/**
 * For insert range in cell context menu
 * @param accessor
 */
export function InsertRangeMoveDownMenuItemFactory(accessor: IAccessor): IMenuButtonItem {
    return {
        id: InsertRangeMoveDownConfirmCommand.id,
        type: MenuItemType.BUTTON,
        title: 'rightClick.moveDown',
        icon: 'InsertCellDown',
        disabled$: getCurrentRangeDisable$(accessor, { workbookTypes: [WorkbookEditablePermission], worksheetTypes: [WorksheetEditPermission], rangeTypes: [RangeProtectionPermissionEditPoint] }),
        hidden$: getCellMenuHidden$(accessor, 'row'),
    };
}

/**
 * Context menu in rowheader.
 * @param accessor
 */
export function InsertMultiRowsAfterHeaderMenuItemFactory(accessor: IAccessor): IMenuButtonItem<number> {
    const univerInstanceService = accessor.get(IUniverInstanceService);
    const selectionManagerService = accessor.get(SheetsSelectionsService);
    const commandService = accessor.get(ICommandService);
    const defaultValue = 1;
    return {
        id: InsertMultiRowsAfterCommand.id,
        type: MenuItemType.BUTTON,
        icon: 'InsertRowBelow',
        label: {
            name: MENU_ITEM_INPUT_COMPONENT,
            props: {
                prefix: 'rightClick.insertRowsAfter',
                min: 1,
                max: 1000,
                suffix: 'rightClick.insertRowsAfterSuffix',
            },
        },
        value$: deriveStateFromActiveSheet$(univerInstanceService, defaultValue, () => new Observable((subscriber) => {
            function update() {
                const range = selectionManagerService.getCurrentLastSelection()?.range;
                let countSelectedRange = defaultValue;
                if (range) {
                    countSelectedRange = range?.endRow - range?.startRow + 1;
                }

                subscriber.next(countSelectedRange);
            }

            const disposable = commandService.onCommandExecuted((c) => {
                const id = c.id;
                if (id === SetSelectionsOperation.id) {
                    return update();
                }
            });

            update();
            return disposable.dispose;
        })),

        disabled$: getCurrentRangeDisable$(accessor, { workbookTypes: [WorkbookEditablePermission], worksheetTypes: [WorksheetInsertRowPermission, WorksheetEditPermission], rangeTypes: [RangeProtectionPermissionEditPoint] }),
        hidden$: getBaseRangeMenuHidden$(accessor),
    };
}

/**
 * Context menu in rowheader.
 * @param accessor
 */
export function InsertMultiRowsAboveHeaderMenuItemFactory(accessor: IAccessor): IMenuButtonItem<number> {
    const univerInstanceService = accessor.get(IUniverInstanceService);
    const selectionManagerService = accessor.get(SheetsSelectionsService);
    const commandService = accessor.get(ICommandService);
    const defaultValue = 1;
    return {
        id: InsertMultiRowsAboveCommand.id,
        type: MenuItemType.BUTTON,
        icon: 'InsertRowAbove',
        label: {
            name: MENU_ITEM_INPUT_COMPONENT,
            props: {
                prefix: 'rightClick.insertRowsAbove',
                min: 1,
                max: 1000,
                suffix: 'rightClick.insertRowsAboveSuffix',
            },
        },
        value$: deriveStateFromActiveSheet$(univerInstanceService, defaultValue, () => new Observable((subscriber) => {
            function update() {
                const range = selectionManagerService.getCurrentLastSelection()?.range;
                let countSelectedRange = defaultValue;
                if (range) {
                    countSelectedRange = range?.endRow - range?.startRow + 1;
                }

                subscriber.next(countSelectedRange);
            }

            const disposable = commandService.onCommandExecuted((c) => {
                const id = c.id;
                if (id === SetSelectionsOperation.id) {
                    return update();
                }
            });

            update();
            return disposable.dispose;
        })),
        disabled$: getCurrentRangeDisable$(accessor, { workbookTypes: [WorkbookEditablePermission], worksheetTypes: [WorksheetInsertRowPermission, WorksheetEditPermission], rangeTypes: [RangeProtectionPermissionEditPoint] }),
        hidden$: getBaseRangeMenuHidden$(accessor),
    };
}

/**
 * Context menu in rowheader.
 * @param accessor
 */
export function InsertMultiColsLeftHeaderMenuItemFactory(accessor: IAccessor): IMenuButtonItem<number> {
    const univerInstanceService = accessor.get(IUniverInstanceService);
    const selectionManagerService = accessor.get(SheetsSelectionsService);
    const commandService = accessor.get(ICommandService);
    const defaultValue = 1;
    return {
        id: InsertMultiColsLeftCommand.id,
        type: MenuItemType.BUTTON,
        icon: 'LeftInsertColumn',
        label: {
            name: MENU_ITEM_INPUT_COMPONENT,
            props: {
                prefix: 'rightClick.insertColsLeft',
                min: 1,
                max: 1000,
                suffix: 'rightClick.insertColsLeftSuffix',
            },
        },
        value$: deriveStateFromActiveSheet$(univerInstanceService, defaultValue, () => new Observable((subscriber) => {
            function update() {
                const range = selectionManagerService.getCurrentLastSelection()?.range;
                let countSelectedRange = defaultValue;
                if (range) {
                    countSelectedRange = range?.endColumn - range?.startColumn + 1;
                }

                subscriber.next(countSelectedRange);
            }

            const disposable = commandService.onCommandExecuted((c) => {
                const id = c.id;
                if (id === SetSelectionsOperation.id) {
                    return update();
                }
            });

            update();
            return disposable.dispose;
        })),
        disabled$: getCurrentRangeDisable$(accessor, { workbookTypes: [WorkbookEditablePermission], worksheetTypes: [WorksheetInsertRowPermission, WorksheetEditPermission], rangeTypes: [RangeProtectionPermissionEditPoint] }),
        hidden$: getBaseRangeMenuHidden$(accessor),
    };
}

/**
 * Context menu in rowheader.
 * @param accessor
 */
export function InsertMultiColsRightHeaderMenuItemFactory(accessor: IAccessor): IMenuButtonItem<number> {
    const univerInstanceService = accessor.get(IUniverInstanceService);
    const selectionManagerService = accessor.get(SheetsSelectionsService);
    const commandService = accessor.get(ICommandService);
    const defaultValue = 1;
    return {
        id: InsertMultiColsRightCommand.id,
        type: MenuItemType.BUTTON,
        icon: 'RightInsertColumn',
        label: {
            name: MENU_ITEM_INPUT_COMPONENT,
            props: {
                prefix: 'rightClick.insertColsRight',
                min: 1,
                max: 1000,
                suffix: 'rightClick.insertColsRightSuffix',
            },
        },
        value$: deriveStateFromActiveSheet$(univerInstanceService, defaultValue, () => new Observable((subscriber) => {
            function update() {
                const range = selectionManagerService.getCurrentLastSelection()?.range;
                let countSelectedRange = defaultValue;
                if (range) {
                    countSelectedRange = range?.endColumn - range?.startColumn + 1;
                }

                subscriber.next(countSelectedRange);
            }

            const disposable = commandService.onCommandExecuted((c) => {
                const id = c.id;
                if (id === SetSelectionsOperation.id) {
                    return update();
                }
            });

            update();
            return disposable.dispose;
        })),
        disabled$: getCurrentRangeDisable$(accessor, { workbookTypes: [WorkbookEditablePermission], worksheetTypes: [WorksheetInsertRowPermission, WorksheetEditPermission], rangeTypes: [RangeProtectionPermissionEditPoint] }),
        hidden$: getBaseRangeMenuHidden$(accessor),
    };
}

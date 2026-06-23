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
    RangeProtectionPermissionEditPoint,
    WorkbookDeleteColumnPermission,
    WorkbookDeleteRowPermission,
    WorkbookEditablePermission,
    WorksheetDeleteColumnPermission,
    WorksheetDeleteRowPermission,
    WorksheetEditPermission,
} from '@univerjs/sheets';
import { MenuItemType } from '@univerjs/ui';
import { DeleteRangeMoveLeftConfirmCommand } from '../commands/commands/delete-range-move-left-confirm.command';
import { DeleteRangeMoveUpConfirmCommand } from '../commands/commands/delete-range-move-up-confirm.command';
import {
    RemoveColConfirmCommand,
    RemoveRowConfirmCommand,
} from '../commands/commands/remove-row-col-confirm.command';
import {
    getBaseRangeMenuHidden$,
    getCellMenuHidden$,
    getCurrentRangeDisable$,
    getDeleteMenuHidden$,
    getObservableWithExclusiveRange$,
} from './menu-util';

export const DELETE_RANGE_MENU_ID = 'sheet.menu.delete';
export function DeleteRangeMenuItemFactory(accessor: IAccessor): IMenuSelectorItem<LocaleKey> {
    return {
        id: DELETE_RANGE_MENU_ID,
        type: MenuItemType.SUBITEMS,
        title: 'sheets-ui.rightClick.delete',
        icon: 'ReduceDoubleIcon',
        hidden$: getObservableWithExclusiveRange$(accessor, getBaseRangeMenuHidden$(accessor)),
        disabled$: getCurrentRangeDisable$(accessor, {
            workbookTypes: [WorkbookEditablePermission],
            worksheetTypes: [WorksheetEditPermission],
        }),
    };
}

export function RemoveColMenuItemFactory(accessor: IAccessor): IMenuButtonItem<LocaleKey> {
    return {
        id: RemoveColConfirmCommand.id,
        type: MenuItemType.BUTTON,
        icon: 'DeleteColumnDoubleIcon',
        title: 'sheets-ui.rightClick.deleteSelectedColumn',
        hidden$: getDeleteMenuHidden$(accessor, 'col'),
        disabled$: getCurrentRangeDisable$(accessor, {
            workbookTypes: [WorkbookEditablePermission, WorkbookDeleteColumnPermission],
            worksheetTypes: [WorksheetEditPermission, WorksheetDeleteColumnPermission],
        }),
    };
}

export function RemoveRowMenuItemFactory(accessor: IAccessor): IMenuButtonItem<LocaleKey> {
    return {
        id: RemoveRowConfirmCommand.id,
        type: MenuItemType.BUTTON,
        icon: 'DeleteRowDoubleIcon',
        title: 'sheets-ui.rightClick.deleteSelectedRow',
        disabled$: getCurrentRangeDisable$(accessor, {
            workbookTypes: [WorkbookEditablePermission, WorkbookDeleteRowPermission],
            worksheetTypes: [WorksheetEditPermission, WorksheetDeleteRowPermission],
        }),
        hidden$: getDeleteMenuHidden$(accessor, 'row'),
    };
}

export function DeleteRangeMoveLeftMenuItemFactory(accessor: IAccessor): IMenuButtonItem<LocaleKey> {
    return {
        id: DeleteRangeMoveLeftConfirmCommand.id,
        type: MenuItemType.BUTTON,
        title: 'sheets-ui.rightClick.moveLeft',
        icon: 'DeleteCellShiftLeftDoubleIcon',
        disabled$: getCurrentRangeDisable$(accessor, {
            workbookTypes: [WorkbookEditablePermission],
            worksheetTypes: [WorksheetEditPermission],
            rangeTypes: [RangeProtectionPermissionEditPoint],
        }),
        hidden$: getCellMenuHidden$(accessor, 'col'),
    };
}

export function DeleteRangeMoveUpMenuItemFactory(accessor: IAccessor): IMenuButtonItem<LocaleKey> {
    return {
        id: DeleteRangeMoveUpConfirmCommand.id,
        type: MenuItemType.BUTTON,
        title: 'sheets-ui.rightClick.moveUp',
        icon: 'DeleteCellShiftUpDoubleIcon',
        disabled$: getCurrentRangeDisable$(accessor, {
            workbookTypes: [WorkbookEditablePermission],
            worksheetTypes: [WorksheetEditPermission],
            rangeTypes: [RangeProtectionPermissionEditPoint],
        }),
        hidden$: getCellMenuHidden$(accessor, 'row'),
    };
}

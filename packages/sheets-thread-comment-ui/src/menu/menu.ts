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
import type { IShortcutItem } from '@univerjs/ui';
import { IPermissionService, IUniverInstanceService, UniverInstanceType } from '@univerjs/core';
import { RangeProtectionPermissionViewPoint, WorkbookCommentPermission, WorksheetViewPermission } from '@univerjs/sheets';
import { deriveStateFromActiveSheet$, getCurrentRangeDisable$, whenSheetEditorFocused } from '@univerjs/sheets-ui';
import { getMenuHiddenObservable, KeyCode, MenuItemType, MetaKeys } from '@univerjs/ui';
import { map } from 'rxjs';
import { AddSheetDrawingCommentOperation, ShowAddSheetCommentModalOperation, ToggleSheetCommentPanelOperation } from '../commands/operations/comment.operation';

function getDrawingCommentDisable$(accessor: IAccessor) {
    const univerInstanceService = accessor.get(IUniverInstanceService);
    const permissionService = accessor.get(IPermissionService);

    return deriveStateFromActiveSheet$(univerInstanceService, true, ({ workbook, worksheet }) => {
        const unitId = workbook.getUnitId();
        const subUnitId = worksheet.getSheetId();

        return permissionService.composePermission$([
            new WorkbookCommentPermission(unitId).id,
            new WorksheetViewPermission(unitId, subUnitId).id,
        ]).pipe(map((permissions) => permissions.some((permission) => permission.value === false)));
    });
}

export const drawingCommentMenuFactory = (accessor: IAccessor) => ({
    id: AddSheetDrawingCommentOperation.id,
    type: MenuItemType.BUTTON,
    icon: 'InsertCommentDoubleIcon',
    title: 'sheets-thread-comment-ui.menu.addComment',
    tooltip: 'sheets-thread-comment-ui.menu.addComment',
    hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_SHEET),
    disabled$: getDrawingCommentDisable$(accessor),
});

export const threadCommentMenuFactory = (accessor: IAccessor) => {
    return {
        id: ShowAddSheetCommentModalOperation.id,
        type: MenuItemType.BUTTON,
        icon: 'InsertCommentDoubleIcon',
        title: 'sheets-thread-comment-ui.menu.addComment',
        tooltip: 'sheets-thread-comment-ui.menu.addComment',
        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_SHEET),
        disabled$: getCurrentRangeDisable$(accessor, {
            workbookTypes: [WorkbookCommentPermission],
            worksheetTypes: [WorksheetViewPermission],
            rangeTypes: [RangeProtectionPermissionViewPoint],
        }),
    };
};

export const threadPanelMenuFactory = (accessor: IAccessor) => {
    return {
        id: ToggleSheetCommentPanelOperation.id,
        type: MenuItemType.BUTTON,
        icon: 'CommentIcon',
        title: 'sheets-thread-comment-ui.menu.openComments',
        tooltip: 'sheets-thread-comment-ui.menu.openComments',
        disabled$: getCurrentRangeDisable$(accessor, {
            workbookTypes: [WorkbookCommentPermission],
            worksheetTypes: [WorksheetViewPermission],
            rangeTypes: [RangeProtectionPermissionViewPoint],
        }),
        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_SHEET),
    };
};

export const AddCommentShortcut: IShortcutItem = {
    id: ShowAddSheetCommentModalOperation.id,
    binding: KeyCode.M | MetaKeys.CTRL_COMMAND | MetaKeys.ALT,
    preconditions: whenSheetEditorFocused,
};

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

import type { IMenuItem, IShortcutItem } from '@univerjs/ui';
import { getMenuHiddenObservable, KeyCode, MenuGroup, MenuItemType, MenuPosition, MetaKeys } from '@univerjs/ui';
import type { IAccessor } from '@wendellhu/redi';
import { ToggleSheetCommentPanelOperation } from '@univerjs/thread-comment-ui';
import { UniverInstanceType } from '@univerjs/core';
import { getCommentDisable$, whenSheetEditorFocused } from '@univerjs/sheets-ui';
import { RangeProtectionPermissionEditPoint, WorkbookCommentPermission, WorksheetViewPermission } from '@univerjs/sheets';
import { ShowAddSheetCommentModalOperation } from '../commands/operations/comment.operation';
import { COMMENT_SINGLE_ICON } from '../types/const';

export const threadCommentMenuFactory = (accessor: IAccessor) => {
    return {
        id: ShowAddSheetCommentModalOperation.id,
        type: MenuItemType.BUTTON,
        positions: [MenuPosition.CONTEXT_MENU],
        icon: COMMENT_SINGLE_ICON,
        title: 'sheetThreadComment.menu.addComment',
        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_SHEET),
        disabled$: getCommentDisable$(accessor, {
            workbookTypes: [WorkbookCommentPermission],
            worksheetTypes: [WorksheetViewPermission],
            rangeTypes: [RangeProtectionPermissionEditPoint],
        }),
    } as IMenuItem;
};

export const threadPanelMenuFactory = (accessor: IAccessor) => {
    return {
        id: ToggleSheetCommentPanelOperation.id,
        type: MenuItemType.BUTTON,
        icon: COMMENT_SINGLE_ICON,
        tooltip: 'sheetThreadComment.menu.commentManagement',
        positions: MenuPosition.TOOLBAR_START,
        group: MenuGroup.TOOLBAR_OTHERS,
        disabled$: getCommentDisable$(accessor, {
            workbookTypes: [WorkbookCommentPermission],
            worksheetTypes: [WorksheetViewPermission],
            rangeTypes: [RangeProtectionPermissionEditPoint],
        }),
        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_SHEET),

    };
};

export const AddCommentShortcut: IShortcutItem = {
    id: ShowAddSheetCommentModalOperation.id,
    binding: KeyCode.M | MetaKeys.CTRL_COMMAND | MetaKeys.ALT,
    preconditions: whenSheetEditorFocused,
};

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
import type { LocaleKey } from '../locale/types';
import { UniverInstanceType } from '@univerjs/core';
import { RangeProtectionPermissionViewPoint, SheetsSelectionsService, WorkbookCommentPermission, WorksheetViewPermission } from '@univerjs/sheets';
import { SheetsThreadCommentModel } from '@univerjs/sheets-thread-comment';
import { getCurrentRangeDisable$ } from '@univerjs/sheets-ui';
import { getMenuHiddenObservable, MenuItemType } from '@univerjs/ui';
import { ShowAddSheetCommentMobileOperation } from '../commands/operations/mobile/show-add-sheet-comment.operation';

export function getMobileThreadCommentMenuTitle(accessor: IAccessor): LocaleKey {
    const selectionService = accessor.get(SheetsSelectionsService);
    const selection = selectionService.getCurrentLastSelection()?.primary;
    const selectionParam = selectionService.currentSelectionParam;
    if (!selection || !selectionParam) {
        return 'sheets-thread-comment-ui.menu.addComment';
    }

    const commentId = accessor.get(SheetsThreadCommentModel).getByLocation(
        selectionParam.unitId,
        selectionParam.sheetId,
        selection.startRow,
        selection.startColumn
    );
    return commentId
        ? 'sheets-thread-comment-ui.menu.openComments'
        : 'sheets-thread-comment-ui.menu.addComment';
}

export const mobileThreadCommentMenuFactory = (accessor: IAccessor) => ({
    id: ShowAddSheetCommentMobileOperation.id,
    type: MenuItemType.BUTTON,
    icon: 'InsertCommentDoubleIcon',
    title: 'sheets-thread-comment-ui.menu.addComment',
    hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_SHEET),
    disabled$: getCurrentRangeDisable$(accessor, {
        workbookTypes: [WorkbookCommentPermission],
        worksheetTypes: [WorksheetViewPermission],
        rangeTypes: [RangeProtectionPermissionViewPoint],
    }),
});

export const mobileContextThreadCommentMenuFactory = (accessor: IAccessor) => ({
    ...mobileThreadCommentMenuFactory(accessor),
    title: getMobileThreadCommentMenuTitle(accessor),
});

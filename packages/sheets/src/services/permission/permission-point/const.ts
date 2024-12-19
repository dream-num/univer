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

import { RangeProtectionPermissionEditPoint } from './range/edit';
import { RangeProtectionPermissionViewPoint } from './range/view';
import { WorkbookCommentPermission } from './workbook/comment';
import { WorkbookCopyPermission } from './workbook/copy';
import { WorkbookCreateProtectPermission } from './workbook/create-permission';
import { WorkbookCreateSheetPermission } from './workbook/create-sheet';
import { WorkbookDeleteSheetPermission } from './workbook/delete-sheet';
import { WorkbookDuplicatePermission } from './workbook/duplicate';
import { WorkbookEditablePermission } from './workbook/editable';
import { WorkbookExportPermission } from './workbook/export';
import { WorkbookHideSheetPermission } from './workbook/hide-sheet';
import { WorkbookHistoryPermission } from './workbook/history';
import { WorkbookManageCollaboratorPermission } from './workbook/manage-collaborator';
import { WorkbookMoveSheetPermission } from './workbook/move-sheet';
import { WorkbookPrintPermission } from './workbook/print';
import { WorkbookRecoverHistoryPermission } from './workbook/recover-history';
import { WorkbookRenameSheetPermission } from './workbook/rename-sheet';
import { WorkbookSharePermission } from './workbook/share';
import { WorkbookViewPermission } from './workbook/view';
import { WorkbookViewHistoryPermission } from './workbook/view-history';
import { WorksheetCopyPermission } from './worksheet/copy';
import { WorksheetDeleteColumnPermission } from './worksheet/delete-column';
import { WorksheetDeleteProtectionPermission } from './worksheet/delete-protection';
import { WorksheetDeleteRowPermission } from './worksheet/delete-row';
import { WorksheetEditPermission } from './worksheet/edit';
import { WorksheetEditExtraObjectPermission } from './worksheet/edit-extra-object';
import { WorksheetFilterPermission } from './worksheet/filter';
import { WorksheetInsertColumnPermission } from './worksheet/insert-column';
import { WorksheetInsertHyperlinkPermission } from './worksheet/insert-hyperlink';
import { WorksheetInsertRowPermission } from './worksheet/insert-row';
import { WorksheetManageCollaboratorPermission } from './worksheet/manage-collaborator';
import { WorksheetPivotTablePermission } from './worksheet/pivot-table';
import { WorksheetSelectProtectedCellsPermission } from './worksheet/select-protected-cells';
import { WorksheetSelectUnProtectedCellsPermission } from './worksheet/select-un-protected-cells';
import { WorksheetSetCellStylePermission } from './worksheet/set-cell-style';
import { WorksheetSetCellValuePermission } from './worksheet/set-cell-value';
import { WorksheetSetColumnStylePermission } from './worksheet/set-column-style';
import { WorksheetSetRowStylePermission } from './worksheet/set-row-style';
import { WorksheetSortPermission } from './worksheet/sort';
import { WorksheetViewPermission } from './worksheet/view';

export const PermissionPointsDefinitions = {
    WorkbookCommentPermission,
    WorkbookCopyPermission,
    WorkbookCreateProtectPermission,
    WorkbookCreateSheetPermission,
    WorkbookDeleteSheetPermission,
    WorkbookDuplicatePermission,
    WorkbookEditablePermission,
    WorkbookExportPermission,
    WorkbookHideSheetPermission,
    WorkbookHistoryPermission,
    WorkbookManageCollaboratorPermission,
    WorkbookMoveSheetPermission,
    WorkbookPrintPermission,
    WorkbookRecoverHistoryPermission,
    WorkbookRenameSheetPermission,
    WorkbookSharePermission,
    WorkbookViewHistoryPermission,
    WorkbookViewPermission,
    WorksheetCopyPermission,

    WorksheetDeleteColumnPermission,
    WorksheetDeleteProtectionPermission,
    WorksheetDeleteRowPermission,
    WorksheetEditExtraObjectPermission,
    WorksheetEditPermission,
    WorksheetFilterPermission,
    WorksheetInsertColumnPermission,
    WorksheetInsertHyperlinkPermission,
    WorksheetInsertRowPermission,
    WorksheetManageCollaboratorPermission,
    WorksheetPivotTablePermission,
    WorksheetSelectProtectedCellsPermission,
    WorksheetSelectUnProtectedCellsPermission,
    WorksheetSetCellStylePermission,
    WorksheetSetCellValuePermission,
    WorksheetSetColumnStylePermission,
    WorksheetSetRowStylePermission,
    WorksheetSortPermission,
    WorksheetViewPermission,

    RangeProtectionPermissionEditPoint,
    RangeProtectionPermissionViewPoint,
};

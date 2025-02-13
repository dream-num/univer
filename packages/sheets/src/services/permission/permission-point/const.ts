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
import { WorksheetSetCellStylePermission } from './worksheet/set-cell-style';
import { WorksheetSetCellValuePermission } from './worksheet/set-cell-value';
import { WorksheetSetColumnStylePermission } from './worksheet/set-column-style';
import { WorksheetSetRowStylePermission } from './worksheet/set-row-style';
import { WorksheetSortPermission } from './worksheet/sort';
import { WorksheetViewPermission } from './worksheet/view';

/**
 * @ignore
 */
export const PermissionPointsDefinitions = {
    /**
     * The permission point for adding or editing workbook comments
     */
    WorkbookCommentPermission,

    /**
     * The permission point for copy in workbook
     */
    WorkbookCopyPermission,

    /**
     * The permission point for creating protect in a workbook
     */
    WorkbookCreateProtectPermission,

    /**
     * The permission point for creating new sheets in a workbook
     */
    WorkbookCreateSheetPermission,

    /**
     * The permission point for deleting sheets in a workbook
     */
    WorkbookDeleteSheetPermission,

    /**
     * The permission point for duplicating a sheet in a workbook
     */
    WorkbookDuplicatePermission,

    /**
     * The permission point for editing workbook content
     */
    WorkbookEditablePermission,

    /**
     * The permission point for exporting workbook data
     */
    WorkbookExportPermission,

    /**
     * The permission point for hiding sheets in a workbook
     */
    WorkbookHideSheetPermission,

    /**
     * The permission point for viewing and managing workbook history
     */
    WorkbookHistoryPermission,

    /**
     * The permission point for managing collaborators in a workbook
     */
    WorkbookManageCollaboratorPermission,

    /**
     * The permission point for moving sheets within a workbook
     */
    WorkbookMoveSheetPermission,

    /**
     * The permission point for printing a workbook
     */
    WorkbookPrintPermission,

    /**
     * The permission point for recovering a previous history state of a workbook
     */
    WorkbookRecoverHistoryPermission,

    /**
     * The permission point for renaming sheets in a workbook
     */
    WorkbookRenameSheetPermission,

    /**
     * The permission point for sharing a workbook with others
     */
    WorkbookSharePermission,

    /**
     * The permission point for viewing the history of a workbook
     */
    WorkbookViewHistoryPermission,

    /**
     * The permission point for viewing a workbook
     */
    WorkbookViewPermission,

    /**
     * The permission point for copying contents from a worksheet
     */
    WorksheetCopyPermission,

    /**
     * The permission point for deleting columns in a worksheet
     */
    WorksheetDeleteColumnPermission,

    /**
     * The permission point for deleting worksheet protection rules
     */
    WorksheetDeleteProtectionPermission,

    /**
     * The permission point for deleting rows in a worksheet
     */
    WorksheetDeleteRowPermission,

    /**
     * The permission point for editing extra objects (e.g. shapes) in a worksheet
     */
    WorksheetEditExtraObjectPermission,

    /**
     * The permission point for editing the content of a worksheet
     */
    WorksheetEditPermission,

    /**
     * The permission point for applying filters in a worksheet
     */
    WorksheetFilterPermission,

    /**
     * The permission point for inserting columns into a worksheet
     */
    WorksheetInsertColumnPermission,

    /**
     * The permission point for inserting hyperlinks in a worksheet
     */
    WorksheetInsertHyperlinkPermission,

    /**
     * The permission point for inserting rows into a worksheet
     */
    WorksheetInsertRowPermission,

    /**
     * The permission point for managing collaborators of a worksheet
     */
    WorksheetManageCollaboratorPermission,

    /**
     * The permission point for creating or modifying pivot tables in a worksheet
     */
    WorksheetPivotTablePermission,

    /**
     * The permission point for setting the style of cells in a worksheet
     */
    WorksheetSetCellStylePermission,

    /**
     * The permission point for setting the value of cells in a worksheet
     */
    WorksheetSetCellValuePermission,

    /**
     * The permission point for setting the style of columns in a worksheet
     */
    WorksheetSetColumnStylePermission,

    /**
     * The permission point for setting the style of rows in a worksheet
     */
    WorksheetSetRowStylePermission,

    /**
     * The permission point for performing sort operations on a worksheet
     */
    WorksheetSortPermission,

    /**
     * The permission point for viewing the content of a worksheet
     */
    WorksheetViewPermission,

    /**
     * The permission point for editing the range protection settings
     */
    RangeProtectionPermissionEditPoint,

    /**
     * The permission point for viewing the range protection settings
     */
    RangeProtectionPermissionViewPoint,
};

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

import type { RangePermissionPointConstructor, WorkbookPermissionPointConstructor, WorkSheetPermissionPointConstructor } from '@univerjs/core';
import {
    RangeProtectionPermissionDeleteProtectionPoint,
    RangeProtectionPermissionEditPoint,
    RangeProtectionPermissionManageCollaPoint,
    RangeProtectionPermissionViewPoint,
    WorkbookCommentPermission,
    WorkbookCopyPermission,
    WorkbookCopySheetPermission,
    WorkbookCreateProtectPermission,
    WorkbookCreateSheetPermission,
    WorkbookDeleteColumnPermission,
    WorkbookDeleteRowPermission,
    WorkbookDeleteSheetPermission,
    WorkbookDuplicatePermission,
    WorkbookEditablePermission,
    WorkbookExportPermission,
    WorkbookHideSheetPermission,
    WorkbookHistoryPermission,
    WorkbookInsertColumnPermission,
    WorkbookInsertRowPermission,
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
} from '@univerjs/sheets';
import { RangePermissionPoint, WorkbookPermissionPoint, WorksheetPermissionPoint } from './permission-types';

/**
 * Mapping table from Workbook permission point enum to class constructors
 */
export const WORKBOOK_PERMISSION_POINT_MAP: Record<WorkbookPermissionPoint, WorkbookPermissionPointConstructor> = {
    [WorkbookPermissionPoint.Edit]: WorkbookEditablePermission,
    [WorkbookPermissionPoint.View]: WorkbookViewPermission,
    [WorkbookPermissionPoint.Print]: WorkbookPrintPermission,
    [WorkbookPermissionPoint.Export]: WorkbookExportPermission,
    [WorkbookPermissionPoint.Share]: WorkbookSharePermission,
    [WorkbookPermissionPoint.CopyContent]: WorkbookCopyPermission,
    [WorkbookPermissionPoint.DuplicateFile]: WorkbookDuplicatePermission,
    [WorkbookPermissionPoint.Comment]: WorkbookCommentPermission,
    [WorkbookPermissionPoint.ManageCollaborator]: WorkbookManageCollaboratorPermission,
    [WorkbookPermissionPoint.CreateSheet]: WorkbookCreateSheetPermission,
    [WorkbookPermissionPoint.DeleteSheet]: WorkbookDeleteSheetPermission,
    [WorkbookPermissionPoint.RenameSheet]: WorkbookRenameSheetPermission,
    [WorkbookPermissionPoint.MoveSheet]: WorkbookMoveSheetPermission,
    [WorkbookPermissionPoint.HideSheet]: WorkbookHideSheetPermission,
    [WorkbookPermissionPoint.ViewHistory]: WorkbookViewHistoryPermission,
    [WorkbookPermissionPoint.ManageHistory]: WorkbookHistoryPermission,
    [WorkbookPermissionPoint.RecoverHistory]: WorkbookRecoverHistoryPermission,
    [WorkbookPermissionPoint.CreateProtection]: WorkbookCreateProtectPermission,
    [WorkbookPermissionPoint.InsertRow]: WorkbookInsertRowPermission,
    [WorkbookPermissionPoint.InsertColumn]: WorkbookInsertColumnPermission,
    [WorkbookPermissionPoint.DeleteRow]: WorkbookDeleteRowPermission,
    [WorkbookPermissionPoint.DeleteColumn]: WorkbookDeleteColumnPermission,
    [WorkbookPermissionPoint.CopySheet]: WorkbookCopySheetPermission,
};

/**
 * Mapping table from Worksheet permission point enum to class constructors
 */
export const WORKSHEET_PERMISSION_POINT_MAP: Record<WorksheetPermissionPoint, WorkSheetPermissionPointConstructor> = {
    [WorksheetPermissionPoint.Edit]: WorksheetEditPermission,
    [WorksheetPermissionPoint.View]: WorksheetViewPermission,
    [WorksheetPermissionPoint.Copy]: WorksheetCopyPermission,
    [WorksheetPermissionPoint.SetCellValue]: WorksheetSetCellValuePermission,
    [WorksheetPermissionPoint.SetCellStyle]: WorksheetSetCellStylePermission,
    [WorksheetPermissionPoint.SetRowStyle]: WorksheetSetRowStylePermission,
    [WorksheetPermissionPoint.SetColumnStyle]: WorksheetSetColumnStylePermission,
    [WorksheetPermissionPoint.InsertRow]: WorksheetInsertRowPermission,
    [WorksheetPermissionPoint.InsertColumn]: WorksheetInsertColumnPermission,
    [WorksheetPermissionPoint.DeleteRow]: WorksheetDeleteRowPermission,
    [WorksheetPermissionPoint.DeleteColumn]: WorksheetDeleteColumnPermission,
    [WorksheetPermissionPoint.Sort]: WorksheetSortPermission,
    [WorksheetPermissionPoint.Filter]: WorksheetFilterPermission,
    [WorksheetPermissionPoint.PivotTable]: WorksheetPivotTablePermission,
    [WorksheetPermissionPoint.InsertHyperlink]: WorksheetInsertHyperlinkPermission,
    [WorksheetPermissionPoint.EditExtraObject]: WorksheetEditExtraObjectPermission,
    [WorksheetPermissionPoint.ManageCollaborator]: WorksheetManageCollaboratorPermission,
    [WorksheetPermissionPoint.DeleteProtection]: WorksheetDeleteProtectionPermission,
    [WorksheetPermissionPoint.SelectProtectedCells]: WorksheetSelectProtectedCellsPermission,
    [WorksheetPermissionPoint.SelectUnProtectedCells]: WorksheetSelectUnProtectedCellsPermission,
};

/**
 * Mapping table from Range permission point enum to class constructors
 */
export const RANGE_PERMISSION_POINT_MAP: Record<RangePermissionPoint, RangePermissionPointConstructor> = {
    [RangePermissionPoint.Edit]: RangeProtectionPermissionEditPoint,
    [RangePermissionPoint.View]: RangeProtectionPermissionViewPoint,
    [RangePermissionPoint.ManageCollaborator]: RangeProtectionPermissionManageCollaPoint,
    [RangePermissionPoint.Delete]: RangeProtectionPermissionDeleteProtectionPoint,
};

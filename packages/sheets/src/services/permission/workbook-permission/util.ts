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

import { UnitAction } from '@univerjs/protocol';
import { WorkbookCommentPermission, WorkbookCopyPermission, WorkbookCopySheetPermission, WorkbookCreateSheetPermission, WorkbookDeleteSheetPermission, WorkbookDuplicatePermission, WorkbookEditablePermission, WorkbookExportPermission, WorkbookHideSheetPermission, WorkbookManageCollaboratorPermission, WorkbookMoveSheetPermission, WorkbookPrintPermission, WorkbookRecoverHistoryPermission, WorkbookRenameSheetPermission, WorkbookSharePermission, WorkbookViewHistoryPermission, WorkbookViewPermission } from '../permission-point';
import { WorkbookCreateProtectPermission } from '../permission-point/workbook/create-permission';

export const getAllWorkbookPermissionPoint = () => [
    WorkbookEditablePermission,
    WorkbookPrintPermission,
    WorkbookCommentPermission,
    WorkbookViewPermission,
    WorkbookCopyPermission,
    WorkbookExportPermission,
    WorkbookManageCollaboratorPermission,
    WorkbookCreateSheetPermission,
    WorkbookDeleteSheetPermission,
    WorkbookRenameSheetPermission,
    WorkbookHideSheetPermission,
    WorkbookDuplicatePermission,
    WorkbookSharePermission,
    WorkbookMoveSheetPermission,
    WorkbookCopySheetPermission,
    WorkbookViewHistoryPermission,
    WorkbookRecoverHistoryPermission,
    WorkbookCreateProtectPermission,
];

export const defaultWorkbookPermissionPoints = [
    UnitAction.Edit,
    UnitAction.Print,
    UnitAction.Comment,
    UnitAction.View,
    UnitAction.Copy,
    UnitAction.Export,
    UnitAction.ManageCollaborator,
    UnitAction.CreateSheet,
    UnitAction.DeleteSheet,
    UnitAction.RenameSheet,
    UnitAction.HideSheet,
    UnitAction.Duplicate,
    UnitAction.Share,
    UnitAction.MoveSheet,
    UnitAction.CopySheet,
    UnitAction.RecoverHistory,
    UnitAction.ViewHistory,
    UnitAction.CreatePermissionObject,
];

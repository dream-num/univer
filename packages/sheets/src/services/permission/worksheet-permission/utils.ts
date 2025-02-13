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
import { WorksheetCopyPermission, WorksheetDeleteColumnPermission, WorksheetDeleteProtectionPermission, WorksheetDeleteRowPermission, WorksheetEditExtraObjectPermission, WorksheetEditPermission, WorksheetFilterPermission, WorksheetInsertColumnPermission, WorksheetInsertHyperlinkPermission, WorksheetInsertRowPermission, WorksheetManageCollaboratorPermission, WorksheetPivotTablePermission, WorksheetSetCellStylePermission, WorksheetSetCellValuePermission, WorksheetSetColumnStylePermission, WorksheetSetRowStylePermission, WorksheetSortPermission, WorksheetViewPermission } from '../permission-point';

export const getAllWorksheetPermissionPoint = () => [
    WorksheetEditPermission,
    WorksheetViewPermission,
    WorksheetManageCollaboratorPermission,
    WorksheetDeleteProtectionPermission,
];

// Changes require synchronization of the following arrays
export const getAllWorksheetPermissionPointByPointPanel = () => [
    WorksheetCopyPermission,
    WorksheetDeleteColumnPermission,
    WorksheetDeleteRowPermission,
    WorksheetEditExtraObjectPermission,
    WorksheetFilterPermission,
    WorksheetInsertColumnPermission,
    WorksheetInsertRowPermission,
    WorksheetInsertHyperlinkPermission,
    WorksheetPivotTablePermission,
    WorksheetSetCellStylePermission,
    WorksheetSetCellValuePermission,
    WorksheetSetColumnStylePermission,
    WorksheetSetRowStylePermission,
    WorksheetSortPermission,
];

export const defaultWorksheetPermissionPoint = [
    UnitAction.Copy,
    UnitAction.DeleteColumn,
    UnitAction.DeleteRow,
    UnitAction.EditExtraObject,
    UnitAction.Filter,
    UnitAction.InsertColumn,
    UnitAction.InsertRow,
    UnitAction.InsertHyperlink,
    UnitAction.PivotTable,
    UnitAction.SetCellStyle,
    UnitAction.SetCellValue,
    UnitAction.SetColumnStyle,
    UnitAction.SetRowStyle,
    UnitAction.Sort,
];

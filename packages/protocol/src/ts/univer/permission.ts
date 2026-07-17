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

export enum UnitAction {
    View = 0,
    Edit = 1,
    ManageCollaborator = 2,
    Print = 3,
    /** Duplicate - create a copy */
    Duplicate = 4,
    Comment = 5,
    Copy = 6,
    Share = 7,
    Export = 8,
    /** @deprecated */
    MoveWorksheet = 9,
    /** @deprecated */
    DeleteWorksheet = 10,
    /** @deprecated */
    HideWorksheet = 11,
    /** @deprecated */
    RenameWorksheet = 12,
    /** @deprecated */
    CreateWorksheet = 13,
    /** @deprecated */
    SetWorksheetStyle = 14,
    /** @deprecated */
    EditWorksheetCell = 15,
    InsertHyperlink = 16,
    Sort = 17,
    Filter = 18,
    PivotTable = 19,
    /** @deprecated */
    FloatImg = 20,
    /** @deprecated */
    IHistory = 21,
    /**
     * RwHgtClWdt - row height, column width
     *
     * @deprecated
     */
    RwHgtClWdt = 22,
    /**
     * ViemRwHgtClWdt - row height, column width in view mode
     *
     * @deprecated
     */
    ViemRwHgtClWdt = 23,
    /**
     * ViewFilter - filter in view mode
     *
     * @deprecated
     */
    ViewFilter = 24,
    MoveSheet = 25,
    /** DeleteSheet - delete the sub sheet */
    DeleteSheet = 26,
    HideSheet = 27,
    CopySheet = 28,
    RenameSheet = 29,
    CreateSheet = 30,
    SelectProtectedCells = 31,
    SelectUnProtectedCells = 32,
    SetCellStyle = 33,
    SetCellValue = 34,
    SetRowStyle = 35,
    SetColumnStyle = 36,
    InsertRow = 37,
    InsertColumn = 38,
    DeleteRow = 39,
    DeleteColumn = 40,
    EditExtraObject = 41,
    /** Delete - delete the unit file */
    Delete = 42,
    RecoverHistory = 43,
    ViewHistory = 44,
    CreatePermissionObject = 45,
    UNRECOGNIZED = -1,
}

export enum UnitRole {
    Reader = 0,
    Editor = 1,
    Owner = 2,
    UNRECOGNIZED = -1,
}

export enum UnitObject {
    Unkonwn = 0,
    Workbook = 1,
    Worksheet = 2,
    SelectRange = 3,
    Document = 4,
    Slide = 5,
    Base = 6,
    Board = 7,
    Pdf = 8,
    UNRECOGNIZED = -1,
}

export enum UnitShareScope {
    Private = 0,
    Public = 1,
    Organization = 2,
    UNRECOGNIZED = -1,
}

export enum ObjectScope {
    SomeCollaborator = 0,
    AllCollaborator = 1,
    OneSelf = 2,
    UNRECOGNIZED = -1,
}

export interface IUnitRoleKV {
    role: UnitRole;
    name: string;
}

export interface IUnitPermissionStrategy {
    role: UnitRole;
    action: UnitAction;
}

export interface IUser {
    userID: string;
    name: string;
    avatar: string;
}

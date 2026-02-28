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

import type { IUser } from '@univerjs/protocol';
import type { Observable } from 'rxjs';

/**
 * ========================
 * Basic Types / Enums
 * ========================
 */

/**
 * User role in a unit (Workbook)
 */
export enum UnitRole {
    Reader = 0,
    Editor = 1,
    Owner = 2,
}

/**
 * User reference information
 */
export interface IUserRef {
    /** User ID (defined by host system) */
    id: string;
    /** Display name */
    displayName?: string;
    /** Email address */
    email?: string;
}

/**
 * Collaborator information
 */
export interface ICollaborator {
    /** User information */
    user: IUserRef;
    /** Role */
    role: UnitRole;
}

/**
 * Workbook-level permission point enumeration
 */
export enum WorkbookPermissionPoint {
    /** Edit permission */
    Edit = 'WorkbookEdit',
    /** View permission */
    View = 'WorkbookView',
    /** Print permission */
    Print = 'WorkbookPrint',
    /** Export permission */
    Export = 'WorkbookExport',
    /** Share permission */
    Share = 'WorkbookShare',
    /** Copy content permission */
    CopyContent = 'WorkbookCopy',
    /** Duplicate file permission */
    DuplicateFile = 'WorkbookDuplicate',
    /** Comment permission */
    Comment = 'WorkbookComment',
    /** Manage collaborators permission */
    ManageCollaborator = 'WorkbookManageCollaborator',
    /** Create sheet permission */
    CreateSheet = 'WorkbookCreateSheet',
    /** Delete sheet permission */
    DeleteSheet = 'WorkbookDeleteSheet',
    /** Rename sheet permission */
    RenameSheet = 'WorkbookRenameSheet',
    /** Move sheet permission */
    MoveSheet = 'WorkbookMoveSheet',
    /** Hide sheet permission */
    HideSheet = 'WorkbookHideSheet',
    /** View history permission */
    ViewHistory = 'WorkbookViewHistory',
    /** Manage history permission */
    ManageHistory = 'WorkbookHistory',
    /** Recover history permission */
    RecoverHistory = 'WorkbookRecoverHistory',
    /** Create protection permission */
    CreateProtection = 'WorkbookCreateProtect',
    /** Insert row permission */
    InsertRow = 'WorkbookInsertRow',
    /** Insert column permission */
    InsertColumn = 'WorkbookInsertColumn',
    /** Delete row permission */
    DeleteRow = 'WorkbookDeleteRow',
    /** Delete column permission */
    DeleteColumn = 'WorkbookDeleteColumn',
    /** Copy sheet permission */
    CopySheet = 'WorkbookCopySheet',
}

/**
 * Worksheet-level permission point enumeration
 */
export enum WorksheetPermissionPoint {
    /** Edit permission */
    Edit = 'WorksheetEdit',
    /** View permission */
    View = 'WorksheetView',
    /** Copy permission */
    Copy = 'WorksheetCopy',
    /** Set cell value permission */
    SetCellValue = 'WorksheetSetCellValue',
    /** Set cell style permission */
    SetCellStyle = 'WorksheetSetCellStyle',
    /** Set row style permission */
    SetRowStyle = 'WorksheetSetRowStyle',
    /** Set column style permission */
    SetColumnStyle = 'WorksheetSetColumnStyle',
    /** Insert row permission */
    InsertRow = 'WorksheetInsertRow',
    /** Insert column permission */
    InsertColumn = 'WorksheetInsertColumn',
    /** Delete row permission */
    DeleteRow = 'WorksheetDeleteRow',
    /** Delete column permission */
    DeleteColumn = 'WorksheetDeleteColumn',
    /** Sort permission */
    Sort = 'WorksheetSort',
    /** Filter permission */
    Filter = 'WorksheetFilter',
    /** Pivot table permission */
    PivotTable = 'WorksheetPivotTable',
    /** Insert hyperlink permission */
    InsertHyperlink = 'WorksheetInsertHyperlink',
    /** Edit extra object permission */
    EditExtraObject = 'WorksheetEditExtraObject',
    /** Manage collaborators permission */
    ManageCollaborator = 'WorksheetManageCollaborator',
    /** Delete protection permission */
    DeleteProtection = 'WorksheetDeleteProtection',
    /** Select protected cells permission */
    SelectProtectedCells = 'WorksheetSelectProtectedCells',
    /** Select unprotected cells permission */
    SelectUnProtectedCells = 'WorksheetSelectUnProtectedCells',
}

/**
 * Range-level permission point enumeration
 */
export enum RangePermissionPoint {
    /** Edit permission */
    Edit = 'RangeEdit',
    /** View permission */
    View = 'RangeView',
    ManageCollaborator = 'RangeManageCollaborator',
    Delete = 'RangeDeleteProtection',
}

/**
 * Workbook permission mode
 */
export type WorkbookMode = 'owner' | 'editor' | 'viewer' | 'commenter';

/**
 * Worksheet permission mode
 */
export type WorksheetMode =
    | 'editable' // Fully editable
    | 'readOnly' // Fully read-only
    | 'filterOnly'; // Filter / sort only

/**
 * Workbook permission snapshot (state of all permission points)
 */
export type WorkbookPermissionSnapshot = Record<WorkbookPermissionPoint, boolean>;

/**
 * Worksheet permission snapshot (state of all permission points)
 */
export type WorksheetPermissionSnapshot = Record<WorksheetPermissionPoint, boolean>;

/**
 * Range permission snapshot (state of all permission points)
 */
export type RangePermissionSnapshot = Record<RangePermissionPoint, boolean>;

/**
 * Unsubscribe function type
 */
export type UnsubscribeFn = () => void;

/**
 * ========================
 * Worksheet Protection Configuration
 * ========================
 */

/**
 * Worksheet protection options configuration
 */
export interface IWorksheetProtectionOptions {
    /** Whitelist of users allowed to edit; empty means only owner */
    allowedUsers?: string[];

    /** Protection name for UI display */
    name?: string;

    /** Custom metadata */
    metadata?: Record<string, unknown>;
}

/**
 * ========================
 * Range Protection Configuration and Rules
 * ========================
 */

/**
 * Range protection options configuration
 */
export interface IRangeProtectionOptions {
    /** Whether to allow current user to edit (default false = protected, not editable) */
    allowEdit?: boolean;

    /** Whitelist of users allowed to edit; empty means determined by role or global policy */
    allowedUsers?: string[];

    allowViewByOthers?: boolean;

    /** Rule name for UI display and management */
    name?: string;

    /** Custom metadata (logs, tags, etc.) */
    metadata?: Record<string, unknown>;
}

/**
 * Cell permission debug rule information
 */
export interface ICellPermissionDebugRuleInfo {
    ruleId: string;
    /** Range reference string list, e.g., ['A1:B10', 'D1:D5'] */
    rangeRefs: string[];
    options: IRangeProtectionOptions;
}

/**
 * ========================
 * Facade: WorkbookPermission
 * ========================
 */

/**
 * Workbook-level permission Facade interface
 */
export interface IWorkbookPermission {
    /**
     * High-level mode setting: By Owner / Editor / Viewer / Commenter semantics
     * Internally automatically combines multiple WorkbookPermissionPoints
     */
    setMode(mode: WorkbookMode): Promise<void>;

    /** Shortcut: Set workbook to read-only (equivalent to setMode('viewer')) */
    setReadOnly(): Promise<void>;

    /** Shortcut: Set workbook to editable (equivalent to setMode('editor') or owner subset) */
    setEditable(): Promise<void>;

    /** Whether current user can edit this workbook (calculated from combined permissions) */
    canEdit(): boolean;

    /**
     * Collaborator management (wraps IAuthzIoService)
     */

    /** Batch set collaborators (replace mode, overwrites existing collaborator list) */
    setCollaborators(collaborators: Array<{ user: IUser; role: UnitRole }>): Promise<void>;

    /** Add a single collaborator */
    addCollaborator(user: IUser, role: UnitRole): Promise<void>;

    /** Update collaborator role and information */
    updateCollaborator(user: IUser, role: UnitRole): Promise<void>;

    /** Remove collaborator */
    removeCollaborator(userId: string): Promise<void>;

    /** Batch remove collaborators */
    removeCollaborators(userIds: string[]): Promise<void>;

    /** List all collaborators */
    listCollaborators(): Promise<ICollaborator[]>;

    /**
     * Low-level point operations: Directly set boolean value of a WorkbookPermissionPoint
     */
    setPoint(point: WorkbookPermissionPoint, value: boolean): Promise<void>;

    /** Read current value of a point (synchronous, reads from local state) */
    getPoint(point: WorkbookPermissionPoint): boolean;

    /** Get snapshot of all current points */
    getSnapshot(): WorkbookPermissionSnapshot;

    /**
     * ========================
     * RxJS Observable Reactive Interface
     * ========================
     */

    /**
     * Permission snapshot change stream (BehaviorSubject, immediately provides current state on subscription)
     * Triggers when any permission point changes
     */
    readonly permission$: Observable<WorkbookPermissionSnapshot>;

    /**
     * Single permission point change stream
     * For scenarios that only care about specific permission point changes
     */
    readonly pointChange$: Observable<{
        point: WorkbookPermissionPoint;
        value: boolean;
        oldValue: boolean;
    }>;

    /**
     * Collaborator change stream
     */
    readonly collaboratorChange$: Observable<{
        type: 'add' | 'update' | 'delete';
        collaborator: ICollaborator;
    }>;

    /**
     * Compatibility method: Simplified subscription (for users unfamiliar with RxJS)
     * Internally implemented based on permission$ Observable
     */
    subscribe(listener: (snapshot: WorkbookPermissionSnapshot) => void): UnsubscribeFn;
}

/**
 * ========================
 * Facade: WorksheetPermission
 * ========================
 */

/**
 * Worksheet permission configuration
 */
export interface IWorksheetPermissionConfig {
    /** One-time mode setting */
    mode?: WorksheetMode;

    /** Point-level configuration patch */
    points?: Partial<Record<WorksheetPermissionPoint, boolean>>;

    /** Batch range protection configuration (optional, for simplified scenarios) */
    rangeProtections?: Array<{
        rangeRefs: string[]; // e.g., ['A1:B10', 'D1:D5']
        options?: IRangeProtectionOptions; // If not provided, defaults to "protected, not editable"
    }>;
}

/**
 * ========================
 * Facade: RangePermission
 * ========================
 */

export interface ICellPermissionDebugInfo {
    permissionId: string;
    ruleId: string;
}

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

import type { ICollaborator as IProtocolCollaborator } from '@univerjs/protocol';
import type { ICollaborator, ICollaboratorUser, WorkbookMode, WorkbookPermissionSnapshot } from './permission-types';
import { IAuthzIoService, Inject, Injector, IPermissionService } from '@univerjs/core';
import { FBase } from '@univerjs/core/facade';
import { UnitObject } from '@univerjs/protocol';
import { WORKBOOK_PERMISSION_POINT_MAP } from './permission-point-map';
import { UnitRole, WorkbookPermissionPoint } from './permission-types';

/**
 * Implementation class for WorkbookPermission
 * Provides workbook-level permission control
 *
 * @hideconstructor
 */
export class FWorkbookPermission extends FBase {
    constructor(
        private readonly _unitId: string,
        @Inject(Injector) private readonly _injector: Injector,
        @IPermissionService protected readonly _permissionService: IPermissionService,
        @IAuthzIoService private readonly _authzIoService: IAuthzIoService
    ) {
        super();
    }

    /**
     * Set permission mode for the workbook.
     * @param {WorkbookMode} mode The permission mode to set ('owner' | 'editor' | 'viewer' | 'commenter').
     * @returns {Promise<void>} A promise that resolves when the mode is set.
     * @example
     * ```ts
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * await fWorkbook.getWorkbookPermission().setMode('editor');
     * ```
     */
    async setMode(mode: WorkbookMode): Promise<void> {
        const pointsToSet = this._getModePermissions(mode);

        await Promise.all(
            Object.entries(pointsToSet).map(([point, value]) => this.setPoint(point as WorkbookPermissionPoint, value))
        );
    }

    /**
     * Get permission configuration for a specific mode
     * @private
     */
    private _getModePermissions(mode: WorkbookMode): Record<WorkbookPermissionPoint, boolean> {
        // Initialize all permission points to false first
        const pointsToSet: Record<WorkbookPermissionPoint, boolean> = {} as Record<WorkbookPermissionPoint, boolean>;
        Object.values(WorkbookPermissionPoint).forEach((point) => {
            pointsToSet[point] = false;
        });

        switch (mode) {
            case 'owner':
                // Owner has all permissions
                Object.values(WorkbookPermissionPoint).forEach((point) => {
                    pointsToSet[point] = true;
                });
                break;
            case 'editor':
                // Editor can edit, view, print, export, and perform basic operations
                pointsToSet[WorkbookPermissionPoint.Edit] = true;
                pointsToSet[WorkbookPermissionPoint.View] = true;
                pointsToSet[WorkbookPermissionPoint.Print] = true;
                pointsToSet[WorkbookPermissionPoint.Export] = true;
                pointsToSet[WorkbookPermissionPoint.CopyContent] = true;
                pointsToSet[WorkbookPermissionPoint.Comment] = true;
                pointsToSet[WorkbookPermissionPoint.CreateSheet] = true;
                pointsToSet[WorkbookPermissionPoint.DeleteSheet] = true;
                pointsToSet[WorkbookPermissionPoint.RenameSheet] = true;
                pointsToSet[WorkbookPermissionPoint.MoveSheet] = true;
                pointsToSet[WorkbookPermissionPoint.HideSheet] = true;
                pointsToSet[WorkbookPermissionPoint.InsertRow] = true;
                pointsToSet[WorkbookPermissionPoint.InsertColumn] = true;
                pointsToSet[WorkbookPermissionPoint.DeleteRow] = true;
                pointsToSet[WorkbookPermissionPoint.DeleteColumn] = true;
                pointsToSet[WorkbookPermissionPoint.CopySheet] = true;
                pointsToSet[WorkbookPermissionPoint.CreateProtection] = true;
                // Not allowed: ManageCollaborator, Share, DuplicateFile, etc. (remain false)
                break;
            case 'viewer':
                // Viewer can only view and print
                pointsToSet[WorkbookPermissionPoint.View] = true;
                pointsToSet[WorkbookPermissionPoint.Print] = true;
                // All other permissions remain false
                break;
            case 'commenter':
                // Commenter can view, comment, and print
                pointsToSet[WorkbookPermissionPoint.View] = true;
                pointsToSet[WorkbookPermissionPoint.Comment] = true;
                pointsToSet[WorkbookPermissionPoint.Print] = true;
                // All other permissions remain false
                break;
        }

        return pointsToSet;
    }

    /**
     * Set the workbook to read-only mode (viewer mode).
     * @returns {Promise<void>} A promise that resolves when the mode is set.
     * @example
     * ```ts
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * await fWorkbook.getWorkbookPermission().setReadOnly();
     * ```
     */
    async setReadOnly(): Promise<void> {
        await this.setMode('viewer');
    }

    /**
     * Set the workbook to editable mode (editor mode).
     * @returns {Promise<void>} A promise that resolves when the mode is set.
     * @example
     * ```ts
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * await fWorkbook.getWorkbookPermission().setEditable();
     * ```
     */
    async setEditable(): Promise<void> {
        await this.setMode('editor');
    }

    /**
     * Set a specific permission point.
     * @param {WorkbookPermissionPoint} point The permission point to set.
     * @param {boolean} value The value to set (true = allowed, false = denied).
     * @returns {Promise<void>} A promise that resolves when the point is set.
     * @example
     * ```ts
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const permission = fWorkbook.getWorkbookPermission();
     * await permission.setPoint(univerAPI.Enum.WorkbookPermissionPoint.Print, false);
     * ```
     */
    async setPoint(point: WorkbookPermissionPoint, value: boolean): Promise<void> {
        const PermissionPointClass = WORKBOOK_PERMISSION_POINT_MAP[point];
        if (!PermissionPointClass) {
            throw new Error(`Unknown workbook permission point: ${point}`);
        }

        const instance = new PermissionPointClass(this._unitId);
        const permissionPoint = this._permissionService.getPermissionPoint(instance.id);
        if (permissionPoint && permissionPoint.value === value) {
            return; // Value unchanged, no update needed
        }

        if (!permissionPoint) {
            this._permissionService.addPermissionPoint(instance);
        }

        await this._authzIoService.update({
            objectType: UnitObject.Workbook,
            objectID: this._unitId,
            unitID: this._unitId,
            share: undefined,
            name: '',
            strategies: [{
                action: instance.subType,
                role: value ? UnitRole.Editor : UnitRole.Owner,
            }],
            scope: undefined,
            collaborators: undefined,
        });

        this._permissionService.updatePermissionPoint(instance.id, value);
    }

    /**
     * Check if the workbook is editable.
     * @returns {boolean} true if the workbook can be edited, false otherwise.
     * @example
     * ```ts
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * if (fWorkbook.getWorkbookPermission().canEdit()) {
     *   console.log('Workbook is editable');
     * }
     * ```
     */
    canEdit(): boolean {
        return this.getPoint(WorkbookPermissionPoint.Edit);
    }

    /**
     * Get the value of a specific permission point.
     * @param {WorkbookPermissionPoint} point The permission point to query.
     * @returns {boolean} true if allowed, false if denied.
     * @example
     * ```ts
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const permission = fWorkbook.getWorkbookPermission();
     * const canPrint = permission.getPoint(univerAPI.Enum.WorkbookPermissionPoint.Print);
     * console.log(canPrint);
     * ```
     */
    getPoint(point: WorkbookPermissionPoint): boolean {
        const PointClass = WORKBOOK_PERMISSION_POINT_MAP[point];
        if (!PointClass) {
            throw new Error(`Unknown workbook permission point: ${point}`);
        }

        const instance = new PointClass(this._unitId);
        const permissionPoint = this._permissionService.getPermissionPoint(instance.id);

        return permissionPoint?.value ?? true; // Default to true (allowed)
    }

    /**
     * Get a snapshot of all permission points.
     * @returns {WorkbookPermissionSnapshot} An object containing all permission point values.
     * @example
     * ```ts
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const snapshot = fWorkbook.getWorkbookPermission().getSnapshot();
     * console.log(snapshot);
     * ```
     */
    getSnapshot(): WorkbookPermissionSnapshot {
        const snapshot = {} as WorkbookPermissionSnapshot;
        for (const point in WorkbookPermissionPoint) {
            const pointKey = WorkbookPermissionPoint[point as keyof typeof WorkbookPermissionPoint];
            snapshot[pointKey] = this.getPoint(pointKey);
        }
        return snapshot;
    }

    /**
     * Set multiple collaborators at once (replaces existing collaborators).
     * @param {Array<{ user: IUser; role: UnitRole }>} collaborators Array of collaborators with user information and role.
     * @returns {Promise<void>} A promise that resolves when the collaborators are set.
     * @example
     * ```ts
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const permission = fWorkbook.getWorkbookPermission();
     * await permission.setCollaborators([
     *   {
     *     user: { userID: 'user1', name: 'John Doe', avatar: 'https://...' },
     *     role: univerAPI.Enum.UnitRole.Editor
     *   },
     *   {
     *     user: { userID: 'user2', name: 'Jane Smith', avatar: '' },
     *     role: univerAPI.Enum.UnitRole.Reader
     *   }
     * ]);
     * ```
     */
    async setCollaborators(collaborators: Array<{ user: ICollaboratorUser; role: UnitRole }>): Promise<void> {
        // Convert to protocol format
        const protocolCollaborators: IProtocolCollaborator[] = collaborators.map((c) => ({
            id: c.user.userID,
            subject: c.user,
            role: c.role,
        }));

        // Batch set collaborators (replace mode)
        await this._authzIoService.putCollaborators({
            objectID: this._unitId,
            unitID: this._unitId,
            collaborators: protocolCollaborators,
        });
    }

    /**
     * Add a single collaborator.
     * @param {IUser} user The user information (userID, name, avatar).
     * @param {UnitRole} role The role to assign.
     * @returns {Promise<void>} A promise that resolves when the collaborator is added.
     * @example
     * ```ts
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const permission = fWorkbook.getWorkbookPermission();
     * await permission.addCollaborator(
     *   { userID: 'user1', name: 'John Doe', avatar: 'https://...' },
     *   univerAPI.Enum.UnitRole.Editor
     * );
     * ```
     */
    async addCollaborator(user: ICollaboratorUser, role: UnitRole): Promise<void> {
        await this._authzIoService.createCollaborator({
            objectID: this._unitId,
            unitID: this._unitId,
            collaborators: [{
                id: user.userID,
                subject: user,
                role,
            }],
        });
    }

    /**
     * Update an existing collaborator's role and information.
     * @param {IUser} user The updated user information (userID, name, avatar).
     * @param {UnitRole} role The new role to assign.
     * @returns {Promise<void>} A promise that resolves when the collaborator is updated.
     * @example
     * ```ts
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const permission = fWorkbook.getWorkbookPermission();
     * await permission.updateCollaborator(
     *   { userID: 'user1', name: 'John Doe Updated', avatar: 'https://...' },
     *   univerAPI.Enum.UnitRole.Reader
     * );
     * ```
     */
    async updateCollaborator(user: ICollaboratorUser, role: UnitRole): Promise<void> {
        await this._authzIoService.updateCollaborator({
            objectID: this._unitId,
            unitID: this._unitId,
            collaborator: {
                id: user.userID,
                subject: user,
                role,
            },
        });
    }

    /**
     * Remove a collaborator from the workbook.
     * @param {string} userId The user ID to remove.
     * @returns {Promise<void>} A promise that resolves when the collaborator is removed.
     * @example
     * ```ts
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const permission = fWorkbook.getWorkbookPermission();
     * await permission.removeCollaborator('user1');
     * ```
     */
    async removeCollaborator(userId: string): Promise<void> {
        await this._authzIoService.deleteCollaborator({
            objectID: this._unitId,
            unitID: this._unitId,
            collaboratorID: userId,
        });
    }

    /**
     * Remove multiple collaborators at once.
     * @param {string[]} userIds Array of user IDs to remove.
     * @returns {Promise<void>} A promise that resolves when the collaborators are removed.
     * @example
     * ```ts
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const permission = fWorkbook.getWorkbookPermission();
     * await permission.removeCollaborators(['user1', 'user2']);
     * ```
     */
    async removeCollaborators(userIds: string[]): Promise<void> {
        await Promise.all(
            userIds.map((userId) => this.removeCollaborator(userId))
        );
    }

    /**
     * List all collaborators of the workbook.
     * @returns {Promise<ICollaborator[]>} Array of collaborators with their roles.
     * @example
     * ```ts
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const permission = fWorkbook.getWorkbookPermission();
     * const collaborators = await permission.listCollaborators();
     * console.log(collaborators);
     * ```
     */
    async listCollaborators(): Promise<ICollaborator[]> {
        const protocolCollaborators = await this._authzIoService.listCollaborators({
            objectID: this._unitId,
            unitID: this._unitId,
        });

        return protocolCollaborators.map((c) => ({
            user: {
                userID: c.subject?.userID || c.id,
                name: c.subject?.name || '',
                avatar: c.subject?.avatar || '',
            },
            role: c.role as UnitRole,
        }));
    }
}

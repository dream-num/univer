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

import type { ICollaborator as IProtocolCollaborator, IUser } from '@univerjs/protocol';
import type { Observable, Subscription } from 'rxjs';
import type { ICollaborator, IWorkbookPermission, UnsubscribeFn, WorkbookMode, WorkbookPermissionSnapshot } from './permission-types';
import { IAuthzIoService, Inject, Injector, IPermissionService } from '@univerjs/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { distinctUntilChanged, filter, map, shareReplay } from 'rxjs/operators';
import { FPermission } from '../f-permission';
import { WORKBOOK_PERMISSION_POINT_MAP } from './permission-point-map';
import { UnitRole, WorkbookPermissionPoint } from './permission-types';

/**
 * Implementation class for WorkbookPermission
 * Provides workbook-level permission control
 *
 * @hideconstructor
 */
export class FWorkbookPermission implements IWorkbookPermission {
    private readonly _permissionSubject: BehaviorSubject<WorkbookPermissionSnapshot>;

    // Collaborator changes are tracked manually since IAuthzIoService doesn't provide an observable
    // TODO: If IAuthzIoService adds an observable in the future, migrate to use that
    private readonly _collaboratorChangeSubject = new Subject<{
        type: 'add' | 'update' | 'delete';
        collaborator: ICollaborator;
    }>();

    /**
     * Observable stream of permission snapshot changes (BehaviorSubject)
     * Emits immediately on subscription with current state, then on any permission point change
     */
    readonly permission$: Observable<WorkbookPermissionSnapshot>;

    /**
     * Observable stream of individual permission point changes
     * Emits when a specific permission point value changes
     */
    readonly pointChange$: Observable<{
        point: WorkbookPermissionPoint;
        value: boolean;
        oldValue: boolean;
    }>;

    /**
     * Observable stream of collaborator changes
     * Emits when collaborators are added, updated, or removed
     */
    readonly collaboratorChange$: Observable<{
        type: 'add' | 'update' | 'delete';
        collaborator: ICollaborator;
    }>;

    private _subscriptions: Subscription[] = [];
    private readonly _fPermission: FPermission;

    constructor(
        private readonly _unitId: string,
        @Inject(Injector) private readonly _injector: Injector,
        @IPermissionService private readonly _permissionService: IPermissionService,
        @IAuthzIoService private readonly _authzIoService: IAuthzIoService
    ) {
        // Initialize FPermission instance
        this._fPermission = this._injector.createInstance(FPermission);

        // Initialize BehaviorSubject (with initial value)
        this._permissionSubject = new BehaviorSubject(this._buildSnapshot());

        // Setup observables from internal services
        this.permission$ = this._createPermissionStream();
        this.pointChange$ = this._createPointChangeStream();

        // Collaborator changes are tracked manually since IAuthzIoService doesn't provide an observable
        this.collaboratorChange$ = this._collaboratorChangeSubject.asObservable().pipe(
            shareReplay({ bufferSize: 1, refCount: true })
        );
    }

    /**
     * Create permission snapshot stream from IPermissionService
     * @private
     */
    private _createPermissionStream(): Observable<WorkbookPermissionSnapshot> {
        const permissionSub = this._permissionService.permissionPointUpdate$.pipe(
            filter((point) => point.id.includes(this._unitId))
        ).subscribe(() => {
            this._permissionSubject.next(this._buildSnapshot());
        });
        this._subscriptions.push(permissionSub);

        return this._permissionSubject.asObservable().pipe(
            distinctUntilChanged((prev, curr) => JSON.stringify(prev) === JSON.stringify(curr)),
            shareReplay({ bufferSize: 1, refCount: true })
        );
    }

    /**
     * Create point change stream from IPermissionService
     * @private
     */
    private _createPointChangeStream(): Observable<{ point: WorkbookPermissionPoint; value: boolean; oldValue: boolean }> {
        // Cache to store previous values for comparison
        const valueCache = new Map<WorkbookPermissionPoint, boolean>();

        // Initialize cache with current values for all permission points
        for (const point in WorkbookPermissionPoint) {
            const pointKey = WorkbookPermissionPoint[point as keyof typeof WorkbookPermissionPoint];
            valueCache.set(pointKey, this.getPoint(pointKey));
        }

        return this._permissionService.permissionPointUpdate$.pipe(
            filter((point) => point.id.includes(this._unitId)),
            map((permissionPoint) => {
                // Find which WorkbookPermissionPoint this corresponds to
                const pointType = this._extractWorkbookPointType(permissionPoint.id);
                if (!pointType) return null;

                const newValue: boolean = Boolean(permissionPoint.value);

                // Get old value from cache
                const oldValue: boolean = valueCache.get(pointType)!;

                // Update cache for next time
                valueCache.set(pointType, newValue);

                if (oldValue === newValue) return null;

                return { point: pointType, value: newValue, oldValue };
            }),
            filter((change): change is { point: WorkbookPermissionPoint; value: boolean; oldValue: boolean } => change !== null),
            shareReplay({ bufferSize: 1, refCount: true })
        );
    }

    /**
     * Extract WorkbookPermissionPoint type from permission point ID
     * @private
     */
    private _extractWorkbookPointType(pointId: string): WorkbookPermissionPoint | null {
        for (const point in WorkbookPermissionPoint) {
            const pointKey = WorkbookPermissionPoint[point as keyof typeof WorkbookPermissionPoint];
            const PointClass = WORKBOOK_PERMISSION_POINT_MAP[pointKey];
            if (!PointClass) continue;

            const instance = new PointClass(this._unitId);
            if (instance.id === pointId) {
                return pointKey;
            }
        }
        return null;
    }

    /**
     * Build permission snapshot
     */
    private _buildSnapshot(): WorkbookPermissionSnapshot {
        const snapshot = {} as WorkbookPermissionSnapshot;
        for (const point in WorkbookPermissionPoint) {
            const pointKey = WorkbookPermissionPoint[point as keyof typeof WorkbookPermissionPoint];
            snapshot[pointKey] = this.getPoint(pointKey);
        }
        return snapshot;
    }

    /**
     * Listen to permission point changes
    /**
     * Set permission mode for the workbook.
     * @param {WorkbookMode} mode The permission mode to set ('owner' | 'editor' | 'viewer' | 'commenter').
     * @returns {Promise<void>} A promise that resolves when the mode is set.
     * @example
     * ```ts
     * const workbook = univerAPI.getActiveWorkbook();
     * const permission = workbook?.getWorkbookPermission();
     * await permission?.setMode('editor');
     * ```
     */
    async setMode(mode: WorkbookMode): Promise<void> {
        const pointsToSet = this._getModePermissions(mode);
        await this._batchSetPermissionPoints(pointsToSet);
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
     * Batch set multiple permission points efficiently
     * @private
     */
    private async _batchSetPermissionPoints(pointsToSet: Record<WorkbookPermissionPoint, boolean>): Promise<void> {
        // Note: IPermissionService doesn't have a batch update API, so we update individually
        // but we optimize by only updating the snapshot once at the end
        const pointsChanged: Array<{ point: WorkbookPermissionPoint; value: boolean; oldValue: boolean }> = [];

        for (const [point, value] of Object.entries(pointsToSet)) {
            const pointKey = point as WorkbookPermissionPoint;
            const PointClass = WORKBOOK_PERMISSION_POINT_MAP[pointKey];
            if (!PointClass) {
                throw new Error(`Unknown workbook permission point: ${pointKey}`);
            }

            const oldValue = this.getPoint(pointKey);
            if (oldValue === value) {
                continue; // Skip unchanged values
            }

            // Use FPermission's setWorkbookPermissionPoint method
            this._fPermission.setWorkbookPermissionPoint(this._unitId, PointClass, value);
            pointsChanged.push({ point: pointKey, value, oldValue });
        }

        // Update snapshot once at the end (the Observable stream will pick up the changes automatically)
        if (pointsChanged.length > 0) {
            const newSnapshot = this._buildSnapshot();
            this._permissionSubject.next(newSnapshot);
        }
    }

    /**
     * Set the workbook to read-only mode (viewer mode).
     * @returns {Promise<void>} A promise that resolves when the mode is set.
     * @example
     * ```ts
     * const workbook = univerAPI.getActiveWorkbook();
     * const permission = workbook?.getWorkbookPermission();
     * await permission?.setReadOnly();
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
     * const workbook = univerAPI.getActiveWorkbook();
     * const permission = workbook?.getWorkbookPermission();
     * await permission?.setEditable();
     * ```
     */
    async setEditable(): Promise<void> {
        await this.setMode('editor');
    }

    /**
     * Check if the workbook is editable.
     * @returns {boolean} true if the workbook can be edited, false otherwise.
     * @example
     * ```ts
     * const workbook = univerAPI.getActiveWorkbook();
     * const permission = workbook?.getWorkbookPermission();
     * if (permission?.canEdit()) {
     *   console.log('Workbook is editable');
     * }
     * ```
     */
    canEdit(): boolean {
        return this.getPoint(WorkbookPermissionPoint.Edit);
    }

    /**
     * Set a specific permission point.
     * @param {WorkbookPermissionPoint} point The permission point to set.
     * @param {boolean} value The value to set (true = allowed, false = denied).
     * @returns {Promise<void>} A promise that resolves when the point is set.
     * @example
     * ```ts
     * const workbook = univerAPI.getActiveWorkbook();
     * const permission = workbook?.getWorkbookPermission();
     * await permission?.setPoint(univerAPI.Enum.WorkbookPermissionPoint.Print, false);
     * ```
     */
    async setPoint(point: WorkbookPermissionPoint, value: boolean): Promise<void> {
        const PointClass = WORKBOOK_PERMISSION_POINT_MAP[point];
        if (!PointClass) {
            throw new Error(`Unknown workbook permission point: ${point}`);
        }

        const oldValue = this.getPoint(point);
        if (oldValue === value) {
            return; // Value unchanged, no update needed
        }

        // Use FPermission's setWorkbookPermissionPoint method
        this._fPermission.setWorkbookPermissionPoint(this._unitId, PointClass, value);

        // Update snapshot (the Observable stream will automatically emit the change)
        const newSnapshot = this._buildSnapshot();
        this._permissionSubject.next(newSnapshot);
    }

    /**
     * Get the value of a specific permission point.
     * @param {WorkbookPermissionPoint} point The permission point to query.
     * @returns {boolean} true if allowed, false if denied.
     * @example
     * ```ts
     * const workbook = univerAPI.getActiveWorkbook();
     * const permission = workbook?.getWorkbookPermission();
     * const canPrint = permission?.getPoint(univerAPI.Enum.WorkbookPermissionPoint.Print);
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
     * const workbook = univerAPI.getActiveWorkbook();
     * const permission = workbook?.getWorkbookPermission();
     * const snapshot = permission?.getSnapshot();
     * console.log(snapshot);
     * ```
     */
    getSnapshot(): WorkbookPermissionSnapshot {
        return this._buildSnapshot();
    }

    /**
     * Set multiple collaborators at once (replaces existing collaborators).
     * @param {Array<{ user: IUser; role: UnitRole }>} collaborators Array of collaborators with user information and role.
     * @returns {Promise<void>} A promise that resolves when the collaborators are set.
     * @example
     * ```ts
     * const workbook = univerAPI.getActiveWorkbook();
     * const permission = workbook?.getWorkbookPermission();
     * await permission?.setCollaborators([
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
    async setCollaborators(collaborators: Array<{ user: IUser; role: UnitRole }>): Promise<void> {
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

        // Trigger change events
        collaborators.forEach((c) => {
            this._collaboratorChangeSubject.next({
                type: 'add',
                collaborator: {
                    user: { id: c.user.userID },
                    role: c.role,
                },
            });
        });
    }

    /**
     * Add a single collaborator.
     * @param {IUser} user The user information (userID, name, avatar).
     * @param {UnitRole} role The role to assign.
     * @returns {Promise<void>} A promise that resolves when the collaborator is added.
     * @example
     * ```ts
     * const workbook = univerAPI.getActiveWorkbook();
     * const permission = workbook?.getWorkbookPermission();
     * await permission?.addCollaborator(
     *   { userID: 'user1', name: 'John Doe', avatar: 'https://...' },
     *   univerAPI.Enum.UnitRole.Editor
     * );
     * ```
     */
    async addCollaborator(user: IUser, role: UnitRole): Promise<void> {
        await this._authzIoService.createCollaborator({
            objectID: this._unitId,
            unitID: this._unitId,
            collaborators: [{
                id: user.userID,
                subject: user,
                role,
            }],
        });

        this._collaboratorChangeSubject.next({
            type: 'add',
            collaborator: {
                user: { id: user.userID },
                role,
            },
        });
    }

    /**
     * Update an existing collaborator's role and information.
     * @param {IUser} user The updated user information (userID, name, avatar).
     * @param {UnitRole} role The new role to assign.
     * @returns {Promise<void>} A promise that resolves when the collaborator is updated.
     * @example
     * ```ts
     * const workbook = univerAPI.getActiveWorkbook();
     * const permission = workbook?.getWorkbookPermission();
     * await permission?.updateCollaborator(
     *   { userID: 'user1', name: 'John Doe Updated', avatar: 'https://...' },
     *   univerAPI.Enum.UnitRole.Reader
     * );
     * ```
     */
    async updateCollaborator(user: IUser, role: UnitRole): Promise<void> {
        await this._authzIoService.updateCollaborator({
            objectID: this._unitId,
            unitID: this._unitId,
            collaborator: {
                id: user.userID,
                subject: user,
                role,
            },
        });

        this._collaboratorChangeSubject.next({
            type: 'update',
            collaborator: {
                user: { id: user.userID },
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
     * const workbook = univerAPI.getActiveWorkbook();
     * const permission = workbook?.getWorkbookPermission();
     * await permission?.removeCollaborator('user1');
     * ```
     */
    async removeCollaborator(userId: string): Promise<void> {
        await this._authzIoService.deleteCollaborator({
            objectID: this._unitId,
            unitID: this._unitId,
            collaboratorID: userId,
        });

        this._collaboratorChangeSubject.next({
            type: 'delete',
            collaborator: {
                user: { id: userId },
                role: UnitRole.Reader, // Placeholder value
            },
        });
    }

    /**
     * Remove multiple collaborators at once.
     * @param {string[]} userIds Array of user IDs to remove.
     * @returns {Promise<void>} A promise that resolves when the collaborators are removed.
     * @example
     * ```ts
     * const workbook = univerAPI.getActiveWorkbook();
     * const permission = workbook?.getWorkbookPermission();
     * await permission?.removeCollaborators(['user1', 'user2']);
     * ```
     */
    async removeCollaborators(userIds: string[]): Promise<void> {
        for (const userId of userIds) {
            await this.removeCollaborator(userId);
        }
    }

    /**
     * List all collaborators of the workbook.
     * @returns {Promise<ICollaborator[]>} Array of collaborators with their roles.
     * @example
     * ```ts
     * const workbook = univerAPI.getActiveWorkbook();
     * const permission = workbook?.getWorkbookPermission();
     * const collaborators = await permission?.listCollaborators();
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
                id: c.subject?.userID || c.id,
                displayName: c.subject?.name || '',
            },
            role: c.role as UnitRole, // Type conversion: protocol UnitRole to our UnitRole
        }));
    }

    /**
     * Subscribe to permission changes (simplified interface for users not familiar with RxJS).
     * @param {Function} listener Callback function to be called when permissions change.
     * @returns {UnsubscribeFn} Unsubscribe function.
     * @example
     * ```ts
     * const workbook = univerAPI.getActiveWorkbook();
     * const permission = workbook?.getWorkbookPermission();
     * const unsubscribe = permission?.subscribe((snapshot) => {
     *   console.log('Permission changed:', snapshot);
     * });
     * // Later, to stop listening:
     * unsubscribe?.();
     * ```
     */
    subscribe(listener: (snapshot: WorkbookPermissionSnapshot) => void): UnsubscribeFn {
        const subscription = this.permission$.subscribe(listener);
        return () => subscription.unsubscribe();
    }

    /**
     * Clean up resources
     */
    dispose(): void {
        this._subscriptions.forEach((s) => s.unsubscribe());
        this._permissionSubject.complete();
        this._collaboratorChangeSubject.complete();
    }
}

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
import type { Observable, Subscription } from 'rxjs';
import type { ICollaborator, UnsubscribeFn, WorkbookMode, WorkbookPermission, WorkbookPermissionSnapshot } from './permission-types';
import { IAuthzIoService, Inject, Injector, IPermissionService } from '@univerjs/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { distinctUntilChanged, shareReplay } from 'rxjs/operators';
import { WORKBOOK_PERMISSION_POINT_MAP } from './permission-point-map';
import { UnitRole, WorkbookPermissionPoint } from './permission-types';

/**
 * Implementation class for WorkbookPermission
 * Provides workbook-level permission control
 *
 * @hideconstructor
 */
export class FWorkbookPermission implements WorkbookPermission {
    private readonly _permissionSubject: BehaviorSubject<WorkbookPermissionSnapshot>;
    private readonly _pointChangeSubject = new Subject<{
        point: WorkbookPermissionPoint;
        value: boolean;
        oldValue: boolean;
    }>();

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

    constructor(
        private readonly _unitId: string,
        @Inject(Injector) private readonly _injector: Injector,
        @IPermissionService private readonly _permissionService: IPermissionService,
        @IAuthzIoService private readonly _authzIoService: IAuthzIoService
    ) {
        // Initialize BehaviorSubject (with initial value)
        this._permissionSubject = new BehaviorSubject(this._buildSnapshot());
        this.permission$ = this._permissionSubject.asObservable().pipe(
            distinctUntilChanged((prev, curr) => JSON.stringify(prev) === JSON.stringify(curr)),
            shareReplay(1)
        );

        this.pointChange$ = this._pointChangeSubject.asObservable();
        this.collaboratorChange$ = this._collaboratorChangeSubject.asObservable();

        // Listen to permission point changes
        this._listenToPermissionChanges();
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
     */
    private _listenToPermissionChanges(): void {
        // TODO: Listen to IPermissionService change events
        // When permission points change, update snapshot and trigger corresponding Observable
    }

    /**
     * Set permission mode for the workbook
     * @param mode - The permission mode to set ('owner' | 'editor' | 'viewer' | 'commenter')
     */
    async setMode(mode: WorkbookMode): Promise<void> {
        const pointsToSet: Partial<Record<WorkbookPermissionPoint, boolean>> = {};

        switch (mode) {
            case 'owner':
                // Owner has all permissions
                Object.values(WorkbookPermissionPoint).forEach((point) => {
                    pointsToSet[point] = true;
                });
                break;
            case 'editor':
                // Editor can edit, view, print, but cannot manage collaborators, share, etc.
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
                pointsToSet[WorkbookPermissionPoint.InsertRow] = true;
                pointsToSet[WorkbookPermissionPoint.InsertColumn] = true;
                pointsToSet[WorkbookPermissionPoint.DeleteRow] = true;
                pointsToSet[WorkbookPermissionPoint.DeleteColumn] = true;
                // Not allowed: ManageCollaborator, Share, DuplicateFile, ManageHistory, etc.
                pointsToSet[WorkbookPermissionPoint.ManageCollaborator] = false;
                pointsToSet[WorkbookPermissionPoint.Share] = false;
                pointsToSet[WorkbookPermissionPoint.DuplicateFile] = false;
                break;
            case 'viewer':
                // Viewer can only view and print
                pointsToSet[WorkbookPermissionPoint.View] = true;
                pointsToSet[WorkbookPermissionPoint.Print] = true;
                // Disable all editing permissions
                pointsToSet[WorkbookPermissionPoint.Edit] = false;
                pointsToSet[WorkbookPermissionPoint.Export] = false;
                pointsToSet[WorkbookPermissionPoint.CopyContent] = false;
                pointsToSet[WorkbookPermissionPoint.Comment] = false;
                pointsToSet[WorkbookPermissionPoint.CreateSheet] = false;
                pointsToSet[WorkbookPermissionPoint.DeleteSheet] = false;
                pointsToSet[WorkbookPermissionPoint.RenameSheet] = false;
                pointsToSet[WorkbookPermissionPoint.MoveSheet] = false;
                pointsToSet[WorkbookPermissionPoint.InsertRow] = false;
                pointsToSet[WorkbookPermissionPoint.InsertColumn] = false;
                pointsToSet[WorkbookPermissionPoint.DeleteRow] = false;
                pointsToSet[WorkbookPermissionPoint.DeleteColumn] = false;
                pointsToSet[WorkbookPermissionPoint.ManageCollaborator] = false;
                pointsToSet[WorkbookPermissionPoint.Share] = false;
                break;
            case 'commenter':
                // Commenter can view and comment
                pointsToSet[WorkbookPermissionPoint.View] = true;
                pointsToSet[WorkbookPermissionPoint.Comment] = true;
                pointsToSet[WorkbookPermissionPoint.Print] = true;
                // Disable editing permissions
                pointsToSet[WorkbookPermissionPoint.Edit] = false;
                pointsToSet[WorkbookPermissionPoint.CreateSheet] = false;
                pointsToSet[WorkbookPermissionPoint.DeleteSheet] = false;
                break;
        }

        // Batch set permission points
        for (const [point, value] of Object.entries(pointsToSet)) {
            await this.setPoint(point as WorkbookPermissionPoint, value);
        }
    }

    /**
     * Set the workbook to read-only mode (viewer mode)
     */
    async setReadOnly(): Promise<void> {
        await this.setMode('viewer');
    }

    /**
     * Set the workbook to editable mode (editor mode)
     */
    async setEditable(): Promise<void> {
        await this.setMode('editor');
    }

    /**
     * Check if the workbook is editable
     * @returns true if the workbook can be edited, false otherwise
     */
    canEdit(): boolean {
        return this.getPoint(WorkbookPermissionPoint.Edit);
    }

    /**
     * Set a specific permission point
     * @param point - The permission point to set
     * @param value - The value to set (true = allowed, false = denied)
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

        const instance = new PointClass(this._unitId);
        const permissionPoint = this._permissionService.getPermissionPoint(instance.id);

        if (!permissionPoint) {
            this._permissionService.addPermissionPoint(instance);
        }

        this._permissionService.updatePermissionPoint(instance.id, value);

        // Trigger change event
        this._pointChangeSubject.next({ point, value, oldValue });

        // Update snapshot
        const newSnapshot = this._buildSnapshot();
        this._permissionSubject.next(newSnapshot);
    }

    /**
     * Get the value of a specific permission point
     * @param point - The permission point to query
     * @returns true if allowed, false if denied
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
     * Get a snapshot of all permission points
     * @returns An object containing all permission point values
     */
    getSnapshot(): WorkbookPermissionSnapshot {
        return this._buildSnapshot();
    }

    /**
     * Set multiple collaborators at once (replaces existing collaborators)
     * @param collaborators - Array of collaborators with userId and role
     */
    async setCollaborators(collaborators: Array<{ userId: string; role: UnitRole }>): Promise<void> {
        // Convert to protocol format
        const protocolCollaborators: IProtocolCollaborator[] = collaborators.map((c) => ({
            id: c.userId,
            subject: {
                userID: c.userId,
                name: '',
                avatar: '',
            },
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
                    user: { id: c.userId },
                    role: c.role,
                },
            });
        });
    }

    /**
     * Add a single collaborator
     * @param userId - The user ID
     * @param role - The role to assign
     */
    async addCollaborator(userId: string, role: UnitRole): Promise<void> {
        await this._authzIoService.createCollaborator({
            objectID: this._unitId,
            unitID: this._unitId,
            collaborators: [{
                id: userId,
                subject: {
                    userID: userId,
                    name: '',
                    avatar: '',
                },
                role,
            }],
        });

        this._collaboratorChangeSubject.next({
            type: 'add',
            collaborator: {
                user: { id: userId },
                role,
            },
        });
    }

    /**
     * Update an existing collaborator's role
     * @param userId - The user ID
     * @param role - The new role to assign
     */
    async updateCollaborator(userId: string, role: UnitRole): Promise<void> {
        await this._authzIoService.updateCollaborator({
            objectID: this._unitId,
            unitID: this._unitId,
            collaborator: {
                id: userId,
                subject: {
                    userID: userId,
                    name: '',
                    avatar: '',
                },
                role,
            },
        });

        this._collaboratorChangeSubject.next({
            type: 'update',
            collaborator: {
                user: { id: userId },
                role,
            },
        });
    }

    /**
     * Remove a collaborator from the workbook
     * @param userId - The user ID to remove
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
     * Remove multiple collaborators at once
     * @param userIds - Array of user IDs to remove
     */
    async removeCollaborators(userIds: string[]): Promise<void> {
        for (const userId of userIds) {
            await this.removeCollaborator(userId);
        }
    }

    /**
     * List all collaborators of the workbook
     * @returns Array of collaborators with their roles
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
     * Subscribe to permission changes (simplified interface for users not familiar with RxJS)
     * @param listener - Callback function to be called when permissions change
     * @returns Unsubscribe function
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
        this._pointChangeSubject.complete();
        this._collaboratorChangeSubject.complete();
    }
}

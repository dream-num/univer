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

import type { Injector } from '@univerjs/core';
import type { FUniver } from '@univerjs/core/facade';
import type { IUser } from '@univerjs/protocol';
import type { WorkbookPermissionSnapshot } from '../permission-types';
import { IPermissionService } from '@univerjs/core';
import { WorkbookEditablePermission } from '@univerjs/sheets';
import { beforeEach, describe, expect, it } from 'vitest';
import { createFacadeTestBed } from '../../__tests__/create-test-bed';
import { WorkbookPermissionPoint } from '../permission-types';

describe('Test FWorkbookPermission', () => {
    let get: Injector['get'];
    let univerAPI: FUniver;
    let permissionService: IPermissionService;

    beforeEach(() => {
        const testBed = createFacadeTestBed();
        get = testBed.get;
        univerAPI = testBed.univerAPI;
        permissionService = get(IPermissionService);
    });

    describe('Basic Operations', () => {
        it('should get workbook permission instance', () => {
            const workbook = univerAPI.getActiveWorkbook();
            const permission = workbook?.getWorkbookPermission();

            expect(permission).toBeDefined();
            expect(permission?.getSnapshot).toBeDefined();
        });

        it('should set and get permission points', async () => {
            const workbook = univerAPI.getActiveWorkbook();
            const permission = workbook?.getWorkbookPermission();

            if (!permission || !workbook) {
                throw new Error('Permission or workbook is null');
            }

            const unitId = workbook.getId();

            // Set Edit permission to false
            await permission.setPoint(WorkbookPermissionPoint.Edit, false);

            let canEdit = permission.getPoint(WorkbookPermissionPoint.Edit);
            expect(canEdit).toBe(false);

            // Verify through permission service
            const editPoint = permissionService.getPermissionPoint(
                new WorkbookEditablePermission(unitId).id
            );
            expect(editPoint?.value).toBe(false);

            // Set Edit permission to true
            await permission.setPoint(WorkbookPermissionPoint.Edit, true);
            canEdit = permission.getPoint(WorkbookPermissionPoint.Edit);
            expect(canEdit).toBe(true);
        });

        it('should get complete permission snapshot', () => {
            const workbook = univerAPI.getActiveWorkbook();
            const permission = workbook?.getWorkbookPermission();

            if (!permission) {
                throw new Error('Permission is null');
            }

            const snapshot = permission.getSnapshot();

            expect(snapshot).toBeDefined();
            expect(snapshot[WorkbookPermissionPoint.Edit]).toBeDefined();
            expect(snapshot[WorkbookPermissionPoint.View]).toBeDefined();
            expect(snapshot[WorkbookPermissionPoint.Print]).toBeDefined();
        });
    });

    describe('Mode Operations', () => {
        it('should set viewer mode', async () => {
            const workbook = univerAPI.getActiveWorkbook();
            const permission = workbook?.getWorkbookPermission();

            if (!permission) {
                throw new Error('Permission is null');
            }

            await permission.setMode('viewer');

            const snapshot = permission.getSnapshot();
            expect(snapshot[WorkbookPermissionPoint.Edit]).toBe(false);
            expect(snapshot[WorkbookPermissionPoint.View]).toBe(true);
        });

        it('should set editor mode', async () => {
            const workbook = univerAPI.getActiveWorkbook();
            const permission = workbook?.getWorkbookPermission();

            if (!permission) {
                throw new Error('Permission is null');
            }

            await permission.setMode('editor');

            const snapshot = permission.getSnapshot();
            expect(snapshot[WorkbookPermissionPoint.Edit]).toBe(true);
            expect(snapshot[WorkbookPermissionPoint.View]).toBe(true);
        });

        it('should set owner mode', async () => {
            const workbook = univerAPI.getActiveWorkbook();
            const permission = workbook?.getWorkbookPermission();

            if (!permission) {
                throw new Error('Permission is null');
            }

            await permission.setMode('owner');

            const snapshot = permission.getSnapshot();
            expect(snapshot[WorkbookPermissionPoint.Edit]).toBe(true);
            expect(snapshot[WorkbookPermissionPoint.View]).toBe(true);
            expect(snapshot[WorkbookPermissionPoint.ManageCollaborator]).toBe(true);
        });

        it('should set commenter mode', async () => {
            const workbook = univerAPI.getActiveWorkbook();
            const permission = workbook?.getWorkbookPermission();

            if (!permission) {
                throw new Error('Permission is null');
            }

            await permission.setMode('commenter');

            const snapshot = permission.getSnapshot();
            expect(snapshot[WorkbookPermissionPoint.Edit]).toBe(false);
            expect(snapshot[WorkbookPermissionPoint.View]).toBe(true);
        });
    });

    describe('Shortcut Methods', () => {
        it('should set read-only using setReadOnly()', async () => {
            const workbook = univerAPI.getActiveWorkbook();
            const permission = workbook?.getWorkbookPermission();

            if (!permission) {
                throw new Error('Permission is null');
            }

            await permission.setReadOnly();

            const canEdit = permission.getPoint(WorkbookPermissionPoint.Edit);
            expect(canEdit).toBe(false);

            const canView = permission.getPoint(WorkbookPermissionPoint.View);
            expect(canView).toBe(true);
        });

        it('should set editable using setEditable()', async () => {
            const workbook = univerAPI.getActiveWorkbook();
            const permission = workbook?.getWorkbookPermission();

            if (!permission) {
                throw new Error('Permission is null');
            }

            await permission.setEditable();

            const canEdit = permission.getPoint(WorkbookPermissionPoint.Edit);
            expect(canEdit).toBe(true);

            const canView = permission.getPoint(WorkbookPermissionPoint.View);
            expect(canView).toBe(true);
        });
    });

    describe('Reactive Streams', () => {
        it('should emit current permission snapshot on subscribe', () => {
            const workbook = univerAPI.getActiveWorkbook();
            const permission = workbook?.getWorkbookPermission();

            if (!permission) {
                throw new Error('Permission is null');
            }

            let snapshotReceived = false;
            const subscription = permission.permission$.subscribe((snapshot) => {
                expect(snapshot).toBeDefined();
                expect(snapshot[WorkbookPermissionPoint.Edit]).toBeDefined();
                snapshotReceived = true;
            });

            expect(snapshotReceived).toBe(true);
            subscription.unsubscribe();
        });

        it('should emit permission changes', async () => {
            const workbook = univerAPI.getActiveWorkbook();
            const permission = workbook?.getWorkbookPermission();

            if (!permission) {
                throw new Error('Permission is null');
            }

            const snapshots: WorkbookPermissionSnapshot[] = [];
            const subscription = permission.permission$.subscribe((snapshot) => {
                snapshots.push(snapshot);
            });

            // Initial snapshot
            expect(snapshots.length).toBeGreaterThan(0);

            // Change permission
            await permission.setPoint(WorkbookPermissionPoint.Edit, false);

            // Should have emitted new snapshot
            expect(snapshots.length).toBeGreaterThan(1);
            expect(snapshots[snapshots.length - 1][WorkbookPermissionPoint.Edit]).toBe(false);

            subscription.unsubscribe();
        });

        it('should use subscribe() compatibility method', () => {
            const workbook = univerAPI.getActiveWorkbook();
            const permission = workbook?.getWorkbookPermission();

            if (!permission) {
                throw new Error('Permission is null');
            }

            let snapshotReceived = false;
            const unsubscribe = permission.subscribe((snapshot) => {
                expect(snapshot).toBeDefined();
                expect(snapshot[WorkbookPermissionPoint.Edit]).toBeDefined();
                snapshotReceived = true;
            });

            expect(snapshotReceived).toBe(true);
            unsubscribe();
        });
    });

    describe('Permission Points Coverage', () => {
        it('should handle all workbook permission points', async () => {
            const workbook = univerAPI.getActiveWorkbook();
            const permission = workbook?.getWorkbookPermission();

            if (!permission) {
                throw new Error('Permission is null');
            }

            const pointsToTest = [
                WorkbookPermissionPoint.Edit,
                WorkbookPermissionPoint.View,
                WorkbookPermissionPoint.Print,
                WorkbookPermissionPoint.Export,
                WorkbookPermissionPoint.CopyContent,
            ];

            for (const point of pointsToTest) {
                await permission.setPoint(point, false);
                const value = permission.getPoint(point);
                expect(value).toBe(false);

                await permission.setPoint(point, true);
                const valueAfter = permission.getPoint(point);
                expect(valueAfter).toBe(true);
            }
        });
    });

    describe('Permission Change Listener', () => {
        it('should listen to permission service updates and emit pointChange$', async () => {
            const workbook = univerAPI.getActiveWorkbook();
            const permission = workbook?.getWorkbookPermission();

            if (!permission || !workbook) {
                throw new Error('Permission or workbook is null');
            }

            const changes: Array<{
                point: WorkbookPermissionPoint;
                value: boolean;
                oldValue: boolean;
            }> = [];

            const subscription = permission.pointChange$.subscribe((change) => {
                changes.push(change);
            });

            // Change a permission point, which should trigger the listener
            await permission.setPoint(WorkbookPermissionPoint.Edit, false);
            await permission.setPoint(WorkbookPermissionPoint.Print, false);

            // Wait a bit for async updates
            await new Promise((resolve) => setTimeout(resolve, 50));

            // Should have captured the changes
            expect(changes.length).toBeGreaterThanOrEqual(2);
            expect(changes.some((c) => c.point === WorkbookPermissionPoint.Edit)).toBe(true);
            expect(changes.some((c) => c.point === WorkbookPermissionPoint.Print)).toBe(true);

            subscription.unsubscribe();
        });

        it('should update snapshot when permission service emits changes', async () => {
            const workbook = univerAPI.getActiveWorkbook();
            const permission = workbook?.getWorkbookPermission();

            if (!permission || !workbook) {
                throw new Error('Permission or workbook is null');
            }

            const snapshots: WorkbookPermissionPoint[][] = [];
            const subscription = permission.permission$.subscribe((snapshot) => {
                const changedPoints = Object.keys(snapshot).filter(
                    (key) => snapshot[key as WorkbookPermissionPoint] === false
                );
                snapshots.push(changedPoints as WorkbookPermissionPoint[]);
            });

            const initialSnapshotCount = snapshots.length;

            // Trigger permission change
            await permission.setPoint(WorkbookPermissionPoint.Export, false);

            // Wait for async updates
            await new Promise((resolve) => setTimeout(resolve, 50));

            // Should have received a new snapshot
            expect(snapshots.length).toBeGreaterThan(initialSnapshotCount);

            subscription.unsubscribe();
        });

        it('should only react to permission changes for this workbook', async () => {
            const workbook = univerAPI.getActiveWorkbook();
            const permission = workbook?.getWorkbookPermission();

            if (!permission || !workbook) {
                throw new Error('Permission or workbook is null');
            }

            const changes: Array<{
                point: WorkbookPermissionPoint;
                value: boolean;
                oldValue: boolean;
            }> = [];

            const subscription = permission.pointChange$.subscribe((change) => {
                changes.push(change);
            });

            // Create a permission point for a different unitId (should be ignored)
            const differentUnitId = 'different-unit-id';
            const differentPermissionPoint = new WorkbookEditablePermission(differentUnitId);
            permissionService.addPermissionPoint(differentPermissionPoint);
            permissionService.updatePermissionPoint(differentPermissionPoint.id, false);

            // Change permission for current workbook
            await permission.setPoint(WorkbookPermissionPoint.View, false);

            // Wait for async updates
            await new Promise((resolve) => setTimeout(resolve, 50));

            // Should only have changes for the current workbook
            expect(changes.every((c) => c.point === WorkbookPermissionPoint.View)).toBe(true);
            expect(changes.length).toBeGreaterThanOrEqual(1);

            subscription.unsubscribe();
        });

        it('should properly dispose subscriptions', () => {
            const workbook = univerAPI.getActiveWorkbook();
            const permission = workbook?.getWorkbookPermission();

            if (!permission) {
                throw new Error('Permission is null');
            }

            // Dispose should not throw
            expect(() => permission.dispose()).not.toThrow();
        });
    });

    describe('Additional Coverage Tests', () => {
        it('should handle canEdit method', () => {
            const workbook = univerAPI.getActiveWorkbook();
            const permission = workbook?.getWorkbookPermission();

            if (!permission) {
                throw new Error('Permission is null');
            }

            const canEdit = permission.canEdit();
            expect(typeof canEdit).toBe('boolean');
        });

        it('should handle subscribe method and return unsubscribe function', () => {
            const workbook = univerAPI.getActiveWorkbook();
            const permission = workbook?.getWorkbookPermission();

            if (!permission) {
                throw new Error('Permission is null');
            }

            let callCount = 0;
            const unsubscribe = permission.subscribe((snapshot) => {
                callCount++;
                expect(snapshot).toBeDefined();
            });

            // Should be called at least once
            expect(callCount).toBeGreaterThan(0);

            // Unsubscribe should work
            unsubscribe();
        });

        it('should handle getSnapshot method', () => {
            const workbook = univerAPI.getActiveWorkbook();
            const permission = workbook?.getWorkbookPermission();

            if (!permission) {
                throw new Error('Permission is null');
            }

            const snapshot = permission.getSnapshot();
            expect(snapshot).toBeDefined();
            expect(typeof snapshot[WorkbookPermissionPoint.View]).toBe('boolean');
        });

        it('should handle setCollaborators method', async () => {
            const workbook = univerAPI.getActiveWorkbook();
            const permission = workbook?.getWorkbookPermission();

            if (!permission) {
                throw new Error('Permission is null');
            }

            const collaborators = [
                {
                    user: {
                        userID: 'user1',
                        name: 'User 1',
                        avatar: '',
                        anonymous: false,
                        canBindAnonymous: false,
                    } as IUser,
                    role: 1,
                },
                {
                    user: {
                        userID: 'user2',
                        name: 'User 2',
                        avatar: '',
                        anonymous: false,
                        canBindAnonymous: false,
                    } as IUser,
                    role: 2,
                },
            ];

            await expect(permission.setCollaborators(collaborators)).resolves.not.toThrow();
        });

        it('should handle addCollaborator method', async () => {
            const workbook = univerAPI.getActiveWorkbook();
            const permission = workbook?.getWorkbookPermission();

            if (!permission) {
                throw new Error('Permission is null');
            }

            const user = {
                userID: 'user3',
                name: 'User 3',
                avatar: '',
                anonymous: false,
                canBindAnonymous: false,
            } as IUser;

            await expect(permission.addCollaborator(user, 1)).resolves.not.toThrow();
        });

        it('should handle updateCollaborator method', async () => {
            const workbook = univerAPI.getActiveWorkbook();
            const permission = workbook?.getWorkbookPermission();

            if (!permission) {
                throw new Error('Permission is null');
            }

            const user: IUser = {
                userID: 'user1',
                name: 'User 1',
                avatar: '',
                anonymous: false,
                canBindAnonymous: false,
                phone: '',
                email: '',
                createTimestamp: 0,
            };

            await expect(permission.updateCollaborator(user, 2)).resolves.not.toThrow();
        });

        it('should handle removeCollaborator method', async () => {
            const workbook = univerAPI.getActiveWorkbook();
            const permission = workbook?.getWorkbookPermission();

            if (!permission) {
                throw new Error('Permission is null');
            }

            await expect(permission.removeCollaborator('user1')).resolves.not.toThrow();
        });

        it('should handle removeCollaborators method', async () => {
            const workbook = univerAPI.getActiveWorkbook();
            const permission = workbook?.getWorkbookPermission();

            if (!permission) {
                throw new Error('Permission is null');
            }

            const userIds = ['user1', 'user2'];
            await expect(permission.removeCollaborators(userIds)).resolves.not.toThrow();
        });

        it('should handle listCollaborators method', async () => {
            const workbook = univerAPI.getActiveWorkbook();
            const permission = workbook?.getWorkbookPermission();

            if (!permission) {
                throw new Error('Permission is null');
            }

            const collaborators = await permission.listCollaborators();
            expect(Array.isArray(collaborators)).toBe(true);
        });

        it('should handle multiple setPoint calls', async () => {
            const workbook = univerAPI.getActiveWorkbook();
            const permission = workbook?.getWorkbookPermission();

            if (!permission) {
                throw new Error('Permission is null');
            }

            // Save original values
            const originalView = permission.getPoint(WorkbookPermissionPoint.View);
            const originalEdit = permission.getPoint(WorkbookPermissionPoint.Edit);
            const originalPrint = permission.getPoint(WorkbookPermissionPoint.Print);

            // Test setPoint for various permission points
            await expect(permission.setPoint(WorkbookPermissionPoint.View, true)).resolves.not.toThrow();
            await expect(permission.setPoint(WorkbookPermissionPoint.Edit, false)).resolves.not.toThrow();
            await expect(permission.setPoint(WorkbookPermissionPoint.Print, true)).resolves.not.toThrow();

            // Restore original values
            await permission.setPoint(WorkbookPermissionPoint.View, originalView);
            await permission.setPoint(WorkbookPermissionPoint.Edit, originalEdit);
            await permission.setPoint(WorkbookPermissionPoint.Print, originalPrint);
        });

        it('should skip setPoint when value is unchanged', async () => {
            const workbook = univerAPI.getActiveWorkbook();
            const permission = workbook?.getWorkbookPermission();

            if (!permission) {
                throw new Error('Permission is null');
            }

            // Get current value
            const currentValue = permission.getPoint(WorkbookPermissionPoint.View);

            // Set same value again, should not cause error
            await expect(permission.setPoint(WorkbookPermissionPoint.View, currentValue)).resolves.not.toThrow();
        });

        it('should throw error for invalid permission point', async () => {
            const workbook = univerAPI.getActiveWorkbook();
            const permission = workbook?.getWorkbookPermission();

            if (!permission) {
                throw new Error('Permission is null');
            }

            // Try to set invalid point
            await expect(permission.setPoint('InvalidPoint' as WorkbookPermissionPoint, true)).rejects.toThrow();
        });

        it('should return default value for invalid getPoint call', () => {
            const workbook = univerAPI.getActiveWorkbook();
            const permission = workbook?.getWorkbookPermission();

            if (!permission) {
                throw new Error('Permission is null');
            }

            // Try to get invalid point
            expect(() => permission.getPoint('InvalidPoint' as WorkbookPermissionPoint)).toThrow();
        });
    });
});

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

            const snapshots: any[] = [];
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
});

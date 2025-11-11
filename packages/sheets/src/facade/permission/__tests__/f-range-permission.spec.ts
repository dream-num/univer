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
import { ICommandService } from '@univerjs/core';
import {
    AddRangeProtectionMutation,
    DeleteRangeProtectionMutation,
    RangeProtectionRuleModel,
    SetRangeProtectionMutation,
} from '@univerjs/sheets';
import { beforeEach, describe, expect, it } from 'vitest';
import { createFacadeTestBed } from '../../__tests__/create-test-bed';
import { RangePermissionPoint } from '../permission-types';

describe('Test FRangePermission', () => {
    let get: Injector['get'];
    let univerAPI: FUniver;
    let commandService: ICommandService;
    let rangeProtectionRuleModel: RangeProtectionRuleModel;

    beforeEach(() => {
        const testBed = createFacadeTestBed();
        get = testBed.get;
        univerAPI = testBed.univerAPI;
        commandService = get(ICommandService);
        rangeProtectionRuleModel = get(RangeProtectionRuleModel);

        // Register commands
        commandService.registerCommand(AddRangeProtectionMutation);
        commandService.registerCommand(SetRangeProtectionMutation);
        commandService.registerCommand(DeleteRangeProtectionMutation);
    });

    describe('Basic Operations', () => {
        it('should get range permission instance', () => {
            const worksheet = univerAPI.getActiveWorkbook()?.getActiveSheet();
            const range = worksheet?.getRange('A1:B2');
            const permission = range?.getRangePermission();

            expect(permission).toBeDefined();
            expect(permission?.protect).toBeDefined();
            expect(permission?.unprotect).toBeDefined();
        });

        it('should get permission snapshot', () => {
            const worksheet = univerAPI.getActiveWorkbook()?.getActiveSheet();
            const range = worksheet?.getRange('A1:B2');
            const permission = range?.getRangePermission();

            if (!permission) {
                throw new Error('Permission is null');
            }

            const snapshot = permission.getSnapshot();

            expect(snapshot).toBeDefined();
            expect(snapshot[RangePermissionPoint.Edit]).toBeDefined();
            expect(snapshot[RangePermissionPoint.View]).toBeDefined();
        });

        it('should get permission point', () => {
            const worksheet = univerAPI.getActiveWorkbook()?.getActiveSheet();
            const range = worksheet?.getRange('A1:B2');
            const permission = range?.getRangePermission();

            if (!permission) {
                throw new Error('Permission is null');
            }

            const canEdit = permission.getPoint(RangePermissionPoint.Edit);
            expect(canEdit).toBeDefined();
            expect(typeof canEdit).toBe('boolean');
        });
    });

    describe('Protection Operations', () => {
        it('should protect range', async () => {
            const worksheet = univerAPI.getActiveWorkbook()?.getActiveSheet();
            const range = worksheet?.getRange('A1:B2');
            const permission = range?.getRangePermission();

            if (!permission) {
                throw new Error('Permission is null');
            }

            const rule = await permission.protect({
                name: 'Protected Area',
                allowEdit: false,
            });

            expect(rule).toBeDefined();
            expect(rule.options.name).toBe('Protected Area');
            expect(rule.options.allowEdit).toBe(false);
        });

        it('should protect range with allowed users', async () => {
            const worksheet = univerAPI.getActiveWorkbook()?.getActiveSheet();
            const range = worksheet?.getRange('A1:B2');
            const permission = range?.getRangePermission();

            if (!permission) {
                throw new Error('Permission is null');
            }

            const rule = await permission.protect({
                name: 'Protected with Users',
                allowEdit: false,
                allowedUsers: ['user123', 'user456'],
            });

            expect(rule).toBeDefined();
            expect(rule.options.allowedUsers).toEqual(['user123', 'user456']);
        });

        it('should protect range with metadata', async () => {
            const worksheet = univerAPI.getActiveWorkbook()?.getActiveSheet();
            const range = worksheet?.getRange('A1:B2');
            const permission = range?.getRangePermission();

            if (!permission) {
                throw new Error('Permission is null');
            }

            const rule = await permission.protect({
                name: 'Protected with Metadata',
                allowEdit: false,
                metadata: {
                    department: 'Finance',
                    createdBy: 'admin',
                },
            });

            expect(rule).toBeDefined();
            expect(rule.options.metadata).toEqual({
                department: 'Finance',
                createdBy: 'admin',
            });
        });

        it('should unprotect range', async () => {
            const worksheet = univerAPI.getActiveWorkbook()?.getActiveSheet();
            const range = worksheet?.getRange('A1:B2');
            const permission = range?.getRangePermission();

            if (!permission || !worksheet) {
                throw new Error('Permission or worksheet is null');
            }

            // First protect
            const rule = await permission.protect({
                name: 'To be removed',
            });

            const workbook = univerAPI.getActiveWorkbook();
            const unitId = workbook?.getId() ?? '';
            const subUnitId = worksheet.getSheetId();

            // Verify it exists
            let existingRule = rangeProtectionRuleModel.getRule(unitId, subUnitId, rule.id);
            expect(existingRule).toBeDefined();

            // Now unprotect
            await permission.unprotect();

            // Verify it's removed
            existingRule = rangeProtectionRuleModel.getRule(unitId, subUnitId, rule.id);
            expect(existingRule).toBeUndefined();
        });
    });

    describe('State Checks', () => {
        it('should check if range is protected', async () => {
            const worksheet = univerAPI.getActiveWorkbook()?.getActiveSheet();
            const range = worksheet?.getRange('A1:B2');
            const permission = range?.getRangePermission();

            if (!permission) {
                throw new Error('Permission is null');
            }

            // Initially not protected
            let isProtected = permission.isProtected();
            expect(isProtected).toBe(false);

            // Protect it
            await permission.protect({ name: 'Test Protection' });

            // Now should be protected
            isProtected = permission.isProtected();
            expect(isProtected).toBe(true);

            // Unprotect
            await permission.unprotect();

            // Should not be protected anymore
            isProtected = permission.isProtected();
            expect(isProtected).toBe(false);
        });

        it('should check if range can be edited', async () => {
            const worksheet = univerAPI.getActiveWorkbook()?.getActiveSheet();
            const range = worksheet?.getRange('A1:B2');
            const permission = range?.getRangePermission();

            if (!permission) {
                throw new Error('Permission is null');
            }

            // Initially can edit
            let canEdit = permission.canEdit();
            expect(canEdit).toBe(true);

            // Protect with allowEdit: false
            await permission.protect({
                name: 'No Edit',
                allowEdit: false,
            });

            // Now cannot edit
            canEdit = permission.canEdit();
            expect(canEdit).toBe(false);

            // Unprotect
            await permission.unprotect();

            // Can edit again
            canEdit = permission.canEdit();
            expect(canEdit).toBe(true);
        });
    });

    describe('List Rules', () => {
        it('should list all protection rules for range', async () => {
            const worksheet = univerAPI.getActiveWorkbook()?.getActiveSheet();
            const range = worksheet?.getRange('A1:B2');
            const permission = range?.getRangePermission();

            if (!permission) {
                throw new Error('Permission is null');
            }

            // Protect the range
            await permission.protect({ name: 'Rule 1' });

            // List rules
            const rules = await permission.listRules();

            expect(rules).toBeDefined();
            expect(Array.isArray(rules)).toBe(true);
            expect(rules.length).toBeGreaterThan(0);

            // Find our rule
            const ourRule = rules.find((r) => r.options.name === 'Rule 1');
            expect(ourRule).toBeDefined();
        });

        it('should list rules for overlapping ranges', async () => {
            const worksheet = univerAPI.getActiveWorkbook()?.getActiveSheet();

            if (!worksheet) {
                throw new Error('Worksheet is null');
            }

            // Protect A1:C3
            const range1 = worksheet.getRange('A1:C3');
            await range1.getRangePermission()?.protect({ name: 'Large Area' });

            // Check if B2:B2 shows the rule
            const range2 = worksheet.getRange('B2:B2');
            const rules = await range2.getRangePermission()?.listRules();

            expect(rules).toBeDefined();
            if (rules) {
                expect(rules.length).toBeGreaterThan(0);
                const overlappingRule = rules.find((r) => r.options.name === 'Large Area');
                expect(overlappingRule).toBeDefined();
            }
        });
    });

    describe('Reactive Streams', () => {
        it('should emit current permission snapshot on subscribe', () => {
            const worksheet = univerAPI.getActiveWorkbook()?.getActiveSheet();
            const range = worksheet?.getRange('A1:B2');
            const permission = range?.getRangePermission();

            if (!permission) {
                throw new Error('Permission is null');
            }

            let snapshotReceived = false;
            const subscription = permission.permission$.subscribe((snapshot) => {
                expect(snapshot).toBeDefined();
                expect(snapshot[RangePermissionPoint.Edit]).toBeDefined();
                snapshotReceived = true;
            });

            expect(snapshotReceived).toBe(true);
            subscription.unsubscribe();
        });

        it('should emit protection changes', async () => {
            const worksheet = univerAPI.getActiveWorkbook()?.getActiveSheet();
            const range = worksheet?.getRange('A1:B2');
            const permission = range?.getRangePermission();

            if (!permission) {
                throw new Error('Permission is null');
            }

            const changes: any[] = [];
            const subscription = permission.protectionChange$.subscribe((change) => {
                changes.push(change);
            });

            // Protect the range
            await permission.protect({ name: 'Test' });

            // Should have emitted change
            expect(changes.length).toBeGreaterThan(0);

            subscription.unsubscribe();
        });
    });

    describe('Error Handling', () => {
        it('should handle unprotecting non-protected range', async () => {
            const worksheet = univerAPI.getActiveWorkbook()?.getActiveSheet();
            const range = worksheet?.getRange('Z99:Z99');
            const permission = range?.getRangePermission();

            if (!permission) {
                throw new Error('Permission is null');
            }

            // Try to unprotect when not protected
            // Should not throw error
            await expect(permission.unprotect()).resolves.not.toThrow();
        });

        it('should throw error when protecting already protected range', async () => {
            const worksheet = univerAPI.getActiveWorkbook()?.getActiveSheet();
            const range = worksheet?.getRange('A1:B2');
            const permission = range?.getRangePermission();

            if (!permission) {
                throw new Error('Permission is null');
            }

            // Protect the range first
            await permission.protect({ name: 'Test Protection' });

            // Try to protect again, should throw error
            await expect(permission.protect({ name: 'Test 2' })).rejects.toThrow('Range is already protected');
        });
    });

    describe('Subscribe Method', () => {
        it('should subscribe to permission changes and return unsubscribe function', () => {
            const worksheet = univerAPI.getActiveWorkbook()?.getActiveSheet();
            const range = worksheet?.getRange('A1:B2');
            const permission = range?.getRangePermission();

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
    });

    describe('Edge Cases', () => {
        it('should handle checking permission point when range not protected', () => {
            const worksheet = univerAPI.getActiveWorkbook()?.getActiveSheet();
            const range = worksheet?.getRange('Z100:Z100');
            const permission = range?.getRangePermission();

            if (!permission) {
                throw new Error('Permission is null');
            }

            // When not protected, should have permission by default
            const canEdit = permission.getPoint(RangePermissionPoint.Edit);
            expect(canEdit).toBe(true);
        });

        it('should handle invalid permission point gracefully', () => {
            const worksheet = univerAPI.getActiveWorkbook()?.getActiveSheet();
            const range = worksheet?.getRange('A1:B2');
            const permission = range?.getRangePermission();

            if (!permission) {
                throw new Error('Permission is null');
            }

            // Test with a non-existent point (should log warning and return false)
            const result = permission.getPoint('NonExistentPoint' as RangePermissionPoint);
            expect(typeof result).toBe('boolean');
        });

        it('should emit permission updates when permission service updates', async () => {
            const worksheet = univerAPI.getActiveWorkbook()?.getActiveSheet();
            const range = worksheet?.getRange('A1:B2');
            const permission = range?.getRangePermission();

            if (!permission) {
                throw new Error('Permission is null');
            }

            let updateReceived = false;
            const subscription = permission.permission$.subscribe((snapshot) => {
                if (snapshot) {
                    updateReceived = true;
                }
            });

            // Protect the range which should trigger permission update
            await permission.protect({ name: 'Test Protection' });

            // Wait a bit for the update to propagate
            await new Promise((resolve) => setTimeout(resolve, 50));

            expect(updateReceived).toBe(true);
            subscription.unsubscribe();

            // Cleanup
            await permission.unprotect();
        });
    });
});

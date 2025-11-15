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
import type { IRangeProtectionRule } from '../permission-types';
import { ICommandService } from '@univerjs/core';
import {
    AddRangeProtectionMutation,
    DeleteRangeProtectionMutation,
    SetRangeProtectionMutation,
} from '@univerjs/sheets';
import { beforeEach, describe, expect, it } from 'vitest';
import { createFacadeTestBed } from '../../__tests__/create-test-bed';
import { WorksheetPermissionPoint } from '../permission-types';

describe('Test FWorksheetPermission', () => {
    let get: Injector['get'];
    let univerAPI: FUniver;
    let commandService: ICommandService;

    beforeEach(() => {
        const testBed = createFacadeTestBed();
        get = testBed.get;
        univerAPI = testBed.univerAPI;
        commandService = get(ICommandService);

        // Register commands
        commandService.registerCommand(AddRangeProtectionMutation);
        commandService.registerCommand(SetRangeProtectionMutation);
        commandService.registerCommand(DeleteRangeProtectionMutation);
    });

    describe('Basic Operations', () => {
        it('should get worksheet permission instance', () => {
            const worksheet = univerAPI.getActiveWorkbook()?.getActiveSheet();
            const permission = worksheet?.getWorksheetPermission();

            expect(permission).toBeDefined();
            expect(permission?.getSnapshot).toBeDefined();
        });

        it('should set and get permission points', async () => {
            const worksheet = univerAPI.getActiveWorkbook()?.getActiveSheet();
            const permission = worksheet?.getWorksheetPermission();

            if (!permission || !worksheet) {
                throw new Error('Permission or worksheet is null');
            }

            // Set Edit permission to false
            await permission.setPoint(WorksheetPermissionPoint.Edit, false);

            let canEdit = permission.getPoint(WorksheetPermissionPoint.Edit);
            expect(canEdit).toBe(false);

            // Set Edit permission to true
            await permission.setPoint(WorksheetPermissionPoint.Edit, true);
            canEdit = permission.getPoint(WorksheetPermissionPoint.Edit);
            expect(canEdit).toBe(true);
        });

        it('should get complete permission snapshot', () => {
            const worksheet = univerAPI.getActiveWorkbook()?.getActiveSheet();
            const permission = worksheet?.getWorksheetPermission();

            if (!permission) {
                throw new Error('Permission is null');
            }

            const snapshot = permission.getSnapshot();

            expect(snapshot).toBeDefined();
            expect(snapshot[WorksheetPermissionPoint.Edit]).toBeDefined();
            expect(snapshot[WorksheetPermissionPoint.View]).toBeDefined();
        });

        it('should check if worksheet is editable', async () => {
            const worksheet = univerAPI.getActiveWorkbook()?.getActiveSheet();
            const permission = worksheet?.getWorksheetPermission();

            if (!permission) {
                throw new Error('Permission is null');
            }

            // Default should be editable
            expect(permission.canEdit()).toBe(true);

            // Set to read-only
            await permission.setMode('readOnly');
            expect(permission.canEdit()).toBe(false);

            // Set back to editable
            await permission.setMode('editable');
            expect(permission.canEdit()).toBe(true);
        });
    });

    describe('Mode Operations', () => {
        it('should set readOnly mode', async () => {
            const worksheet = univerAPI.getActiveWorkbook()?.getActiveSheet();
            const permission = worksheet?.getWorksheetPermission();

            if (!permission) {
                throw new Error('Permission is null');
            }

            await permission.setMode('readOnly');

            const snapshot = permission.getSnapshot();
            expect(snapshot[WorksheetPermissionPoint.Edit]).toBe(false);
            expect(snapshot[WorksheetPermissionPoint.View]).toBe(true);
        });

        it('should set editable mode', async () => {
            const worksheet = univerAPI.getActiveWorkbook()?.getActiveSheet();
            const permission = worksheet?.getWorksheetPermission();

            if (!permission) {
                throw new Error('Permission is null');
            }

            await permission.setMode('editable');

            const snapshot = permission.getSnapshot();
            expect(snapshot[WorksheetPermissionPoint.Edit]).toBe(true);
            expect(snapshot[WorksheetPermissionPoint.View]).toBe(true);
        });

        it('should set filterOnly mode', async () => {
            const worksheet = univerAPI.getActiveWorkbook()?.getActiveSheet();
            const permission = worksheet?.getWorksheetPermission();

            if (!permission) {
                throw new Error('Permission is null');
            }

            await permission.setMode('filterOnly');

            const snapshot = permission.getSnapshot();
            expect(snapshot[WorksheetPermissionPoint.Edit]).toBe(false);
            expect(snapshot[WorksheetPermissionPoint.Filter]).toBe(true);
        });
    });

    describe('Shortcut Methods', () => {
        it('should set read-only using setReadOnly()', async () => {
            const worksheet = univerAPI.getActiveWorkbook()?.getActiveSheet();
            const permission = worksheet?.getWorksheetPermission();

            if (!permission) {
                throw new Error('Permission is null');
            }

            await permission.setReadOnly();

            expect(permission.canEdit()).toBe(false);
        });

        it('should set editable using setEditable()', async () => {
            const worksheet = univerAPI.getActiveWorkbook()?.getActiveSheet();
            const permission = worksheet?.getWorksheetPermission();

            if (!permission) {
                throw new Error('Permission is null');
            }

            await permission.setEditable();

            expect(permission.canEdit()).toBe(true);
        });
    });

    describe('Cell-Level Permission Checks', () => {
        it('should check if cell can be edited', () => {
            const worksheet = univerAPI.getActiveWorkbook()?.getActiveSheet();
            const permission = worksheet?.getWorksheetPermission();

            if (!permission) {
                throw new Error('Permission is null');
            }

            // Default should allow editing
            const canEdit = permission.canEditCell(0, 0);
            expect(canEdit).toBeDefined();
        });

        it('should check if cell can be viewed', () => {
            const worksheet = univerAPI.getActiveWorkbook()?.getActiveSheet();
            const permission = worksheet?.getWorksheetPermission();

            if (!permission) {
                throw new Error('Permission is null');
            }

            // Default should allow viewing
            const canView = permission.canViewCell(0, 0);
            expect(canView).toBeDefined();
        });
    });

    describe('Range Protection', () => {
        it('should protect ranges', async () => {
            const worksheet = univerAPI.getActiveWorkbook()?.getActiveSheet();
            const permission = worksheet?.getWorksheetPermission();

            if (!permission || !worksheet) {
                throw new Error('Permission or worksheet is null');
            }

            const range = worksheet.getRange('A1:B2');

            const rules = await permission.protectRanges([
                {
                    ranges: [range],
                    options: {
                        name: 'Protected Area',
                        allowEdit: false,
                    },
                },
            ]);

            expect(rules).toBeDefined();
            expect(rules.length).toBe(1);
            expect(rules[0].options.name).toBe('Protected Area');
        });

        it('should protect multiple ranges in batch', async () => {
            const worksheet = univerAPI.getActiveWorkbook()?.getActiveSheet();
            const permission = worksheet?.getWorksheetPermission();

            if (!permission || !worksheet) {
                throw new Error('Permission or worksheet is null');
            }

            const range1 = worksheet.getRange('A1:A10');
            const range2 = worksheet.getRange('B1:B10');
            const range3 = worksheet.getRange('C1:C10');

            const rules = await permission.protectRanges([
                { ranges: [range1], options: { name: 'Rule 1' } },
                { ranges: [range2], options: { name: 'Rule 2' } },
                { ranges: [range3], options: { name: 'Rule 3' } },
            ]);

            expect(rules.length).toBe(3);
            expect(rules[0].options.name).toBe('Rule 1');
            expect(rules[1].options.name).toBe('Rule 2');
            expect(rules[2].options.name).toBe('Rule 3');
        });

        it('should unprotect rules', async () => {
            const worksheet = univerAPI.getActiveWorkbook()?.getActiveSheet();
            const permission = worksheet?.getWorksheetPermission();

            if (!permission || !worksheet) {
                throw new Error('Permission or worksheet is null');
            }

            const range = worksheet.getRange('A1:B2');

            // Create protection rule
            const rules = await permission.protectRanges([
                {
                    ranges: [range],
                    options: { name: 'To be removed' },
                },
            ]);

            expect(rules.length).toBe(1);

            // Remove the rule
            await permission.unprotectRules([rules[0].id]);

            // Verify rule is removed
            const allRules = await permission.listRangeProtectionRules();
            const removedRule = allRules.find((r) => r.id === rules[0].id);
            expect(removedRule).toBeUndefined();
        });

        it('should list all range protection rules', async () => {
            const worksheet = univerAPI.getActiveWorkbook()?.getActiveSheet();
            const permission = worksheet?.getWorksheetPermission();

            if (!permission || !worksheet) {
                throw new Error('Permission or worksheet is null');
            }

            const range1 = worksheet.getRange('A1:A10');
            const range2 = worksheet.getRange('B1:B10');

            await permission.protectRanges([
                { ranges: [range1], options: { name: 'Rule A' } },
                { ranges: [range2], options: { name: 'Rule B' } },
            ]);

            const allRules = await permission.listRangeProtectionRules();

            expect(allRules.length).toBeGreaterThanOrEqual(2);
            const ruleNames = allRules.map((r) => r.options.name);
            expect(ruleNames).toContain('Rule A');
            expect(ruleNames).toContain('Rule B');
        });

        it('should return correct ranges for protection rules', async () => {
            const worksheet = univerAPI.getActiveWorkbook()?.getActiveSheet();
            const permission = worksheet?.getWorksheetPermission();

            if (!permission || !worksheet) {
                throw new Error('Permission or worksheet is null');
            }

            const range1 = worksheet.getRange('C1:C5');
            const range2 = worksheet.getRange('D10:F15');

            await permission.protectRanges([
                { ranges: [range1], options: { name: 'Range Test 1' } },
                { ranges: [range2], options: { name: 'Range Test 2' } },
            ]);

            const allRules = await permission.listRangeProtectionRules();

            // Find our test rules
            const rule1 = allRules.find((r) => r.options.name === 'Range Test 1');
            const rule2 = allRules.find((r) => r.options.name === 'Range Test 2');

            expect(rule1).toBeDefined();
            expect(rule2).toBeDefined();

            // Verify rule1 has correct ranges
            if (rule1) {
                expect(rule1.ranges.length).toBe(1);
                const actualRange1 = rule1.ranges[0];
                expect(actualRange1.getA1Notation()).toBe('C1:C5');
            }

            // Verify rule2 has correct ranges
            if (rule2) {
                expect(rule2.ranges.length).toBe(1);
                const actualRange2 = rule2.ranges[0];
                expect(actualRange2.getA1Notation()).toBe('D10:F15');
            }
        });
    });

    describe('Debug Utilities', () => {
        it('should debug cell permission', async () => {
            const worksheet = univerAPI.getActiveWorkbook()?.getActiveSheet();
            const permission = worksheet?.getWorksheetPermission();

            if (!permission || !worksheet) {
                throw new Error('Permission or worksheet is null');
            }

            const range = worksheet.getRange('A1:B2');

            // Create protection rule
            await permission.protectRanges([
                {
                    ranges: [range],
                    options: { name: 'Debug Test' },
                },
            ]);

            // Debug cell A1 (should hit the rule)
            const debugInfo = permission.debugCellPermission(0, 0);

            expect(debugInfo).toBeDefined();
            if (debugInfo) {
                expect(debugInfo.row).toBe(0);
                expect(debugInfo.col).toBe(0);
                expect(debugInfo.hitRules.length).toBeGreaterThan(0);
            }
        });

        it('should return undefined for unprotected cell', () => {
            const worksheet = univerAPI.getActiveWorkbook()?.getActiveSheet();
            const permission = worksheet?.getWorksheetPermission();

            if (!permission) {
                throw new Error('Permission is null');
            }

            // Debug cell far away (Z99)
            const debugInfo = permission.debugCellPermission(98, 25);

            // Should be undefined or empty if no rules hit this cell
            if (debugInfo) {
                expect(debugInfo.hitRules.length).toBe(0);
            }
        });
    });

    describe('Reactive Streams', () => {
        it('should emit current permission snapshot on subscribe', () => {
            const worksheet = univerAPI.getActiveWorkbook()?.getActiveSheet();
            const permission = worksheet?.getWorksheetPermission();

            if (!permission) {
                throw new Error('Permission is null');
            }

            let snapshotReceived = false;
            const subscription = permission.permission$.subscribe((snapshot) => {
                expect(snapshot).toBeDefined();
                expect(snapshot[WorksheetPermissionPoint.Edit]).toBeDefined();
                snapshotReceived = true;
            });

            expect(snapshotReceived).toBe(true);
            subscription.unsubscribe();
        });

        it('should emit range protection changes', async () => {
            const worksheet = univerAPI.getActiveWorkbook()?.getActiveSheet();
            const permission = worksheet?.getWorksheetPermission();

            if (!permission || !worksheet) {
                throw new Error('Permission or worksheet is null');
            }

            const changes: Array<{ type: 'add' | 'update' | 'delete'; rules: IRangeProtectionRule[] }> = [];
            const subscription = permission.rangeProtectionChange$.subscribe((change) => {
                changes.push(change);
            });

            const range = worksheet.getRange('A1:A10');
            await permission.protectRanges([
                { ranges: [range], options: { name: 'Test Rule' } },
            ]);

            // Should have emitted change
            expect(changes.length).toBeGreaterThan(0);

            subscription.unsubscribe();
        });

        it('should emit current rules list on subscribe', async () => {
            const worksheet = univerAPI.getActiveWorkbook()?.getActiveSheet();
            const permission = worksheet?.getWorksheetPermission();

            if (!permission || !worksheet) {
                throw new Error('Permission or worksheet is null');
            }

            const range = worksheet.getRange('A1:A10');
            await permission.protectRanges([
                { ranges: [range], options: { name: 'Existing Rule' } },
            ]);

            let rulesReceived = false;
            const subscription = permission.rangeProtectionRules$.subscribe((rules) => {
                expect(rules).toBeDefined();
                expect(Array.isArray(rules)).toBe(true);
                rulesReceived = true;
            });

            expect(rulesReceived).toBe(true);
            subscription.unsubscribe();
        });
    });

    describe('applyConfig', () => {
        it('should apply mode configuration', async () => {
            const worksheet = univerAPI.getActiveWorkbook()?.getActiveSheet();
            const permission = worksheet?.getWorksheetPermission();

            if (!permission) {
                throw new Error('Permission is null');
            }

            await permission.applyConfig({
                mode: 'readOnly',
            });

            expect(permission.getPoint(WorksheetPermissionPoint.View)).toBe(true);
            expect(permission.getPoint(WorksheetPermissionPoint.Edit)).toBe(false);
        });

        it('should apply permission points configuration', async () => {
            const worksheet = univerAPI.getActiveWorkbook()?.getActiveSheet();
            const permission = worksheet?.getWorksheetPermission();

            if (!permission) {
                throw new Error('Permission is null');
            }

            await permission.applyConfig({
                points: {
                    [WorksheetPermissionPoint.Edit]: false,
                    [WorksheetPermissionPoint.Sort]: true,
                },
            });

            expect(permission.getPoint(WorksheetPermissionPoint.Edit)).toBe(false);
            expect(permission.getPoint(WorksheetPermissionPoint.Sort)).toBe(true);
        });

        it('should apply range protections configuration', async () => {
            const worksheet = univerAPI.getActiveWorkbook()?.getActiveSheet();
            const permission = worksheet?.getWorksheetPermission();

            if (!permission || !worksheet) {
                throw new Error('Permission or worksheet is null');
            }

            await permission.applyConfig({
                rangeProtections: [
                    {
                        rangeRefs: ['A1:A5'],
                        options: { name: 'Protected A' },
                    },
                    {
                        rangeRefs: ['B1:B5', 'C1:C5'],
                        options: { name: 'Protected B&C', allowEdit: true },
                    },
                ],
            });

            const rules = await permission.listRangeProtectionRules();
            expect(rules.length).toBe(2);

            const ruleA = rules.find((r) => r.options.name === 'Protected A');
            const ruleBC = rules.find((r) => r.options.name === 'Protected B&C');

            expect(ruleA).toBeDefined();
            expect(ruleA?.ranges.length).toBe(1);
            expect(ruleA?.ranges[0].getA1Notation()).toBe('A1:A5');

            expect(ruleBC).toBeDefined();
            expect(ruleBC?.ranges.length).toBe(2);
            expect(ruleBC?.ranges[0].getA1Notation()).toBe('B1:B5');
            expect(ruleBC?.ranges[1].getA1Notation()).toBe('C1:C5');
        });

        it('should apply complete configuration with all fields', async () => {
            const worksheet = univerAPI.getActiveWorkbook()?.getActiveSheet();
            const permission = worksheet?.getWorksheetPermission();

            if (!permission || !worksheet) {
                throw new Error('Permission or worksheet is null');
            }

            await permission.applyConfig({
                mode: 'editable',
                points: {
                    [WorksheetPermissionPoint.InsertRow]: false,
                },
                rangeProtections: [
                    {
                        rangeRefs: ['D1:D10'],
                        options: { name: 'Formula Column' },
                    },
                ],
            });

            // Check mode applied
            expect(permission.getPoint(WorksheetPermissionPoint.Edit)).toBe(true);

            // Check points override
            expect(permission.getPoint(WorksheetPermissionPoint.InsertRow)).toBe(false);

            // Check range protection
            const rules = await permission.listRangeProtectionRules();
            const formulaRule = rules.find((r) => r.options.name === 'Formula Column');
            expect(formulaRule).toBeDefined();
            expect(formulaRule?.ranges[0].getA1Notation()).toBe('D1:D10');
        });
    });

    describe('Additional Coverage Tests', () => {
        it('should throw error when protectRanges is called with empty configs', async () => {
            const worksheet = univerAPI.getActiveWorkbook()?.getActiveSheet();
            const permission = worksheet?.getWorksheetPermission();

            if (!permission) {
                throw new Error('Permission is null');
            }

            // Try to protect with empty configs
            await expect(permission.protectRanges([])).rejects.toThrow('Configs cannot be empty');
        });

        it('should handle subscribe method and return unsubscribe function', () => {
            const worksheet = univerAPI.getActiveWorkbook()?.getActiveSheet();
            const permission = worksheet?.getWorksheetPermission();

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
            const worksheet = univerAPI.getActiveWorkbook()?.getActiveSheet();
            const permission = worksheet?.getWorksheetPermission();

            if (!permission) {
                throw new Error('Permission is null');
            }

            const snapshot = permission.getSnapshot();
            expect(snapshot).toBeDefined();
            expect(typeof snapshot[WorksheetPermissionPoint.View]).toBe('boolean');
        });

        it('should handle multiple setPoint calls with same value', async () => {
            const worksheet = univerAPI.getActiveWorkbook()?.getActiveSheet();
            const permission = worksheet?.getWorksheetPermission();

            if (!permission) {
                throw new Error('Permission is null');
            }

            // Get current value
            const currentValue = permission.getPoint(WorksheetPermissionPoint.Edit);

            // Set same value again, should not cause error
            await expect(permission.setPoint(WorksheetPermissionPoint.Edit, currentValue)).resolves.not.toThrow();
        });

        it('should throw error for invalid worksheet permission point in setPoint', async () => {
            const worksheet = univerAPI.getActiveWorkbook()?.getActiveSheet();
            const permission = worksheet?.getWorksheetPermission();

            if (!permission) {
                throw new Error('Permission is null');
            }

            // Try to set invalid point
            await expect(permission.setPoint('InvalidPoint' as WorksheetPermissionPoint, true)).rejects.toThrow();
        });

        it('should throw error for invalid worksheet permission point in getPoint', () => {
            const worksheet = univerAPI.getActiveWorkbook()?.getActiveSheet();
            const permission = worksheet?.getWorksheetPermission();

            if (!permission) {
                throw new Error('Permission is null');
            }

            // Try to get invalid point
            expect(() => permission.getPoint('InvalidPoint' as WorksheetPermissionPoint)).toThrow();
        });

        it('should handle unprotectRules with empty array', async () => {
            const worksheet = univerAPI.getActiveWorkbook()?.getActiveSheet();
            const permission = worksheet?.getWorksheetPermission();

            if (!permission) {
                throw new Error('Permission is null');
            }

            // Should not throw when called with empty array
            await expect(permission.unprotectRules([])).resolves.not.toThrow();
        });

        it('should handle dispose method', () => {
            const worksheet = univerAPI.getActiveWorkbook()?.getActiveSheet();
            const permission = worksheet?.getWorksheetPermission();

            if (!permission) {
                throw new Error('Permission is null');
            }

            // Dispose should not throw
            expect(() => permission.dispose()).not.toThrow();
        });
    });
});

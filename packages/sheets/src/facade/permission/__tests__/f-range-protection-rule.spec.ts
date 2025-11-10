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

describe('Test FRangeProtectionRule', () => {
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
        it('should create and access rule properties', async () => {
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
                        name: 'Test Rule',
                        allowEdit: false,
                        metadata: { description: 'Test Description' },
                    },
                },
            ]);

            const rule = rules[0];

            // Access properties
            expect(rule.id).toBeDefined();
            expect(typeof rule.id).toBe('string');
            expect(rule.ranges).toBeDefined();
            expect(rule.ranges.length).toBe(1);
            expect(rule.options).toBeDefined();
            expect(rule.options.name).toBe('Test Rule');
            expect(rule.options.allowEdit).toBe(false);
            expect(rule.options.metadata?.description).toBe('Test Description');
        });
    });

    describe('Update Ranges', () => {
        it('should update protection ranges', async () => {
            const worksheet = univerAPI.getActiveWorkbook()?.getActiveSheet();
            const permission = worksheet?.getWorksheetPermission();

            if (!permission || !worksheet) {
                throw new Error('Permission or worksheet is null');
            }

            const initialRange = worksheet.getRange('A1:B2');

            const rules = await permission.protectRanges([
                {
                    ranges: [initialRange],
                    options: { name: 'To be updated' },
                },
            ]);

            const rule = rules[0];

            // Update to new range
            const newRange = worksheet.getRange('C3:D4');
            await rule.updateRanges([newRange]);

            // Verify update
            expect(rule.ranges.length).toBe(1);
            const updatedRange = rule.ranges[0].getRange();
            expect(updatedRange.startRow).toBe(2); // C3 is row 2 (0-indexed)
            expect(updatedRange.startColumn).toBe(2); // C3 is col 2 (0-indexed)
        });

        it('should update to multiple ranges', async () => {
            const worksheet = univerAPI.getActiveWorkbook()?.getActiveSheet();
            const permission = worksheet?.getWorksheetPermission();

            if (!permission || !worksheet) {
                throw new Error('Permission or worksheet is null');
            }

            const initialRange = worksheet.getRange('A1:A10');

            const rules = await permission.protectRanges([
                {
                    ranges: [initialRange],
                    options: { name: 'Multi-range' },
                },
            ]);

            const rule = rules[0];

            // Update to multiple ranges
            const range1 = worksheet.getRange('B1:B10');
            const range2 = worksheet.getRange('C1:C10');
            const range3 = worksheet.getRange('D1:D10');

            await rule.updateRanges([range1, range2, range3]);

            // Verify update
            expect(rule.ranges.length).toBe(3);
        });

        it('should throw error for overlapping ranges', async () => {
            const worksheet = univerAPI.getActiveWorkbook()?.getActiveSheet();
            const permission = worksheet?.getWorksheetPermission();

            if (!permission || !worksheet) {
                throw new Error('Permission or worksheet is null');
            }

            // Create first rule
            const range1 = worksheet.getRange('A1:C3');
            await permission.protectRanges([
                {
                    ranges: [range1],
                    options: { name: 'Existing Rule' },
                },
            ]);

            // Create second rule
            const range2 = worksheet.getRange('D1:E2');
            const rules = await permission.protectRanges([
                {
                    ranges: [range2],
                    options: { name: 'New Rule' },
                },
            ]);

            const rule = rules[0];

            // Try to update to overlapping range
            const overlappingRange = worksheet.getRange('B2:D4'); // Overlaps with A1:C3

            await expect(rule.updateRanges([overlappingRange])).rejects.toThrow();
        });
    });

    describe('Update Options', () => {
        it('should update rule name', async () => {
            const worksheet = univerAPI.getActiveWorkbook()?.getActiveSheet();
            const permission = worksheet?.getWorksheetPermission();

            if (!permission || !worksheet) {
                throw new Error('Permission or worksheet is null');
            }

            const range = worksheet.getRange('A1:B2');

            const rules = await permission.protectRanges([
                {
                    ranges: [range],
                    options: { name: 'Original Name' },
                },
            ]);

            const rule = rules[0];

            // Update name
            await rule.updateOptions({ name: 'Updated Name' });

            // Verify update
            expect(rule.options.name).toBe('Updated Name');
        });

        it('should update allowEdit flag', async () => {
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
                        name: 'Test',
                        allowEdit: false,
                    },
                },
            ]);

            const rule = rules[0];

            // Update allowEdit
            await rule.updateOptions({ allowEdit: true });

            // Verify update
            expect(rule.options.allowEdit).toBe(true);
        });

        it('should update allowed users', async () => {
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
                        name: 'Test',
                        allowedUsers: ['user1'],
                    },
                },
            ]);

            const rule = rules[0];

            // Update allowed users
            await rule.updateOptions({ allowedUsers: ['user2', 'user3'] });

            // Verify update
            expect(rule.options.allowedUsers).toEqual(['user2', 'user3']);
        });

        it('should update description in metadata', async () => {
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
                        name: 'Test',
                        metadata: { description: 'Old description' },
                    },
                },
            ]);

            const rule = rules[0];

            // Update metadata with new description
            await rule.updateOptions({
                metadata: { description: 'New description' },
            });

            // Verify update
            expect(rule.options.metadata?.description).toBe('New description');
        });

        it('should update metadata', async () => {
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
                        name: 'Test',
                        metadata: { key1: 'value1' },
                    },
                },
            ]);

            const rule = rules[0];

            // Update metadata
            await rule.updateOptions({
                metadata: {
                    key1: 'updated',
                    key2: 'new',
                },
            });

            // Verify update
            expect(rule.options.metadata).toEqual({
                key1: 'updated',
                key2: 'new',
            });
        });

        it('should partially update options', async () => {
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
                        name: 'Original',
                        allowEdit: false,
                        metadata: { description: 'Original description' },
                    },
                },
            ]);

            const rule = rules[0];

            // Update only name, other options should remain
            await rule.updateOptions({ name: 'Updated' });

            // Verify partial update
            expect(rule.options.name).toBe('Updated');
            expect(rule.options.allowEdit).toBe(false);
            expect(rule.options.metadata?.description).toBe('Original description');
        });
    });

    describe('Remove Rule', () => {
        it('should remove protection rule', async () => {
            const worksheet = univerAPI.getActiveWorkbook()?.getActiveSheet();
            const permission = worksheet?.getWorksheetPermission();

            if (!permission || !worksheet) {
                throw new Error('Permission or worksheet is null');
            }

            const range = worksheet.getRange('A1:B2');

            const rules = await permission.protectRanges([
                {
                    ranges: [range],
                    options: { name: 'To be removed' },
                },
            ]);

            const rule = rules[0];
            const ruleId = rule.id;

            const workbook = univerAPI.getActiveWorkbook();
            const unitId = workbook?.getId() ?? '';
            const subUnitId = worksheet.getSheetId();

            // Verify rule exists
            let existingRule = rangeProtectionRuleModel.getRule(unitId, subUnitId, ruleId);
            expect(existingRule).toBeDefined();

            // Remove the rule
            await rule.remove();

            // Verify rule is removed
            existingRule = rangeProtectionRuleModel.getRule(unitId, subUnitId, ruleId);
            expect(existingRule).toBeUndefined();
        });

        it('should handle removing already removed rule', async () => {
            const worksheet = univerAPI.getActiveWorkbook()?.getActiveSheet();
            const permission = worksheet?.getWorksheetPermission();

            if (!permission || !worksheet) {
                throw new Error('Permission or worksheet is null');
            }

            const range = worksheet.getRange('A1:B2');

            const rules = await permission.protectRanges([
                {
                    ranges: [range],
                    options: { name: 'Test' },
                },
            ]);

            const rule = rules[0];

            // Remove once
            await rule.remove();

            // Try to remove again (should not throw)
            await expect(rule.remove()).resolves.not.toThrow();
        });
    });

    describe('Complex Scenarios', () => {
        it('should handle multiple updates in sequence', async () => {
            const worksheet = univerAPI.getActiveWorkbook()?.getActiveSheet();
            const permission = worksheet?.getWorksheetPermission();

            if (!permission || !worksheet) {
                throw new Error('Permission or worksheet is null');
            }

            const initialRange = worksheet.getRange('A1:A10');

            const rules = await permission.protectRanges([
                {
                    ranges: [initialRange],
                    options: {
                        name: 'Initial',
                        allowEdit: false,
                    },
                },
            ]);

            const rule = rules[0];

            // Update 1: Change name
            await rule.updateOptions({ name: 'Step 1' });
            expect(rule.options.name).toBe('Step 1');

            // Update 2: Change range
            const newRange = worksheet.getRange('B1:B10');
            await rule.updateRanges([newRange]);
            const updatedRange1 = rule.ranges[0].getRange();
            expect(updatedRange1.startColumn).toBe(1);

            // Update 3: Change allowEdit
            await rule.updateOptions({ allowEdit: true });
            expect(rule.options.allowEdit).toBe(true);

            // All properties should be updated correctly
            expect(rule.options.name).toBe('Step 1');
            expect(rule.options.allowEdit).toBe(true);
            const finalRange = rule.ranges[0].getRange();
            expect(finalRange.startColumn).toBe(1);
        });

        it('should update options and ranges independently', async () => {
            const worksheet = univerAPI.getActiveWorkbook()?.getActiveSheet();
            const permission = worksheet?.getWorksheetPermission();

            if (!permission || !worksheet) {
                throw new Error('Permission or worksheet is null');
            }

            const range1 = worksheet.getRange('A1:A10');

            const rules = await permission.protectRanges([
                {
                    ranges: [range1],
                    options: { name: 'Test', allowEdit: false },
                },
            ]);

            const rule = rules[0];

            // Update range
            const range2 = worksheet.getRange('B1:B10');
            await rule.updateRanges([range2]);

            // Options should remain unchanged
            expect(rule.options.name).toBe('Test');
            expect(rule.options.allowEdit).toBe(false);

            // Update options
            await rule.updateOptions({ name: 'Updated', allowEdit: true });

            // Ranges should remain unchanged
            const unchangedRange = rule.ranges[0].getRange();
            expect(unchangedRange.startColumn).toBe(1); // Still column B
        });
    });
});

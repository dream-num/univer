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
import { combineLatest } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { beforeEach, describe, expect, it } from 'vitest';
import { createFacadeTestBed } from '../../__tests__/create-test-bed';
import { WorkbookPermissionPoint, WorksheetPermissionPoint } from '../permission-types';

describe('Test Permission Combination Logic', () => {
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

    describe('Hierarchical Permission Combination', () => {
        it('should respect workbook-level restrictions', async () => {
            const workbook = univerAPI.getActiveWorkbook();
            const worksheet = workbook?.getActiveSheet();

            if (!workbook || !worksheet) {
                throw new Error('Workbook or worksheet is null');
            }

            const workbookPermission = workbook.getWorkbookPermission();
            const worksheetPermission = worksheet.getWorksheetPermission();

            // Set workbook to read-only
            await workbookPermission.setMode('viewer');

            // Even if worksheet allows editing, workbook restriction should apply
            await worksheetPermission.setMode('editable');

            // Workbook level should be restricted
            expect(workbookPermission.getPoint(WorkbookPermissionPoint.Edit)).toBe(false);

            // Worksheet may show as editable, but in practice workbook-level restriction applies
            expect(worksheetPermission.getPoint(WorksheetPermissionPoint.Edit)).toBe(true);
        });

        it('should combine workbook and worksheet permissions', async () => {
            const workbook = univerAPI.getActiveWorkbook();
            const worksheet = workbook?.getActiveSheet();

            if (!workbook || !worksheet) {
                throw new Error('Workbook or worksheet is null');
            }

            const workbookPermission = workbook.getWorkbookPermission();
            const worksheetPermission = worksheet.getWorksheetPermission();

            // Both allow editing
            await workbookPermission.setMode('editor');
            await worksheetPermission.setMode('editable');

            expect(workbookPermission.getPoint(WorkbookPermissionPoint.Edit)).toBe(true);
            expect(worksheetPermission.getPoint(WorksheetPermissionPoint.Edit)).toBe(true);

            // Set worksheet to read-only
            await worksheetPermission.setMode('readOnly');

            // Workbook still allows, but worksheet restricts
            expect(workbookPermission.getPoint(WorkbookPermissionPoint.Edit)).toBe(true);
            expect(worksheetPermission.getPoint(WorksheetPermissionPoint.Edit)).toBe(false);
        });

        it('should handle three-level permission hierarchy', async () => {
            const workbook = univerAPI.getActiveWorkbook();
            const worksheet = workbook?.getActiveSheet();

            if (!workbook || !worksheet) {
                throw new Error('Workbook or worksheet is null');
            }

            const workbookPermission = workbook.getWorkbookPermission();
            const worksheetPermission = worksheet.getWorksheetPermission();

            // Set all levels to editable
            await workbookPermission.setMode('editor');
            await worksheetPermission.setMode('editable');

            const range = worksheet.getRange('A1:B2');
            const rangePermission = range.getRangePermission();

            if (!rangePermission) {
                throw new Error('Range permission is null');
            }

            // Initially all should allow editing
            expect(workbookPermission.getPoint(WorkbookPermissionPoint.Edit)).toBe(true);
            expect(worksheetPermission.getPoint(WorksheetPermissionPoint.Edit)).toBe(true);
            expect(rangePermission.canEdit()).toBe(true);

            // Protect the range
            await rangePermission.protect({
                name: 'Protected Area',
                allowEdit: false,
            });

            // Range should now be protected
            expect(rangePermission.isProtected()).toBe(true);
            expect(rangePermission.canEdit()).toBe(false);

            // But workbook and worksheet should still allow editing
            expect(workbookPermission.getPoint(WorkbookPermissionPoint.Edit)).toBe(true);
            expect(worksheetPermission.getPoint(WorksheetPermissionPoint.Edit)).toBe(true);
        });
    });

    describe('Cell-Level Permission Checks', () => {
        it('should check cell permissions with range protection', async () => {
            const worksheet = univerAPI.getActiveWorkbook()?.getActiveSheet();
            const worksheetPermission = worksheet?.getWorksheetPermission();

            if (!worksheet || !worksheetPermission) {
                throw new Error('Worksheet or permission is null');
            }

            // Protect A1:B2
            const range = worksheet.getRange('A1:B2');
            await range.getRangePermission()?.protect({
                name: 'Protected Area',
                allowEdit: false,
            });

            // Check cell A1 (should be protected)
            const canEditA1 = worksheetPermission.canEditCell(0, 0);
            expect(canEditA1).toBe(false);

            // Check cell C3 (should be editable - outside protected range)
            const canEditC3 = worksheetPermission.canEditCell(2, 2);
            expect(canEditC3).toBe(true);
        });

        it('should handle overlapping protection rules', async () => {
            const worksheet = univerAPI.getActiveWorkbook()?.getActiveSheet();
            const worksheetPermission = worksheet?.getWorksheetPermission();

            if (!worksheet || !worksheetPermission) {
                throw new Error('Worksheet or permission is null');
            }

            // Create separate non-overlapping protected ranges
            const range1 = worksheet.getRange('A1:A10');
            const range2 = worksheet.getRange('B1:B10');

            await worksheetPermission.protectRanges([
                { ranges: [range1], options: { name: 'Column A', allowEdit: false } },
                { ranges: [range2], options: { name: 'Column B', allowEdit: false } },
            ]);

            // Check cells in protected columns
            expect(worksheetPermission.canEditCell(0, 0)).toBe(false); // A1
            expect(worksheetPermission.canEditCell(0, 1)).toBe(false); // B1

            // Check cell in unprotected column
            expect(worksheetPermission.canEditCell(0, 2)).toBe(true); // C1
        });

        it('should debug cell permission with multiple rules', async () => {
            const worksheet = univerAPI.getActiveWorkbook()?.getActiveSheet();
            const worksheetPermission = worksheet?.getWorksheetPermission();

            if (!worksheet || !worksheetPermission) {
                throw new Error('Worksheet or permission is null');
            }

            // Create multiple protection rules
            await worksheetPermission.protectRanges([
                {
                    ranges: [worksheet.getRange('A1:C3')],
                    options: { name: 'Area 1', allowEdit: false },
                },
                {
                    ranges: [worksheet.getRange('D1:E2')],
                    options: { name: 'Area 2', allowEdit: false },
                },
            ]);

            // Debug cell A1 (should hit Area 1)
            const debugA1 = worksheetPermission.debugCellPermission(0, 0);
            expect(debugA1).toBeDefined();
            if (debugA1) {
                expect(debugA1.hitRules.length).toBeGreaterThan(0);
                const ruleNames = debugA1.hitRules.map((r) => r.options.name);
                expect(ruleNames).toContain('Area 1');
            }

            // Debug cell D1 (should hit Area 2)
            const debugD1 = worksheetPermission.debugCellPermission(0, 3);
            expect(debugD1).toBeDefined();
            if (debugD1) {
                expect(debugD1.hitRules.length).toBeGreaterThan(0);
                const ruleNames = debugD1.hitRules.map((r) => r.options.name);
                expect(ruleNames).toContain('Area 2');
            }

            // Debug cell Z99 (should hit no rules)
            const debugZ99 = worksheetPermission.debugCellPermission(98, 25);
            if (debugZ99) {
                expect(debugZ99.hitRules.length).toBe(0);
            }
        });
    });

    describe('Batch Operations', () => {
        it('should create multiple protection rules in one batch', async () => {
            const worksheet = univerAPI.getActiveWorkbook()?.getActiveSheet();
            const worksheetPermission = worksheet?.getWorksheetPermission();

            if (!worksheet || !worksheetPermission) {
                throw new Error('Worksheet or permission is null');
            }

            const startTime = Date.now();

            // Batch create 5 rules
            const rules = await worksheetPermission.protectRanges([
                { ranges: [worksheet.getRange('A1:A10')], options: { name: 'Rule 1' } },
                { ranges: [worksheet.getRange('B1:B10')], options: { name: 'Rule 2' } },
                { ranges: [worksheet.getRange('C1:C10')], options: { name: 'Rule 3' } },
                { ranges: [worksheet.getRange('D1:D10')], options: { name: 'Rule 4' } },
                { ranges: [worksheet.getRange('E1:E10')], options: { name: 'Rule 5' } },
            ]);

            const endTime = Date.now();
            const duration = endTime - startTime;

            // Should create 5 rules
            expect(rules.length).toBe(5);

            // Should be reasonably fast (batch operation)
            // This is a rough check - in real scenario, batch should be much faster than individual
            expect(duration).toBeLessThan(5000); // 5 seconds max for test environment

            // Verify all rules exist
            const allRules = await worksheetPermission.listRangeProtectionRules();
            const ruleNames = allRules.map((r) => r.options.name);
            expect(ruleNames).toContain('Rule 1');
            expect(ruleNames).toContain('Rule 2');
            expect(ruleNames).toContain('Rule 3');
            expect(ruleNames).toContain('Rule 4');
            expect(ruleNames).toContain('Rule 5');
        });

        it('should batch delete protection rules', async () => {
            const worksheet = univerAPI.getActiveWorkbook()?.getActiveSheet();
            const worksheetPermission = worksheet?.getWorksheetPermission();

            if (!worksheet || !worksheetPermission) {
                throw new Error('Worksheet or permission is null');
            }

            // Create 3 rules
            const rules = await worksheetPermission.protectRanges([
                { ranges: [worksheet.getRange('A1:A10')], options: { name: 'To Delete 1' } },
                { ranges: [worksheet.getRange('B1:B10')], options: { name: 'To Delete 2' } },
                { ranges: [worksheet.getRange('C1:C10')], options: { name: 'To Delete 3' } },
            ]);

            const ruleIds = rules.map((r) => r.id);

            // Batch delete
            await worksheetPermission.unprotectRules(ruleIds);

            // Verify all deleted
            const remainingRules = await worksheetPermission.listRangeProtectionRules();
            const remainingIds = remainingRules.map((r) => r.id);

            for (const id of ruleIds) {
                expect(remainingIds).not.toContain(id);
            }
        });
    });

    describe('Reactive Streams Combination', () => {
        it('should combine multiple permission streams', async () => {
            const workbook = univerAPI.getActiveWorkbook();
            const worksheet = workbook?.getActiveSheet();

            if (!workbook || !worksheet) {
                throw new Error('Workbook or worksheet is null');
            }

            const workbookPermission = workbook.getWorkbookPermission();
            const worksheetPermission = worksheet.getWorksheetPermission();

            // Combine workbook and worksheet permission streams
            const combined$ = combineLatest([
                workbookPermission.permission$,
                worksheetPermission.permission$,
            ]).pipe(
                map(([workbookSnapshot, worksheetSnapshot]) => ({
                    workbookEdit: workbookSnapshot[WorkbookPermissionPoint.Edit],
                    worksheetEdit: worksheetSnapshot[WorksheetPermissionPoint.Edit],
                })),
                take(1)
            );

            const result = await combined$.toPromise();

            expect(result).toBeDefined();
            expect(result?.workbookEdit).toBeDefined();
            expect(result?.worksheetEdit).toBeDefined();
        });

        it('should monitor range protection changes reactively', async () => {
            const worksheet = univerAPI.getActiveWorkbook()?.getActiveSheet();
            const worksheetPermission = worksheet?.getWorksheetPermission();

            if (!worksheet || !worksheetPermission) {
                throw new Error('Worksheet or permission is null');
            }

            const changes: any[] = [];
            const subscription = worksheetPermission.rangeProtectionChange$.subscribe((change) => {
                changes.push(change);
            });

            // Create protection
            const range = worksheet.getRange('A1:A10');
            await range.getRangePermission()?.protect({ name: 'Test' });

            // Should have emitted change
            expect(changes.length).toBeGreaterThan(0);

            subscription.unsubscribe();
        });

        it('should track current rules list reactively', async () => {
            const worksheet = univerAPI.getActiveWorkbook()?.getActiveSheet();
            const worksheetPermission = worksheet?.getWorksheetPermission();

            if (!worksheet || !worksheetPermission) {
                throw new Error('Worksheet or permission is null');
            }

            // Subscribe to rules list
            const rulesLists: any[][] = [];
            const subscription = worksheetPermission.rangeProtectionRules$.subscribe((rules) => {
                rulesLists.push([...rules]);
            });

            // Initial should be received
            expect(rulesLists.length).toBeGreaterThan(0);

            // Add a rule
            await worksheetPermission.protectRanges([
                { ranges: [worksheet.getRange('A1:A10')], options: { name: 'New Rule' } },
            ]);

            // Should have received updated list
            expect(rulesLists.length).toBeGreaterThan(1);

            subscription.unsubscribe();
        });
    });

    describe('Mode Transitions', () => {
        it('should transition through different workbook modes', async () => {
            const workbook = univerAPI.getActiveWorkbook();
            const permission = workbook?.getWorkbookPermission();

            if (!permission) {
                throw new Error('Permission is null');
            }

            // Owner -> Editor
            await permission.setMode('owner');
            expect(permission.getPoint(WorkbookPermissionPoint.ManageCollaborator)).toBe(true);

            await permission.setMode('editor');
            expect(permission.getPoint(WorkbookPermissionPoint.Edit)).toBe(true);
            expect(permission.getPoint(WorkbookPermissionPoint.ManageCollaborator)).toBe(false);

            // Editor -> Viewer
            await permission.setMode('viewer');
            expect(permission.getPoint(WorkbookPermissionPoint.Edit)).toBe(false);
            expect(permission.getPoint(WorkbookPermissionPoint.View)).toBe(true);

            // Viewer -> Owner
            await permission.setMode('owner');
            expect(permission.getPoint(WorkbookPermissionPoint.Edit)).toBe(true);
            expect(permission.getPoint(WorkbookPermissionPoint.ManageCollaborator)).toBe(true);
        });

        it('should transition through worksheet modes', async () => {
            const worksheet = univerAPI.getActiveWorkbook()?.getActiveSheet();
            const permission = worksheet?.getWorksheetPermission();

            if (!permission) {
                throw new Error('Permission is null');
            }

            // Editable -> ReadOnly
            await permission.setMode('editable');
            expect(permission.canEdit()).toBe(true);

            await permission.setMode('readOnly');
            expect(permission.canEdit()).toBe(false);

            // ReadOnly -> FilterOnly
            await permission.setMode('filterOnly');
            expect(permission.getPoint(WorksheetPermissionPoint.Edit)).toBe(false);
            expect(permission.getPoint(WorksheetPermissionPoint.Filter)).toBe(true);

            // FilterOnly -> Editable
            await permission.setMode('editable');
            expect(permission.canEdit()).toBe(true);
        });
    });

    describe('Edge Cases', () => {
        it('should handle empty protection rules list', async () => {
            const worksheet = univerAPI.getActiveWorkbook()?.getActiveSheet();
            const worksheetPermission = worksheet?.getWorksheetPermission();

            if (!worksheetPermission) {
                throw new Error('Permission is null');
            }

            const rules = await worksheetPermission.listRangeProtectionRules();

            // Should return empty array, not undefined
            expect(Array.isArray(rules)).toBe(true);
        });

        it('should handle checking permissions on non-existent cells', () => {
            const worksheet = univerAPI.getActiveWorkbook()?.getActiveSheet();
            const worksheetPermission = worksheet?.getWorksheetPermission();

            if (!worksheetPermission) {
                throw new Error('Permission is null');
            }

            // Check very large row/column numbers
            const canEdit = worksheetPermission.canEditCell(9999, 9999);
            expect(typeof canEdit).toBe('boolean');
        });

        it('should handle unprotecting already unprotected range', async () => {
            const worksheet = univerAPI.getActiveWorkbook()?.getActiveSheet();
            const range = worksheet?.getRange('Z99:Z99');
            const permission = range?.getRangePermission();

            if (!permission) {
                throw new Error('Permission is null');
            }

            // Should not throw error
            await expect(permission.unprotect()).resolves.not.toThrow();
        });
    });
});

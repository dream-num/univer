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

import { IPermissionService } from '@univerjs/core';
import { WorksheetSetColumnStylePermission, WorksheetSetRowStylePermission } from '@univerjs/sheets';
import { describe, expect, it } from 'vitest';
import { createCommandTestBed } from '../../../commands/commands/__tests__/create-command-test-bed';
import { checkHeaderResizePermission } from '../sheet-permission-interceptor-canvas-render.controller';

describe('checkHeaderResizePermission', () => {
    it('checks the style permission for the first row and column instead of skipping index 0', () => {
        const testBed = createCommandTestBed();
        const permissionService = testBed.get(IPermissionService);
        const unitId = testBed.sheet.getUnitId();
        const subUnitId = testBed.sheet.getActiveSheet()!.getSheetId();
        const rowStyle = new WorksheetSetRowStylePermission(unitId, subUnitId);
        const colStyle = new WorksheetSetColumnStylePermission(unitId, subUnitId);

        for (const point of [rowStyle, colStyle]) {
            if (!permissionService.getPermissionPoint(point.id)) {
                permissionService.addPermissionPoint(point);
            }
        }

        try {
            expect(checkHeaderResizePermission(permissionService, unitId, subUnitId, { row: 0 })).toBe(true);
            expect(checkHeaderResizePermission(permissionService, unitId, subUnitId, { col: 0 })).toBe(true);

            permissionService.updatePermissionPoint(rowStyle.id, false);
            expect(checkHeaderResizePermission(permissionService, unitId, subUnitId, { row: 0 })).toBe(false);
            expect(checkHeaderResizePermission(permissionService, unitId, subUnitId, { row: 1 })).toBe(false);
            expect(checkHeaderResizePermission(permissionService, unitId, subUnitId, { col: 0 })).toBe(true);

            permissionService.updatePermissionPoint(rowStyle.id, true);
            permissionService.updatePermissionPoint(colStyle.id, false);
            expect(checkHeaderResizePermission(permissionService, unitId, subUnitId, { col: 0 })).toBe(false);
            expect(checkHeaderResizePermission(permissionService, unitId, subUnitId, { col: 5 })).toBe(false);
            expect(checkHeaderResizePermission(permissionService, unitId, subUnitId, { row: 0 })).toBe(true);
        } finally {
            testBed.univer.dispose();
        }
    });
});

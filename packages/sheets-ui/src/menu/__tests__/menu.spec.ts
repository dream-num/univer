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

import type { IPermissionPoint } from '@univerjs/core';
import type { Observable } from 'rxjs';
import { IPermissionService } from '@univerjs/core';
import {
    WorkbookEditablePermission,
    WorksheetEditPermission,
    WorksheetSetColumnStylePermission,
    WorksheetSetRowStylePermission,
} from '@univerjs/sheets';
import { describe, expect, it } from 'vitest';
import { createCommandTestBed } from '../../commands/commands/__tests__/create-command-test-bed';
import {
    ColAutoWidthMenuItemFactory,
    FitContentMenuItemFactory,
    SetColWidthMenuItemFactory,
    SetRowHeightMenuItemFactory,
} from '../menu';

const PERMISSION_DEBOUNCE_MS = 200;

function waitForPermissionUpdate() {
    return new Promise((resolve) => setTimeout(resolve, PERMISSION_DEBOUNCE_MS));
}

function ensurePermissionPoint(permissionService: IPermissionService, point: IPermissionPoint) {
    if (!permissionService.getPermissionPoint(point.id)) {
        permissionService.addPermissionPoint(point);
    }
}

function collectStates(observable: Observable<boolean>) {
    const states: boolean[] = [];
    const subscription = observable.subscribe((state) => states.push(state));

    return { states, subscription };
}

describe('row height and column width menu permissions', () => {
    it('only requires the matching row or column style permission', async () => {
        const testBed = createCommandTestBed();
        const permissionService = testBed.get(IPermissionService);
        const unitId = testBed.sheet.getUnitId();
        const subUnitId = testBed.sheet.getActiveSheet()!.getSheetId();
        const workbookEditable = new WorkbookEditablePermission(unitId);
        const worksheetEdit = new WorksheetEditPermission(unitId, subUnitId);
        const rowStyle = new WorksheetSetRowStylePermission(unitId, subUnitId);
        const colStyle = new WorksheetSetColumnStylePermission(unitId, subUnitId);

        for (const point of [workbookEditable, worksheetEdit, rowStyle, colStyle]) {
            ensurePermissionPoint(permissionService, point);
        }

        const accessor = testBed.univer.__getInjector();
        const rowHeight = collectStates(SetRowHeightMenuItemFactory(accessor).hidden$!);
        const colWidth = collectStates(SetColWidthMenuItemFactory(accessor).hidden$!);
        const fitContent = collectStates(FitContentMenuItemFactory(accessor).disabled$!);
        const autoWidth = collectStates(ColAutoWidthMenuItemFactory(accessor).disabled$!);

        try {
            await waitForPermissionUpdate();
            expect(rowHeight.states.at(-1)).toBe(false);
            expect(colWidth.states.at(-1)).toBe(false);
            expect(fitContent.states.at(-1)).toBe(false);
            expect(autoWidth.states.at(-1)).toBe(false);

            permissionService.updatePermissionPoint(workbookEditable.id, false);
            permissionService.updatePermissionPoint(worksheetEdit.id, false);
            await waitForPermissionUpdate();
            expect(rowHeight.states.at(-1)).toBe(false);
            expect(colWidth.states.at(-1)).toBe(false);
            expect(fitContent.states.at(-1)).toBe(false);
            expect(autoWidth.states.at(-1)).toBe(false);

            permissionService.updatePermissionPoint(rowStyle.id, false);
            await waitForPermissionUpdate();
            expect(rowHeight.states.at(-1)).toBe(true);
            expect(fitContent.states.at(-1)).toBe(true);
            expect(colWidth.states.at(-1)).toBe(false);
            expect(autoWidth.states.at(-1)).toBe(false);

            permissionService.updatePermissionPoint(rowStyle.id, true);
            permissionService.updatePermissionPoint(colStyle.id, false);
            await waitForPermissionUpdate();
            expect(rowHeight.states.at(-1)).toBe(false);
            expect(fitContent.states.at(-1)).toBe(false);
            expect(colWidth.states.at(-1)).toBe(true);
            expect(autoWidth.states.at(-1)).toBe(true);
        } finally {
            rowHeight.subscription.unsubscribe();
            colWidth.subscription.unsubscribe();
            fitContent.subscription.unsubscribe();
            autoWidth.subscription.unsubscribe();
            testBed.univer.dispose();
        }
    });
});

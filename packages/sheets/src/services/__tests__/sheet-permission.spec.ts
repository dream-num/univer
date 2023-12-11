/**
 * Copyright 2023-present DreamNum Inc.
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

import type { Univer } from '@univerjs/core';
import { ICommandService, IUniverInstanceService, UniverPermissionService } from '@univerjs/core';
import type { Injector } from '@wendellhu/redi';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import type { ISetRangeValuesCommandParams } from '../../commands/commands/set-range-values.command';
import { SetRangeValuesCommand } from '../../commands/commands/set-range-values.command';
import { SetRangeValuesMutation } from '../../commands/mutations/set-range-values.mutation';
import { SheetEditablePermission, SheetPermissionService } from '../permission';
import { SelectionManagerService } from '../selection-manager.service';
import { SheetInterceptorService } from '../sheet-interceptor/sheet-interceptor.service';
import { createTestBase, TEST_WORKBOOK_DATA_DEMO } from './util';

describe('test sheet permission service', () => {
    let univer: Univer;
    let commandService: ICommandService;
    let get: Injector['get'];
    beforeEach(() => {
        const testBed = createTestBase(TEST_WORKBOOK_DATA_DEMO, [
            [SheetPermissionService],
            [SelectionManagerService],
            [SheetInterceptorService],
        ]);
        get = testBed.get;
        univer = testBed.univer;
        commandService = testBed.get(ICommandService);
        commandService.registerCommand(SetRangeValuesCommand);
        commandService.registerCommand(SetRangeValuesMutation);
    });
    afterEach(() => {
        univer.dispose();
    });

    it('test set univer editable', () => {
        const initPermission = new SheetEditablePermission('1', '1');
        const univerInstanceService = get(IUniverInstanceService);
        const univerPermissionService = get(UniverPermissionService);

        const workbook = univerInstanceService.getCurrentUniverSheetInstance();
        const sheet = workbook.getActiveSheet();
        const sheetPermissionService = get(SheetPermissionService);
        expect(sheetPermissionService.getSheetEditable(workbook.getUnitId(), sheet.getSheetId())).toBe(
            initPermission.value
        );
        univerPermissionService.setEditable(workbook.getUnitId(), false);
        expect(univerPermissionService.getEditable()).toBe(false);
        expect(sheetPermissionService.getSheetEditable(workbook.getUnitId(), sheet.getSheetId())).toBe(false);

        univerPermissionService.setEditable(workbook.getUnitId(), true);
        expect(univerPermissionService.getEditable()).toBe(true);
        expect(sheetPermissionService.getSheetEditable(workbook.getUnitId(), sheet.getSheetId())).toBe(true);
    });

    it('test set sheet editable', () => {
        const initPermission = new SheetEditablePermission('1', '1');
        const univerInstanceService = get(IUniverInstanceService);
        const univerPermissionService = get(UniverPermissionService);

        const workbook = univerInstanceService.getCurrentUniverSheetInstance();
        const sheet = workbook.getActiveSheet();
        const sheetPermissionService = get(SheetPermissionService);
        expect(sheetPermissionService.getSheetEditable(workbook.getUnitId(), sheet.getSheetId())).toBe(
            initPermission.value
        );

        sheetPermissionService.setSheetEditable(false);
        expect(univerPermissionService.getEditable()).toBe(true);
        expect(sheetPermissionService.getSheetEditable(workbook.getUnitId(), sheet.getSheetId())).toBe(false);

        sheetPermissionService.setSheetEditable(true);
        expect(univerPermissionService.getEditable()).toBe(true);
        expect(sheetPermissionService.getSheetEditable(workbook.getUnitId(), sheet.getSheetId())).toBe(true);
    });

    it('test setRangeValue commands', async () => {
        const univerPermissionService = get(UniverPermissionService);
        const univerInstanceService = get(IUniverInstanceService);
        const workbook = univerInstanceService.getCurrentUniverSheetInstance();

        const commandService = get(ICommandService);
        univerPermissionService.setEditable(workbook.getUnitId(), false);
        const result = await commandService.executeCommand(SetRangeValuesCommand.id, {
            range: { startRow: 0, startColumn: 0, endColumn: 0, endRow: 0 },
            value: { v: 3 },
        } as ISetRangeValuesCommandParams);
        expect(result).toBe(false);
        univerPermissionService.setEditable(workbook.getUnitId(), true);
        const result2 = await commandService.executeCommand(SetRangeValuesCommand.id, {
            range: { startRow: 0, startColumn: 0, endColumn: 0, endRow: 0 },
            value: { v: 3 },
        } as ISetRangeValuesCommandParams);
        expect(result2).toBe(true);
    });
});

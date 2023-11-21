import { ICommandService, IUniverInstanceService, Univer, UniverPermissionService } from '@univerjs/core';
import { Injector } from '@wendellhu/redi';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { ISetRangeValuesCommandParams, SetRangeValuesCommand } from '../../commands/commands/set-range-values.command';
import { SetRangeValuesMutation } from '../../commands/mutations/set-range-values.mutation';
import { SheetEditablePermission, SheetPermissionService } from '../permission';
import { SelectionManagerService } from '../selection-manager.service';
import { createTestBase, TEST_WORKBOOK_DATA_DEMO } from './util';

describe('test sheet permission service', () => {
    let univer: Univer;
    let commandService: ICommandService;
    let get: Injector['get'];
    beforeEach(() => {
        const testBed = createTestBase(TEST_WORKBOOK_DATA_DEMO, [[SheetPermissionService], [SelectionManagerService]]);
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

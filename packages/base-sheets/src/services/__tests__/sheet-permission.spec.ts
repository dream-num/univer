import { ICommandService, IUniverInstanceService, Univer, UniverPermissionService } from '@univerjs/core';
import { Injector } from '@wendellhu/redi';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { SetRangeValuesCommand } from '../../commands/commands/set-range-values.command';
import { SheetEditablePermission, SheetPermissionService } from '../permission';
import { createTestBase, TEST_WORKBOOK_DATA_DEMO } from './util';

describe('test sheet permission service', () => {
    let univer: Univer;
    let commandService: ICommandService;
    let get: Injector['get'];
    beforeEach(() => {
        const testBed = createTestBase(TEST_WORKBOOK_DATA_DEMO, [[SheetPermissionService]]);
        get = testBed.get;
        univer = testBed.univer;
        commandService = testBed.get(ICommandService);
        commandService.registerCommand(SetRangeValuesCommand);
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
        univerPermissionService.setEditable(false);
        expect(univerPermissionService.getEditable()).toBe(false);
        expect(sheetPermissionService.getSheetEditable(workbook.getUnitId(), sheet.getSheetId())).toBe(false);

        univerPermissionService.setEditable(true);
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
});

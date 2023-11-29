import { ICommandService, IUniverInstanceService } from '@univerjs/core';
import { Injector } from '@wendellhu/redi';
import { beforeEach, describe, expect, it } from 'vitest';

import { SetNumfmtMutation, SetNumfmtMutationParams } from '../commands/mutations/set.numfmt.mutation';
import { NumfmtService } from '../service/numfmt.service';
import { INumfmtService } from '../service/type';
import { createTestBase } from './createTestBase';

describe('test numfmt service', () => {
    let get: Injector['get'];
    let commandService: ICommandService;

    beforeEach(() => {
        const testBed = createTestBase(undefined, [[INumfmtService, { useClass: NumfmtService }]]);
        get = testBed.get;
        commandService = get(ICommandService);
    });

    it('model set', () => {
        const univerInstanceService = get(IUniverInstanceService);
        const numfmtService = get(INumfmtService);
        const workbook = univerInstanceService.getCurrentUniverSheetInstance();
        const sheet = workbook.getActiveSheet();
        const workbookId = workbook.getUnitId();
        const worksheetId = sheet.getSheetId();
        const params: SetNumfmtMutationParams = {
            workbookId,
            worksheetId,
            values: [{ row: 1, col: 1, pattern: 'asdws' }],
        };
        commandService.executeCommand(SetNumfmtMutation.id, params);
        const numfmtValue = numfmtService.getValue(workbookId, worksheetId, 1, 1);
        expect(numfmtValue).toEqual({ pattern: 'asdws', type: undefined });
        const model = numfmtService.getModel(workbookId, worksheetId);
        expect(model?.getValue(1, 1)).toEqual({ pattern: '1' });
    });

    it('model delete', () => {
        const univerInstanceService = get(IUniverInstanceService);
        const numfmtService = get(INumfmtService);
        const workbook = univerInstanceService.getCurrentUniverSheetInstance();
        const sheet = workbook.getActiveSheet();
        const workbookId = workbook.getUnitId();
        const worksheetId = sheet.getSheetId();
        const params: SetNumfmtMutationParams = {
            workbookId,
            worksheetId,
            values: [{ row: 1, col: 1, pattern: 'asdws' }],
        };
        commandService.executeCommand(SetNumfmtMutation.id, params);
        const numfmtValue = numfmtService.getValue(workbookId, worksheetId, 1, 1);
        expect(numfmtValue).toEqual({ pattern: 'asdws' });
        commandService.executeCommand(SetNumfmtMutation.id, { ...params, values: [{ row: 1, col: 1 }] });
        const numfmtValueDelete = numfmtService.getValue(workbookId, worksheetId, 1, 1);
        expect(numfmtValueDelete).toEqual(null);
    });

    it('ref model set', () => {
        const univerInstanceService = get(IUniverInstanceService);
        const numfmtService = get(INumfmtService);
        const workbook = univerInstanceService.getCurrentUniverSheetInstance();
        const sheet = workbook.getActiveSheet();
        const workbookId = workbook.getUnitId();
        const worksheetId = sheet.getSheetId();
        const params: SetNumfmtMutationParams = {
            workbookId,
            worksheetId,
            values: [{ row: 1, col: 1, pattern: 'asdws' }],
        };
        commandService.executeCommand(SetNumfmtMutation.id, params);
        const refModel = numfmtService.getRefModel(workbookId);
        expect(refModel?.getKeyMap('numfmtId')).toEqual(['1']);
        expect(refModel?.getKeyMap('pattern')).toEqual(['asdws']);
        expect(refModel?.getValue('asdws')?.count).toEqual(1);
        expect(refModel?.getValue('1')?.count).toEqual(1);
    });

    it('model delete', () => {
        const univerInstanceService = get(IUniverInstanceService);
        const numfmtService = get(INumfmtService);
        const workbook = univerInstanceService.getCurrentUniverSheetInstance();
        const sheet = workbook.getActiveSheet();
        const workbookId = workbook.getUnitId();
        const worksheetId = sheet.getSheetId();
        const params: SetNumfmtMutationParams = {
            workbookId,
            worksheetId,
            values: [{ row: 1, col: 1, pattern: 'asdws' }],
        };
        commandService.executeCommand(SetNumfmtMutation.id, params);
        commandService.executeCommand(SetNumfmtMutation.id, { ...params, values: [{ row: 1, col: 1 }] });
        const refModel = numfmtService.getRefModel(workbookId);
        expect(refModel?.getValue('asdws')?.count).toEqual(0);
        expect(refModel?.getValue('1')?.count).toEqual(0);
    });
});

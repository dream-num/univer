import type { ISetNumfmtMutationParams } from '@univerjs/base-sheets';
import type { Univer } from '@univerjs/core';
import { ICommandService, IUniverInstanceService } from '@univerjs/core';
import type { Injector } from '@wendellhu/redi';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { SetNumfmtMutation } from '../../commands/mutations/set-numfmt-mutation';
import { NumfmtService } from '../numfmt/numfmt.service';
import { INumfmtService } from '../numfmt/type';
import { createTestBase } from './util';

describe('test numfmt service', () => {
    let univer: Univer;
    let get: Injector['get'];
    let commandService: ICommandService;

    beforeEach(() => {
        const testBed = createTestBase(undefined, [[INumfmtService, { useClass: NumfmtService }]]);
        univer = testBed.univer;
        get = testBed.get;
        commandService = get(ICommandService);
    });
    afterEach(() => {
        univer.dispose();
    });

    it('model set', () => {
        const univerInstanceService = get(IUniverInstanceService);
        const numfmtService = get(INumfmtService);
        const workbook = univerInstanceService.getCurrentUniverSheetInstance();
        const sheet = workbook.getActiveSheet();
        const workbookId = workbook.getUnitId();
        const worksheetId = sheet.getSheetId();
        const params: ISetNumfmtMutationParams = {
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
        const params: ISetNumfmtMutationParams = {
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
        const params: ISetNumfmtMutationParams = {
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
        const params: ISetNumfmtMutationParams = {
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

    it('model delete', () => {
        const univerInstanceService = get(IUniverInstanceService);
        const numfmtService = get(INumfmtService);
        const workbook = univerInstanceService.getCurrentUniverSheetInstance();
        const workbookId = workbook.getUnitId();
        const sheets = workbook.getSheets();
        const pattern = 'asdws';
        const params1: ISetNumfmtMutationParams = {
            workbookId,
            worksheetId: sheets[0].getSheetId(),
            values: [{ row: 1, col: 1, pattern }],
        };
        commandService.executeCommand(SetNumfmtMutation.id, params1);
        const params2: ISetNumfmtMutationParams = {
            workbookId,
            worksheetId: sheets[1].getSheetId(),
            values: [{ row: 1, col: 1, pattern }],
        };
        commandService.executeCommand(SetNumfmtMutation.id, params2);
        const refModel = numfmtService.getRefModel(workbookId);
        const model1 = numfmtService.getModel(workbookId, sheets[0].getSheetId());
        const model2 = numfmtService.getModel(workbookId, sheets[1].getSheetId());
        expect(refModel?.getValue(pattern)?.count).toBe(2);
        expect(model1?.getValue(1, 1)?.pattern).toBe('1');
        expect(model2?.getValue(1, 1)?.pattern).toBe('1');
        expect(refModel?.getValue(model2?.getValue(1, 1)?.pattern!)?.pattern).toBe(pattern);
    });
});

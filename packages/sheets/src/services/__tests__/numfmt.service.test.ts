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
import { cellToRange, ICommandService, IUniverInstanceService } from '@univerjs/core';
import type { IRemoveNumfmtMutationParams, ISetNumfmtMutationParams } from '@univerjs/sheets';
import type { Injector } from '@wendellhu/redi';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { RemoveNumfmtMutation, SetNumfmtMutation } from '../../commands/mutations/numfmt-mutation';
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
        commandService.registerCommand(SetNumfmtMutation);
        commandService.registerCommand(RemoveNumfmtMutation);
    });

    afterEach(() => {
        univer.dispose();
    });

    it('model set', () => {
        const univerInstanceService = get(IUniverInstanceService);
        const numfmtService = get(INumfmtService);
        const workbook = univerInstanceService.getCurrentUniverSheetInstance();
        const sheet = workbook.getActiveSheet();
        const unitId = workbook.getUnitId();
        const subUnitId = sheet.getSheetId();
        const params: ISetNumfmtMutationParams = {
            unitId,
            subUnitId,
            refMap: {
                1: {
                    pattern: 'asdws',
                    type: 'sss' as any,
                },
            },
            values: { 1: { ranges: [cellToRange(1, 1)] } },
        };
        commandService.executeCommand(SetNumfmtMutation.id, params);
        const numfmtValue = numfmtService.getValue(unitId, subUnitId, 1, 1);
        expect(numfmtValue).toEqual({ pattern: 'asdws', type: 'sss' });
        const model = numfmtService.getModel(unitId, subUnitId);
        expect(model?.getValue(1, 1)).toEqual({ i: '1' });
    });

    it('model delete', () => {
        const univerInstanceService = get(IUniverInstanceService);
        const numfmtService = get(INumfmtService);
        const workbook = univerInstanceService.getCurrentUniverSheetInstance();
        const sheet = workbook.getActiveSheet();
        const unitId = workbook.getUnitId();
        const subUnitId = sheet.getSheetId();
        const params: ISetNumfmtMutationParams = {
            unitId,
            subUnitId,
            refMap: {
                1: {
                    pattern: 'asdws',
                    type: 'sss' as any,
                },
            },
            values: { 1: { ranges: [cellToRange(1, 1)] } },
        };
        const deleteParams: IRemoveNumfmtMutationParams = {
            unitId,
            subUnitId,
            ranges: [cellToRange(1, 1)],
        };
        commandService.executeCommand(SetNumfmtMutation.id, params);
        const numfmtValue = numfmtService.getValue(unitId, subUnitId, 1, 1);
        expect(numfmtValue).toEqual({ pattern: 'asdws', type: 'sss' });
        commandService.executeCommand(RemoveNumfmtMutation.id, deleteParams);
        const numfmtValueDelete = numfmtService.getValue(unitId, subUnitId, 1, 1);
        expect(numfmtValueDelete).toEqual(null);
    });

    it('ref model set', () => {
        const univerInstanceService = get(IUniverInstanceService);
        const numfmtService = get(INumfmtService);
        const workbook = univerInstanceService.getCurrentUniverSheetInstance();
        const sheet = workbook.getActiveSheet();
        const unitId = workbook.getUnitId();
        const subUnitId = sheet.getSheetId();
        const params: ISetNumfmtMutationParams = {
            unitId,
            subUnitId,
            refMap: {
                1: {
                    pattern: 'asdws',
                    type: 'sss' as any,
                },
            },
            values: { 1: { ranges: [cellToRange(1, 1)] } },
        };
        commandService.executeCommand(SetNumfmtMutation.id, params);
        const refModel = numfmtService.getRefModel(unitId);
        expect(refModel?.getKeyMap('i')).toEqual(['1']);
        expect(refModel?.getKeyMap('pattern')).toEqual(['asdws']);
        expect(refModel?.getValue('asdws')?.count).toEqual(1);
        expect(refModel?.getValue('1')?.count).toEqual(1);
    });

    it('model delete', () => {
        const univerInstanceService = get(IUniverInstanceService);
        const numfmtService = get(INumfmtService);
        const workbook = univerInstanceService.getCurrentUniverSheetInstance();
        const sheet = workbook.getActiveSheet();
        const unitId = workbook.getUnitId();
        const subUnitId = sheet.getSheetId();
        const params: ISetNumfmtMutationParams = {
            unitId,
            subUnitId,
            refMap: {
                1: {
                    pattern: 'asdws',
                    type: 'sss' as any,
                },
            },
            values: { 1: { ranges: [cellToRange(1, 1)] } },
        };
        const deleteParams: IRemoveNumfmtMutationParams = {
            unitId,
            subUnitId,
            ranges: [cellToRange(1, 1)],
        };
        commandService.executeCommand(SetNumfmtMutation.id, params);
        commandService.executeCommand(RemoveNumfmtMutation.id, deleteParams);
        const refModel = numfmtService.getRefModel(unitId);
        expect(refModel?.getValue('asdws')?.count).toEqual(0);
        expect(refModel?.getValue('1')?.count).toEqual(0);
    });

    it('model delete', () => {
        const univerInstanceService = get(IUniverInstanceService);
        const numfmtService = get(INumfmtService);
        const workbook = univerInstanceService.getCurrentUniverSheetInstance();
        const unitId = workbook.getUnitId();
        const sheets = workbook.getSheets();
        const pattern = 'asdws';
        const params1: ISetNumfmtMutationParams = {
            unitId,
            subUnitId: sheets[0].getSheetId(),
            refMap: {
                1: {
                    pattern,
                    type: 'sss' as any,
                },
            },
            values: { 1: { ranges: [cellToRange(1, 1)] } },
        };
        commandService.executeCommand(SetNumfmtMutation.id, params1);
        const params2: ISetNumfmtMutationParams = {
            unitId,
            subUnitId: sheets[1].getSheetId(),
            refMap: {
                1: {
                    pattern,
                    type: 'sss' as any,
                },
            },
            values: { 1: { ranges: [cellToRange(1, 1)] } },
        };
        commandService.executeCommand(SetNumfmtMutation.id, params2);
        const refModel = numfmtService.getRefModel(unitId);
        const model1 = numfmtService.getModel(unitId, sheets[0].getSheetId());
        const model2 = numfmtService.getModel(unitId, sheets[1].getSheetId());
        expect(refModel?.getValue(pattern)?.count).toBe(2);
        expect(model1?.getValue(1, 1)?.i).toBe('1');
        expect(model2?.getValue(1, 1)?.i).toBe('1');
        expect(refModel?.getValue(model2?.getValue(1, 1)?.i!)?.pattern).toBe(pattern);
    });
});

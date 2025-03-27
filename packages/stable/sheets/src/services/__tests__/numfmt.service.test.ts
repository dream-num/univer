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

import type { Injector, Styles, Univer, Workbook, Worksheet } from '@univerjs/core';
import type { IRemoveNumfmtMutationParams, ISetNumfmtMutationParams } from '@univerjs/sheets';
import { cellToRange, CellValueType, ICommandService, IUniverInstanceService, UniverInstanceType } from '@univerjs/core';
import { DEFAULT_TEXT_FORMAT_EXCEL } from '@univerjs/engine-numfmt';

import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { RemoveNumfmtMutation, SetNumfmtMutation } from '../../commands/mutations/numfmt-mutation';
import { NumfmtService } from '../numfmt/numfmt.service';
import { INumfmtService } from '../numfmt/type';
import { createTestBase } from './util';

describe('test numfmt service', () => {
    let univer: Univer;
    let get: Injector['get'];
    let commandService: ICommandService;
    let univerInstanceService: IUniverInstanceService;
    let numfmtService: INumfmtService;
    let workbook: Workbook;
    let styles: Styles;
    let sheet: Worksheet;
    let unitId: string;
    let subUnitId: string;

    beforeEach(() => {
        const testBed = createTestBase(undefined, [[INumfmtService, { useClass: NumfmtService }]]);
        univer = testBed.univer;
        get = testBed.get;
        commandService = get(ICommandService);
        commandService.registerCommand(SetNumfmtMutation);
        commandService.registerCommand(RemoveNumfmtMutation);

        univerInstanceService = get(IUniverInstanceService);
        numfmtService = get(INumfmtService);
        workbook = univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET)!;
        styles = workbook.getStyles();
        sheet = workbook.getActiveSheet()!;
        unitId = workbook.getUnitId();
        subUnitId = sheet.getSheetId();
    });

    afterEach(() => {
        univer.dispose();
    });

    it('model delete', () => {
        const params: ISetNumfmtMutationParams = {
            unitId,
            subUnitId,
            refMap: {
                1: {
                    pattern: 'asdws',
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
        expect(numfmtValue).toEqual({ pattern: 'asdws' });
        commandService.executeCommand(RemoveNumfmtMutation.id, deleteParams);
        const numfmtValueDelete = numfmtService.getValue(unitId, subUnitId, 1, 1);
        expect(numfmtValueDelete).toEqual(null);
    });

    it('model set, normal format', () => {
        const params: ISetNumfmtMutationParams = {
            unitId,
            subUnitId,
            refMap: {
                1: {
                    pattern: 'asdws',
                },
            },
            values: { 1: { ranges: [cellToRange(1, 1)] } },
        };
        commandService.executeCommand(SetNumfmtMutation.id, params);
        const numfmt = numfmtService.getValue(unitId, subUnitId, 1, 1);
        expect(numfmt?.pattern).toEqual('asdws');
        const numfmtId = sheet.getCellRaw(1, 1)?.s;
        expect(styles.get(numfmtId)?.n).toEqual({ pattern: 'asdws' });
    });

    it('model set, update format', () => {
        const params: ISetNumfmtMutationParams = {
            unitId,
            subUnitId,
            refMap: {
                1: {
                    pattern: DEFAULT_TEXT_FORMAT_EXCEL,
                },
            },
            values: { 1: { ranges: [cellToRange(0, 5)] } },
        };
        commandService.executeCommand(SetNumfmtMutation.id, params);
        const numfmt = numfmtService.getValue(unitId, subUnitId, 0, 5);
        expect(numfmt?.pattern).toEqual(DEFAULT_TEXT_FORMAT_EXCEL);

        const cell = sheet.getCellRaw(0, 5);
        const numfmtId = cell?.s;
        expect(styles.get(numfmtId)?.n).toEqual({ pattern: DEFAULT_TEXT_FORMAT_EXCEL });
    });

    it('model set, text format contains number, to number format', () => {
        // text format set to percentage format, value is not changed, t is not changed, only style is changed
        // Re-enter a number so that the cell Only then display the percentage
        const params: ISetNumfmtMutationParams = {
            unitId,
            subUnitId,
            refMap: {
                1: {
                    pattern: '0%',
                },
            },
            values: { 1: { ranges: [cellToRange(0, 6)] } },
        };
        commandService.executeCommand(SetNumfmtMutation.id, params);
        const numfmt = numfmtService.getValue(unitId, subUnitId, 0, 6);
        expect(numfmt?.pattern).toEqual('0%');

        const cell = sheet.getCellRaw(0, 6);
        const numfmtId = cell?.s;
        expect(styles.get(numfmtId)?.n).toEqual({ pattern: '0%' });
        expect(cell).toStrictEqual({ v: '001', t: CellValueType.STRING, s: numfmtId });
    });

    it('model set, text format contains text, to number format', () => {
        const params: ISetNumfmtMutationParams = {
            unitId,
            subUnitId,
            refMap: {
                1: {
                    pattern: '0%',
                },
            },
            values: { 1: { ranges: [cellToRange(0, 7)] } },
        };
        commandService.executeCommand(SetNumfmtMutation.id, params);
        const numfmt = numfmtService.getValue(unitId, subUnitId, 0, 7);
        expect(numfmt?.pattern).toEqual('0%');

        const cell = sheet.getCellRaw(0, 7);
        const numfmtId = cell?.s;
        expect(styles.get(numfmtId)?.n).toEqual({ pattern: '0%' });
        expect(cell).toStrictEqual({ v: 'text', t: CellValueType.STRING, s: numfmtId });
    });

    it('model set, force string, to number format', () => {
        const params: ISetNumfmtMutationParams = {
            unitId,
            subUnitId,
            refMap: {
                1: {
                    pattern: '0%',
                },
            },
            values: { 1: { ranges: [cellToRange(0, 8)] } },
        };
        commandService.executeCommand(SetNumfmtMutation.id, params);
        const numfmt = numfmtService.getValue(unitId, subUnitId, 0, 8);
        expect(numfmt?.pattern).toEqual('0%');

        const cell = sheet.getCellRaw(0, 8);
        const numfmtId = cell?.s;
        expect(styles.get(numfmtId)?.n).toEqual({ pattern: '0%' });
        expect(cell).toStrictEqual({ v: '001', t: CellValueType.FORCE_STRING, s: numfmtId });
    });
});

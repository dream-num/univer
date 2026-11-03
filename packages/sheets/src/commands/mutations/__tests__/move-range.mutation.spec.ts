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

import type { IWorkbookData, Workbook } from '@univerjs/core';
import { ICommandService, IUniverInstanceService, LocaleService, LocaleType, Tools, Univer, UniverInstanceType } from '@univerjs/core';
import { afterEach, describe, expect, it } from 'vitest';
import { UniverSheetsPlugin } from '../../../plugin';
import { MoveRangeMutation } from '../move-range.mutation';

describe('MoveRangeMutation', () => {
    it('applies a changeset to its explicit workbook while another workbook is active', () => {
        const univer = new Univer();
        try {
            const injector = univer.__getInjector();
            const data: IWorkbookData = {
                id: 'active',
                appVersion: '1.0.3',
                locale: LocaleType.EN_US,
                name: 'Active',
                styles: {},
                sheetOrder: ['sheet1'],
                sheets: { sheet1: { id: 'sheet1', name: 'Sheet1', rowCount: 10, columnCount: 10, cellData: { 0: { 0: { v: 'source' } } } } },
            };
            const active = univer.createUnit<IWorkbookData, Workbook>(UniverInstanceType.UNIVER_SHEET, data);
            const instances = injector.get(IUniverInstanceService);
            const peer = instances.createUnit<IWorkbookData, Workbook>(UniverInstanceType.UNIVER_SHEET, {
                ...Tools.deepClone(data),
                id: 'peer',
            }, { makeCurrent: false });
            const commands = injector.get(ICommandService);
            commands.registerCommand(MoveRangeMutation);
            expect(commands.syncExecuteCommand(MoveRangeMutation.id, {
                unitId: 'peer',
                fromRange: { startRow: 0, endRow: 0, startColumn: 0, endColumn: 0 },
                toRange: { startRow: 1, endRow: 1, startColumn: 1, endColumn: 1 },
                from: { subUnitId: 'sheet1', value: { 0: { 0: null } } },
                to: { subUnitId: 'sheet1', value: { 1: { 1: { v: 'source' } } } },
            }, { fromChangeset: true })).toBe(true);
            expect(peer.getSheetBySheetId('sheet1')!.getCellRaw(0, 0)).toBeUndefined();
            expect(peer.getSheetBySheetId('sheet1')!.getCellRaw(1, 1)?.v).toBe('source');
            expect(active.getSheetBySheetId('sheet1')!.getCellRaw(0, 0)?.v).toBe('source');
            expect(active.getSheetBySheetId('sheet1')!.getCellRaw(1, 1)).toBeUndefined();
        } finally {
            univer.dispose();
        }
    });
});

describe('MoveRangeMutation explicit workbook ownership', () => {
    let univer: Univer | undefined;

    afterEach(() => univer?.dispose());

    it.each([
        { unitId: 'owner', currentUnitId: 'independent', success: true },
        { unitId: 'owner', currentUnitId: 'owner', success: true },
        { unitId: 'missing', currentUnitId: 'independent', success: false },
    ])('replays a move for $unitId with current workbook $currentUnitId (success=$success)', ({ unitId, currentUnitId, success }) => {
        univer = new Univer();
        univer.registerPlugin(UniverSheetsPlugin, { onlyRegisterFormulaRelatedMutations: true });
        const injector = univer.__getInjector();
        const locale = injector.get(LocaleService);
        locale.setLocale(LocaleType.EN_US);
        locale.setDirection('ltr');
        const createWorkbook = (id: string, source: number, target: number) => univer!.createUnit<IWorkbookData, Workbook>(
            UniverInstanceType.UNIVER_SHEET,
            {
                id,
                locale: LocaleType.EN_US,
                styles: {},
                sheetOrder: ['scratch', 'summary'],
                sheets: {
                    scratch: { id: 'scratch', name: 'Scratch', cellData: { 1: { 0: { v: source }, 1: { f: '=A2*2', v: source * 2 } } } },
                    summary: { id: 'summary', name: 'Summary', cellData: { 4: { 3: { v: target } } } },
                },
            }
        );
        const owner = createWorkbook('owner', 20, 7);
        const independent = createWorkbook('independent', 101, 103);
        const instances = injector.get(IUniverInstanceService);
        instances.setCurrentUnitForType(currentUnitId);
        expect(instances.getCurrentUnitOfType(UniverInstanceType.UNIVER_SHEET)?.getUnitId()).toBe(currentUnitId);
        const beforeOwner = owner.save();
        const beforeIndependent = independent.save();
        expect(injector.get(ICommandService).syncExecuteCommand(MoveRangeMutation.id, {
            unitId,
            fromRange: { startRow: 1, endRow: 1, startColumn: 0, endColumn: 1 },
            toRange: { startRow: 4, endRow: 4, startColumn: 3, endColumn: 4 },
            from: { subUnitId: 'scratch', value: { 1: { 0: null, 1: null } } },
            to: { subUnitId: 'summary', value: { 4: { 3: { v: 20 }, 4: { f: '=D5*2', v: 40 } } } },
        }, { onlyLocal: true, fromSync: true })).toBe(success);
        if (success) {
            expect(owner.getSheetBySheetId('summary')!.getCellMatrix().getValue(4, 3)).toEqual({ v: 20 });
            expect(owner.getSheetBySheetId('summary')!.getCellMatrix().getValue(4, 4)).toEqual({ f: '=D5*2', v: 40 });
            expect(owner.getSheetBySheetId('scratch')!.getCellMatrix().getValue(1, 0)).toBeUndefined();
        } else {
            expect(owner.save()).toEqual(beforeOwner);
        }
        expect(independent.save()).toEqual(beforeIndependent);
    });
});

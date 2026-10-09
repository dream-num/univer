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
import { ICommandService, IUniverInstanceService, LocaleType, Tools, Univer, UniverInstanceType } from '@univerjs/core';
import { describe, expect, it } from 'vitest';
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

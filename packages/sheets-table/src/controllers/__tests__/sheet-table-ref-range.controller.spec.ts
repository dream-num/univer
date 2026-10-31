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

import type { IWorkbookData } from '@univerjs/core';
import {
    Direction,
    IResourceLoaderService,
    IUniverInstanceService,
    RedoCommand,
    Tools,
    UndoCommand,
    UniverInstanceType,
} from '@univerjs/core';
import { InsertRowCommand, RemoveColCommand, RemoveRowCommand } from '@univerjs/sheets';
import { describe, expect, it } from 'vitest';
import { createTableTestBed } from '../../__tests__/create-table-test-bed';

describe('SheetTableRefRangeController', () => {
    it('shifts a table before its header without changing column identity and restores the range through history', async () => {
        const bed = createTableTestBed(5);
        try {
            const before = Tools.deepClone(bed.manager.getTable('unit', 'sales')!.toJSON());
            expect(await bed.commands.executeCommand(InsertRowCommand.id, {
                unitId: 'unit',
                subUnitId: 'orders',
                direction: Direction.UP,
                range: { startRow: 1, endRow: 2, startColumn: 0, endColumn: 19 },
            })).toBe(true);
            const shifted = { ...before, range: { ...before.range, startRow: 7, endRow: 15 } };
            expect(bed.manager.getTable('unit', 'sales')!.toJSON()).toEqual(shifted);
            expect(await bed.commands.executeCommand(UndoCommand.id)).toBe(true);
            expect(bed.manager.getTable('unit', 'sales')!.toJSON()).toEqual(before);
            expect(await bed.commands.executeCommand(RedoCommand.id)).toBe(true);
            expect(bed.manager.getTable('unit', 'sales')!.toJSON()).toEqual(shifted);
        } finally {
            bed.univer.dispose();
        }
    });

    it('removes a worksheet column and restores complete table column metadata through undo', async () => {
        const bed = createTableTestBed();
        try {
            const before = Tools.deepClone(bed.manager.getTable('unit', 'sales')!.toJSON());
            expect(await bed.commands.executeCommand(RemoveColCommand.id, {
                unitId: 'unit',
                subUnitId: 'orders',
                range: { startRow: 0, endRow: 29, startColumn: 6, endColumn: 6 },
            })).toBe(true);
            expect(bed.manager.getTable('unit', 'sales')!.getTableInfo().columns).toEqual(before.columns.filter((column) => column.id !== 'original-6'));
            expect(await bed.commands.executeCommand(UndoCommand.id)).toBe(true);
            expect(bed.manager.getTable('unit', 'sales')!.toJSON()).toEqual(before);
        } finally {
            bed.univer.dispose();
        }
    });

    it.each(['row', 'column'])('restores the complete table after deleting its %s boundary', async (axis) => {
        const bed = createTableTestBed();
        try {
            const before = Tools.deepClone(bed.manager.getTable('unit', 'sales')!.toJSON());
            const commandId = axis === 'row' ? RemoveRowCommand.id : RemoveColCommand.id;
            const range = axis === 'row'
                ? { startRow: 0, endRow: 0, startColumn: 0, endColumn: 19 }
                : { startRow: 0, endRow: 29, startColumn: 0, endColumn: 7 };
            expect(await bed.commands.executeCommand(commandId, { unitId: 'unit', subUnitId: 'orders', range })).toBe(true);
            expect(bed.manager.getTable('unit', 'sales')).toBeUndefined();
            expect(await bed.commands.executeCommand(UndoCommand.id)).toBe(true);
            expect(bed.manager.getTable('unit', 'sales')!.toJSON()).toEqual(before);
            expect(await bed.commands.executeCommand(RedoCommand.id)).toBe(true);
            expect(bed.manager.getTable('unit', 'sales')).toBeUndefined();
            expect(await bed.commands.executeCommand(UndoCommand.id)).toBe(true);
            expect(bed.manager.getTable('unit', 'sales')!.toJSON()).toEqual(before);
            const snapshot = bed.injector.get(IResourceLoaderService).saveUnit<IWorkbookData>('unit')!;
            bed.injector.get(IUniverInstanceService).disposeUnit('unit');
            bed.univer.createUnit(UniverInstanceType.UNIVER_SHEET, JSON.parse(JSON.stringify(snapshot)));
            expect(bed.manager.getTable('unit', 'sales')!.toJSON()).toEqual(before);
        } finally {
            bed.univer.dispose();
        }
    });
});

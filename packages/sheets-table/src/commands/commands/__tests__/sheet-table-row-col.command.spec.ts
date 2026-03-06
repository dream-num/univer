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

import { ICommandService, IUndoRedoService, IUniverInstanceService } from '@univerjs/core';
import { SheetsSelectionsService } from '@univerjs/sheets';

import { describe, expect, it, vi } from 'vitest';
import { SheetsTableController } from '../../../controllers/sheets-table.controller';
import { TableManager } from '../../../model/table-manager';
import {
    SheetTableInsertColCommand,
    SheetTableInsertRowCommand,
    SheetTableRemoveColCommand,
    SheetTableRemoveRowCommand,
} from '../sheet-table-row-col.command';

const sheetsMocks = vi.hoisted(() => ({
    getSheetCommandTarget: vi.fn(),
    getMoveRangeUndoRedoMutations: vi.fn(),
    SheetsSelectionsService: Symbol('SheetsSelectionsService'),
}));

vi.mock('@univerjs/sheets', async () => {
    const actual = await vi.importActual('@univerjs/sheets');
    return {
        ...actual,
        getSheetCommandTarget: sheetsMocks.getSheetCommandTarget,
        getMoveRangeUndoRedoMutations: sheetsMocks.getMoveRangeUndoRedoMutations,
        SheetsSelectionsService: sheetsMocks.SheetsSelectionsService,
    };
});

function createAccessor(pairs: Array<[unknown, unknown]>) {
    const map = new Map<unknown, unknown>(pairs);
    return {
        get(token: unknown) {
            if (!map.has(token)) {
                throw new Error(`Unknown token: ${String(token)}`);
            }
            return map.get(token);
        },
    } as any;
}

describe('sheet-table-row-col commands', () => {
    it('insert commands should return false when there is no sheet target', () => {
        sheetsMocks.getSheetCommandTarget.mockReturnValue(null);

        const accessor = createAccessor([
            [IUniverInstanceService, {}],
        ]);

        expect(SheetTableInsertRowCommand.handler(accessor)).toBe(false);
        expect(SheetTableInsertColCommand.handler(accessor)).toBe(false);
    });

    it('remove commands should return false for invalid params', () => {
        const accessor = createAccessor([
            [IUniverInstanceService, {}],
        ]);

        expect(SheetTableRemoveRowCommand.handler(accessor, undefined as any)).toBe(false);
        expect(SheetTableRemoveColCommand.handler(accessor, undefined as any)).toBe(false);
    });

    it('commands should stop when current selection is invalid or table is missing', () => {
        sheetsMocks.getSheetCommandTarget.mockReturnValue({
            unitId: 'u1',
            subUnitId: 's1',
            worksheet: {
                getRowCount: () => 100,
                getColumnCount: () => 100,
                getCellMatrix: () => ({ getDataRange: () => ({ endRow: 10, endColumn: 10 }) }),
            },
            workbook: {},
        });

        const accessor = createAccessor([
            [IUniverInstanceService, {}],
            [SheetsSelectionsService, { getCurrentSelections: () => [] }],
            [SheetsTableController, { getContainerTableWithRange: () => null }],
            [TableManager, {}],
            [ICommandService, { syncExecuteCommand: vi.fn(() => true) }],
            [IUndoRedoService, { pushUndoRedo: vi.fn() }],
        ]);

        expect(SheetTableInsertRowCommand.handler(accessor)).toBe(false);
        expect(SheetTableInsertColCommand.handler(accessor)).toBe(false);

        expect(SheetTableRemoveRowCommand.handler(accessor, { unitId: 'u1', subUnitId: 's1', tableId: 't1' } as any)).toBe(false);
        expect(SheetTableRemoveColCommand.handler(accessor, { unitId: 'u1', subUnitId: 's1', tableId: 't1' } as any)).toBe(false);
    });
});

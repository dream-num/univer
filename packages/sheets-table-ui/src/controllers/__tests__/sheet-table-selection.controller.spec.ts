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

import { SetSelectionsOperation } from '@univerjs/sheets';
import { SelectAllCommand } from '@univerjs/sheets-ui';
import { describe, expect, it, vi } from 'vitest';
import { SheetTableSelectionController } from '../sheet-table-selection.controller';

describe('SheetTableSelectionController', () => {
    it('should toggle select-all behavior between table body and table with header', () => {
        let interceptCommandConfig: any;

        const tableRange = { startRow: 2, endRow: 5, startColumn: 1, endColumn: 3 };
        const table = {
            getRange: () => tableRange,
        };

        const worksheet = {
            getSheetId: () => 's1',
            getMergedCell: () => null,
        };

        const workbook = {
            getUnitId: () => 'u1',
            getActiveSheet: () => worksheet,
        };

        const controller = new SheetTableSelectionController(
            {
                interceptCommand: vi.fn((config: any) => {
                    interceptCommandConfig = config;
                    return { dispose: vi.fn() };
                }),
            } as any,
            {
                getCurrentUnitOfType: () => workbook,
            } as any,
            {
                getTablesBySubunitId: () => [table],
            } as any
        );

        const selectWholeTable = interceptCommandConfig.getMutations({
            id: SelectAllCommand.id,
            params: { range: tableRange },
        });
        expect(selectWholeTable).toEqual({ redos: [], undos: [] });

        const tableBodyRange = { ...tableRange, startRow: tableRange.startRow + 1 };
        const selectBodyThenExpandToHeader = interceptCommandConfig.getMutations({
            id: SelectAllCommand.id,
            params: { range: tableBodyRange },
        });

        expect(selectBodyThenExpandToHeader.redos).toHaveLength(1);
        expect(selectBodyThenExpandToHeader.redos[0]).toEqual({
            id: SetSelectionsOperation.id,
            params: expect.objectContaining({
                unitId: 'u1',
                subUnitId: 's1',
                selections: [expect.objectContaining({ range: tableRange })],
            }),
        });

        const randomRange = { startRow: 3, endRow: 3, startColumn: 1, endColumn: 2 };
        const selectRandomThenBody = interceptCommandConfig.getMutations({
            id: SelectAllCommand.id,
            params: { range: randomRange },
        });
        expect(selectRandomThenBody.redos).toHaveLength(1);
        expect(selectRandomThenBody.redos[0]).toEqual({
            id: SetSelectionsOperation.id,
            params: expect.objectContaining({
                selections: [expect.objectContaining({ range: tableBodyRange })],
            }),
        });

        controller.dispose();
    });
});

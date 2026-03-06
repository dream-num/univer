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

import { InsertRowMutation } from '@univerjs/sheets';
import { describe, expect, it, vi } from 'vitest';
import { SheetTableRefRangeController } from '../sheet-table-ref-range.controller';

describe('SheetTableRefRangeController', () => {
    it('should return empty mutations for unsupported commands and update table range after row insertion', () => {
        let interceptCommandConfig: any;
        let commandExecutedListener: any;

        const table = {
            getId: () => 't1',
            getRange: () => ({ startRow: 5, endRow: 10, startColumn: 1, endColumn: 3 }),
        };

        const tableManager = {
            getTablesBySubunitId: vi.fn(() => [table]),
            updateTableRange: vi.fn(),
        };

        const controller = new SheetTableRefRangeController(
            {
                onCommandExecuted: vi.fn((listener: any) => {
                    commandExecutedListener = listener;
                    return { dispose: vi.fn() };
                }),
            } as any,
            {} as any,
            {} as any,
            {} as any,
            {
                interceptCommand: vi.fn((config: any) => {
                    interceptCommandConfig = config;
                    return { dispose: vi.fn() };
                }),
            } as any,
            tableManager as any,
            { t: () => 'Column' } as any
        );

        expect(interceptCommandConfig.getMutations({ id: 'unknown.command', params: {} })).toEqual({ redos: [], undos: [] });

        commandExecutedListener({
            id: InsertRowMutation.id,
            params: {
                unitId: 'u1',
                subUnitId: 's1',
                range: { startRow: 1, endRow: 2, startColumn: 0, endColumn: 10 },
            },
        });

        expect(tableManager.updateTableRange).toHaveBeenCalledWith('u1', 't1', {
            newRange: {
                startRow: 7,
                endRow: 12,
                startColumn: 1,
                endColumn: 3,
            },
        });

        controller.dispose();
    });
});

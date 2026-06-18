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

import type { ICellValueCompareFn } from '../../commands/commands/sheets-sort.command';
import { ICommandService, Injector, IUniverInstanceService } from '@univerjs/core';
import { FormulaDataModel } from '@univerjs/engine-formula';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SortRangeCommand } from '../../commands/commands/sheets-sort.command';
import { SheetsSortService } from '../sheets-sort.service';

describe('SheetsSortService', () => {
    let service: SheetsSortService;
    let sheet: any;
    let arrayFormulaRange: any;
    let executeCommand: ReturnType<typeof vi.fn>;

    beforeEach(() => {
        const injector = new Injector();
        sheet = {
            getSheetId: () => 'sheet-1',
            getMergeData: () => [],
            getCellRaw: () => null,
        };
        arrayFormulaRange = {};
        executeCommand = vi.fn(async () => true);

        const workbook = {
            getUnitId: () => 'book-1',
            getSheetBySheetId: (sheetId: string) => (sheetId === 'sheet-1' ? sheet : null),
            getActiveSheet: () => sheet,
        };

        class TestUniverInstanceService {
            getUnit = (unitId: string) => (unitId === 'book-1' ? workbook : null);
            getCurrentUnitOfType = () => workbook;
        }

        class TestCommandService {
            executeCommand = executeCommand;
        }

        class TestFormulaDataModel {
            getArrayFormulaRange = () => arrayFormulaRange;
        }

        injector.add([IUniverInstanceService, { useClass: TestUniverInstanceService as never }]);
        injector.add([ICommandService, { useClass: TestCommandService as never }]);
        injector.add([FormulaDataModel, { useClass: TestFormulaDataModel as never }]);
        injector.add([SheetsSortService]);
        service = injector.get(SheetsSortService);
    });

    it('requires multi-row ranges for sort actions', () => {
        expect(service.singleCheck({ unitId: 'book-1', subUnitId: 'sheet-1', range: { startRow: 2, endRow: 2, startColumn: 0, endColumn: 2 } })).toBe(false);
        expect(service.singleCheck({ unitId: 'book-1', subUnitId: 'sheet-1', range: { startRow: 2, endRow: 4, startColumn: 0, endColumn: 2 } })).toBe(true);
    });

    it('uses the most recently registered comparator first', () => {
        const first: ICellValueCompareFn = () => 1;
        const second: ICellValueCompareFn = () => -1;

        service.registerCompareFn(first);
        service.registerCompareFn(second);

        expect(service.getAllCompareFns()).toEqual([second, first]);
    });

    it('validates sort ranges against merge layout and non-empty cells', () => {
        const location = { unitId: 'book-1', subUnitId: 'sheet-1', range: { startRow: 0, endRow: 1, startColumn: 0, endColumn: 1 } };

        expect(service.mergeCheck(location)).toBe(true);
        sheet.getMergeData = () => [{ startRow: 0, endRow: 1, startColumn: 0, endColumn: 1 }];
        expect(service.mergeCheck(location)).toBe(true);
        sheet.getMergeData = () => [
            { startRow: 0, endRow: 0, startColumn: 0, endColumn: 0 },
            { startRow: 1, endRow: 1, startColumn: 1, endColumn: 1 },
        ];
        expect(service.mergeCheck(location)).toBe(false);

        sheet.getCellRaw = (row: number, col: number) => (row === 1 && col === 1 ? { v: 'value' } : null);
        expect(service.emptyCheck(location)).toBe(true);
        sheet.getCellRaw = () => null;
        expect(service.emptyCheck(location)).toBe(false);

        expect(service.mergeCheck({ ...location, unitId: 'missing' })).toBe(false);
        expect(service.emptyCheck({ ...location, unitId: 'missing' })).toBe(false);
    });

    it('rejects sort ranges that intersect array formulas', () => {
        const location = { unitId: 'book-1', subUnitId: 'sheet-1', range: { startRow: 0, endRow: 2, startColumn: 0, endColumn: 2 } };

        expect(service.formulaCheck(location)).toBe(true);

        arrayFormulaRange = {
            'book-1': {
                'sheet-1': {
                    1: {
                        1: { startRow: 1, endRow: 3, startColumn: 1, endColumn: 3 },
                    },
                },
            },
        };
        expect(service.formulaCheck(location)).toBe(false);
    });

    it('applies sort options through the command service with explicit or active sheet targets', async () => {
        service.applySort({
            range: { startRow: 0, endRow: 3, startColumn: 0, endColumn: 2 },
            orderRules: [{ colIndex: 1, type: 'asc' }] as never,
            hasTitle: true,
        });
        service.applySort({
            range: { startRow: 0, endRow: 3, startColumn: 0, endColumn: 2 },
            orderRules: [] as never,
        }, 'book-2', 'sheet-2');

        expect(executeCommand).toHaveBeenNthCalledWith(1, SortRangeCommand.id, {
            range: { startRow: 0, endRow: 3, startColumn: 0, endColumn: 2 },
            orderRules: [{ colIndex: 1, type: 'asc' }],
            hasTitle: true,
            unitId: 'book-1',
            subUnitId: 'sheet-1',
        });
        expect(executeCommand).toHaveBeenNthCalledWith(2, SortRangeCommand.id, {
            range: { startRow: 0, endRow: 3, startColumn: 0, endColumn: 2 },
            orderRules: [],
            hasTitle: false,
            unitId: 'book-2',
            subUnitId: 'sheet-2',
        });
    });
});

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

import { Injector, IUniverInstanceService } from '@univerjs/core';
import { IActiveDirtyManagerService, ISheetRowFilteredService } from '@univerjs/engine-formula';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SheetsFilterFormulaService } from '../sheet-filter-formula.service';
import { SheetsFilterService } from '../sheet-filter.service';

describe('SheetsFilterFormulaService', () => {
    let dirtyConverters: Map<string, { getDirtyData: (commandInfo: unknown) => unknown }>;
    let rowFilteredCallback: ((unitId: string, subUnitId: string, row: number) => boolean) | undefined;

    beforeEach(() => {
        dirtyConverters = new Map();
        class TestActiveDirtyManagerService {
            register = (commandId: string, converter: never) => dirtyConverters.set(commandId, converter);
        }

        class TestSheetRowFilteredService {
            register = (callback: never) => (rowFilteredCallback = callback);
        }

        class TestSheetsFilterService {
            getFilterModel = vi.fn(() => ({ getRange: () => ({ startRow: 2, endRow: 5 }), isRowFiltered: (row: number) => row === 3 }));
        }

        class TestUniverInstanceService {
            getUnit = () => ({ getSheetBySheetId: () => ({ getColumnCount: () => 10 }) });
        }

        const injector = new Injector();
        injector.add([IActiveDirtyManagerService, { useClass: TestActiveDirtyManagerService as never }]);
        injector.add([ISheetRowFilteredService, { useClass: TestSheetRowFilteredService as never }]);
        injector.add([SheetsFilterService, { useClass: TestSheetsFilterService as never }]);
        injector.add([IUniverInstanceService, { useClass: TestUniverInstanceService as never }]);
        injector.add([SheetsFilterFormulaService]);
        injector.get(SheetsFilterFormulaService);
    });

    it('marks the filtered row span dirty for formula recalculation', () => {
        const converter = [...dirtyConverters.values()][0];

        expect(converter.getDirtyData({ params: { unitId: 'book-1', subUnitId: 'sheet-1' } })).toEqual({
            dirtyRanges: [{
                unitId: 'book-1',
                sheetId: 'sheet-1',
                range: { startRow: 2, startColumn: 0, endRow: 5, endColumn: 9 },
            }],
            clearDependencyTreeCache: { 'book-1': { 'sheet-1': '1' } },
        });
    });

    it('registers formula row-filter lookups against the active sheet filter model', () => {
        expect(rowFilteredCallback?.('book-1', 'sheet-1', 3)).toBe(true);
        expect(rowFilteredCallback?.('book-1', 'sheet-1', 4)).toBe(false);
    });
});

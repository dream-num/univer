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
import { beforeEach, describe, expect, it } from 'vitest';
import { SheetsSortService } from '../sheets-sort.service';

describe('SheetsSortService', () => {
    let service: SheetsSortService;

    beforeEach(() => {
        const injector = new Injector();
        injector.add([IUniverInstanceService, { useValue: {} as IUniverInstanceService }]);
        injector.add([ICommandService, { useValue: { executeCommand: async () => true } as unknown as ICommandService }]);
        injector.add([FormulaDataModel, { useValue: { getArrayFormulaRange: () => ({}) } as unknown as FormulaDataModel }]);
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
});

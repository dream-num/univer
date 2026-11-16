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

import type { ICellData, ICommandService, Nullable } from '@univerjs/core';
import { CellValueType } from '@univerjs/core';
import { describe, expect, it } from 'vitest';
import type { ICellValueCompareFn } from '../../commands/commands/sheets-sort.command';
import type { SheetsSortService } from '../../services/sheets-sort.service';
import { SortType } from '../../services/interface';
import { SheetsSortController } from '../sheets-sort.controller';

function registeredCompareFn(): ICellValueCompareFn {
    let compareFn: ICellValueCompareFn | undefined;
    const commandService = { registerCommand: () => ({ dispose: () => {} }) } as unknown as ICommandService;
    const sortService = {
        registerCompareFn: (fn: ICellValueCompareFn) => {
            compareFn = fn;
        },
    } as unknown as SheetsSortService;
    const controller = new SheetsSortController(commandService, sortService);
    controller.dispose();
    return compareFn!;
}

const sort = (cells: Nullable<ICellData>[], type: SortType) => {
    const compare = registeredCompareFn();
    return [...cells].sort((a, b) => compare(type, a, b) ?? 0).map((cell) => cell?.v);
};

const cells: Nullable<ICellData>[] = [
    { v: 'zoe', t: CellValueType.STRING },
    { v: 1, t: CellValueType.BOOLEAN },
    { v: 0, t: CellValueType.BOOLEAN },
    { v: '#N/A', t: CellValueType.STRING },
    { v: 10, t: CellValueType.NUMBER },
    { v: 'apple', t: CellValueType.STRING },
    null,
];

describe('SheetsSortController compare function', () => {
    it('orders number, text, logical, error, blank groups ascending and descending', () => {
        expect(sort(cells, SortType.ASC)).toEqual([10, 'apple', 'zoe', 0, 1, '#N/A', undefined]);
        expect(sort(cells, SortType.DESC)).toEqual(['#N/A', 1, 0, 'zoe', 'apple', 10, undefined]);
    });

    it('distinguishes literal forced error text from formula errors', () => {
        expect(sort([{ v: '#N/A', t: CellValueType.STRING }, { v: '#N/A', t: CellValueType.FORCE_STRING }, { v: 'apple', t: CellValueType.STRING }], SortType.ASC)).toEqual(['#N/A', 'apple', '#N/A']);
    });

    it('preserves numeric forced text and compares both logical encodings', () => {
        expect(sort([{ v: true, t: CellValueType.BOOLEAN }, { v: 'false', t: CellValueType.BOOLEAN }, { v: '002', t: CellValueType.FORCE_STRING }, { v: 1, t: CellValueType.NUMBER }], SortType.ASC)).toEqual([1, '002', 'false', true]);
    });
});

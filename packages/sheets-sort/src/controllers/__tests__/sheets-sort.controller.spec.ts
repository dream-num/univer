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

const registeredCompareFn = (): ICellValueCompareFn => {
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
};

const sortedValues = (cells: Nullable<ICellData>[], type = SortType.ASC) => {
    const compare = registeredCompareFn();
    return [...cells].sort((a, b) => compare(type, a, b) ?? 0).map((cell) => cell?.v);
};

describe('SheetsSortController compare function', () => {
    const numbers = [5, 1, 3].map((v) => ({ v, t: CellValueType.NUMBER }));

    it('sorts numbers around forced text that is not a number', () => {
        const forced = { v: 'n/a', t: CellValueType.FORCE_STRING };
        expect(sortedValues([...numbers, forced])).toEqual([1, 3, 5, 'n/a']);
        expect(sortedValues([forced, ...numbers].reverse())).toEqual([1, 3, 5, 'n/a']);
        expect(sortedValues([numbers[0], forced, numbers[1], numbers[2]])).toEqual([1, 3, 5, 'n/a']);
    });

    it('still sorts forced numeric text as a number', () => {
        expect(sortedValues([...numbers, { v: '002', t: CellValueType.FORCE_STRING }])).toEqual([1, '002', 3, 5]);
    });
});

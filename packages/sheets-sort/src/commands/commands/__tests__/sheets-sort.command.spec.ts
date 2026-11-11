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

import { ICommandService } from '@univerjs/core';
import { ReorderRangeCommand, ReorderRangeMutation, SetSelectionsOperation } from '@univerjs/sheets';
import { expect, it } from 'vitest';
import { SortType } from '../../../services/interface';
import { SheetsSortService } from '../../../services/sheets-sort.service';
import { SortRangeCommand } from '../sheets-sort.command';
import { createCommandTestBed } from './create-command-test-bed';

it('blocks local sorting while allowing resolved reorder mutations and sorting after release', () => {
    const { get, sheet, univer } = createCommandTestBed();
    try {
        const commands = get(ICommandService);
        commands.registerCommand(SetSelectionsOperation);
        commands.registerCommand(ReorderRangeCommand);
        commands.registerCommand(ReorderRangeMutation);
        const location = {
            unitId: 'test',
            subUnitId: 'sheet1',
            range: { startRow: 0, endRow: 1, startColumn: 0, endColumn: 0 },
        };
        const sort = { ...location, hasTitle: false, orderRules: [{ colIndex: 0, type: SortType.DESC }] };
        const worksheet = sheet.getActiveSheet()!;
        const guard = get(SheetsSortService).registerSortGuard(({ unitId, subUnitId }) =>
            unitId !== location.unitId || subUnitId !== location.subUnitId
        );
        expect(commands.syncExecuteCommand(SortRangeCommand.id, sort)).toBe(false);
        expect(worksheet.getCellRaw(0, 0)?.v).toBe(1);

        expect(commands.syncExecuteCommand(ReorderRangeMutation.id, { ...location, order: { 0: 1, 1: 0 } }, { fromChangeset: true })).toBe(true);
        expect(worksheet.getCellRaw(0, 0)?.v).toBe(2);
        guard.dispose();

        expect(commands.syncExecuteCommand(SortRangeCommand.id, { ...sort, orderRules: [{ colIndex: 0, type: SortType.ASC }] })).toBe(true);
        expect(worksheet.getCellRaw(0, 0)?.v).toBe(1);
    } finally {
        univer.dispose();
    }
});

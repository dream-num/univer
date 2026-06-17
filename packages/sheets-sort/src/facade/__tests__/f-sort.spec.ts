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

import type { ICellData, Injector, Nullable, Univer, Workbook } from '@univerjs/core';
import { ICommandService, IUniverInstanceService } from '@univerjs/core';
import { FUniver } from '@univerjs/core/facade';
import { DefinedNamesService, IDefinedNamesService } from '@univerjs/engine-formula';
import { ReorderRangeCommand, ReorderRangeMutation, SetSelectionsOperation } from '@univerjs/sheets';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createCommandTestBed } from '../../commands/commands/__tests__/create-command-test-bed';
import '@univerjs/sheets/facade';
import '@univerjs/sheets-sort/facade';

describe('sheets-sort facade', () => {
    let univer: Univer;
    let get: Injector['get'];
    let univerAPI: FUniver;
    let getData: (row: number, col: number) => Nullable<ICellData>;

    beforeEach(() => {
        const testBed = createCommandTestBed(undefined, [
            [IDefinedNamesService, { useClass: DefinedNamesService }],
        ]);
        univer = testBed.univer;
        get = testBed.get;

        const commandService = get(ICommandService);
        commandService.registerCommand(SetSelectionsOperation);
        commandService.registerCommand(ReorderRangeMutation);
        commandService.registerCommand(ReorderRangeCommand);

        const workbook = get(IUniverInstanceService).getUnit<Workbook>('test')!;
        const worksheet = workbook.getSheetBySheetId('sheet1')!;
        getData = (row: number, col: number) => worksheet.getCellMatrix().getValue(row, col) ?? undefined;
        univerAPI = FUniver.newAPI(univer.__getInjector());
    });

    afterEach(() => {
        univer.dispose();
    });

    it('sorts a selected range by a facade column spec relative to the range', () => {
        const worksheet = univerAPI.getActiveWorkbook()!.getActiveSheet();

        worksheet.getRange('A1:C6').sort({ column: 1, ascending: true });

        expect(getData(0, 0)?.v).toBe(6);
        expect(getData(0, 1)?.v).toBe(15);
        expect(getData(5, 0)?.v).toBe(1);
        expect(getData(5, 1)?.v).toBe(20);
    });

    it('sorts the whole worksheet and emits before/after sort events with user-facing columns', () => {
        const events: Array<{ phase: string; column: number; ascending: boolean }> = [];
        const beforeDisposable = univerAPI.addEvent(univerAPI.Event.SheetBeforeRangeSort, (params) => {
            events.push({
                phase: 'before',
                column: params.sortColumn[0].column,
                ascending: params.sortColumn[0].ascending,
            });
        });
        const afterDisposable = univerAPI.addEvent(univerAPI.Event.SheetRangeSorted, (params) => {
            events.push({
                phase: 'after',
                column: params.sortColumn[0].column,
                ascending: params.sortColumn[0].ascending,
            });
        });

        univerAPI.getActiveWorkbook()!.getActiveSheet().sort(0, false);

        expect(getData(0, 0)?.v).toBe(6);
        expect(events).toEqual([
            { phase: 'before', column: 0, ascending: false },
            { phase: 'after', column: 0, ascending: false },
        ]);

        beforeDisposable.dispose();
        afterDisposable.dispose();
    });
});

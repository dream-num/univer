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

import type { Injector, IWorkbookData, Univer, Workbook } from '@univerjs/core';
import { ICommandService, IUniverInstanceService, LocaleType, RegionService } from '@univerjs/core';
import { ReorderRangeCommand, ReorderRangeMutation, SetSelectionsOperation } from '@univerjs/sheets';
import { afterEach, describe, expect, it } from 'vitest';
import type { ISortRangeCommandParams } from '../sheets-sort.command';
import { SortType } from '../../../services/interface';
import { SortRangeCommand } from '../sheets-sort.command';
import { createCommandTestBed } from './create-command-test-bed';

function workbookWithColumn(values: string[]): IWorkbookData {
    return {
        id: 'test',
        appVersion: '3.0.0-alpha',
        sheets: {
            sheet1: {
                id: 'sheet1',
                name: 'sheet1',
                cellData: Object.fromEntries(values.map((v, row) => [row, { 0: { v } }])),
            },
        },
        locale: LocaleType.EN_US,
        name: '',
        sheetOrder: ['sheet1'],
        styles: {},
    };
}

describe('Test "Sort Range Commands" on text', () => {
    let univer: Univer;
    let get: Injector['get'];

    afterEach(() => univer.dispose());

    async function sortColumn(values: string[], type: SortType, region: LocaleType): Promise<string[]> {
        const testBed = createCommandTestBed(workbookWithColumn(values));
        univer = testBed.univer;
        get = testBed.get;

        const commandService = get(ICommandService);
        commandService.registerCommand(SetSelectionsOperation);
        commandService.registerCommand(ReorderRangeMutation);
        commandService.registerCommand(ReorderRangeCommand);
        get(RegionService).setRegion(region);

        const params: ISortRangeCommandParams = {
            unitId: 'test',
            subUnitId: 'sheet1',
            hasTitle: false,
            orderRules: [{ colIndex: 0, type }],
            range: { startRow: 0, endRow: values.length - 1, startColumn: 0, endColumn: 0 },
        };
        expect(await commandService.executeCommand(SortRangeCommand.id, params)).toBeTruthy();

        const worksheet = (get(IUniverInstanceService).getUnit('test') as Workbook).getSheetBySheetId('sheet1')!;
        return values.map((_, row) => `${worksheet.getCellMatrix().getValue(row, 0)?.v}`);
    }

    it('sorts digits before punctuation before letters, and accented letters beside their base letter', async () => {
        const values = ['A_', 'Ábaco', 'A0', 'Zeta', 'abeja', 'A b'];

        expect(await sortColumn(values, SortType.ASC, LocaleType.EN_US)).toEqual(['A0', 'A b', 'A_', 'Ábaco', 'abeja', 'Zeta']);
        univer.dispose();
        expect(await sortColumn(values, SortType.DESC, LocaleType.EN_US)).toEqual(['Zeta', 'abeja', 'Ábaco', 'A_', 'A b', 'A0']);
    });

    it('collates text for the configured region rather than the host locale', async () => {
        const values = ['oso', 'ñu', 'nube'];

        // Spanish sorts ñ as its own letter after n; English sorts it as an accented n.
        expect(await sortColumn(values, SortType.ASC, LocaleType.ES_ES)).toEqual(['nube', 'ñu', 'oso']);
        univer.dispose();
        expect(await sortColumn(values, SortType.ASC, LocaleType.EN_US)).toEqual(['ñu', 'nube', 'oso']);
    });
});

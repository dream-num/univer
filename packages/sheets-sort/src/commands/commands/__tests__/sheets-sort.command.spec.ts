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

import type { ICellData, Workbook } from '@univerjs/core';
import { CellValueType, ICommandService, IUniverInstanceService, LocaleType, RegionService } from '@univerjs/core';
import { ReorderRangeCommand, ReorderRangeMutation, SetSelectionsOperation } from '@univerjs/sheets';
import { describe, expect, it } from 'vitest';
import type { IOrderRule } from '../../../services/interface';
import type { ISortRangeCommandParams } from '../sheets-sort.command';
import { SortType } from '../../../services/interface';
import { SheetsSortService } from '../../../services/sheets-sort.service';
import { SortRangeCommand } from '../sheets-sort.command';
import { createCommandTestBed } from './create-command-test-bed';

interface ISortFixture {
    cells: Array<ICellData | null>;
    secondary?: number[];
    region?: LocaleType;
}

/**
 * Sort the fixture's rows by column B and return the original row index of every row in the
 * resulting order, which makes the row identity of the reorder visible.
 */
async function sortRows(fixture: ISortFixture, type: SortType, secondaryType?: SortType) {
    const { univer, get } = createCommandTestBed();
    try {
        const commands = get(ICommandService);
        commands.registerCommand(SetSelectionsOperation);
        commands.registerCommand(ReorderRangeMutation);
        commands.registerCommand(ReorderRangeCommand);
        if (fixture.region) {
            get(RegionService).setRegion(fixture.region);
        }

        const workbook = get(IUniverInstanceService).getUnit('test') as Workbook;
        const worksheet = workbook.getSheetBySheetId('sheet1')!;
        const matrix = worksheet.getCellMatrix();
        fixture.cells.forEach((value, row) => {
            matrix.setValue(row, 0, { v: row, t: CellValueType.NUMBER });
            matrix.setValue(row, 1, value ?? {});
            matrix.setValue(row, 2, { v: fixture.secondary?.[row] ?? 0, t: CellValueType.NUMBER });
        });

        const orderRules: IOrderRule[] = [{ colIndex: 1, type }];
        if (secondaryType) {
            orderRules.push({ colIndex: 2, type: secondaryType });
        }

        const params: ISortRangeCommandParams = {
            unitId: 'test',
            subUnitId: 'sheet1',
            hasTitle: false,
            range: { startRow: 0, endRow: fixture.cells.length - 1, startColumn: 0, endColumn: 2 },
            orderRules,
        };
        expect(await commands.executeCommand(SortRangeCommand.id, params)).toBeTruthy();

        return fixture.cells.map((_, row) => matrix.getValue(row, 0)?.v);
    } finally {
        univer.dispose();
    }
}

describe('SortRangeCommand with text', () => {
    async function sortText(values: string[], type: SortType, region: LocaleType) {
        const rows = await sortRows({ cells: values.map((v) => ({ v })), region }, type);
        return rows.map((row) => values[Number(row)]);
    }

    it('sorts punctuation before digits and accented letters beside their base letter', async () => {
        const values = ['A_', 'Ábaco', 'A0', 'Zeta', 'abeja', 'A b', 'A!', 'A.'];
        const ascending = ['A b', 'A!', 'A.', 'A_', 'A0', 'Ábaco', 'abeja', 'Zeta'];

        expect(await sortText(values, SortType.ASC, LocaleType.ZH_CN)).toEqual(ascending);
        expect(await sortText(values, SortType.DESC, LocaleType.ZH_CN)).toEqual(ascending.reverse());
    });

    it('uses word punctuation to break ties after comparing letters and accents', async () => {
        const values = ['á-ba', 'abá', 'aba', 'a-ba', 'a-bá', 'ab-a', "a'ba"];
        const ascending = ['aba', 'ab-a', "a'ba", 'a-ba', 'abá', 'a-bá', 'á-ba'];

        expect(await sortText(values, SortType.ASC, LocaleType.ZH_CN)).toEqual(ascending);
        expect(await sortText(values, SortType.DESC, LocaleType.ZH_CN)).toEqual(ascending.reverse());
    });

    it('keeps canonically equivalent spellings tied when comparing word punctuation', async () => {
        const composed = 'café-';
        const decomposed = 'cafe\u0301-';
        const values = [composed, decomposed, 'café'];

        expect(await sortText(values, SortType.ASC, LocaleType.ZH_CN)).toEqual(['café', composed, decomposed]);
        expect(await sortText(values, SortType.DESC, LocaleType.ZH_CN)).toEqual([composed, decomposed, 'café']);
    });

    it('preserves spaces and the input order of case-equivalent English text', async () => {
        const values = ['ann Lee', 'ANNE MARIE', 'Ann', '  ann', 'Ann  Lee', 'ann', 'Anne Marie', 'Ann '];

        expect(await sortText(values, SortType.ASC, LocaleType.EN_US))
            .toEqual(['  ann', 'Ann', 'ann', 'Ann ', 'Ann  Lee', 'ann Lee', 'ANNE MARIE', 'Anne Marie']);
    });

    it('collates text for the configured region', async () => {
        const values = ['oso', 'ñu', 'nube'];

        expect(await sortText(values, SortType.ASC, LocaleType.ES_ES)).toEqual(['nube', 'ñu', 'oso']);
        expect(await sortText(values, SortType.ASC, LocaleType.EN_US)).toEqual(['ñu', 'nube', 'oso']);
        expect(await sortText(['北京', '上海', '广州'], SortType.ASC, LocaleType.ZH_CN)).toEqual(['北京', '广州', '上海']);
    });
});

describe('SortRangeCommand with mixed cell types', () => {
    const mixed: Array<ICellData | null> = [
        { v: 'zoe', t: CellValueType.STRING },
        { v: 1, t: CellValueType.BOOLEAN },
        { v: 0, t: CellValueType.BOOLEAN },
        { v: '#N/A', t: CellValueType.STRING },
        { v: 10, t: CellValueType.NUMBER },
        { v: 'apple', t: CellValueType.STRING },
        null,
    ];

    it('orders numbers, text, logical values, errors, and blanks like Excel', async () => {
        expect(await sortRows({ cells: mixed }, SortType.ASC)).toEqual([4, 5, 0, 2, 1, 3, 6]);
        expect(await sortRows({ cells: mixed }, SortType.DESC)).toEqual([3, 1, 2, 0, 5, 4, 6]);
    });

    it('sorts every Boolean encoding in the logical group', async () => {
        const booleans: Array<ICellData | null> = [
            { v: 'TRUE', t: CellValueType.BOOLEAN },
            { v: 0, t: CellValueType.BOOLEAN },
            { v: true, t: CellValueType.BOOLEAN },
            { v: 'false', t: CellValueType.BOOLEAN },
            { v: '1', t: CellValueType.BOOLEAN },
        ];

        expect(await sortRows({ cells: booleans }, SortType.ASC)).toEqual([1, 3, 0, 2, 4]);
        expect(await sortRows({ cells: booleans }, SortType.DESC)).toEqual([0, 2, 4, 1, 3]);
    });

    it('orders numeric keys and breaks numeric ties with the secondary key', async () => {
        const cells = [
            { v: '10.0', t: CellValueType.NUMBER },
            { v: 2, t: CellValueType.NUMBER },
            { v: 10, t: CellValueType.NUMBER },
        ];

        expect(await sortRows({ cells, secondary: [2, 0, 1] }, SortType.ASC, SortType.ASC)).toEqual([1, 2, 0]);
        expect(await sortRows({ cells, secondary: [2, 0, 1] }, SortType.DESC, SortType.DESC)).toEqual([0, 2, 1]);
    });

    it('uses the secondary key rather than the error token for distinct errors', async () => {
        const errors: Array<ICellData | null> = [
            { v: '#N/A', t: CellValueType.STRING },
            { v: '#DIV/0!', t: CellValueType.STRING },
            { v: 10, t: CellValueType.NUMBER },
            null,
        ];

        expect(await sortRows({ cells: errors, secondary: [2, 1, 0, 0] }, SortType.ASC, SortType.ASC))
            .toEqual([2, 1, 0, 3]);
    });

    it('keeps error-looking text and numbers stored as text in the text group', async () => {
        const cells: Array<ICellData | null> = [
            { v: '#N/A', t: CellValueType.STRING },
            { v: '#N/A', t: CellValueType.FORCE_STRING },
            { v: 'apple', t: CellValueType.STRING },
            { v: 10, t: CellValueType.NUMBER },
            { v: '9', t: CellValueType.FORCE_STRING },
            { v: '10', t: CellValueType.FORCE_STRING },
        ];

        // Numbers stored as text sort as text, not as numbers: '10' comes before '9'.
        expect(await sortRows({ cells }, SortType.ASC)).toEqual([3, 1, 5, 4, 2, 0]);
    });

    it('falls back to the value kind of cells without a type', async () => {
        const cells: Array<ICellData | null> = [
            { v: 10 },
            { v: 2 },
            { v: '002', t: CellValueType.FORCE_STRING },
            { v: 'apple', t: CellValueType.STRING },
            { v: true },
        ];

        expect(await sortRows({ cells }, SortType.ASC)).toEqual([1, 0, 2, 3, 4]);
    });
});

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

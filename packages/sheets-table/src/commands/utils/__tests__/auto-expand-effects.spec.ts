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

import type { Injector, IWorkbookData, Workbook } from '@univerjs/core';
import type { ISheetValueChangeContext } from '@univerjs/sheets';
import { LocaleType, Univer, UniverInstanceType } from '@univerjs/core';
import { LexerTreeBuilder } from '@univerjs/engine-formula';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { Table } from '../../../models/table';
import { getTableAutoExpandFormulaEffects } from '../auto-expand-effects';

const oldRange = { startRow: 2, endRow: 5, startColumn: 2, endColumn: 4 };
const candidate = { tableId: 'table', direction: 'row' as const, oldRange, newRange: { ...oldRange, endRow: 6 }, addedRanges: [{ ...oldRange, startRow: 6, endRow: 6 }] };

describe('Table auto expansion formula effects', () => {
    let univer: Univer;
    let workbook: Workbook;
    let injector: Injector;
    let table: Table;
    let context: ISheetValueChangeContext;

    beforeEach(() => {
        univer = new Univer();
        injector = univer.__getInjector();
        injector.add([LexerTreeBuilder]);
        workbook = univer.createUnit<IWorkbookData, Workbook>(UniverInstanceType.UNIVER_SHEET, {
            id: 'book',
            name: 'Formula',
            appVersion: '1',
            locale: LocaleType.EN_US,
            styles: {},
            sheetOrder: ['sheet'],
            sheets: { sheet: { id: 'sheet', name: 'Sheet', rowCount: 20, columnCount: 15, cellData: {
                3: { 3: { v: 1 }, 4: { f: '=D4*10+$A$1' } },
                4: { 3: { v: 2 }, 4: { f: '=D5*10+$A$1' } },
                5: { 3: { v: 3 }, 4: { f: '=D6*10+$A$1' } },
            } } },
        });
        table = new Table('table', 'Orders', oldRange, ['Item', 'Qty', 'Total']);
        context = { unitId: 'book', subUnitId: 'sheet', source: 'paste', ranges: [candidate.addedRanges[0]], contentWrites: { 6: { 2: { v: 'Input' } } }, beforeCells: { 6: { 2: null } }, explicitStyleRanges: [], explicitValidationRanges: [] };
    });

    afterEach(() => univer.dispose());

    function effects() {
        return getTableAutoExpandFormulaEffects(context, candidate, table, workbook.getActiveSheet()!, () => injector.get(LexerTreeBuilder));
    }

    it('infers the whole original body pattern and preserves absolute references', () => {
        expect(effects().redos).toMatchObject([{ params: { cellValue: { 6: { 4: { f: '=D7*10+$A$1' } } } } }]);
        expect(effects().undos).toMatchObject([{ params: { cellValue: { 6: { 4: { f: null } } } } }]);
        expect(workbook.getActiveSheet()!.getCellRaw(6, 4)).toBeFalsy();
    });

    it.each([{ v: 999 }, { v: 0 }, { v: false }, { f: '=1' }, null])('preserves explicit input including blanks: %o', (cell) => {
        context.contentWrites[6][4] = cell;
        expect(effects().redos).toEqual([]);
    });

    it.each([{ v: 8 }, null, { f: '=D5+2' }])('does not infer a mixed column: %o', (cell) => {
        workbook.getActiveSheet()!.getCellMatrix().setValue(4, 4, cell);
        expect(effects().redos).toEqual([]);
    });

    it('uses an explicit template even when the old body has exceptions', () => {
        workbook.getActiveSheet()!.getCellMatrix().setValue(4, 4, { v: 9 });
        table.getTableColumnByIndex(2)!.formula = '=D4*20';
        expect(effects().redos).toMatchObject([{ params: { cellValue: { 6: { 4: { f: '=D7*20' } } } } }]);
    });

    it('resolves shared formulas from their anchor', () => {
        workbook.getActiveSheet()!.getCellMatrix().setValue(3, 4, { f: '=D4*10', si: 'shared' });
        workbook.getActiveSheet()!.getCellMatrix().setValue(4, 4, { si: 'shared' });
        workbook.getActiveSheet()!.getCellMatrix().setValue(5, 4, { si: 'shared' });
        expect(effects().redos).toMatchObject([{ params: { cellValue: { 6: { 4: { f: '=D7*10', si: null } } } } }]);
    });
});

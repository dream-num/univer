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

import type { IWorkbookData, Workbook } from '@univerjs/core';
import {
    CellValueType,
    FilterSelectionMode,
    InterceptorEffectEnum,
    LocaleType,
    RecordValueType,
    Univer,
    UniverInstanceType,
} from '@univerjs/core';
import { INTERCEPTOR_POINT, SheetInterceptorService } from '@univerjs/sheets';
import { afterEach, describe, expect, it } from 'vitest';
import { TableColumnFilterTypeEnum } from '../../../types/enum';
import { compileTableRecordFilter, getTableRecordValue, getTableRecordValueKey } from '../record-filter';

function createWorkbookData(): IWorkbookData {
    return {
        id: 'record-filter-test',
        appVersion: '3.0.0-alpha',
        locale: LocaleType.EN_US,
        name: 'record-filter-test',
        sheetOrder: ['sheet-1'],
        sheets: {
            'sheet-1': {
                id: 'sheet-1',
                name: 'Sheet1',
                rowCount: 20,
                columnCount: 1,
                cellData: {
                    0: { 0: { v: 1, t: CellValueType.NUMBER } },
                    1: { 0: { v: '1', t: CellValueType.STRING } },
                    2: { 0: { v: true, t: CellValueType.BOOLEAN } },
                    3: { 0: { v: '#N/A', t: CellValueType.STRING, f: '=NA()' } },
                    4: { 0: { v: '#N/A', t: CellValueType.STRING } },
                    6: { 0: { v: '', t: CellValueType.STRING } },
                    7: { 0: { v: '__EMPTY__', t: CellValueType.STRING } },
                    8: { 0: { v: 45292, t: CellValueType.NUMBER, s: { n: { pattern: 'yyyy-mm-dd' } } } },
                    9: { 0: { p: { body: { dataStream: 'rich text\r\n' } } as never } },
                    10: { 0: { v: '2024-01-01', t: CellValueType.STRING, s: { n: { pattern: 'yyyy-mm-dd' } } } },
                    11: { 0: { v: '#DIV/0!', t: CellValueType.STRING, isInArrayFormulaRange: true } as never },
                },
            },
        },
        styles: {},
    };
}

describe('record-filter', () => {
    let univer: Univer | undefined;

    afterEach(() => {
        univer?.dispose();
        univer = undefined;
    });

    it('keeps worksheet member types distinct without guessing text dates or literal errors', () => {
        univer = new Univer();
        const workbook = univer.createUnit<IWorkbookData, Workbook>(UniverInstanceType.UNIVER_SHEET, createWorkbookData());
        const sheet = workbook.getSheetBySheetId('sheet-1')!;

        expect(Array.from({ length: 12 }, (_, row) => getTableRecordValue(sheet, row, 0))).toEqual([
            { type: 'number', value: 1 },
            { type: 'string', value: '1' },
            { type: 'boolean', value: true },
            { type: 'error', value: '#N/A' },
            { type: 'string', value: '#N/A' },
            { type: 'blank' },
            { type: 'string', value: '' },
            { type: 'string', value: '__EMPTY__' },
            { type: 'date', value: 45292 },
            { type: 'string', value: 'rich text' },
            { type: 'string', value: '2024-01-01' },
            { type: 'error', value: '#DIV/0!' },
        ]);
    });

    it('compiles typed include and exclude sets with stable distinct keys', () => {
        const include = compileTableRecordFilter({
            filterType: TableColumnFilterTypeEnum.record,
            mode: FilterSelectionMode.Include,
            values: [{ type: RecordValueType.Number, value: 1 }, { type: RecordValueType.Blank }],
        });
        const exclude = compileTableRecordFilter({
            filterType: TableColumnFilterTypeEnum.record,
            mode: FilterSelectionMode.Exclude,
            values: [{ type: RecordValueType.String, value: 'blocked' }],
        });

        expect(include({ type: RecordValueType.Number, value: 1 })).toBe(true);
        expect(include({ type: RecordValueType.String, value: '1' })).toBe(false);
        expect(include({ type: RecordValueType.Blank })).toBe(true);
        expect(exclude({ type: RecordValueType.String, value: 'blocked' })).toBe(false);
        expect(exclude({ type: RecordValueType.String, value: 'new' })).toBe(true);
        const numberKey = getTableRecordValueKey({ type: RecordValueType.Number, value: 1 });
        const stringKey = getTableRecordValueKey({ type: RecordValueType.String, value: '1' });
        expect(numberKey).not.toBe(stringKey);
    });

    it('uses the computed numeric value from an array-origin cell interceptor', () => {
        univer = new Univer();
        const injector = univer.__getInjector();
        injector.add([SheetInterceptorService]);
        injector.get(SheetInterceptorService).intercept(INTERCEPTOR_POINT.CELL_CONTENT, {
            priority: 100,
            effect: InterceptorEffectEnum.Value,
            handler: (cell, _location, next) => next({
                ...cell,
                v: 99,
                t: CellValueType.NUMBER,
                isInArrayFormulaRange: true,
            }),
        });
        const workbook = univer.createUnit<IWorkbookData, Workbook>(UniverInstanceType.UNIVER_SHEET, createWorkbookData());

        expect(getTableRecordValue(workbook.getSheetBySheetId('sheet-1')!, 0, 0)).toEqual({
            type: 'number',
            value: 99,
        });
    });

    it('rejects malformed modes and typed values instead of accepting every row', () => {
        expect(() => compileTableRecordFilter({
            filterType: TableColumnFilterTypeEnum.record,
            mode: 'invalid',
            values: [],
        } as never)).toThrow(TypeError);
        expect(() => compileTableRecordFilter({
            filterType: TableColumnFilterTypeEnum.record,
            mode: FilterSelectionMode.Include,
            values: [{ type: RecordValueType.Number, value: Number.POSITIVE_INFINITY }],
        })).toThrow(RangeError);
        expect(() => getTableRecordValueKey({ type: RecordValueType.Blank, value: 'not-blank' } as never)).toThrow(TypeError);
        expect(() => getTableRecordValueKey({ type: 'unknown', value: 'x' } as never)).toThrow(TypeError);
    });
});

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

import { BooleanNumber, BorderStyleTypes } from '@univerjs/core';
import { describe, expect, it } from 'vitest';
import { Table } from '../table';
import { getTableDxfStyle, hasTableDxfStyles, isImportedTableWithoutTheme } from '../table-dxf';

function fixture() {
    const table = new Table('t', 'Orders', { startRow: 2, endRow: 6, startColumn: 1, endColumn: 3 }, ['A', 'B', 'C'], { showFooter: true });
    table.setTableMeta({ _xlsx: { options: {
        dataDxfStyle: { bg: { rgb: '#eeeeee' }, bl: BooleanNumber.TRUE },
        headerRowDxfStyle: { bg: { rgb: '#111111' }, bl: BooleanNumber.TRUE },
        totalsRowDxfStyle: { bg: { rgb: '#dddddd' } },
        tableBorderDxfStyle: { bd: { t: { s: BorderStyleTypes.THIN }, b: { s: BorderStyleTypes.THIN }, l: { s: BorderStyleTypes.THIN }, r: { s: BorderStyleTypes.THIN } } },
        headerRowBorderDxfStyle: { bd: { b: { s: BorderStyleTypes.DOUBLE } } },
        totalsRowBorderDxfStyle: { bd: { t: { s: BorderStyleTypes.MEDIUM } } },
    } } });
    table.getTableColumnByIndex(1)!.setMeta({ _xlsx: {
        dataDxfStyle: { n: { pattern: '0.00' }, bl: BooleanNumber.FALSE, _rawDxfId: 4 },
        headerRowDxfStyle: { cl: { rgb: '#ffffff' } },
        totalsRowDxfStyle: { n: { pattern: '0.000' } },
    } });
    return table;
}

describe('table differential formats', () => {
    it('combines all nine table/column regions without leaking raw metadata or mutating the model', () => {
        const table = fixture();
        const before = JSON.stringify(table.toJSON());
        expect(getTableDxfStyle(table, 2, 2)).toMatchObject({ bg: { rgb: '#111111' }, cl: { rgb: '#ffffff' }, bd: { b: { s: BorderStyleTypes.DOUBLE } } });
        expect(getTableDxfStyle(table, 3, 2)).toEqual({ bg: { rgb: '#eeeeee' }, n: { pattern: '0.00' }, bl: BooleanNumber.FALSE });
        expect(getTableDxfStyle(table, 6, 2)).toMatchObject({ bg: { rgb: '#dddddd' }, n: { pattern: '0.000' }, bd: { t: { s: BorderStyleTypes.MEDIUM }, b: { s: BorderStyleTypes.THIN } } });
        expect(getTableDxfStyle(table, 3, 1)).toMatchObject({ bd: { l: { s: BorderStyleTypes.THIN } } });
        expect(getTableDxfStyle(table, 3, 3)).toMatchObject({ bd: { r: { s: BorderStyleTypes.THIN } } });
        expect(getTableDxfStyle(table, 0, 2)).toBeUndefined();
        expect(JSON.stringify(table.toJSON())).toBe(before);
    });

    it('leaves tables without dxf and cells without a matching dxf unchanged', () => {
        const table = new Table('plain', 'Plain', { startRow: 0, endRow: 3, startColumn: 0, endColumn: 2 }, ['A', 'B', 'C']);
        table.setTableMeta({ custom: 'table' });
        table.getTableColumnByIndex(1)!.setMeta({ custom: 'column' });
        const before = JSON.stringify(table.toJSON());
        expect(hasTableDxfStyles(table.toJSON())).toBe(false);
        expect(getTableDxfStyle(table, 1, 1)).toBeUndefined();
        expect(isImportedTableWithoutTheme(table)).toBe(false);
        expect(JSON.stringify(table.toJSON())).toBe(before);
        table.setTableMeta({ _xlsx: { options: { tableBorderDxfStyle: { bd: { l: { s: BorderStyleTypes.THIN } } } } } });
        expect(hasTableDxfStyles(table.toJSON())).toBe(true);
        expect(getTableDxfStyle(table, 1, 1)).toBeUndefined();
        expect(getTableDxfStyle(table, 1, 0)?.bd?.l?.s).toBe(BorderStyleTypes.THIN);
    });

    it('follows range/header/footer changes and metadata removal', () => {
        const table = fixture();
        table.setRange({ startRow: 5, endRow: 10, startColumn: 4, endColumn: 6 });
        expect(getTableDxfStyle(table, 6, 5)?.n?.pattern).toBe('0.00');
        expect(getTableDxfStyle(table, 3, 2)).toBeUndefined();
        table.setShowHeader(false);
        table.fromJSON({ ...table.toJSON(), options: { ...table.toJSON().options, showFooter: false } });
        expect(getTableDxfStyle(table, 5, 5)?.n?.pattern).toBe('0.00');
        expect(getTableDxfStyle(table, 10, 5)?.n?.pattern).toBe('0.00');
        table.getTableColumnByIndex(1)!.setMeta({ _xlsx: {} });
        expect(getTableDxfStyle(table, 6, 5)?.n).toBeUndefined();
        expect(getTableDxfStyle(table, 6, 5)?.bg?.rgb).toBe('#eeeeee');
    });

    it('recognizes imported direct formats without inventing a table theme', () => {
        const table = fixture();
        const meta = table.getTableMeta();
        meta._xlsx.rawTableXml = '<table dataDxfId="0"/>';
        expect(isImportedTableWithoutTheme(table)).toBe(true);
        expect(table.getTableStyleId()).toBe('');
        meta._xlsx.options = {};
        table.getTableColumnByIndex(1)!.setMeta({ _xlsx: {} });
        expect(table.getTableStyleId()).toBe('');
        table.setTableStyleId('selected-theme');
        expect(table.getTableStyleId()).toBe('selected-theme');
    });
});

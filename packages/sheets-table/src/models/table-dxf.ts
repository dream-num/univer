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

import type { IBorderData, IStyleData } from '@univerjs/core';
import { composeStyles } from '@univerjs/core';
import type { ITableColumnJson, TableMetaType } from '../types/type';
import type { Table } from './table';

const TABLE_DXF_STYLE_KEYS = ['dataDxfStyle', 'headerRowDxfStyle', 'totalsRowDxfStyle', 'tableBorderDxfStyle', 'headerRowBorderDxfStyle', 'totalsRowBorderDxfStyle'] as const;

type DxfStyleKey = typeof TABLE_DXF_STYLE_KEYS[number];

type ITableDxfStyles = Partial<Record<DxfStyleKey, IStyleData>>;

function tableDxfStyles(meta: TableMetaType | undefined): ITableDxfStyles | undefined {
    return meta?._xlsx?.options;
}

function hasColumnDxfStyles(meta: TableMetaType | undefined): boolean {
    return TABLE_DXF_STYLE_KEYS.slice(0, 3).some((key) => !!meta?._xlsx?.[key]);
}

export function hasTableDxfStyles(table: { meta?: TableMetaType; columns?: ITableColumnJson[] }): boolean {
    const styles = tableDxfStyles(table.meta);
    return TABLE_DXF_STYLE_KEYS.some((key) => !!styles?.[key])
        || !!table.columns?.some((column) => hasColumnDxfStyles(column.meta));
}

export function isImportedTableWithoutTheme(table: Table): boolean {
    const xlsx = table.getTableMeta()?._xlsx;
    if (!xlsx?.rawTableXml || xlsx.options?.tableStyleId) {
        return false;
    }
    if (/\b(?:dataDxfId|headerRowDxfId|totalsRowDxfId|tableBorderDxfId|headerRowBorderDxfId|totalsRowBorderDxfId)\s*=/.test(xlsx.rawTableXml)) {
        return true;
    }
    const hasDxf = (styles: ITableDxfStyles | undefined) => styles && Object.keys(styles).some((key) => key.endsWith('DxfStyle'));
    if (hasDxf(tableDxfStyles(table.getTableMeta()))) {
        return true;
    }
    for (let index = 0; index < table.getColumnsCount(); index++) {
        if (hasDxf(table.getTableColumnByIndex(index)?.getMeta()?._xlsx)) {
            return true;
        }
    }
    return false;
}

function renderableStyle(style: IStyleData | undefined): IStyleData | undefined {
    if (!style) {
        return undefined;
    }
    return Object.fromEntries(Object.entries(style).filter(([key]) => !key.startsWith('_')));
}

function regionBorder(style: IStyleData | undefined, row: number, col: number, startRow: number, endRow: number, startColumn: number, endColumn: number): IStyleData | undefined {
    if (!style?.bd || startRow > endRow) {
        return undefined;
    }
    const bd: IBorderData = {};
    if (row === startRow && style.bd.t !== undefined) {
        bd.t = style.bd.t;
    }
    if (row === endRow && style.bd.b !== undefined) {
        bd.b = style.bd.b;
    }
    if (col === startColumn && style.bd.l !== undefined) {
        bd.l = style.bd.l;
    }
    if (col === endColumn && style.bd.r !== undefined) {
        bd.r = style.bd.r;
    }
    return Object.keys(bd).length ? { bd } : undefined;
}

function composeDxfStyles(layers: Array<IStyleData | undefined>): IStyleData | undefined {
    const style = composeStyles(...layers);
    let border: IStyleData['bd'];
    for (const layer of layers) {
        if (layer?.bd === null) {
            border = null;
        } else if (layer?.bd) {
            border = { ...border, ...Object.fromEntries(Object.entries(layer.bd).filter(([, value]) => value !== undefined)) };
        }
    }
    if (border !== undefined) {
        style.bd = border;
    }
    return Object.keys(style).length ? style : undefined;
}

/** Resolve table-owned formats without assigning a direct style to the cell. */
export function getTableDxfStyle(table: Table, row: number, col: number): IStyleData | undefined {
    const { startRow, endRow, startColumn, endColumn } = table.getRange();
    if (row < startRow || row > endRow || col < startColumn || col > endColumn) {
        return undefined;
    }
    const source = tableDxfStyles(table.getTableMeta());
    const column = table.getTableColumnByIndex(col - startColumn)?.getMeta()?._xlsx as ITableDxfStyles | undefined;
    const header = table.isShowHeader() && row === startRow;
    const totals = table.isShowFooter() && row === endRow;
    let key: DxfStyleKey = 'dataDxfStyle';
    if (header) {
        key = 'headerRowDxfStyle';
    } else if (totals) {
        key = 'totalsRowDxfStyle';
    }
    const layers = [
        renderableStyle(source?.[key]),
        renderableStyle(column?.[key]),
        regionBorder(source?.tableBorderDxfStyle, row, col, startRow, endRow, startColumn, endColumn),
        header ? regionBorder(source?.headerRowBorderDxfStyle, row, col, startRow, startRow, startColumn, endColumn) : undefined,
        totals ? regionBorder(source?.totalsRowBorderDxfStyle, row, col, endRow, endRow, startColumn, endColumn) : undefined,
    ];
    return composeDxfStyles(layers);
}

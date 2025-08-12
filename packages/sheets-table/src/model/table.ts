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

import type { ITableColumnJson, ITableFilterItem, ITableInfo, ITableJson, ITableOptions, ITableRange } from '../types/type';
import { generateRandomId } from '@univerjs/core';
import { tableThemeConfig } from '../controllers/table-theme.factory';
import { TableColumn } from './table-column';
import { TableFilters } from './table-filter';

export class Table {
    private _id: string;
    private _name: string;
    /**
     * @property {string} tableStyleId The table style id. If the property is empty, the default style will be used.
     */
    private _tableStyleId?: string;
    private _showHeader: boolean;
    private _showFooter: boolean;
    private _range: ITableRange;
    private _columns: Map<string, TableColumn> = new Map();
    private _columnOrder: string[] = [];
    tableMeta: Record<string, any>;
    private _tableFilters: TableFilters;

    private _subUnitId: string;

    constructor(id: string, name: string, range: ITableRange, header: string[], options: ITableOptions = {}) {
        this._id = id;
        this._range = range;
        this._name = name;
        this._tableFilters = new TableFilters();
        this._init(header, options);
    }

    _init(header: string[], options: ITableOptions) {
        this._tableStyleId = options?.tableStyleId;
        this._showHeader = options?.showHeader ?? true;
        // Summarization is not supported yet. Footer is not displayed yet.
        this._showFooter = false;
        // init table columns
        if (options.columns) {
            options.columns.forEach((column) => {
                const id = column.id || generateRandomId();
                const tableColumn = new TableColumn(id, column.displayName);
                tableColumn.fromJSON(column);
                this._columns.set(id, tableColumn);
                this._columnOrder.push(id);
            });
        } else {
            const range = this.getRange();
            const startColumn = range.startColumn;
            const endColumn = range.endColumn;
            for (let i = startColumn; i <= endColumn; i++) {
                const id = generateRandomId();

                const column = new TableColumn(id, header[i - startColumn]);
                this._columns.set(id, column);
                this._columnOrder.push(id);
            }
        }

        // this._tableFilters = new TableFilters();

        if (options.filters) {
            const filters = options.filters;
            filters.forEach((filter, index) => {
                if (filter) {
                    this._tableFilters.setColumnFilter(index, filter);
                }
            });
        }
    }

    setTableFilterColumn(columnIndex: number, filter: ITableFilterItem) {
        this._tableFilters.setColumnFilter(columnIndex, filter);
    }

    getTableFilterColumn(columnIndex: number) {
        return this._tableFilters.getColumnFilter(columnIndex);
    }

    getTableFilters() {
        return this._tableFilters;
    }

    getTableFilterRange() {
        const tableRange = this.getRange();
        const showHeader = this.isShowHeader();
        const isShowFooter = this.isShowFooter();
        const { startRow, startColumn, endRow, endColumn } = tableRange;
        const start = showHeader ? startRow + 1 : startRow;
        const end = isShowFooter ? endRow - 1 : endRow;
        return {
            startRow: start,
            startColumn,
            endRow: end,
            endColumn,
        };
    }

    setColumns(columns: ITableColumnJson[]) {
        this._columns.clear();
        this._columnOrder = [];
        columns.forEach((columnJson) => {
            const column = new TableColumn(columnJson.id, columnJson.displayName);
            column.fromJSON(columnJson);
            this._columns.set(columnJson.id, column);
            this._columnOrder.push(columnJson.id);
        });
    }

    getColumnsCount() {
        return this._columnOrder.length;
    }

    insertColumn(index: number, column: TableColumn) {
        const columnId = column.id;
        this._columns.set(columnId, column);
        this._columnOrder.splice(index, 0, columnId);
    }

    removeColumn(index: number) {
        const columnId = this._columnOrder[index];
        this._columns.delete(columnId);
        this._columnOrder.splice(index, 1);
    }

    setTableMeta(meta: Record<string, any>) {
        this.tableMeta = meta;
    }

    getTableMeta() {
        return this.tableMeta;
    }

    getColumn(columnId: string) {
        return this._columns.get(columnId);
    }

    getTableColumnByIndex(index: number) {
        const id = this._columnOrder[index];
        return this.getColumn(id);
    }

    getColumnNameByIndex(index: number) {
        const id = this._columnOrder[index];
        return this.getColumn(id)?.getDisplayName() || '';
    }

    getId() {
        return this._id;
    }

    getRangeInfo() {
        return {
            ...this._range,
        };
    }

    getRange() {
        return { ...this._range };
    }

    setRange(range: ITableRange) {
        this._range = range;
    }

    setDisplayName(name: string) {
        this._name = name;
    }

    getDisplayName() {
        return this._name;
    }

    getSubunitId() {
        return this._subUnitId;
    }

    setSubunitId(subUnitId: string) {
        this._subUnitId = subUnitId;
    }

    getTableStyleId() {
        return this._tableStyleId ?? tableThemeConfig[0].name;
    }

    setTableStyleId(tableStyleId: string) {
        this._tableStyleId = tableStyleId;
    }

    isShowHeader() {
        return this._showHeader ?? true;
    }

    setShowHeader(showHeader: boolean) {
        this._showHeader = showHeader;
    }

    isShowFooter() {
        return this._showFooter ?? false;
    }

    getTableInfo(): ITableInfo {
        return {
            id: this._id,
            subUnitId: this._subUnitId,
            name: this._name,
            range: this.getRangeInfo(),
            meta: this.tableMeta,
            showHeader: this._showHeader,
            columns: this._columnOrder.map((columnId) => this._columns.get(columnId)!.toJSON()),
        };
    }

    getTableConfig() {
        return {
            name: this.getDisplayName(),
            range: this.getRangeInfo(),
            options: {
                showHeader: this._showHeader,
                showFooter: this._showFooter,
            },
            tableStyleId: this._tableStyleId,
        };
    }

    getFilterStates(range: ITableRange) {
        return this._tableFilters.getFilterStates(range);
    }

    toJSON(): ITableJson {
        const columns: ITableColumnJson[] = [];
        this._columns.forEach((column) => {
            columns.push(column.toJSON());
        });
        return {
            id: this._id,
            name: this._name,
            range: this.getRangeInfo(),
            options: {
                showHeader: this._showHeader,
                showFooter: this._showFooter,
                tableStyleId: this._tableStyleId,
            },
            // TODO: support filter
            filters: this._tableFilters.toJSON(),
            columns,
            meta: this.tableMeta,
        };
    }

    fromJSON(json: ITableJson) {
        this._id = json.id;
        this._name = json.name;
        this._range = json.range;
        this.tableMeta = json.meta;
        this._tableStyleId = json.options.tableStyleId || '';
        this._showHeader = json.options.showHeader || true;
        this._showFooter = json.options.showFooter || true;
        const columns = json.columns;
        columns.forEach((column) => {
            const tableColumn = new TableColumn(column.id, column.displayName);
            tableColumn.fromJSON(column);
            this._columns.set(column.id, tableColumn);
            this._columnOrder.push(column.id);
        });
        this._tableFilters = new TableFilters();
        this._tableFilters.fromJSON(json.filters);
    }

    dispose() {
        this._id = '';
        this._name = '';
        this._tableStyleId = '';
        this._showHeader = true;
        this._showFooter = true;
        // @ts-ignore
        delete this._range;
        this._columns.clear();
        this._columnOrder = [];
    }
}

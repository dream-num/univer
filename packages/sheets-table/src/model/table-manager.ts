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

import type { IRange, Workbook } from '@univerjs/core';
import type { ITableAddedEvent, ITableDeletedEvent, ITableFilterChangedEvent, ITableFilterItem, ITableInfoWithUnitId, ITableJson, ITableNameChangedEvent, ITableOptions, ITableRange, ITableRangeChangedEvent, ITableRangeRowColOperation, ITableRangeUpdate, ITableRangeWithState, ITableResource, ITableSetConfig, ITableThemeChangedEvent } from '../types/type';
import { Disposable, generateRandomId, Inject, IUniverInstanceService, LocaleService } from '@univerjs/core';
import { getSheetCommandTarget } from '@univerjs/sheets';
import { BehaviorSubject, Subject } from 'rxjs';
import { IRangeOperationTypeEnum } from '../types/type';
import { convertCellDataToString, getColumnName } from '../util';
import { Table } from './table';
import { TableColumn } from './table-column';

export class TableManager extends Disposable {
    private _tableMap: Map<string, Map<string, Table>>;

    private _tableAdd$ = new Subject<ITableAddedEvent>();
    public tableAdd$ = this._tableAdd$.asObservable();

    private _tableDelete$ = new Subject<ITableDeletedEvent>();
    public tableDelete$ = this._tableDelete$.asObservable();

    private _tableNameChanged$ = new Subject<ITableNameChangedEvent>();
    public tableNameChanged$ = this._tableNameChanged$.asObservable();

    private _tableRangeChanged$ = new Subject<ITableRangeChangedEvent>();
    public tableRangeChanged$ = this._tableRangeChanged$.asObservable();

    private _tableThemeChanged$ = new Subject<ITableThemeChangedEvent>();
    public tableThemeChanged$ = this._tableThemeChanged$.asObservable();

    private _tableFilterChanged$ = new Subject<ITableFilterChangedEvent>();
    public tableFilterChanged$ = this._tableFilterChanged$.asObservable();

    private _tableInitStatus = new BehaviorSubject<boolean>(false);
    public tableInitStatus$ = this._tableInitStatus.asObservable();

    constructor(
        @IUniverInstanceService private readonly _univerInstanceService: IUniverInstanceService,
        @Inject(LocaleService) private readonly _localeService: LocaleService
    ) {
        super();
        this._tableMap = new Map();
    }

    private _ensureUnit(unitId: string) {
        if (!this._tableMap.has(unitId)) {
            this._tableMap.set(unitId, new Map());
        }
        return this._tableMap.get(unitId)!;
    }

    getColumnHeader(unitId: string, subUnitId: string, range: ITableRange, prefixText?: string) {
        const worksheet = this._univerInstanceService.getUnit<Workbook>(unitId)?.getSheetBySheetId(subUnitId);

        const { startRow, startColumn, endColumn } = range;
        const header = [];
        const columnText = prefixText ?? 'Column';
        for (let i = startColumn; i <= endColumn; i++) {
            header.push(convertCellDataToString(worksheet?.getCell(startRow, i)) || getColumnName(i - startColumn + 1, columnText));
        }
        return header;
    }

    /**
     * Add a table to univer.
     * @param {string} unitId The unit id of the table.
     * @param {string} subUnitId The subunit id of the table.
     * @param {string} name The table name, it should be unique in the unit or it will be appended with a number.
     * @param {ITableRange} range The range of the table, it contains the unit id and subunit id.
     * @param {ITableOptions} [options] Other options of the table.
     * @returns {string} The table id.
     */
    addTable(unitId: string, subUnitId: string, name: string, range: ITableRange, header?: string[], initId?: string, options?: ITableOptions): string {
        const id = initId ?? generateRandomId();
        const tableHeader = header || this.getColumnHeader(unitId, subUnitId, range);
        const table = new Table(id, name, range, tableHeader, options);
        // set subunit id to table
        table.setSubunitId(subUnitId);
        const unitMap = this._ensureUnit(unitId);
        unitMap.set(id, table);
        this._tableAdd$.next({
            unitId,
            subUnitId,
            range,
            tableName: name,
            tableId: id,
        });

        return id;
    }

    addFilter(unitId: string, tableId: string, column: number, filter: ITableFilterItem | undefined) {
        const table = this.getTable(unitId, tableId);
        if (table) {
            const tableFilter = table.getTableFilters();
            tableFilter.setColumnFilter(column, filter);
            const subUnitId = table.getSubunitId();
            this._tableFilterChanged$.next({
                unitId,
                subUnitId,
                tableId,
            });
        }
    }

    getFilterRanges(unitId: string, subUnitId: string): IRange[] {
        const unitMap = this._tableMap.get(unitId);
        if (!unitMap) {
            return [];
        }
        const filterRanges: IRange[] = [];
        unitMap.forEach((table) => {
            if (table.getSubunitId() === subUnitId && table.isShowHeader()) {
                filterRanges.push(table.getRange());
            }
        });
        return filterRanges;
    }

    getSheetFilterRangeWithState(unitId: string, subUnitId: string): ITableRangeWithState[] {
        const unitMap = this._tableMap.get(unitId);
        if (!unitMap) {
            return [];
        }
        const filterRanges: ITableRangeWithState[] = [];
        unitMap.forEach((table) => {
            if (table.getSubunitId() === subUnitId && table.isShowHeader()) {
                filterRanges.push({
                    tableId: table.getId(),
                    range: table.getRange(),
                    states: table.getFilterStates(table.getRange()),
                });
            }
        });
        return filterRanges;
    }

    getTable(unitId: string, tableId: string) {
        const unitMap = this._tableMap.get(unitId);
        if (!unitMap) {
            return undefined;
        }
        return unitMap.get(tableId);
    }

    /**
     * Get the unique table name, in excel, the table name should be unique because it is used as a reference.
     * @param {string} unitId The unit id of the table.
     * @param {string} baseName The base name of the table.
     * @returns {string} The unique table name
     */
    getUniqueTableName(unitId: string, baseName: string) {
        const unitMap = this._tableMap.get(unitId);
        if (!unitMap) {
            return baseName;
        }
        const tableNamesSet = new Set(Array.from(unitMap.values()).map((table) => table.getDisplayName()));
        let newName = baseName;
        let count = 1;
        while (tableNamesSet.has(newName)) {
            newName = `${baseName}-${count}`;
            count++;
        }
        return newName;
    }

    /**
     * Get table by unit id and table id.
     * @param {string} unitId  The unit id of the table.
     * @param {string} tableId The table id.
     * @returns {Table} The table.
     */
    getTableById(unitId: string, tableId: string) {
        return this.getTable(unitId, tableId);
    }

    getTableList(unitId: string): ITableInfoWithUnitId[] {
        const unitMap = this._tableMap.get(unitId);
        if (!unitMap) {
            return [] as ITableInfoWithUnitId[];
        }
        return Array.from(unitMap.values()).map((table) => {
            return { ...table.getTableInfo(), unitId };
        });
    }

    /**
     * Get the table list by unit id and subunit id.
     * @param {string} unitId The unit id of the table.
     * @param {string} subUnitId The subunit id of the table.
     * @returns {Table[]} The table list.
     */
    getTablesBySubunitId(unitId: string, subUnitId: string) {
        const unitMap = this._tableMap.get(unitId);
        if (!unitMap) {
            return [];
        }
        return Array.from(unitMap.values()).filter((table) => table.getSubunitId() === subUnitId);
    }

    getTablesInfoBySubunitId(unitId: string, subUnitId: string) {
        return this.getTablesBySubunitId(unitId, subUnitId).map((table) => {
            return {
                id: table.getId(),
                name: table.getDisplayName(),
                range: table.getRange(),
            };
        });
    }

    deleteTable(unitId: string, tableId: string) {
        const unitMap = this._tableMap.get(unitId);
        const table = unitMap?.get(tableId);
        if (table) {
            const tableInfo = table.getTableInfo();
            const tableStyleId = table.getTableStyleId();
            unitMap?.delete(tableId);
            const { subUnitId, range, name } = tableInfo;
            this._tableDelete$.next({
                unitId,
                subUnitId,
                tableId,
                range,
                tableName: name,
                tableStyleId,
            });
        }
    }

    operationTableRowCol(unitId: string, tableId: string, config: ITableRangeRowColOperation) {
        const table = this.getTableById(unitId, tableId);
        if (!table) return;
        const { operationType, rowColType, index, count, columnsJson } = config;
        const oldRange = table.getRange();
        const newRange = { ...oldRange };
        if (operationType === IRangeOperationTypeEnum.Insert) {
            if (rowColType === 'row') {
                newRange.endRow += count;
            } else if (rowColType === 'column') {
                newRange.endColumn += count;

                for (let i = 0; i < count; i++) {
                    // There is no need to enforce column name uniqueness.
                    const columnPrefix = this._localeService.t('sheets-table.columnPrefix');
                    const column = new TableColumn(generateRandomId(), getColumnName(table.getColumnsCount() + 1 + i, columnPrefix));
                    if (columnsJson?.[i]) {
                        column.fromJSON(columnsJson[i]);
                    }
                    const columnIndex = index + i - oldRange.startColumn;
                    table.insertColumn(columnIndex, column);
                }
            }
        } else {
            if (rowColType === 'row') {
                newRange.endRow -= count;
            } else if (rowColType === 'column') {
                newRange.endColumn -= count;
                // Remove columns from the end to avoid index shifting
                for (let i = count - 1; i >= 0; i--) {
                    const columnIndex = index + i - oldRange.startColumn;
                    table.removeColumn(columnIndex);
                }
            }
        }

        table.setRange(newRange);
        this._tableRangeChanged$.next({
            unitId,
            subUnitId: table.getSubunitId(),
            tableId,
            range: newRange,
            oldRange,
        });
    }

    updateTableRange(unitId: string, tableId: string, config: ITableRangeUpdate) {
        const table = this.getTableById(unitId, tableId);
        if (!table) return;
        const oldRange = table.getRange();
        const newRange = config.newRange;
        if (newRange.startColumn < oldRange.startColumn) {
            const diff = oldRange.startColumn - newRange.startColumn;
            const columnPrefix = this._localeService.t('sheets-table.columnPrefix');
            for (let i = 0; i < diff; i++) {
                table.insertColumn(oldRange.startColumn, new TableColumn(generateRandomId(), getColumnName(table.getColumnsCount() + 1, columnPrefix)));
            }
        } else if (newRange.startColumn > oldRange.startColumn) {
            const diff = newRange.startColumn - oldRange.startColumn;
            for (let i = diff - 1; i >= 0; i--) {
                const columnIndex = newRange.startColumn + i - oldRange.startColumn;
                table.removeColumn(columnIndex);
            }
        }

        if (newRange.endColumn < oldRange.endColumn) {
            const diff = oldRange.endColumn - newRange.endColumn;
            for (let i = diff - 1; i >= 0; i--) {
                const columnIndex = newRange.endColumn + i - oldRange.startColumn;
                table.removeColumn(columnIndex);
            }
        } else if (newRange.endColumn > oldRange.endColumn) {
            const diff = newRange.endColumn - oldRange.endColumn;
            for (let i = 0; i < diff; i++) {
                table.insertColumn(oldRange.endColumn, new TableColumn(generateRandomId(), getColumnName(table.getColumnsCount() + 1, 'Column')));
            }
        }

        table.setRange(newRange);
        this._tableRangeChanged$.next({
            unitId,
            subUnitId: table.getSubunitId(),
            tableId,
            range: newRange,
            oldRange,
        });
    }

    setTableByConfig(unitId: string, tableId: string, config: ITableSetConfig) {
        const unitMap = this._tableMap.get(unitId);
        const table = unitMap?.get(tableId);
        if (!table) return;
        const subUnitId = table.getSubunitId();
        const { name, updateRange, rowColOperation, theme, options } = config;
        if (name) {
            const oldTableName = table.getDisplayName();
            table.setDisplayName(name);
            this._tableNameChanged$.next({
                unitId,
                subUnitId,
                tableId,
                tableName: name,
                oldTableName,
            });
        }
        if (rowColOperation) {
            this.operationTableRowCol(unitId, tableId, rowColOperation);
        }
        if (updateRange) {
            this.updateTableRange(unitId, tableId, updateRange);
        }
        if (theme) {
            const oldTheme = table.getTableStyleId() ?? 'default';
            table.setTableStyleId(theme);
            this._tableThemeChanged$.next({
                unitId,
                subUnitId,
                tableId,
                theme,
                oldTheme,
            });
        }

        if (options) {
            if (options.showHeader !== undefined) {
                table.setShowHeader(options.showHeader);
            }
        }
    }

    toJSON(unitId: string): ITableResource {
        const result: ITableResource = {};
        const unitMap = this._tableMap.get(unitId);
        if (unitMap) {
            unitMap.forEach((table) => {
                const subUnitId = table.getSubunitId();
                if (!result[subUnitId]) {
                    result[subUnitId] = [] as ITableJson[];
                }
                result[subUnitId].push(table.toJSON());
            });
        }
        return result;
    }

    fromJSON(unitId: string, data: ITableResource) {
        const unitMap = this._ensureUnit(unitId);
        const subUnitIds = Object.keys(data);
        subUnitIds.forEach((subUnitId) => {
            const target = getSheetCommandTarget(this._univerInstanceService, { unitId, subUnitId });
            if (!target) {
                return;
            }
            const sheet = target.worksheet;
            const tables = data[subUnitId];
            tables.forEach((table) => {
                const header = this.getColumnHeader(unitId, subUnitId, table.range);
                const tableInstance = new Table(table.id, table.name, table.range, header, table.options);
                tableInstance.setTableMeta(table.meta);
                if (table.columns.length) {
                    tableInstance.setColumns(table.columns);
                }
                if (table.filters) {
                    const tableFilter = tableInstance.getTableFilters();
                    tableFilter.fromJSON(table.filters);
                    tableFilter.doFilter(sheet, tableInstance.getTableFilterRange());
                }
                tableInstance.setSubunitId(subUnitId);
                unitMap.set(table.id, tableInstance);
                this._tableAdd$.next({
                    unitId,
                    subUnitId,
                    range: table.range,
                    tableName: table.name,
                    tableId: table.id,
                });
            });
        });
        this._tableInitStatus.next(true);
    }

    deleteUnitId(unitId: string) {
        this._tableMap.delete(unitId);
    }

    override dispose() {
        super.dispose();
        this._tableMap.forEach((unitMap) => {
            unitMap.forEach((table) => table.dispose());
            unitMap.clear();
        });
        this._tableMap.clear();
    }
}

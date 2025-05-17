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

import type { IRangeThemeStyleJSON } from '@univerjs/sheets';
import type { IAddSheetTableCommandParams, IDeleteSheetTableParams, ISetSheetTableCommandParams, ISetSheetTableParams, ITableFilterItem, ITableInfoWithUnitId, ITableOptions, ITableRange } from '@univerjs/sheets-table';
import { cellToRange, Rectangle } from '@univerjs/core';
import { RangeThemeStyle } from '@univerjs/sheets';
import { AddSheetTableCommand, AddTableThemeCommand, DeleteSheetTableCommand, SetSheetTableCommand, SetSheetTableFilterCommand, SheetTableService } from '@univerjs/sheets-table';
import { FWorksheet } from '@univerjs/sheets/facade';

/**
 * @ignore
 */
export interface IFWorkSheetTableMixin {
    /**
     * Add a table to the worksheet
     * @param tableName The table name
     * @param rangeInfo The table range information
     * @param tableId The table id
     * @param options The table options
     * @returns {Promise<boolean>} Whether the table was added successfully
     * @example
     * ```typescript
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fSheet = fWorkbook.getActiveSheet();
     * const subUnitId = fSheet.getSheetId();
     * const res = await fSheet.addTable('name-1', {
     * startRow: 1,
     *     startColumn: 1,
     *     endRow: 10,
     *     endColumn: 5,
     * }, 'id-1', {
     * showHeader: true
     * })
     * const tableInfo = fWorkbook.getTableInfo('id-1');
     * console.log('debugger tableInfo', tableInfo);
     * ```
     */
    addTable(tableName: string, rangeInfo: ITableRange, tableId?: string, options?: ITableOptions): Promise<boolean>;

    /**
     *
     * @param tableId The table id
     * @param column The column index
     * @param filter The filter item
     * @returns {Promise<boolean>} Whether the table filter was set successfully
     * @example
     * ```typescript
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fSheet = fWorkbook.getActiveSheet();
     * const subUnitId = fSheet.getSheetId();
     * const res = await fSheet.addTable('name-1', {
     *   startRow: 1,
     *   startColumn: 1,
     *  endRow: 10,
     *  endColumn: 5,
     * }, 'id-1', {
     *   showHeader: true
     * })
     * const tableInfo = fWorkbook.getTableInfo('id-1');
     * console.log('debugger tableInfo',tableInfo);
     * const result = await fSheet.setTableFilter('id-1', 1, {
     *   filterType: univerAPI.Enum.TableColumnFilterTypeEnum.condition,
     *   filterInfo: {
     *    conditionType: univerAPI.Enum.TableConditionTypeEnum.Number,
     *    compareType: univerAPI.Enum.TableNumberCompareTypeEnum.GreaterThan,
     *    expectedValue: 10,
     *    }
     * });
     * console.log('debugger result',result);
     */
    setTableFilter(tableId: string, column: number, filter: ITableFilterItem): Promise<boolean>;

    /**
     * Remove a table from the worksheet
     * @param tableId The table id
     * @returns {Promise<boolean>} Whether the table was removed successfully
     * @example
     * ```typescript
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fSheet = fWorkbook.getActiveSheet();
     * const subUnitId = fSheet.getSheetId();
     * const res = await fSheet.addTable('name-1', {
     * startRow: 1,
     * startColumn: 1,
     * endRow: 10,
     * endColumn: 5,
     * }, 'id-1', {
     * showHeader: true
     * })
     * const tableInfo = fWorkbook.getTableInfo('id-1');
     * console.log('debugger tableInfo', tableInfo);
     * const result = await fSheet.removeTable('id-1');
     * console.log('debugger result', result);
     */
    removeTable(tableId: string): Promise<boolean>;

    /**
     * Set the range of a table
     * @param tableId The table id
     * @param rangeInfo The new range information
     * @returns {Promise<boolean>} Whether the table range was set successfully
     * @example
     * ```typescript
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fSheet = fWorkbook.getActiveSheet();
     * const subUnitId = fSheet.getSheetId();
     * const res = await fSheet.addTable('name-1', {
     *     startRow: 1,
     *     startColumn: 1,
     *     endRow: 10,
     *     endColumn: 5,
     * }, 'id-1', {
     *     showHeader: true
     * })
     * const tableInfo = fWorkbook.getTableInfo('id-1');
     * console.log('debugger tableInfo', tableInfo);
     * const result = await fSheet.setTableRange('id-1', {
     *     startRow: 1,
     *     startColumn: 1,
     *     endRow: 20,
     *     endColumn: 5,
     * })
     * console.log('debugger result', result);
     * const tableInfo2 = fWorkbook.getTableInfo('id-1');
     * console.log('debugger tableInfo2', tableInfo2);
     * ```
     */
    setTableRange(tableId: string, rangeInfo: ITableRange): Promise<boolean>;

    /**
     * Set the name of a table
     * @param tableId The table id
     * @param tableName The new table name
     * @returns {Promise<boolean>} Whether the table name was set successfully
     * @example
     * ```typescript
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fSheet = fWorkbook.getActiveSheet();
     * const subUnitId = fSheet.getSheetId();
     * const res = await fSheet.addTable('name-1', {
     *    startRow: 1,
     *    startColumn: 1,
     *    endRow: 10,
     *    endColumn: 5,
     * }, 'id-1', {
     * showHeader: true
     * })
     * const result = await fSheet.setTableName('id-1', 'new-name');
     * console.log('debugger result',result);
     * ```
     */
    setTableName(tableId: string, tableName: string): Promise<boolean>;

    /**
     * Get the list of tables in the worksheet
     * @returns {ITableInfoWithUnitId[]} The list of tables
     * @example
     * ```typescript
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fSheet = fWorkbook.getActiveSheet();
     * const subUnitId = fSheet.getSheetId();
     * const res = await fSheet.addTable('name-1', {
     *    startRow: 1,
     *    startColumn: 1,
     *    endRow: 10,
     *    endColumn: 5,
     * }, 'id-1', {
     * showHeader: true
     * })
     * const tableList = fSheet.getSubTableInfos();
     * console.log('debugger tableList',tableList);
     * ```
     */
    getSubTableInfos(): ITableInfoWithUnitId[];

    /**
     * Reset the column filter of a table
     * @param tableId The table id
     * @param column The column index
     * @returns {Promise<boolean>} Whether the table filter was reset successfully
     * @example
     * ```typescript
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fSheet = fWorkbook.getActiveSheet();
     * const subUnitId = fSheet.getSheetId();
     * const res = await fSheet.addTable('name-1', {
     *   startRow: 1,
     *   startColumn: 1,
     *   endRow: 10,
     *   endColumn: 5,
     * }, 'id-1', {
     *   showHeader: true
     * })
     * const tableInfo = fWorkbook.getTableInfo('id-1');
     * console.log('debugger tableInfo',tableInfo);
     * const result = await fSheet.setTableFilter('id-1', 1, {
     *  filterType: univerAPI.Enum.TableColumnFilterTypeEnum.condition,
     *  filterInfo: {
     *   conditionType: univerAPI.Enum.TableConditionTypeEnum.Number,
     *   compareType: univerAPI.Enum.TableNumberCompareTypeEnum.GreaterThan,
     *   expectedValue: 10,
     *  }
     * })
     * console.log('debugger result',result);
     * const result2 = await fSheet.resetFilter('id-1', 1);
     * console.log('debugger result2',result2);
     * const tableInfo2 = fWorkbook.getTableInfo('id-1');
     * console.log('debugger tableInfo2',tableInfo2);
     * ```
     */
    resetFilter(tableId: string, column: number): Promise<boolean>;

    /**
     * Get the table information by cell position
     * @param row The row index
     * @param column The column index
     * @returns {ITableInfoWithUnitId | undefined} The table information or undefined if not found
     * @example
     * ```typescript
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fSheet = fWorkbook.getActiveSheet();
     * const subUnitId = fSheet.getSheetId();
     * const res = await fSheet.addTable('name-1', {
     *  startRow: 1,
     *  startColumn: 1,
     *  endRow: 10,
     *  endColumn: 5,
     * }, 'id-1', {
     *  showHeader: true
     * })
     * const tableInfo = fWorkbook.getTableInfo('id-1');
     * console.log('debugger tableInfo',tableInfo);
     * const tableInfo2 = fSheet.getTableByCell(1, 1);
     * console.log('debugger tableInfo2',tableInfo2);
     * ```
     */
    getTableByCell(row: number, column: number): ITableInfoWithUnitId | undefined;

    /**
     * Add a theme to the table
     * @param tableId The table id
     * @param themeStyleJSON The theme style JSON
     * @returns {Promise<boolean>} Whether the theme was added successfully
     * @example
     * ```typescript
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fSheet = fWorkbook.getActiveSheet();
     * const subUnitId = fSheet.getSheetId();
     * const res = await fSheet.addTable('name-1', {
     *  startRow: 1,
     *  startColumn: 1,
     *  endRow: 10,
     *  endColumn: 5,
     * }, 'id-1', {
     * showHeader: true
     * })
     * const tableInfo = fWorkbook.getTableInfo('id-1');
     * console.log('debugger tableInfo', tableInfo);
     * const result = await fSheet.addTableTheme('id-1', {
     *  name: "table-custom-1",
     *  headerRowStyle: {
     *     bd: {
     *         t: {
     *             s: 1,
     *             cl: {
     *                 rgb: "rgb(95 101 116)"
     *             }
     *         }
     *     },
     *     bg: {
     *         rgb: 'rgb(255,123,65)'
     *     }
     *  },
     * lastRowStyle: {
     *     bd: {
     *         b: {
     *             s: 1,
     *             cl: {
     *                 rgb: "rgb(95 101 116)"
     *             }
     *         }
     *     }
     *   },
     * });
     */
    addTableTheme(tableId: string, themeStyleJSON: IRangeThemeStyleJSON): Promise<boolean>;
}

export class FWorkSheetTableMixin extends FWorksheet implements IFWorkSheetTableMixin {
    override addTable(tableName: string, rangeInfo: ITableRange, tableId?: string, options?: ITableOptions): Promise<boolean> {
        const subUnitId = this.getSheetId();
        const unitId = this.getWorkbook().getUnitId();
        const addTableParams: IAddSheetTableCommandParams = {
            unitId,
            subUnitId,
            name: tableName,
            range: rangeInfo,
            id: tableId,
            options,
        };
        return this._commandService.executeCommand(AddSheetTableCommand.id, addTableParams);
    }

    override setTableFilter(tableId: string, column: number, filter: ITableFilterItem): Promise<boolean> {
        const setTableFilterParams: ISetSheetTableParams = {
            unitId: this.getWorkbook().getUnitId(),
            tableId,
            column,
            tableFilter: filter,
        };
        return this._commandService.executeCommand(SetSheetTableFilterCommand.id, setTableFilterParams);
    }

    override removeTable(tableId: string): Promise<boolean> {
        const removedTableParams: IDeleteSheetTableParams = {
            unitId: this._fWorkbook.getId(),
            subUnitId: this.getSheetId(),
            tableId,
        };
        return this._commandService.executeCommand(DeleteSheetTableCommand.id, removedTableParams);
    }

    override setTableRange(tableId: string, rangeInfo: ITableRange): Promise<boolean> {
        const tableSetConfig: ISetSheetTableCommandParams = {
            unitId: this.getWorkbook().getUnitId(),
            tableId,
            updateRange: {
                newRange: rangeInfo,
            },
        };
        return this._commandService.executeCommand(SetSheetTableCommand.id, tableSetConfig);
    }

    override setTableName(tableId: string, tableName: string): Promise<boolean> {
        const tableSetConfig: ISetSheetTableCommandParams = {
            unitId: this.getWorkbook().getUnitId(),
            tableId,
            name: tableName,
        };
        return this._commandService.executeCommand(SetSheetTableCommand.id, tableSetConfig);
    }

    override getSubTableInfos(): ITableInfoWithUnitId[] {
        const unitId = this._fWorkbook.getId();
        const sheetTableService = this._injector.get(SheetTableService);
        return sheetTableService.getTableList(unitId).filter((table) => table.subUnitId === this.getSheetId());
    }

    override resetFilter(tableId: string, column: number): Promise<boolean> {
        const setTableFilterParams: ISetSheetTableParams = {
            unitId: this._fWorkbook.getId(),
            tableId,
            column,
            tableFilter: undefined,
        };
        return this._commandService.executeCommand(SetSheetTableFilterCommand.id, setTableFilterParams);
    }

    override getTableByCell(row: number, column: number): ITableInfoWithUnitId | undefined {
        const unitId = this._fWorkbook.getId();
        const sheetTableService = this._injector.get(SheetTableService);
        const allSubTableInfos = sheetTableService.getTableList(unitId).filter((table) => table.subUnitId === this.getSheetId());
        const cellRange = cellToRange(row, column);
        return allSubTableInfos.find((table) => {
            const tableRange = table.range;
            return Rectangle.intersects(tableRange, cellRange);
        });
    }

    override addTableTheme(tableId: string, themeStyleJSON: IRangeThemeStyleJSON): Promise<boolean> {
        const themeStyle = new RangeThemeStyle('table-style');
        themeStyle.fromJson(themeStyleJSON);
        return this._commandService.executeCommand(AddTableThemeCommand.id, {
            unitId: this._fWorkbook.getId(),
            tableId,
            themeStyle,
        });
    }
}

FWorksheet.extend(FWorkSheetTableMixin);
declare module '@univerjs/sheets/facade' {
    // eslint-disable-next-line ts/naming-convention
    interface FWorksheet extends IFWorkSheetTableMixin { }
}

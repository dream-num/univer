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
import type {
    IAddSheetTableCommandParams,
    IDeleteSheetTableParams,
    ISetSheetTableCommandParams,
    ISetSheetTableParams,
    ITableFilterItem,
    ITableInfoWithUnitId,
    ITableOptions,
    ITableRange,
} from '@univerjs/sheets-table';
import { cellToRange, customNameCharacterCheck, ILogService, LocaleService, Rectangle } from '@univerjs/core';
import { RangeThemeStyle } from '@univerjs/sheets';
import {
    AddSheetTableCommand,
    AddTableThemeCommand,
    DeleteSheetTableCommand,
    SetSheetTableCommand,
    SetSheetTableFilterCommand,
    SheetTableService,
} from '@univerjs/sheets-table';
import { FWorksheet } from '@univerjs/sheets/facade';

/**
 * @ignore
 */
export interface IFWorkSheetTableMixin {
    /**
     * Add a table to the worksheet
     * @param {string} tableName The table name
     * @param {ITableRange} rangeInfo The table range information
     * @param {string} [tableId] The table id
     * @param {ITableOptions} [options] The table options
     * @returns {Promise<boolean>} Whether the table was added successfully
     * @example
     * ```typescript
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
     *
     * // Insert a table in the range B2:F11
     * const fRange = fWorksheet.getRange('B2:F11');
     * const success = await fWorksheet.addTable(
     *   'name-1',
     *   fRange.getRange(),
     *   'id-1',
     *   {
     *     showHeader: true,
     *   }
     * );
     *
     * if (success) {
     *   const tableInfo = fWorkbook.getTableInfo('id-1');
     *   console.log('debugger tableInfo', tableInfo);
     * }
     * ```
     */
    addTable(tableName: string, rangeInfo: ITableRange, tableId?: string, options?: ITableOptions): Promise<boolean> | boolean;

    /**
     * Set the filter for a table column
     * @param {string} tableId The table id
     * @param {number} column The table column index, starting from 0. For example, the first column is 0, the second column is 1, and so on.
     * @param {ITableFilterItem} filter The filter item
     * @returns {Promise<boolean>} Whether the table filter was set successfully
     * @example
     * ```typescript
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
     *
     * // Insert a table in the range B2:F11
     * const fRange = fWorksheet.getRange('B2:F11');
     * const success = await fWorksheet.addTable(
     *   'name-1',
     *   fRange.getRange(),
     *   'id-1',
     *   {
     *     showHeader: true,
     *   }
     * );
     *
     * if (success) {
     *   // Set the filter for the second column
     *   await fWorksheet.setTableFilter('id-1', 1, {
     *     filterType: univerAPI.Enum.TableColumnFilterTypeEnum.condition,
     *     filterInfo: {
     *       conditionType: univerAPI.Enum.TableConditionTypeEnum.Number,
     *       compareType: univerAPI.Enum.TableNumberCompareTypeEnum.GreaterThan,
     *       expectedValue: 10,
     *     },
     *   });
     *
     *   const tableInfo = fWorkbook.getTableInfo('id-1');
     *   console.log('debugger tableInfo', tableInfo);
     * }
     * ```
     */
    setTableFilter(tableId: string, column: number, filter: ITableFilterItem): Promise<boolean>;

    /**
     * Remove a table from the worksheet
     * @param {string} tableId The table id
     * @returns {Promise<boolean>} Whether the table was removed successfully
     * @example
     * ```typescript
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
     * const tableInfo = fWorkbook.getTableInfo('id-1');
     * console.log('debugger tableInfo', tableInfo);
     *
     * if (tableInfo) {
     *   // Remove the table with the specified id
     *   await fWorksheet.removeTable('id-1');
     * }
     * ```
     */
    removeTable(tableId: string): Promise<boolean>;

    /**
     * Set the range of a table
     * @param {string} tableId The table id
     * @param {ITableRange} rangeInfo The new range information
     * @returns {Promise<boolean>} Whether the table range was set successfully
     * @example
     * ```typescript
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
     *
     * // Insert a table in the range B2:F11
     * const fRange = fWorksheet.getRange('B2:F11');
     * const success = await fWorksheet.addTable(
     *   'name-1',
     *   fRange.getRange(),
     *   'id-1',
     *   {
     *     showHeader: true,
     *   }
     * );
     *
     * if (success) {
     *   // Update the table range to B2:F21 after 3 seconds
     *   setTimeout(async () => {
     *     const newRange = fWorksheet.getRange('B2:F21');
     *     await fWorksheet.setTableRange('id-1', newRange.getRange());
     *
     *     const tableInfo = fWorkbook.getTableInfo('id-1');
     *     console.log('debugger tableInfo', tableInfo);
     *   }, 3000);
     * }
     * ```
     */
    setTableRange(tableId: string, rangeInfo: ITableRange): Promise<boolean>;

    /**
     * Set the name of a table
     * @param {string} tableId The table id
     * @param {string} tableName The new table name
     * @returns {Promise<boolean>} Whether the table name was set successfully
     * @example
     * ```typescript
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
     *
     * // Insert a table in the range B2:F11
     * const fRange = fWorksheet.getRange('B2:F11');
     * const success = await fWorksheet.addTable(
     *   'name-1',
     *   fRange.getRange(),
     *   'id-1',
     *   {
     *     showHeader: true,
     *   }
     * );
     *
     * if (success) {
     *   // Update the table name after 3 seconds
     *   setTimeout(async () => {
     *     await fWorksheet.setTableName('id-1', 'new-name');
     *
     *     const tableInfo = fWorkbook.getTableInfo('id-1');
     *     console.log('debugger tableInfo', tableInfo);
     *   }, 3000);
     * }
     * ```
     */
    setTableName(tableId: string, tableName: string): Promise<boolean> | boolean;

    /**
     * Get the list of tables in the worksheet
     * @returns {ITableInfoWithUnitId[]} The list of tables
     * @example
     * ```typescript
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
     * const tables = fWorksheet.getSubTableInfos();
     * console.log('debugger tables', tables);
     * ```
     */
    getSubTableInfos(): ITableInfoWithUnitId[];

    /**
     * Reset the column filter of a table
     * @param {string} tableId The table id
     * @param {number} column The column index, starting from 0. For example, the first column is 0, the second column is 1, and so on.
     * @returns {Promise<boolean>} Whether the table filter was reset successfully
     * @example
     * ```typescript
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
     *
     * // Insert a table in the range B2:F11
     * const fRange = fWorksheet.getRange('B2:F11');
     * const success = await fWorksheet.addTable(
     *   'name-1',
     *   fRange.getRange(),
     *   'id-1',
     *   {
     *     showHeader: true,
     *   }
     * );
     *
     * if (success) {
     *   // Set the filter for the second column
     *   await fWorksheet.setTableFilter('id-1', 1, {
     *     filterType: univerAPI.Enum.TableColumnFilterTypeEnum.condition,
     *     filterInfo: {
     *       conditionType: univerAPI.Enum.TableConditionTypeEnum.Number,
     *       compareType: univerAPI.Enum.TableNumberCompareTypeEnum.GreaterThan,
     *       expectedValue: 10,
     *     },
     *   });
     *
     *   // Reset the filter for the second column after 3 seconds
     *   setTimeout(async () => {
     *     await fWorksheet.resetFilter('id-1', 1);
     *   }, 3000);
     *
     *   const tableInfo = fWorkbook.getTableInfo('id-1');
     *   console.log('debugger tableInfo', tableInfo);
     * }
     * ```
     */
    resetFilter(tableId: string, column: number): Promise<boolean>;

    /**
     * Get the table information by cell position
     * @param {number} row The cell row index, starting from 0.
     * @param {number} column The cell column index, starting from 0.
     * @returns {ITableInfoWithUnitId | undefined} The table information or undefined if not found
     * @example
     * ```typescript
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
     *
     * const cellB2 = fWorksheet.getRange('B2');
     * const row = cellB2.getRow();
     * const column = cellB2.getColumn();
     * console.log('debugger tableInfo', fWorksheet.getTableByCell(row, column));
     *
     * // Insert a table in the range B2:F11
     * const fRange = fWorksheet.getRange('B2:F11');
     * const success = await fWorksheet.addTable(
     *   'name-1',
     *   fRange.getRange(),
     *   'id-1',
     *   {
     *     showHeader: true,
     *   }
     * );
     * console.log('debugger tableInfo2', fWorksheet.getTableByCell(row, column));
     * ```
     */
    getTableByCell(row: number, column: number): ITableInfoWithUnitId | undefined;

    /**
     * Add a theme to the table
     * @param {string} tableId The table id
     * @param {IRangeThemeStyleJSON} themeStyleJSON The theme style JSON
     * @returns {Promise<boolean>} Whether the theme was added successfully
     * @example
     * ```typescript
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
     *
     * // Insert a table in the range B2:F11
     * const fRange = fWorksheet.getRange('B2:F11');
     * const success = await fWorksheet.addTable(
     *   'name-1',
     *   fRange.getRange(),
     *   'id-1',
     *   {
     *     showHeader: true,
     *   }
     * );
     *
     * if (success) {
     *   await fWorksheet.addTableTheme('id-1', {
     *     name: 'table-custom-1',
     *     headerRowStyle: {
     *       bg: {
     *         rgb: '#145f82',
     *       },
     *     },
     *     firstRowStyle: {
     *       bg: {
     *         rgb: '#c0e4f5',
     *       },
     *     },
     *   });
     *
     *   const tableInfo = fWorkbook.getTableInfo('id-1');
     *   console.log('debugger tableInfo', tableInfo);
     * }
     * ```
     */
    addTableTheme(tableId: string, themeStyleJSON: IRangeThemeStyleJSON): Promise<boolean>;
}

export class FWorkSheetTableMixin extends FWorksheet implements IFWorkSheetTableMixin {
    override addTable(tableName: string, rangeInfo: ITableRange, tableId?: string, options?: ITableOptions): Promise<boolean> | boolean {
        const subUnitId = this.getSheetId();
        const workbook = this.getWorkbook();
        const unitId = workbook.getUnitId();

        const localeService = this._injector.get(LocaleService);

        const sheetNameSet = new Set<string>();
        if (workbook) {
            workbook.getSheets().forEach((sheet) => {
                sheetNameSet.add(sheet.getName());
            });
        }
        const isValidName = customNameCharacterCheck(tableName, sheetNameSet);
        if (!isValidName) {
            const logService = this._injector.get(ILogService);
            logService.warn(localeService.t('sheets-table.tableNameError'));
            return false;
        }
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

    override setTableName(tableId: string, tableName: string): Promise<boolean> | boolean {
        const workbook = this.getWorkbook();

        const localeService = this._injector.get(LocaleService);

        const sheetNameSet = new Set<string>();
        if (workbook) {
            workbook.getSheets().forEach((sheet) => {
                sheetNameSet.add(sheet.getName());
            });
        }
        const isValidName = customNameCharacterCheck(tableName, sheetNameSet);
        if (!isValidName) {
            const logService = this._injector.get(ILogService);
            logService.warn(localeService.t('sheets-table.tableNameError'));
            return false;
        }

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

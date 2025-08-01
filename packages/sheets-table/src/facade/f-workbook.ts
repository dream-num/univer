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

import type { Workbook } from '@univerjs/core';
import type { IAddSheetTableCommandParams, IDeleteSheetTableParams, ISetSheetTableParams, ITableFilterItem, ITableInfo, ITableInfoWithUnitId, ITableOptions, ITableRange } from '@univerjs/sheets-table';
import { customNameCharacterCheck, ILogService, IUniverInstanceService, LocaleService, UniverInstanceType } from '@univerjs/core';
import { AddSheetTableCommand, DeleteSheetTableCommand, SetSheetTableFilterCommand, SheetTableService } from '@univerjs/sheets-table';
import { FWorkbook } from '@univerjs/sheets/facade';

/**
 * @ignore
 */
export interface IFWorkbookSheetsTableMixin {
    /**
     * Get table information
     * @param {string} tableId The table id
     * @returns {ITableInfo} The table information
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
    getTableInfo(tableId: string): ITableInfoWithUnitId | undefined;

    /**
     * Get table information by name
     * @param {string} tableName The table name
     * @returns {ITableInfo} The table information
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
     *   const tableInfo = fWorkbook.getTableInfoByName('name-1');
     *   console.log('debugger tableInfo', tableInfo);
     * }
     * ```
     */
    getTableInfoByName(tableName: string): ITableInfoWithUnitId | undefined;

    /**
     * Get table list
     * @returns {ITableInfo[]} The table list
     * @example
     * ```typescript
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const tables = fWorkbook.getTableList();
     * console.log('debugger tables', tables);
     * ```
     */
    getTableList(): ITableInfo[];

    /**
     * Add table
     * @param {string} subUnitId The sub unit id
     * @param {string} tableName The table name
     * @param {ITableRange} rangeInfo The table range information
     * @param {string} [tableId] The table id
     * @param {ITableOptions} [options] The table options
     * @returns {string} The table id
     * @example
     * ```typescript
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
     *
     * // Insert a table in the range B2:F11
     * const fRange = fWorksheet.getRange('B2:F11');
     * const id = await fWorkbook.addTable(
     *   fWorksheet.getSheetId(),
     *   'name-1',
     *   fRange.getRange(),
     *   'id-1',
     *   {
     *     showHeader: true,
     *   }
     * );
     *
     * if (id) {
     *   const tableInfo = fWorkbook.getTableInfo(id);
     *   console.log('debugger tableInfo', tableInfo);
     * }
     * ```
     */
    addTable(subUnitId: string, tableName: string, rangeInfo: ITableRange, tableId?: string, options?: ITableOptions): Promise<string | undefined>;

    /**
     * set table filter
     * @param {string} tableId The table id
     * @param {number} column The column index, starting from 0.
     * @param {ITableFilterItem} filter The filter item
     * @returns {Promise<boolean>} The result of set table filter
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
     *   await fWorkbook.setTableFilter('id-1', 1, {
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
    setTableFilter(tableId: string, column: number, filter: ITableFilterItem | undefined): void;

    /**
     * Remove table
     * @param {string} tableId The table id
     * @returns {boolean} The result of remove table
     * @example
     * ```typescript
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const tableInfo = fWorkbook.getTableInfo('id-1');
     * console.log('debugger tableInfo', tableInfo);
     *
     * if (tableInfo) {
     *   // Remove the table with the specified id
     *   await fWorkbook.removeTable('id-1');
     * }
     * ```
     */
    removeTable(tableId: string): Promise<boolean>;
}

export class FWorkbookSheetsTableMixin extends FWorkbook implements IFWorkbookSheetsTableMixin {
    override getTableInfo(tableId: string): ITableInfoWithUnitId | undefined {
        const unitId = this.getId();
        const sheetTableService = this._injector.get(SheetTableService);
        return sheetTableService.getTableInfo(unitId, tableId);
    }

    override getTableList(): ITableInfoWithUnitId[] {
        const unitId = this.getId();
        const sheetTableService = this._injector.get(SheetTableService);
        return sheetTableService.getTableList(unitId);
    }

    override async addTable(subUnitId: string, tableName: string, rangeInfo: ITableRange, tableId?: string, options?: ITableOptions): Promise<string | undefined> {
        const sheetTableService = this._injector.get(SheetTableService);
        const localeService = this._injector.get(LocaleService);

        const univerInstanceService = this._injector.get(IUniverInstanceService);
        const workbook = univerInstanceService.getCurrentUnitOfType<Workbook>(UniverInstanceType.UNIVER_SHEET);
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
            return undefined;
        }

        const addTableParams: IAddSheetTableCommandParams = {
            unitId: this.getId(),
            name: tableName,
            subUnitId,
            range: rangeInfo,
            options,
            id: tableId,
        };
        const rs = await this._commandService.executeCommand(AddSheetTableCommand.id, addTableParams);
        if (rs) {
            return sheetTableService.getTableList(this.getId()).find((table) => table.name === tableName)?.id;
        }
        return undefined;
    }

    override async removeTable(tableId: string): Promise<boolean> {
        const subUnitId = this.getTableInfo(tableId)?.subUnitId;
        if (!subUnitId) {
            return false;
        }
        const removedTableParams: IDeleteSheetTableParams = {
            unitId: this.getId(),
            subUnitId,
            tableId,
        };
        return this._commandService.executeCommand(DeleteSheetTableCommand.id, removedTableParams);
    }

    override getTableInfoByName(tableName: string): ITableInfoWithUnitId | undefined {
        const tableList = this.getTableList();
        return tableList.find((table) => table.name === tableName);
    }

    override setTableFilter(tableId: string, column: number, filter: ITableFilterItem | undefined): Promise<boolean> {
        const setTableFilterParams: ISetSheetTableParams = {
            unitId: this.getId(),
            tableId,
            column,
            tableFilter: filter,
        };
        return this._commandService.executeCommand(SetSheetTableFilterCommand.id, setTableFilterParams);
    }
}

FWorkbook.extend(FWorkbookSheetsTableMixin);
declare module '@univerjs/sheets/facade' {
    // eslint-disable-next-line ts/naming-convention
    interface FWorkbook extends IFWorkbookSheetsTableMixin { }
}

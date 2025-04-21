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

import type { IAddSheetTableParams, IDeleteSheetTableParams, ISetSheetTableParams, ITableFilterItem, ITableInfo, ITableInfoWithUnitId, ITableOptions, ITableRange } from '@univerjs/sheets-table';
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
     * const fSheet = fWorkbook.getActiveSheet();
     * const id = fWorkbook.addTable('Table1', {
     *  unitId: fWorkbook.getId(),
     *  subUnitId:fSheet.getSheetId(),
     *  range: {
     *      startRow: 1,
     *      startColumn: 1,
     *      endRow: 10,
     *      endColumn: 5,
     * },
     * }, { showHeader: true });
     * const tableInfo = fWorkbook.getTableInfo(fWorkbook.getId(), id);
     * ```
     */
    getTableInfo(tableId: string): ITableInfoWithUnitId | undefined;

    getTableInfoByName(tableName: string): ITableInfoWithUnitId | undefined;
    /**
     * Get table list
     * @returns {ITableInfo[]} The table list
     * @example
     * ```typescript
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fSheet = fWorkbook.getActiveSheet();
     * const id = fWorkbook.addTable('Table1', {
     *  unitId: fWorkbook.getId(),
     *  subUnitId:fSheet.getSheetId(),
     *  range: {
     *      startRow: 1,
     *      startColumn: 1,
     *      endRow: 10,
     *      endColumn: 5,
     * },
     * }, { showHeader: true });
     * const tableList = fWorkbook.getTableList(fWorkbook.getId());
     * ```
     */
    getTableList(): ITableInfo[];
    /**
     * Add table
     * @param {string} tableName The table name
     * @param {ITableRange} rangeInfo The table range information
     * @param {ITableOptions} options The table options
     * @returns {string} The table id
     * @example
     * ```typescript
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fSheet = fWorkbook.getActiveSheet();
     * const id = fWorkbook.addTable('Table1', {
     *  unitId: fWorkbook.getId(),
     *  subUnitId:fSheet.getSheetId(),
     *  range: {
     *      startRow: 1,
     *      startColumn: 1,
     *      endRow: 10,
     *      endColumn: 5,
     * },
     * }, 'table1' ,{ showHeader: true });
     * ```
     */
    addTable(subUnitId: string, tableName: string, rangeInfo: ITableRange, tableId?: string, options?: ITableOptions): Promise<string | undefined>;
    setTableFilter(tableId: string, column: number, filter: ITableFilterItem | undefined): void;
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

        const addTableParams: IAddSheetTableParams = {
            unitId: this.getId(),
            name: tableName,
            subUnitId,
            range: rangeInfo,
            options,
            tableId,
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

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

import type { ISetSheetTableParams, ITableFilterItem, ITableOptions, ITableRange } from '@univerjs/sheets-table';
import { LocaleService } from '@univerjs/core';
import { SetSheetTableFilterCommand, SheetTableService, TableManager } from '@univerjs/sheets-table';
import { FWorksheet } from '@univerjs/sheets/facade';

/**
 * @ignore
 */
export interface IFWorkSheetTableMixin {
    addTable(tableName: string, rangeInfo: ITableRange, tableId?: string, options?: ITableOptions): string;
    addTableFilter(tableId: string, column: number, filter: ITableFilterItem): Promise<boolean>;
}

export class FWorkSheetTableMixin extends FWorksheet implements IFWorkSheetTableMixin {
    override addTable(tableName: string, rangeInfo: ITableRange, tableId?: string, options?: ITableOptions): string {
        const sheetTableService = this._injector.get(SheetTableService);
        const subUnitId = this.getSheetId();
        const unitId = this.getWorkbook().getUnitId();
        const tableManager = this._injector.get(TableManager);
        const localeService = this._injector.get(LocaleService);
        const header = tableManager.getColumnHeader(unitId, subUnitId, rangeInfo, localeService.t('sheets-table.columnPrefix'));
        return sheetTableService.addTable(unitId, subUnitId, tableName, rangeInfo, header, tableId, options);
    }

    override addTableFilter(tableId: string, column: number, filter: ITableFilterItem): Promise<boolean> {
        const setTableFilterParams: ISetSheetTableParams = {
            unitId: this.getWorkbook().getUnitId(),
            tableId,
            column,
            tableFilter: filter,
        };
        return this._commandService.executeCommand(SetSheetTableFilterCommand.id, setTableFilterParams);
    }
}

FWorksheet.extend(FWorkSheetTableMixin);
declare module '@univerjs/sheets/facade' {
    // eslint-disable-next-line ts/naming-convention
    interface FWorksheet extends IFWorkSheetTableMixin { }
}

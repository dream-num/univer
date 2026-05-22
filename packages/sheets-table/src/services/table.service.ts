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

import type { Worksheet } from '@univerjs/core';
import type { ITableFilterItem, ITableInfoWithUnitId, ITableOptions, ITableRange, TableMetaType } from '../types/type';
import { Disposable, Inject } from '@univerjs/core';
import { getCellValueWithConditionType } from '../model/filter-util/condition';
import { TableManager } from '../model/table-manager';
import { TableConditionTypeEnum } from '../types/enum';

export class SheetTableService extends Disposable {
    constructor(
        @Inject(TableManager) private _tableManager: TableManager
    ) {
        super();
    }

    getTableInfo(unitId: string, tableId: string): ITableInfoWithUnitId | undefined {
        const table = this._tableManager.getTable(unitId, tableId);
        if (!table) {
            return;
        }
        return {
            unitId,
            ...table.getTableInfo(),
        };
    }

    getTableList(unitId: string): ITableInfoWithUnitId[] {
        return this._tableManager.getTableList(unitId);
    }

    addTable(unitId: string, subUnitId: string, tableName: string, rangeInfo: ITableRange, tableHeader?: string[], tableId?: string, options?: ITableOptions): string {
        return this._tableManager.addTable(unitId, subUnitId, tableName, rangeInfo, tableHeader, tableId, options);
    }

    deleteTable(unitId: string, subUnitId: string, tableId: string) {
        this._tableManager.deleteTable(unitId, tableId);
    }

    getTableMeta(unitId: string, tableId: string): TableMetaType | undefined {
        return this._tableManager.getTable(unitId, tableId)?.getTableMeta();
    }

    setTableMeta(unitId: string, tableId: string, meta: TableMetaType) {
        this._tableManager.getTable(unitId, tableId)?.setTableMeta(meta);
    }

    getTableColumnMeta(unitId: string, tableId: string, index: number): TableMetaType | undefined {
        return this._tableManager.getTable(unitId, tableId)?.getTableColumnByIndex(index)?.getMeta();
    }

    selTableColumnMeta(unitId: string, tableId: string, index: number, meta: TableMetaType) {
        this._tableManager.getTable(unitId, tableId)?.getTableColumnByIndex(index)?.setMeta(meta);
    }

    addFilter(unitId: string, tableId: string, column: number, filter: ITableFilterItem) {
        this._tableManager.addFilter(unitId, tableId, column, filter);
    }

    getCellValueWithConditionType(sheet: Worksheet, row: number, col: number, conditionType: TableConditionTypeEnum = TableConditionTypeEnum.String) {
        return getCellValueWithConditionType(sheet, row, col, conditionType);
    }
}

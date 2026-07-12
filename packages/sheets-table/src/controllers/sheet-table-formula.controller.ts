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

import type { IRemoveSuperTableMutationParam, ISetSuperTableMutationParam, ISetSuperTableMutationSearchParam } from '@univerjs/engine-formula';
import type { Table } from '../models/table';
import { Disposable, ICommandService, Inject } from '@univerjs/core';
import { RemoveSuperTableMutation, SetSuperTableMutation } from '@univerjs/engine-formula';
import { TableManager } from '../models/table-manager';

export class SheetTableFormulaController extends Disposable {
    constructor(
        @Inject(TableManager) private _tableManager: TableManager,
        @ICommandService private readonly _commandService: ICommandService
    ) {
        super();
        this._initRangeListener();
    }

    private _initRangeListener() {
        this.disposeWithMe(
            this._tableManager.tableRangeChanged$.subscribe((event) => {
                const { tableId, unitId } = event;
                const table = this._tableManager.getTableById(unitId, tableId);
                if (!table) {
                    return;
                }
                this._updateSuperTable(unitId, table);
            })
        );
        this.disposeWithMe(
            this._tableManager.tableAdd$.subscribe((event) => {
                const { tableId, unitId } = event;
                const table = this._tableManager.getTableById(unitId, tableId);
                if (!table) {
                    return;
                }
                this._updateSuperTable(unitId, table);
            })
        );
        this.disposeWithMe(
            this._tableManager.tableDelete$.subscribe((event) => {
                const { unitId, subUnitId, tableName, range } = event;
                this._commandService.executeCommand<IRemoveSuperTableMutationParam>(RemoveSuperTableMutation.id, {
                    unitId,
                    tableName,
                    reference: {
                        sheetId: subUnitId,
                        range,
                    },
                });
            })
        );
        this.disposeWithMe(
            this._tableManager.tableNameChanged$.subscribe((event) => {
                const { tableId, unitId, oldTableName } = event;

                this._commandService.executeCommand<ISetSuperTableMutationSearchParam>(RemoveSuperTableMutation.id, {
                    unitId,
                    tableName: oldTableName,
                });

                const table = this._tableManager.getTableById(unitId, tableId);
                if (!table) {
                    return;
                }
                this._updateSuperTable(unitId, table, oldTableName);
            })
        );
    }

    private _updateSuperTable(unitId: string, table: Table, oldTableName?: string) {
        const tableInfo = table.getTableInfo();
        const name = tableInfo.name;
        const columns = tableInfo.columns;
        const titleMap = new Map<string, number>();
        columns.forEach((column, index) => {
            titleMap.set(column.displayName, index);
        });
        this._commandService.executeCommand<ISetSuperTableMutationParam>(SetSuperTableMutation.id, {
            unitId,
            tableName: name,
            oldTableName,
            reference: {
                range: tableInfo.range,
                sheetId: tableInfo.subUnitId,
                titleMap,
            },
        });
    }
}

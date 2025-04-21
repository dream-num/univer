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

import type { IRange } from '@univerjs/core';

import type { ITableResource } from '../types/type';
import { Disposable, Inject, InterceptorEffectEnum, IResourceManagerService, Rectangle, RTree, UniverInstanceType } from '@univerjs/core';
import { INTERCEPTOR_POINT, SheetInterceptorService } from '@univerjs/sheets';
import { PLUGIN_NAME } from '../const';
import { TableManager } from '../model/table-manager';

export class SheetsTableController extends Disposable {
    private _tableRangeRTree = new Map<string, RTree>();
    constructor(
        @Inject(SheetInterceptorService) private _sheetInterceptorService: SheetInterceptorService,
        @Inject(TableManager) private _tableManager: TableManager,
        @Inject(IResourceManagerService) private _resourceManagerService: IResourceManagerService
    ) {
        super();
        this._initSnapshot();
        this.registerTableChangeEvent();
        this.registerTableHeaderInterceptor();
    }

    getContainerTableWithRange(unitId: string, subUnitId: string, range: IRange) {
        const rTree = this._ensureTableRangeRTree(unitId);
        const ids = Array.from(rTree.bulkSearch([{ unitId, sheetId: subUnitId, range }]));
        const wrapperTableId = ids.find((id) => {
            const table = this._tableManager.getTable(unitId, String(id));
            if (table) {
                return Rectangle.contains(table.getRange(), range);
            }
            return false;
        });
        if (wrapperTableId) {
            const table = this._tableManager.getTable(unitId, String(wrapperTableId));
            return table;
        }
    }

    private _ensureTableRangeRTree(unitId: string) {
        if (!this._tableRangeRTree.has(unitId)) {
            this._tableRangeRTree.set(unitId, new RTree());
        }
        return this._tableRangeRTree.get(unitId)!;
    }

    registerTableChangeEvent() {
        this.disposeWithMe(
            this._tableManager.tableAdd$.subscribe((event) => {
                const { range, tableId, unitId, subUnitId } = event;
                const rTree = this._ensureTableRangeRTree(unitId);
                rTree.insert({
                    unitId,
                    sheetId: subUnitId,
                    id: tableId,
                    range: { ...range },
                });
            })
        );

        this.disposeWithMe(
            this._tableManager.tableRangeChanged$.subscribe((event) => {
                const { range, tableId, unitId, subUnitId, oldRange } = event;
                const rTree = this._ensureTableRangeRTree(unitId);
                rTree.remove({
                    unitId,
                    sheetId: subUnitId,
                    id: tableId,
                    range: { ...oldRange },
                });
                rTree.insert({
                    unitId,
                    sheetId: subUnitId,
                    id: tableId,
                    range: { ...range },
                });
            })
        );

        this.disposeWithMe(
            this._tableManager.tableDelete$.subscribe((event) => {
                const { tableId, unitId, subUnitId, range } = event;
                const rTree = this._ensureTableRangeRTree(unitId);
                rTree.remove({
                    unitId,
                    sheetId: subUnitId,
                    id: tableId,
                    range: { ...range },
                });
            })
        );
    }

    registerTableHeaderInterceptor() {
        this.disposeWithMe(
            this._sheetInterceptorService.intercept(INTERCEPTOR_POINT.CELL_CONTENT, {
                effect: InterceptorEffectEnum.Value,
                handler: (cell, context, next) => {
                    const { row, col, unitId, subUnitId } = context;
                    const rTree = this._ensureTableRangeRTree(unitId);
                    const v = cell?.v;
                    if (v === undefined && rTree) {
                        const ids = Array.from(rTree.bulkSearch([{ unitId, sheetId: subUnitId, range: { startColumn: col, endColumn: col, startRow: row, endRow: row } }]));
                        if (ids.length > 0) {
                            const table = this._tableManager.getTable(unitId, ids[0] as string);
                            if (table) {
                                const tableRange = table.getRange();
                                const index = col - tableRange.startColumn;
                                const tableStartRow = tableRange.startRow;
                                if (tableStartRow === row) {
                                    const columnName = table.getColumnNameByIndex(index);
                                    const newCell = { ...cell, v: columnName };
                                    return next(newCell);
                                }
                            }
                        }
                    }
                    return next(cell);
                },
            })
        );
    }

    private _toJson(unitId: string): ITableResource {
        return this._tableManager.toJSON(unitId);
    }

    private _fromJSON(unitId: string, resources: ITableResource) {
        return this._tableManager.fromJSON(unitId, resources);
    }

    private _deleteUnitId(unitId: string) {
        this._tableManager.deleteUnitId(unitId);
    }

    private _initSnapshot(): void {
        this.disposeWithMe(this._resourceManagerService.registerPluginResource({
            toJson: (unitId: string) => {
                return JSON.stringify(this._toJson(unitId));
            },
            parseJson: (json: string) => {
                if (!json) {
                    return {};
                }
                try {
                    return JSON.parse(json);
                    // eslint-disable-next-line unused-imports/no-unused-vars
                } catch (error) {
                    return {};
                }
            },
            businesses: [UniverInstanceType.UNIVER_SHEET],
            pluginName: PLUGIN_NAME,
            onLoad: (unitId, resources) => {
                this._fromJSON(unitId, resources);
            },
            onUnLoad: (unitId) => {
                this._deleteUnitId(unitId);
            },
        }));
    }

    override dispose() {
        super.dispose();
        this._tableRangeRTree.clear();
    }
}

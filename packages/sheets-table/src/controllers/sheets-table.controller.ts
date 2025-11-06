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

import type { IMutationInfo, IRange, Workbook } from '@univerjs/core';
import type { ICopySheetCommandParams, IRemoveSheetCommandParams } from '@univerjs/sheets';
import type { ITableResource } from '../types/type';
import { Disposable, generateRandomId, Inject, InterceptorEffectEnum, IResourceManagerService, IUniverInstanceService, Rectangle, RTree, UniverInstanceType } from '@univerjs/core';
import { CopySheetCommand, INTERCEPTOR_POINT, RemoveSheetCommand, SheetInterceptorService } from '@univerjs/sheets';
import { AddSheetTableMutation } from '../commands/mutations/add-sheet-table.mutation';
import { DeleteSheetTableMutation } from '../commands/mutations/delete-sheet-table.mutation';
import { PLUGIN_NAME } from '../const';
import { TableManager } from '../model/table-manager';

export class SheetsTableController extends Disposable {
    private _tableRangeRTree = new Map<string, RTree>();
    constructor(
        @Inject(IUniverInstanceService) private _univerInstanceService: IUniverInstanceService,
        @Inject(SheetInterceptorService) private _sheetInterceptorService: SheetInterceptorService,
        @Inject(TableManager) private _tableManager: TableManager,
        @Inject(IResourceManagerService) private _resourceManagerService: IResourceManagerService
    ) {
        super();
        this._initSnapshot();
        this._initSheetChange();
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
                                    if (!cell || cell === context.rawData) {
                                        cell = { ...context.rawData };
                                    }

                                    cell.v = columnName;
                                    return next(cell);
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

    // eslint-disable-next-line max-lines-per-function
    private _initSheetChange() {
        this.disposeWithMe(
            this._sheetInterceptorService.interceptCommand({
                // eslint-disable-next-line max-lines-per-function
                getMutations: (commandInfo) => {
                    if (commandInfo.id === RemoveSheetCommand.id) {
                        const params = commandInfo.params as IRemoveSheetCommandParams;
                        const unitId = params.unitId || this._univerInstanceService.getCurrentUnitOfType<Workbook>(UniverInstanceType.UNIVER_SHEET)!.getUnitId();
                        const subUnitId = params.subUnitId || this._univerInstanceService.getCurrentUnitOfType<Workbook>(UniverInstanceType.UNIVER_SHEET)!.getActiveSheet()?.getSheetId();

                        if (!unitId || !subUnitId) {
                            return { redos: [], undos: [] };
                        }

                        const tables = this._tableManager.getTablesBySubunitId(unitId, subUnitId);

                        if (tables.length === 0) {
                            return { redos: [], undos: [] };
                        }

                        const redos: IMutationInfo[] = [];
                        const undos: IMutationInfo[] = [];

                        tables.forEach((table) => {
                            const tableJson = table.toJSON();

                            redos.push({
                                id: DeleteSheetTableMutation.id,
                                params: {
                                    unitId,
                                    subUnitId,
                                    tableId: tableJson.id,
                                },
                            });
                            undos.push({
                                id: AddSheetTableMutation.id,
                                params: {
                                    unitId,
                                    subUnitId,
                                    name: tableJson.name,
                                    range: tableJson.range,
                                    tableId: tableJson.id,
                                    options: {
                                        ...tableJson.options,
                                        columns: tableJson.columns,
                                        filters: tableJson.filters.tableColumnFilterList,
                                    },
                                },
                            });
                        });

                        return { redos, undos };
                    } else if (commandInfo.id === CopySheetCommand.id) {
                        const params = commandInfo.params as ICopySheetCommandParams & { targetSubUnitId: string };
                        const { unitId, subUnitId, targetSubUnitId } = params;

                        if (!unitId || !subUnitId || !targetSubUnitId) {
                            return { redos: [], undos: [] };
                        }

                        const tables = this._tableManager.getTablesBySubunitId(unitId, subUnitId);

                        if (tables.length === 0) {
                            return { redos: [], undos: [] };
                        }

                        const redos: IMutationInfo[] = [];
                        const undos: IMutationInfo[] = [];

                        tables.forEach((table) => {
                            const tableJson = table.toJSON();
                            const tableId = generateRandomId();

                            redos.push({
                                id: AddSheetTableMutation.id,
                                params: {
                                    unitId,
                                    subUnitId: targetSubUnitId,
                                    name: tableJson.name,
                                    range: {
                                        ...tableJson.range,
                                        sheetId: targetSubUnitId,
                                    },
                                    tableId,
                                    options: {
                                        ...tableJson.options,
                                        columns: tableJson.columns,
                                        filters: tableJson.filters.tableColumnFilterList,
                                    },
                                },
                            });
                            undos.push({
                                id: DeleteSheetTableMutation.id,
                                params: {
                                    unitId,
                                    subUnitId: targetSubUnitId,
                                    tableId,
                                },
                            });
                        });

                        return { redos, undos };
                    }
                    return { redos: [], undos: [] };
                },
            })
        );
    }

    override dispose() {
        super.dispose();
        this._tableRangeRTree.clear();
    }
}

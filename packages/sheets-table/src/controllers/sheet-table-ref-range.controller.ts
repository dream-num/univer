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

/* eslint-disable max-lines-per-function */
/* eslint-disable complexity */

import type { IMutationInfo, Workbook } from '@univerjs/core';
import type { IInsertColCommandParams, IInsertRowCommandParams, IInsertRowMutationParams, IRemoveRowColCommandParams } from '@univerjs/sheets';
import type { ITableColumnJson } from '../types/type';
import { Disposable, ICommandService, Inject, Injector, IUniverInstanceService, LocaleService, Rectangle } from '@univerjs/core';
import { getSheetCommandTarget, InsertColCommand, InsertColMutation, InsertRowCommand, InsertRowMutation, RefRangeService, RemoveColCommand, RemoveColMutation, RemoveRowCommand, RemoveRowMutation, SheetInterceptorService } from '@univerjs/sheets';
import { AddSheetTableMutation } from '../commands/mutations/add-sheet-table.mutation';
import { DeleteSheetTableMutation } from '../commands/mutations/delete-sheet-table.mutation';
import { SetSheetTableMutation } from '../commands/mutations/set-sheet-table.mutation';
import { TableManager } from '../model/table-manager';
import { IRangeOperationTypeEnum, IRowColTypeEnum } from '../types/type';
import { convertCellDataToString, getColumnName } from '../util';

export class SheetTableRefRangeController extends Disposable {
    constructor(
        @Inject(ICommandService) private readonly _commandService: ICommandService,
        @Inject(RefRangeService) private readonly _refRangeService: RefRangeService,
        @Inject(IUniverInstanceService) private readonly _univerInstanceService: IUniverInstanceService,
        @Inject(Injector) private _injector: Injector,
        @Inject(SheetInterceptorService) private _sheetInterceptorService: SheetInterceptorService,
        @Inject(TableManager) private _tableManager: TableManager,
        @Inject(LocaleService) private _localeService: LocaleService

    ) {
        super();
        this._initCommandInterceptor();
        this._initCommandListener();
    }

    private _initCommandInterceptor() {
        const self = this;
        this._sheetInterceptorService.interceptCommand({
            getMutations(commandInfo) {
                const defaultReturn = { redos: [], undos: [] };
                const { id, params } = commandInfo;
                switch (id) {
                    case InsertRowCommand.id:
                        return self._generateTableMutationWithInsertRow(params as IInsertRowCommandParams);
                    case InsertColCommand.id:
                        return self._generateTableMutationWithInsertCol(params as IInsertColCommandParams);
                    case RemoveRowCommand.id:
                        return self._generateTableMutationWithRemoveRow(params as IRemoveRowColCommandParams);
                    case RemoveColCommand.id:
                        return self._generateTableMutationWithRemoveCol(params as IRemoveRowColCommandParams);
                }

                return defaultReturn;
            },
        });
    }

    private _generateTableMutationWithInsertRow(insertParams: IInsertRowCommandParams) {
        const undos: IMutationInfo[] = [];
        const redos: IMutationInfo[] = [];

        const target = getSheetCommandTarget(this._univerInstanceService);
        if (!target) {
            return { undos, redos };
        }

        const { unitId, subUnitId } = target;
        const allSubUnitTables = this._tableManager.getTablesBySubunitId(unitId, subUnitId);
        if (!allSubUnitTables.length) {
            return { undos, redos };
        }

        const { range } = insertParams;
        allSubUnitTables.forEach((table) => {
            const tableRange = table.getRange();
            if (range.startRow > tableRange.startRow && range.startRow <= tableRange.endRow) {
                const insertRowCount = range.endRow - range.startRow + 1;
                redos.push({
                    id: SetSheetTableMutation.id,
                    params: {
                        unitId,
                        subUnitId,
                        tableId: table.getId(),
                        config: {
                            updateRange: {
                                newRange: {
                                    ...tableRange,
                                    endRow: tableRange.endRow + insertRowCount,
                                },
                            },
                        },
                    },
                });

                undos.push({
                    id: SetSheetTableMutation.id,
                    params: {
                        unitId,
                        subUnitId,
                        tableId: table.getId(),
                        config: {
                            updateRange: {
                                newRange: {
                                    ...tableRange,
                                },
                            },
                        },
                    },
                });
            }
        });

        return { undos, redos };
    }

    private _generateTableMutationWithInsertCol(insertParams: IInsertColCommandParams) {
        const undos: IMutationInfo[] = [];
        const redos: IMutationInfo[] = [];

        const target = getSheetCommandTarget(this._univerInstanceService);
        if (!target) {
            return { undos, redos };
        }
        const { unitId, subUnitId } = target;
        const allSubUnitTables = this._tableManager.getTablesBySubunitId(unitId, subUnitId);
        if (!allSubUnitTables.length) {
            return { undos, redos };
        }
        const { range } = insertParams;
        allSubUnitTables.forEach((table) => {
            const tableRange = table.getRange();
            if (range.startColumn > tableRange.startColumn && range.startColumn <= tableRange.endColumn) {
                const insertColCount = range.endColumn - range.startColumn + 1;
                redos.push({
                    id: SetSheetTableMutation.id,
                    params: {
                        unitId,
                        subUnitId,
                        tableId: table.getId(),
                        config: {
                            rowColOperation: {
                                operationType: IRangeOperationTypeEnum.Insert,
                                rowColType: IRowColTypeEnum.Col,
                                index: range.startColumn,
                                count: insertColCount,
                            },
                        },
                    },
                });

                undos.push({
                    id: SetSheetTableMutation.id,
                    params: {
                        unitId,
                        subUnitId,
                        tableId: table.getId(),
                        config: {
                            rowColOperation: {
                                operationType: IRangeOperationTypeEnum.Delete,
                                rowColType: IRowColTypeEnum.Col,
                                index: range.startColumn,
                                count: insertColCount,
                            },
                        },
                    },
                });
            }
        });

        return { undos, redos };
    }

    private _generateTableMutationWithRemoveRow(removeParams: IRemoveRowColCommandParams) {
        const undos: IMutationInfo[] = [];
        const redos: IMutationInfo[] = [];
        const preRedos: IMutationInfo[] = [];
        const preUndos: IMutationInfo[] = [];

        const target = getSheetCommandTarget(this._univerInstanceService);
        if (!target) {
            return { undos, redos, preRedos, preUndos };
        }
        const { unitId, subUnitId } = target;
        const allSubUnitTables = this._tableManager.getTablesBySubunitId(unitId, subUnitId);
        if (!allSubUnitTables.length) {
            return { undos, redos, preRedos, preUndos };
        }
        const { range } = removeParams;
        const removeRowCount = range.endRow - range.startRow + 1;

        allSubUnitTables.forEach((table) => {
            const tableRange = table.getRange();
            if (Rectangle.intersects(tableRange, range)) {
                if (range.startRow <= tableRange.startRow && range.endRow >= tableRange.startRow) {
                    preRedos.push({
                        id: DeleteSheetTableMutation.id,
                        params: {
                            unitId,
                            subUnitId,
                            tableId: table.getId(),
                        },
                    });
                    const tableJson = table.toJSON();
                    undos.push({
                        id: AddSheetTableMutation.id,
                        params: {
                            unitId,
                            subUnitId,
                            tableId: tableJson.id,
                            name: tableJson.name,
                            range: tableJson.range,
                            options: tableJson.options,
                        },
                    });
                } else if (range.startRow > tableRange.startRow && range.startRow <= tableRange.endRow) {
                    redos.push({
                        id: SetSheetTableMutation.id,
                        params: {
                            unitId,
                            subUnitId,
                            tableId: table.getId(),
                            config: {
                                updateRange: {
                                    newRange: {
                                        ...tableRange,
                                        endRow: tableRange.endRow - removeRowCount,
                                    },
                                },
                            },
                        },
                    });

                    undos.push({
                        id: SetSheetTableMutation.id,
                        params: {
                            unitId,
                            subUnitId,
                            tableId: table.getId(),
                            config: {
                                updateRange: {
                                    newRange: {
                                        ...tableRange,
                                    },
                                },
                            },
                        },
                    });
                } else if (range.startRow < tableRange.endRow && range.endRow >= tableRange.endRow) {
                    redos.push({
                        id: SetSheetTableMutation.id,
                        params: {
                            unitId,
                            subUnitId,
                            tableId: table.getId(),
                            config: {
                                updateRange: {
                                    newRange: {
                                        ...tableRange,
                                        endRow: range.startRow - 1,
                                    },
                                },
                            },
                        },
                    });

                    undos.push({
                        id: SetSheetTableMutation.id,
                        params: {
                            unitId,
                            subUnitId,
                            tableId: table.getId(),
                            config: {
                                updateRange: {
                                    newRange: {
                                        ...tableRange,
                                    },
                                },
                            },
                        },
                    });
                }
            }
        });

        return { undos, redos, preRedos, preUndos };
    }

    private _generateTableMutationWithRemoveCol(removeParams: IRemoveRowColCommandParams) {
        const undos: IMutationInfo[] = [];
        const redos: IMutationInfo[] = [];
        const preRedos: IMutationInfo[] = [];
        const preUndos: IMutationInfo[] = [];

        const target = getSheetCommandTarget(this._univerInstanceService);
        if (!target) {
            return { undos, redos, preRedos, preUndos };
        }
        const { unitId, subUnitId } = target;
        const allSubUnitTables = this._tableManager.getTablesBySubunitId(unitId, subUnitId);
        if (!allSubUnitTables.length) {
            return { undos, redos, preRedos, preUndos };
        }
        const { range } = removeParams;
        const removeColCount = range.endColumn - range.startColumn + 1;
        allSubUnitTables.forEach((table) => {
            const tableRange = table.getRange();
            if (Rectangle.intersects(tableRange, range)) {
                if (range.startColumn <= tableRange.startColumn && range.endColumn >= tableRange.endColumn) {
                    preRedos.push({
                        id: DeleteSheetTableMutation.id,
                        params: {
                            unitId,
                            subUnitId,
                            tableId: table.getId(),
                        },
                    });
                    const tableJson = table.toJSON();
                    const { startRow, startColumn, endColumn } = tableJson.range;
                    const workbook = this._univerInstanceService.getUnit<Workbook>(unitId);
                    const worksheet = workbook?.getSheetBySheetId(subUnitId);
                    if (!worksheet) {
                        return { undos, redos, preRedos, preUndos };
                    }
                    const header: string[] = [];
                    for (let i = startColumn; i <= endColumn; i++) {
                        header.push(convertCellDataToString(worksheet?.getCell(startRow, i)) || getColumnName(i - startColumn + 1, this._localeService.t('sheets-table.columnPrefix')));
                    }
                    undos.push({
                        id: AddSheetTableMutation.id,
                        params: {
                            unitId,
                            subUnitId,
                            tableId: tableJson.id,
                            name: tableJson.name,
                            header,
                            range: tableJson.range,
                            options: tableJson.options,
                        },
                    });
                } else if (range.startColumn <= tableRange.startColumn && range.endColumn >= tableRange.startColumn) {
                    const removeColumnCount = range.endColumn - tableRange.startColumn + 1;
                    redos.push({
                        id: SetSheetTableMutation.id,
                        params: {
                            unitId,
                            subUnitId,
                            tableId: table.getId(),
                            config: {
                                rowColOperation: {
                                    operationType: IRangeOperationTypeEnum.Delete,
                                    rowColType: IRowColTypeEnum.Col,
                                    index: tableRange.startColumn,
                                    count: removeColumnCount,
                                },
                            },
                        },
                    });
                    const columns: ITableColumnJson[] = [];
                    for (let i = 0; i < removeColumnCount; i++) {
                        const column = table.getTableColumnByIndex(i);
                        if (column) {
                            columns.push(column.toJSON());
                        }
                    }
                    undos.push({
                        id: SetSheetTableMutation.id,
                        params: {
                            unitId,
                            subUnitId,
                            tableId: table.getId(),
                            config: {
                                rowColOperation: {
                                    operationType: IRangeOperationTypeEnum.Insert,
                                    rowColType: IRowColTypeEnum.Col,
                                    index: tableRange.startColumn,
                                    count: removeColumnCount,
                                    columnsJson: columns,
                                },
                            },
                        },
                    });
                } else if (range.startColumn > tableRange.startColumn && range.endColumn > tableRange.endColumn) {
                    const removeColumnCount = tableRange.endColumn - range.startColumn + 1;
                    redos.push({
                        id: SetSheetTableMutation.id,
                        params: {
                            unitId,
                            subUnitId,
                            tableId: table.getId(),
                            config: {
                                rowColOperation: {
                                    operationType: IRangeOperationTypeEnum.Delete,
                                    rowColType: IRowColTypeEnum.Col,
                                    index: range.startColumn,
                                    count: removeColumnCount,
                                },
                            },
                        },
                    });

                    const columns: ITableColumnJson[] = [];
                    const gap = range.startColumn - tableRange.startColumn;
                    for (let i = 0; i < removeColumnCount; i++) {
                        const column = table.getTableColumnByIndex(i + gap);
                        if (column) {
                            columns.push(column.toJSON());
                        }
                    }

                    undos.push({
                        id: SetSheetTableMutation.id,
                        params: {
                            unitId,
                            subUnitId,
                            tableId: table.getId(),
                            config: {
                                rowColOperation: {
                                    operationType: IRangeOperationTypeEnum.Insert,
                                    rowColType: IRowColTypeEnum.Col,
                                    index: range.startColumn,
                                    count: removeColCount,
                                    columnsJson: columns,
                                },
                            },
                        },
                    });
                } else if (range.startColumn > tableRange.startColumn && range.endColumn <= tableRange.endColumn) {
                    redos.push({
                        id: SetSheetTableMutation.id,
                        params: {
                            unitId,
                            subUnitId,
                            tableId: table.getId(),
                            config: {
                                rowColOperation: {
                                    operationType: IRangeOperationTypeEnum.Delete,
                                    rowColType: IRowColTypeEnum.Col,
                                    index: range.startColumn,
                                    count: removeColCount,
                                },
                            },
                        },
                    });

                    const columns: ITableColumnJson[] = [];
                    const gap = range.startColumn - tableRange.startColumn;
                    for (let i = 0; i < removeColCount; i++) {
                        const column = table.getTableColumnByIndex(i + gap);
                        if (column) {
                            columns.push(column.toJSON());
                        }
                    }
                    undos.push({
                        id: SetSheetTableMutation.id,
                        params: {
                            unitId,
                            subUnitId,
                            tableId: table.getId(),
                            config: {
                                rowColOperation: {
                                    operationType: IRangeOperationTypeEnum.Insert,
                                    rowColType: IRowColTypeEnum.Col,
                                    index: range.startColumn,
                                    count: removeColCount,
                                    columnsJson: columns,
                                },
                            },
                        },
                    });
                }
            }
        });

        return { undos, redos, preRedos, preUndos };
    }

    private _initCommandListener() {
        this._commandService.onCommandExecuted((commandInfo) => {
            if (commandInfo.id === InsertRowMutation.id) {
                const params = commandInfo.params as IInsertRowMutationParams;
                const { unitId, subUnitId, range } = params;
                const insertCount = range.endRow - range.startRow + 1;
                const allTables = this._tableManager.getTablesBySubunitId(unitId, subUnitId);
                allTables.forEach((table) => {
                    const tableRange = table.getRange();
                    if (range.startRow <= tableRange.startRow) {
                        this._tableManager.updateTableRange(unitId, table.getId(), {
                            newRange: {
                                ...tableRange,
                                startRow: tableRange.startRow + insertCount,
                                endRow: tableRange.endRow + insertCount,
                            },
                        });
                    }
                });
            } else if (commandInfo.id === InsertColMutation.id) {
                const params = commandInfo.params as IInsertRowMutationParams;
                const { unitId, subUnitId, range } = params;
                const insertCount = range.endColumn - range.startColumn + 1;
                const allTables = this._tableManager.getTablesBySubunitId(unitId, subUnitId);
                allTables.forEach((table) => {
                    const tableRange = table.getRange();
                    if (range.startColumn <= tableRange.startColumn) {
                        this._tableManager.updateTableRange(unitId, table.getId(), {
                            newRange: {
                                ...tableRange,
                                startColumn: tableRange.startColumn + insertCount,
                                endColumn: tableRange.endColumn + insertCount,
                            },
                        });
                    }
                });
            } else if (commandInfo.id === RemoveRowMutation.id) {
                const params = commandInfo.params as IInsertRowMutationParams;
                const { unitId, subUnitId, range } = params;
                const removeCount = range.endRow - range.startRow + 1;
                const allTables = this._tableManager.getTablesBySubunitId(unitId, subUnitId);
                allTables.forEach((table) => {
                    const tableRange = table.getRange();
                    if (range.startRow < tableRange.startRow) {
                        this._tableManager.updateTableRange(unitId, table.getId(), {
                            newRange: {
                                ...tableRange,
                                startRow: tableRange.startRow - removeCount,
                                endRow: tableRange.endRow - removeCount,
                            },
                        });
                    }
                });
            } else if (commandInfo.id === RemoveColMutation.id) {
                const params = commandInfo.params as IInsertRowMutationParams;
                const { unitId, subUnitId, range } = params;
                const removeCount = range.endColumn - range.startColumn + 1;
                const allTables = this._tableManager.getTablesBySubunitId(unitId, subUnitId);
                allTables.forEach((table) => {
                    const tableRange = table.getRange();
                    if (range.startColumn < tableRange.startColumn) {
                        this._tableManager.updateTableRange(unitId, table.getId(), {
                            newRange: {
                                ...tableRange,
                                startColumn: tableRange.startColumn - removeCount,
                                endColumn: tableRange.endColumn - removeCount,
                            },
                        });
                    }
                });
            }
        });
    }
}

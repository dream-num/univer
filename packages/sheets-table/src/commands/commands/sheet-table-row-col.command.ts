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

import type { ICommand, IMutationInfo } from '@univerjs/core';
import type { ITableColumnJson } from '../../types/type';
import { CommandType, ICommandService, IUndoRedoService, IUniverInstanceService, sequenceExecute } from '@univerjs/core';
import { getMoveRangeUndoRedoMutations, getSheetCommandTarget, InsertColMutation, InsertRowMutation, RemoveColMutation, RemoveRowMutation, SheetsSelectionsService } from '@univerjs/sheets';
import { SheetsTableController } from '../../controllers/sheets-table.controller';
import { TableManager } from '../../model/table-manager';
import { IRangeOperationTypeEnum, IRowColTypeEnum } from '../../types/type';
import { SetSheetTableMutation } from '../mutations/set-sheet-table.mutation';

interface ISheetTableRowColOperationCommandParams {
    tableId: string;
    unitId: string;
    subUnitId: string;
}

export const SheetTableInsertRowCommand: ICommand<ISheetTableRowColOperationCommandParams> = {
    id: 'sheet.command.table-insert-row',
    type: CommandType.COMMAND,
    handler: (accessor) => {
        const univerInstanceService = accessor.get(IUniverInstanceService);
        const target = getSheetCommandTarget(univerInstanceService);

        if (!target) {
            return false;
        }

        const { workbook, worksheet, unitId, subUnitId } = target;

        const sheetsSelectionsService = accessor.get(SheetsSelectionsService);
        const selections = sheetsSelectionsService.getCurrentSelections();
        if (!selections.length || selections.length > 1) {
            return false;
        }

        const tableManager = accessor.get(TableManager);

        const selection = selections[0];
        const range = selection.range;

        const sheetsTableController = accessor.get(SheetsTableController);
        const table = sheetsTableController.getContainerTableWithRange(unitId, subUnitId, range);

        if (!table) return false;

        const insertRowCount = range.endRow - range.startRow + 1;

        const worksheetCount = worksheet.getRowCount();
        const worksheetLastRowIndex = worksheetCount - 1;
        const rowContentIndex = worksheet.getCellMatrix().getDataRange().endRow;

        const redos: IMutationInfo[] = [];
        const undos: IMutationInfo[] = [];

        if (worksheetLastRowIndex - rowContentIndex < insertRowCount) {
            // should insert row
            redos.push({
                id: InsertRowMutation.id,
                params: {
                    unitId,
                    subUnitId,
                    range: { ...range },
                },
            });
            redos.push({
                id: SetSheetTableMutation.id,
                params: {
                    unitId,
                    subUnitId,
                    tableId: table.getId(),
                    config: {
                        updateRange: {
                            newRange: {
                                ...table.getRange(),
                                endRow: table.getRange().endRow + insertRowCount,
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
                            newRange: table.getRange(),
                        },
                    },
                },
            });
            undos.push({
                id: RemoveRowMutation.id,
                params: {
                    unitId,
                    subUnitId,
                    range: { ...range },
                },
            });
        } else {
            const oldRange = { ...table.getRange() };
            redos.push({
                id: SetSheetTableMutation.id,
                params: {
                    unitId,
                    subUnitId,
                    tableId: table.getId(),
                    config: {
                        updateRange: {
                            newRange: {
                                ...oldRange,
                                endRow: oldRange.endRow + insertRowCount,
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
                            newRange: { ...oldRange },
                        },
                    },
                },
            });

            const moveRangeMutations = getMoveRangeUndoRedoMutations(
                accessor,
                {
                    unitId,
                    subUnitId,
                    range: {
                        startRow: range.startRow,
                        endRow: rowContentIndex,
                        startColumn: oldRange.startColumn,
                        endColumn: oldRange.endColumn,
                    },
                },
                {
                    unitId,
                    subUnitId,
                    range: {
                        startRow: range.startRow + insertRowCount,
                        endRow: rowContentIndex + insertRowCount,
                        startColumn: oldRange.startColumn,
                        endColumn: oldRange.endColumn,
                    },
                }
            );
            if (moveRangeMutations) {
                redos.push(...moveRangeMutations.redos);
                undos.push(...moveRangeMutations.undos);
            }
        }

        const commandService = accessor.get(ICommandService);
        const res = sequenceExecute(redos, commandService);

        if (res) {
            const undoRedoService = accessor.get(IUndoRedoService);
            undoRedoService.pushUndoRedo({
                unitID: unitId,
                undoMutations: undos,
                redoMutations: redos,
            });
        }

        return true;
    },
};

export const SheetTableInsertColCommand: ICommand<ISheetTableRowColOperationCommandParams> = {
    id: 'sheet.command.table-insert-col',
    type: CommandType.COMMAND,
    handler: (accessor) => {
        const univerInstanceService = accessor.get(IUniverInstanceService);
        const target = getSheetCommandTarget(univerInstanceService);
        if (!target) {
            return false;
        }
        const { worksheet, unitId, subUnitId } = target;
        const sheetsSelectionsService = accessor.get(SheetsSelectionsService);
        const selections = sheetsSelectionsService.getCurrentSelections();
        if (!selections.length || selections.length > 1) {
            return false;
        }
        const selection = selections[0];
        const range = selection.range;
        const sheetsTableController = accessor.get(SheetsTableController);
        const table = sheetsTableController.getContainerTableWithRange(unitId, subUnitId, range);
        if (!table) return false;
        const insertColCount = range.endColumn - range.startColumn + 1;
        const worksheetCount = worksheet.getColumnCount();
        const worksheetLastColIndex = worksheetCount - 1;
        const colContentIndex = worksheet.getCellMatrix().getDataRange().endColumn;
        const redos: IMutationInfo[] = [];
        const undos: IMutationInfo[] = [];
        if (worksheetLastColIndex - colContentIndex < insertColCount) {
            // should insert col
            redos.push({
                id: InsertColMutation.id,
                params: {
                    unitId,
                    subUnitId,
                    range: { ...range },
                },
            });
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
            undos.push({
                id: RemoveColMutation.id,
                params: {
                    unitId,
                    subUnitId,
                    range: { ...range },
                },
            });
        } else {
            const oldRange = table.getRange();
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

            const moveRangeMutations = getMoveRangeUndoRedoMutations(
                accessor,
                {
                    unitId,
                    subUnitId,
                    range: {
                        startRow: oldRange.startRow,
                        endRow: oldRange.endRow,
                        startColumn: range.startColumn,
                        endColumn: colContentIndex,
                    },
                },
                {
                    unitId,
                    subUnitId,
                    range: {
                        startRow: oldRange.startRow,
                        endRow: oldRange.endRow,
                        startColumn: range.startColumn + insertColCount,
                        endColumn: colContentIndex + insertColCount,
                    },
                }
            );
            if (moveRangeMutations) {
                redos.push(...moveRangeMutations.redos);
                undos.push(...moveRangeMutations.undos);
            }
        }
        const commandService = accessor.get(ICommandService);
        const res = sequenceExecute(redos, commandService);
        if (res) {
            const undoRedoService = accessor.get(IUndoRedoService);
            undoRedoService.pushUndoRedo({
                unitID: unitId,
                undoMutations: undos,
                redoMutations: redos,
            });
        }

        return true;
    },
};

export const SheetTableRemoveRowCommand: ICommand<ISheetTableRowColOperationCommandParams> = {
    id: 'sheet.command.table-remove-row',
    type: CommandType.COMMAND,
    handler: (accessor, params) => {
        if (!params) {
            return false;
        }

        const univerInstanceService = accessor.get(IUniverInstanceService);
        const target = getSheetCommandTarget(univerInstanceService);
        if (!target) {
            return false;
        }
        const { unitId, subUnitId } = target;
        const sheetsSelectionsService = accessor.get(SheetsSelectionsService);
        const selections = sheetsSelectionsService.getCurrentSelections();
        if (!selections.length || selections.length > 1) {
            return false;
        }
        const selection = selections[0];
        const range = selection.range;
        const sheetsTableController = accessor.get(SheetsTableController);
        const table = sheetsTableController.getContainerTableWithRange(unitId, subUnitId, range);
        if (!table) return false;
        const removeRowCount = range.endRow - range.startRow + 1;
        const redos: IMutationInfo[] = [];
        const undos: IMutationInfo[] = [];

        const oldRange = table.getRange();
        redos.push({
            id: SetSheetTableMutation.id,
            params: {
                unitId,
                subUnitId,
                tableId: table.getId(),
                config: {
                    updateRange: {
                        newRange: {
                            ...oldRange,
                            endRow: oldRange.endRow - removeRowCount,
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
                        newRange: { ...oldRange },
                    },
                },
            },
        });

        const worksheet = target.worksheet;
        const rowContentIndex = worksheet.getCellMatrix().getDataRange().endRow;
        const moveRangeMutations = getMoveRangeUndoRedoMutations(
            accessor,
            {
                unitId,
                subUnitId,
                range: {
                    startRow: range.endRow + 1,
                    endRow: rowContentIndex,
                    startColumn: oldRange.startColumn,
                    endColumn: oldRange.endColumn,
                },
            },
            {
                unitId,
                subUnitId,
                range: {
                    startRow: range.startRow,
                    endRow: rowContentIndex - removeRowCount,
                    startColumn: oldRange.startColumn,
                    endColumn: oldRange.endColumn,
                },
            }
        );

        if (moveRangeMutations) {
            redos.push(...moveRangeMutations.redos);
            undos.push(...moveRangeMutations.undos);
        }

        const commandService = accessor.get(ICommandService);
        const res = sequenceExecute(redos, commandService);
        if (res) {
            const undoRedoService = accessor.get(IUndoRedoService);
            undoRedoService.pushUndoRedo({
                unitID: unitId,
                undoMutations: undos,
                redoMutations: redos,
            });
        }

        return true;
    },
};

export const SheetTableRemoveColCommand: ICommand<ISheetTableRowColOperationCommandParams> = {
    id: 'sheet.command.table-remove-col',
    type: CommandType.COMMAND,
    handler: (accessor, params) => {
        if (!params) {
            return false;
        }
        const univerInstanceService = accessor.get(IUniverInstanceService);
        const target = getSheetCommandTarget(univerInstanceService);
        if (!target) {
            return false;
        }
        const { workbook, unitId, subUnitId } = target;
        const tableManager = accessor.get(TableManager);
        const sheetsSelectionsService = accessor.get(SheetsSelectionsService);
        const selections = sheetsSelectionsService.getCurrentSelections();
        if (!selections.length || selections.length > 1) {
            return false;
        }
        const selection = selections[0];
        const range = selection.range;
        const sheetsTableController = accessor.get(SheetsTableController);
        const table = sheetsTableController.getContainerTableWithRange(unitId, subUnitId, range);
        if (!table) return false;
        const removeColCount = range.endColumn - range.startColumn + 1;
        const redos: IMutationInfo[] = [];
        const undos: IMutationInfo[] = [];
        const oldRange = table.getRange();

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
        const gap = range.startColumn - oldRange.startColumn;
        for (let i = 0; i < removeColCount; i++) {
            const column = table.getTableInfo().columns[gap + i];
            if (column) {
                columns.push(column);
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

        const worksheet = target.worksheet;
        const colContentIndex = worksheet.getCellMatrix().getDataRange().endColumn;
        const moveRangeMutations = getMoveRangeUndoRedoMutations(
            accessor,
            {
                unitId,
                subUnitId,
                range: {
                    startRow: oldRange.startRow,
                    endRow: oldRange.endRow,
                    startColumn: range.endColumn + 1,
                    endColumn: colContentIndex,
                },
            },
            {
                unitId,
                subUnitId,
                range: {
                    startRow: oldRange.startRow,
                    endRow: oldRange.endRow,
                    startColumn: range.startColumn,
                    endColumn: colContentIndex - removeColCount,
                },
            }
        );

        if (moveRangeMutations) {
            redos.push(...moveRangeMutations.redos);
            undos.push(...moveRangeMutations.undos);
        }

        const commandService = accessor.get(ICommandService);
        const res = sequenceExecute(redos, commandService);
        if (res) {
            const undoRedoService = accessor.get(IUndoRedoService);
            undoRedoService.pushUndoRedo({
                unitID: unitId,
                undoMutations: undos,
                redoMutations: redos,
            });
        }

        return true;
    },
};

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

import type { IAccessor, ICellData, IMutationInfo, IObjectMatrixPrimitiveType, IRange, Nullable } from '@univerjs/core';
import { Dimension, getArrayLength, IUniverInstanceService, ObjectMatrix, Tools } from '@univerjs/core';

import type {
    IDeleteRangeMutationParams,
    IInsertRangeMutationParams,
} from '../../basics/interfaces/mutation-interface';
import { SheetInterceptorService } from '../../services/sheet-interceptor/sheet-interceptor.service';
import { getMoveRangeUndoRedoMutations } from '../commands/move-range.command';
import { SetRangeValuesCommand } from '../commands/set-range-values.command';
import {
    type ISetRangeValuesMutationParams,
    SetRangeValuesMutation,
    SetRangeValuesUndoMutationFactory,
} from '../mutations/set-range-values.mutation';
import { getSheetMutationTarget } from '../commands/utils/target-util';
import { generateNullCell } from '../../basics/utils';

/**
 * Generate undo mutation of a `InsertRangeMutation`
 *
 * @param {IAccessor} accessor - injector accessor
 * @param {IInsertRangeMutationParams} params - do mutation params
 * @returns {IDeleteRangeMutationParams} undo mutation params
 */
export const InsertRangeUndoMutationFactory = (
    accessor: IAccessor,
    params: IInsertRangeMutationParams
): IDeleteRangeMutationParams => ({
    unitId: params.unitId,
    subUnitId: params.subUnitId,
    range: params.range,
    shiftDimension: params.shiftDimension,
});

// export const InsertRangeMutation: IMutation<IInsertRangeMutationParams, boolean> = {
//     id: 'sheet.mutation.insert-range',
//     type: CommandType.MUTATION,
//     handler: (accessor, params) => {
//         const { unitId, subUnitId, range, cellValue, shiftDimension } = params;
//         const univerInstanceService = accessor.get(IUniverInstanceService);
//         const workbook = univerInstanceService.getUniverSheetInstance(unitId);
//         if (!workbook) return false;
//         const worksheet = workbook.getSheetBySheetId(subUnitId);
//         if (!worksheet) return false;

//         const cellMatrix = worksheet.getCellMatrix();
//         const lastEndRow = worksheet.getLastRowWithContent();
//         const lastEndColumn = worksheet.getLastColumnWithContent();

//         handleInsertRangeMutation(cellMatrix, range, lastEndRow, lastEndColumn, shiftDimension, cellValue);

//         return true;
//     },
// };

/**
 * InsertRange is not a mutation but combination of `SetRangeValuesMutation` and `MoveRangeMutation`.
 * @param accessor
 * @param params
 * @returns
 */

export function getInsertRangeMutations(accessor: IAccessor, params: IInsertRangeMutationParams) {
    const redo: IMutationInfo[] = [];
    const undo: IMutationInfo[] = [];
    const { unitId, subUnitId, range, shiftDimension, cellValue = {} } = params;
    const instanceService = accessor.get(IUniverInstanceService);
    const sheetInterceptorService = accessor.get(SheetInterceptorService);

    const workbook = instanceService.getUniverSheetInstance(unitId);
    const worksheet = workbook?.getSheetBySheetId(subUnitId);
    if (worksheet) {
        const cellMatrix = worksheet.getCellMatrix();
        const dataRange = cellMatrix.getDataRange();

        if (range.startColumn <= dataRange.endColumn || range.startRow <= dataRange.endRow) {
            let moveFromRange: IRange;
            let moveToRange: IRange;
            if (shiftDimension === Dimension.COLUMNS) {
                const endRow = Math.min(range.endRow, dataRange.endRow);
                let endColumn = 0;
                for (let row = range.startRow; row <= endRow; row++) {
                    const rowData = cellMatrix.getRow(row);
                    const rowLength = rowData ? getArrayLength(rowData) - 1 : 0;
                    endColumn = Math.max(endColumn, rowLength);
                }

                moveFromRange = {
                    startRow: range.startRow,
                    startColumn: range.startColumn,
                    endRow,
                    endColumn,
                };
                const shift = range.endColumn - range.startColumn + 1;
                moveToRange = {
                    startRow: range.startRow,
                    startColumn: moveFromRange.startColumn + shift,
                    endRow,
                    endColumn: moveFromRange.endColumn + shift,
                };
            } else {
                const endColumn = Math.min(range.endColumn, dataRange.endColumn);
                const endRow = dataRange.endRow;
                moveFromRange = {
                    startRow: range.startRow,
                    startColumn: range.startColumn,
                    endRow,
                    endColumn,
                };
                const shift = range.endRow - range.startRow + 1;
                moveToRange = {
                    startRow: moveFromRange.startRow + shift,
                    startColumn: range.startColumn,
                    endRow: moveFromRange.endRow + shift,
                    endColumn,
                };
            }

            const moveRangeMutations = getMoveRangeUndoRedoMutations(
                accessor,
                { unitId, subUnitId, range: moveFromRange },
                { unitId, subUnitId, range: moveToRange },
                true
            );
            if (moveRangeMutations) {
                redo.push(...moveRangeMutations.redos);
                undo.push(...moveRangeMutations.undos);
            }
        }

        if (Object.entries(cellValue).length === 0) {
            for (let row = range.startRow; row <= range.endRow; row++) {
                if (!cellValue[row]) {
                    cellValue[row] = {};
                }
                for (let column = range.startColumn; column <= range.endColumn; column++) {
                    cellValue[row][column] = null;
                }
            }
        }

        const setRangeValuesMutationParams: ISetRangeValuesMutationParams = {
            subUnitId,
            unitId,
            cellValue,
        };
        const undoSetRangeValuesMutationParams: ISetRangeValuesMutationParams = SetRangeValuesUndoMutationFactory(
            accessor,
            setRangeValuesMutationParams
        );
        const { undos: interceptorUndos, redos: interceptorRedos } = sheetInterceptorService.onCommandExecute({
            id: SetRangeValuesCommand.id,
            params: { ...setRangeValuesMutationParams, range },
        });

        redo.push({ id: SetRangeValuesMutation.id, params: setRangeValuesMutationParams }, ...interceptorRedos);
        undo.push({ id: SetRangeValuesMutation.id, params: undoSetRangeValuesMutationParams }, ...interceptorUndos);
    }
    return {
        redo,
        undo,
    };
}

// eslint-disable-next-line max-lines-per-function
export function getRemoveRangeMutations(accessor: IAccessor, params: IDeleteRangeMutationParams) {
    const redo: IMutationInfo[] = [];
    const undo: IMutationInfo[] = [];
    const { unitId, subUnitId, range, shiftDimension } = params;
    const instanceService = accessor.get(IUniverInstanceService);
    const sheetInterceptorService = accessor.get(SheetInterceptorService);

    const workbook = instanceService.getUniverSheetInstance(unitId);
    const worksheet = workbook?.getSheetBySheetId(subUnitId);
    if (worksheet) {
        const cellMatrix = worksheet.getCellMatrix();
        const dataRange = cellMatrix.getDataRange();

        const setRangeValuesMutationParams: ISetRangeValuesMutationParams = {
            subUnitId,
            unitId,
            cellValue: generateNullCell([range]),
        };
        const undoSetRangeValuesMutationParams: ISetRangeValuesMutationParams = SetRangeValuesUndoMutationFactory(
            accessor,
            setRangeValuesMutationParams
        );
        const intercepted = sheetInterceptorService.onCommandExecute({
            id: SetRangeValuesCommand.id,
            params: setRangeValuesMutationParams,
        });
        redo.push({ id: SetRangeValuesMutation.id, params: setRangeValuesMutationParams }, ...intercepted.redos);
        undo.push(...intercepted.undos, {
            id: SetRangeValuesMutation.id,
            params: undoSetRangeValuesMutationParams,
        });

        if (range.startColumn <= dataRange.endColumn || range.startRow <= dataRange.endRow) {
            let moveFromRange: IRange | null = null;
            let moveToRange: IRange | null = null;
            if (shiftDimension === Dimension.COLUMNS && range.endColumn < dataRange.endColumn) {
                const endRow = Math.min(range.endRow, dataRange.endRow);
                let endColumn = 0;
                for (let row = range.startRow; row <= endRow; row++) {
                    const rowData = cellMatrix.getRow(row);
                    const rowLength = rowData ? getArrayLength(rowData) - 1 : 0;
                    endColumn = Math.max(endColumn, rowLength);
                }

                moveFromRange = {
                    startRow: range.startRow,
                    startColumn: range.endColumn + 1,
                    endRow,
                    endColumn,
                };
                const shift = range.endColumn - range.startColumn + 1;
                moveToRange = {
                    startRow: range.startRow,
                    startColumn: moveFromRange.startColumn - shift,
                    endRow,
                    endColumn: moveFromRange.endColumn - shift,
                };
            }

            if (shiftDimension === Dimension.ROWS && range.endRow < dataRange.endRow) {
                const endColumn = Math.min(range.endColumn, dataRange.endColumn);
                const endRow = dataRange.endRow;
                moveFromRange = {
                    startRow: range.endRow + 1,
                    startColumn: range.startColumn,
                    endRow,
                    endColumn,
                };
                const shift = range.endRow - range.startRow + 1;
                moveToRange = {
                    startRow: moveFromRange.startRow - shift,
                    startColumn: range.startColumn,
                    endRow: moveFromRange.endRow - shift,
                    endColumn,
                };
            }

            if (moveFromRange && moveToRange) {
                const moveRangeMutations = getMoveRangeUndoRedoMutations(
                    accessor,
                    { unitId, subUnitId, range: moveFromRange },
                    { unitId, subUnitId, range: moveToRange },
                    true
                );
                if (moveRangeMutations) {
                    redo.push(...moveRangeMutations.redos);
                    undo.push(...moveRangeMutations.undos);
                }
            }
        }
    }
    return {
        redo,
        undo,
    };
}

export function handleInsertRangeMutation<T>(
    cellMatrix: ObjectMatrix<T>,
    range: IRange,
    lastEndRow: number,
    lastEndColumn: number,
    shiftDimension: Dimension,
    cellValue?: IObjectMatrixPrimitiveType<T>
) {
    const { startRow, endRow, startColumn, endColumn } = range;
    if (shiftDimension === Dimension.ROWS) {
        const rows = endRow - startRow + 1;
        // build new data
        for (let r = lastEndRow; r >= startRow; r--) {
            for (let c = startColumn; c <= endColumn; c++) {
                // get value blow current range

                const value = cellMatrix.getValue(r, c);
                if (value == null) {
                    cellMatrix.realDeleteValue(r + rows, c);
                } else {
                    cellMatrix.setValue(r + rows, c, value);
                }
            }
        }
        // insert cell value from user
        for (let r = endRow; r >= startRow; r--) {
            for (let c = startColumn; c <= endColumn; c++) {
                if (cellValue && cellValue[r] && cellValue[r][c]) {
                    cellMatrix.setValue(r, c, cellValue[r][c]);
                } else {
                    cellMatrix.realDeleteValue(r, c);
                }
            }
        }
    } else if (shiftDimension === Dimension.COLUMNS) {
        const columns = endColumn - startColumn + 1;
        for (let r = startRow; r <= endRow; r++) {
            for (let c = lastEndColumn; c >= startColumn; c--) {
                // get value blow current range
                const value = cellMatrix.getValue(r, c);

                if (value == null) {
                    cellMatrix.realDeleteValue(r, c + columns);
                } else {
                    cellMatrix.setValue(r, c + columns, value);
                }
            }
        }
        // insert cell value from user
        for (let r = startRow; r <= endRow; r++) {
            for (let c = endColumn; c >= startColumn; c--) {
                if (cellValue && cellValue[r] && cellValue[r][c]) {
                    cellMatrix.setValue(r, c, cellValue[r][c]);
                } else {
                    cellMatrix.realDeleteValue(r, c);
                }
            }
        }
    }
}

/**
 * Generate undo mutation of a `DeleteRangeMutation`
 *
 * @param {IAccessor} accessor - injector accessor
 * @param {IDeleteRangeMutationParams} params - do mutation params
 * @returns {IInsertRangeMutationParams} undo mutation params
 */
export const DeleteRangeUndoMutationFactory = (
    accessor: IAccessor,
    params: IDeleteRangeMutationParams
): Nullable<IInsertRangeMutationParams> => {
    const univerInstanceService = accessor.get(IUniverInstanceService);
    const target = getSheetMutationTarget(univerInstanceService, params);
    if (!target) return null;

    const { worksheet } = target;
    const cellMatrix = worksheet.getCellMatrix();
    const undoData = new ObjectMatrix<ICellData>();
    const lastEndRow = worksheet.getConfig().rowCount;
    const lastEndColumn = worksheet.getConfig().columnCount;

    const { startRow, endRow, startColumn, endColumn } = params.range;
    if (params.shiftDimension === Dimension.ROWS) {
        // build new data
        for (let r = startRow; r <= lastEndRow; r++) {
            for (let c = startColumn; c <= endColumn; c++) {
                // store old value
                if (r <= endRow) {
                    const cell: Nullable<ICellData> = cellMatrix.getValue(r, c);
                    undoData.setValue(r, c, cell as ICellData);
                }
            }
        }
    } else if (params.shiftDimension === Dimension.COLUMNS) {
        // build new data
        for (let r = startRow; r <= endRow; r++) {
            for (let c = startColumn; c <= lastEndColumn; c++) {
                // store old value
                if (c <= endColumn) {
                    const cell: Nullable<ICellData> = cellMatrix.getValue(r, c);
                    undoData.setValue(r, c, cell as ICellData);
                } else {
                    for (let i = 0; i <= endColumn; i++) {
                        const cell: Nullable<ICellData> = cellMatrix.getValue(r, c);
                        undoData.setValue(r, c + i, cell as ICellData);
                    }
                }
            }
        }
    }

    return {
        ...Tools.deepClone(params),
        cellValue: undoData.getData(),
    };
};

export function handleDeleteRangeMutation<T>(
    cellMatrix: ObjectMatrix<T>,
    range: IRange,
    lastEndRow: number,
    lastEndColumn: number,
    shiftDimension: Dimension
) {
    const { startRow, endRow, startColumn, endColumn } = range;

    const rows = endRow - startRow + 1;
    const columns = endColumn - startColumn + 1;

    if (shiftDimension === Dimension.ROWS) {
        // build new data
        for (let r = startRow; r <= lastEndRow; r++) {
            for (let c = startColumn; c <= endColumn; c++) {
                // get value blow current range
                const value = cellMatrix.getValue(r + rows, c);
                if (value == null) {
                    cellMatrix.realDeleteValue(r, c);
                } else {
                    cellMatrix.setValue(r, c, value);
                }
            }
        }
    } else if (shiftDimension === Dimension.COLUMNS) {
        // build new data
        for (let r = startRow; r <= endRow; r++) {
            for (let c = startColumn; c <= lastEndColumn; c++) {
                // get value blow current range

                const value = cellMatrix.getValue(r, c + columns);
                if (value == null) {
                    cellMatrix.realDeleteValue(r, c);
                } else {
                    cellMatrix.setValue(r, c, value);
                }
            }
        }
    }
}

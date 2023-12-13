/**
 * Copyright 2023-present DreamNum Inc.
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

import type { ICellData, IMutationInfo, IRange } from '@univerjs/core';
import { IUniverInstanceService, ObjectMatrix, Rectangle } from '@univerjs/core';
import type {
    IAddWorksheetMergeMutationParams,
    IMoveRangeMutationParams,
    IRemoveWorksheetMergeMutationParams,
    ISetRangeValuesMutationParams,
} from '@univerjs/sheets';
import {
    AddMergeUndoMutationFactory,
    AddWorksheetMergeMutation,
    MoveRangeCommand,
    MoveRangeMutation,
    NORMAL_SELECTION_PLUGIN_NAME,
    RemoveMergeUndoMutationFactory,
    RemoveWorksheetMergeMutation,
    SetRangeValuesMutation,
    SetRangeValuesUndoMutationFactory,
    SetSelectionsOperation,
    SheetInterceptorService,
} from '@univerjs/sheets';
import type { IAccessor } from '@wendellhu/redi';

import type { ICellDataWithSpanInfo } from '../../services/clipboard/type';
import { COPY_TYPE } from '../../services/clipboard/type';

// if special paste need append mutations instead of replace the default, it can use this function to generate default mutations.
export function getDefaultOnPasteCellMutations(
    pastedRange: IRange,
    matrix: ObjectMatrix<ICellDataWithSpanInfo>,
    unitId: string,
    subUnitId: string,
    copyInfo: {
        copyType: COPY_TYPE;
        copyRange?: IRange;
    },
    accessor: IAccessor
) {
    const redoMutationsInfo: IMutationInfo[] = [];
    const undoMutationsInfo: IMutationInfo[] = [];
    if (copyInfo.copyType === COPY_TYPE.CUT) {
        const { undos, redos } = getMoveRangeMutations(pastedRange, unitId, subUnitId, copyInfo, accessor);
        redoMutationsInfo.push(...redos);
        undoMutationsInfo.push(...undos);
    } else {
        // clear style
        const { undos: clearStyleUndos, redos: clearStyleRedos } = getClearCellStyleMutations(
            unitId,
            subUnitId,
            pastedRange,
            matrix,
            accessor
        );
        redoMutationsInfo.push(...clearStyleRedos);
        undoMutationsInfo.push(...clearStyleUndos);

        // set values
        const { undos: setValuesUndos, redos: setValuesRedos } = getSetCellValueMutations(
            unitId,
            subUnitId,
            pastedRange,
            matrix,
            accessor
        );
        redoMutationsInfo.push(...setValuesRedos);
        undoMutationsInfo.push(...setValuesUndos);

        // set styles
        const { undos: setStyleUndos, redos: setStyleRedos } = getSetCellStyleMutations(
            unitId,
            subUnitId,
            pastedRange,
            matrix,
            accessor
        );
        redoMutationsInfo.push(...setStyleRedos);
        undoMutationsInfo.push(...setStyleUndos);

        // clear and add merge
        const { undos: clearMergeUndos, redos: clearMergeRedos } = getClearAndSetMergeMutations(
            unitId,
            subUnitId,
            pastedRange,
            matrix,
            accessor
        );
        redoMutationsInfo.push(...clearMergeRedos);
        undoMutationsInfo.push(...clearMergeUndos);
    }
    return {
        undos: undoMutationsInfo,
        redos: redoMutationsInfo,
    };
}

export function getMoveRangeMutations(
    pastedRange: IRange,
    unitId: string,
    subUnitId: string,
    copyInfo: {
        copyType: COPY_TYPE;
        copyRange?: IRange;
    },
    accessor: IAccessor
) {
    let redoMutationsInfo: IMutationInfo[] = [];
    let undoMutationsInfo: IMutationInfo[] = [];
    const { copyRange } = copyInfo;
    if (copyRange) {
        const univerInstanceService = accessor.get(IUniverInstanceService);
        const sheetInterceptorService = accessor.get(SheetInterceptorService);
        const workbook = univerInstanceService.getUniverSheetInstance(unitId);
        const worksheet = workbook?.getSheetBySheetId(subUnitId);
        if (worksheet) {
            const fromValues = worksheet.getRange(copyRange).getValues();

            const newFromCellValues = fromValues.reduce((res, row, rowIndex) => {
                row.forEach((colItem, colIndex) => {
                    res.setValue(copyRange.startRow + rowIndex, copyRange.startColumn + colIndex, null);
                });
                return res;
            }, new ObjectMatrix<ICellData | null>());
            const currentFromCellValues = fromValues.reduce((res, row, rowIndex) => {
                row.forEach((colItem, colIndex) => {
                    res.setValue(copyRange.startRow + rowIndex, copyRange.startColumn + colIndex, colItem);
                });
                return res;
            }, new ObjectMatrix<ICellData | null>());

            const newToCellValues = fromValues.reduce((res, row, rowIndex) => {
                row.forEach((colItem, colIndex) => {
                    res.setValue(pastedRange.startRow + rowIndex, pastedRange.startColumn + colIndex, colItem);
                });
                return res;
            }, new ObjectMatrix<ICellData | null>());
            const currentToCellValues = worksheet
                .getRange(pastedRange)
                .getValues()
                .reduce((res, row, rowIndex) => {
                    row.forEach((colItem, colIndex) => {
                        res.setValue(pastedRange.startRow + rowIndex, pastedRange.startColumn + colIndex, colItem);
                    });
                    return res;
                }, new ObjectMatrix<ICellData | null>());

            const doMoveRangeMutation: IMoveRangeMutationParams = {
                from: newFromCellValues.getMatrix(),
                to: newToCellValues.getMatrix(),
                unitId,
                subUnitId,
            };
            const undoMoveRangeMutation: IMoveRangeMutationParams = {
                from: currentFromCellValues.getMatrix(),
                to: currentToCellValues.getMatrix(),
                unitId,
                subUnitId,
            };
            const interceptorCommands = sheetInterceptorService.onCommandExecute({
                id: MoveRangeCommand.id,
                params: { toRange: pastedRange, fromRange: copyRange },
            });

            redoMutationsInfo = [
                { id: MoveRangeMutation.id, params: doMoveRangeMutation },
                ...interceptorCommands.redos,
                {
                    id: SetSelectionsOperation.id,
                    params: {
                        unitId,
                        sheetId: subUnitId,
                        pluginName: NORMAL_SELECTION_PLUGIN_NAME,
                        selections: [{ range: pastedRange }],
                    },
                },
            ];
            undoMutationsInfo = [
                {
                    id: SetSelectionsOperation.id,
                    params: {
                        unitId,
                        sheetId: subUnitId,
                        pluginName: NORMAL_SELECTION_PLUGIN_NAME,
                        selections: [{ range: copyRange }],
                    },
                },
                ...interceptorCommands.undos,
                { id: MoveRangeMutation.id, params: undoMoveRangeMutation },
            ];
        }
    }

    return {
        undos: undoMutationsInfo,
        redos: redoMutationsInfo,
    };
}

export function getSetCellValueMutations(
    unitId: string,
    subUnitId: string,
    range: IRange,
    matrix: ObjectMatrix<ICellDataWithSpanInfo>,
    accessor: IAccessor
) {
    const redoMutationsInfo: IMutationInfo[] = [];
    const undoMutationsInfo: IMutationInfo[] = [];
    const { startColumn, startRow } = range;
    const valueMatrix = new ObjectMatrix<ICellData>();

    matrix.forValue((row, col, value) => {
        valueMatrix.setValue(row + startRow, col + startColumn, {
            v: value.v,
        });
        // if (value.p?.body) {
        //     valueMatrix.setValue(row + startRow, col + startColumn, {
        //         p: {
        //             body: {
        //                 dataStream: value.p.body.dataStream,
        //             },
        //         },
        //     });
        // }
    });
    // set cell value and style
    const setValuesMutation: ISetRangeValuesMutationParams = {
        unitId,
        subUnitId,
        cellValue: valueMatrix.getData(),
    };

    redoMutationsInfo.push({
        id: SetRangeValuesMutation.id,
        params: setValuesMutation,
    });

    // undo
    const undoSetValuesMutation: ISetRangeValuesMutationParams = SetRangeValuesUndoMutationFactory(
        accessor,
        setValuesMutation
    );

    undoMutationsInfo.push({
        id: SetRangeValuesMutation.id,
        params: undoSetValuesMutation,
    });
    return {
        undos: undoMutationsInfo,
        redos: redoMutationsInfo,
    };
}

export function getSetCellStyleMutations(
    unitId: string,
    subUnitId: string,
    range: IRange,
    matrix: ObjectMatrix<ICellDataWithSpanInfo>,
    accessor: IAccessor
) {
    const redoMutationsInfo: IMutationInfo[] = [];
    const undoMutationsInfo: IMutationInfo[] = [];
    const { startColumn, startRow } = range;
    const valueMatrix = new ObjectMatrix<ICellData>();

    matrix.forValue((row, col, value) => {
        valueMatrix.setValue(row + startRow, col + startColumn, {
            s: value.s,
        });
        if (value.p?.body) {
            valueMatrix.setValue(row + startRow, col + startColumn, {
                p: value.p,
            });
        }
    });
    // set cell style
    const setValuesMutation: ISetRangeValuesMutationParams = {
        unitId,
        subUnitId,
        cellValue: valueMatrix.getData(),
    };

    redoMutationsInfo.push({
        id: SetRangeValuesMutation.id,
        params: setValuesMutation,
    });

    // undo
    const undoSetValuesMutation: ISetRangeValuesMutationParams = SetRangeValuesUndoMutationFactory(
        accessor,
        setValuesMutation
    );

    undoMutationsInfo.push({
        id: SetRangeValuesMutation.id,
        params: undoSetValuesMutation,
    });
    return {
        undos: undoMutationsInfo,
        redos: redoMutationsInfo,
    };
}

export function getClearCellStyleMutations(
    unitId: string,
    subUnitId: string,
    range: IRange,
    matrix: ObjectMatrix<ICellDataWithSpanInfo>,
    accessor: IAccessor
) {
    const redoMutationsInfo: IMutationInfo[] = [];
    const undoMutationsInfo: IMutationInfo[] = [];
    const clearStyleMatrix = new ObjectMatrix<ICellData>();
    const { startColumn, startRow } = range;

    matrix.forValue((row, col, value) => {
        // NOTE: When pasting, the original cell may contain a default style that is not explicitly carried, resulting in the failure to overwrite the style of the target cell.
        // If the original cell has a style (lack of other default styles) or is undefined (all default styles), we need to clear the existing styles in the target area
        // If the original cell style is "", it is to handle the situation where the target area contains merged cells. The style is not overwritten, only the value is overwritten. There is no need to clear the existing style of the target area.
        if (value.s) {
            clearStyleMatrix.setValue(row + startRow, col + startColumn, { s: null });
        }
    });
    // clear style
    if (clearStyleMatrix.getLength() > 0) {
        const clearMutation: ISetRangeValuesMutationParams = {
            subUnitId,
            unitId,
            cellValue: clearStyleMatrix.getData(),
        };
        redoMutationsInfo.push({
            id: SetRangeValuesMutation.id,
            params: clearMutation,
        });

        // undo
        const undoClearMutation: ISetRangeValuesMutationParams = SetRangeValuesUndoMutationFactory(
            accessor,
            clearMutation
        );

        undoMutationsInfo.push({
            id: SetRangeValuesMutation.id,
            params: undoClearMutation,
        });
    }

    return { undos: undoMutationsInfo, redos: redoMutationsInfo };
}

export function getClearAndSetMergeMutations(
    unitId: string,
    subUnitId: string,
    range: IRange,
    matrix: ObjectMatrix<ICellDataWithSpanInfo>,
    accessor: IAccessor
) {
    const redoMutationsInfo: IMutationInfo[] = [];
    const undoMutationsInfo: IMutationInfo[] = [];
    const { startColumn, startRow, endColumn, endRow } = range;
    let hasMerge = false;
    const mergeRangeData: IRange[] = [];

    matrix.forValue((row, col, value) => {
        if (value.rowSpan) {
            const colSpan = value.colSpan || 1;
            const mergeRange = {
                startRow: startRow + row,
                endRow: startRow + row + value.rowSpan - 1,
                startColumn: startColumn + col,
                endColumn: startColumn + col + colSpan - 1,
            };
            mergeRangeData.push(mergeRange);
            hasMerge = true;
        } else if (value.colSpan) {
            const rowSpan = value.rowSpan || 1;
            const mergeRange = {
                startRow: startRow + row,
                endRow: startRow + row + rowSpan - 1,
                startColumn: startColumn + col,
                endColumn: startColumn + col + value.colSpan - 1,
            };
            mergeRangeData.push(mergeRange);
            hasMerge = true;
        }
    });

    // clear merge
    // remove current range's all merged Cell
    if (hasMerge) {
        // get all merged cells
        const currentService = accessor.get(IUniverInstanceService) as IUniverInstanceService;
        const workbook = currentService.getUniverSheetInstance(unitId);
        const worksheet = workbook?.getSheetBySheetId(subUnitId);
        if (workbook && worksheet) {
            const mergeData = worksheet.getMergeData();
            const mergedCellsInRange = mergeData.filter((rect) =>
                Rectangle.intersects({ startRow, startColumn, endRow, endColumn }, rect)
            );

            const removeMergeMutationParams: IRemoveWorksheetMergeMutationParams = {
                unitId,
                subUnitId,
                ranges: mergedCellsInRange,
            };
            redoMutationsInfo.push({
                id: RemoveWorksheetMergeMutation.id,
                params: removeMergeMutationParams,
            });

            const undoRemoveMergeMutationParams: IAddWorksheetMergeMutationParams = RemoveMergeUndoMutationFactory(
                accessor,
                removeMergeMutationParams
            );

            undoMutationsInfo.push({
                id: AddWorksheetMergeMutation.id,
                params: undoRemoveMergeMutationParams,
            });
        }
    }

    // set merged cell info
    const addMergeMutationParams: IAddWorksheetMergeMutationParams = {
        unitId,
        subUnitId,
        ranges: mergeRangeData,
    };
    redoMutationsInfo.push({
        id: AddWorksheetMergeMutation.id,
        params: addMergeMutationParams,
    });

    // undo
    const undoAddMergeMutation: IRemoveWorksheetMergeMutationParams = AddMergeUndoMutationFactory(
        accessor,
        addMergeMutationParams
    );

    undoMutationsInfo.push({
        id: RemoveWorksheetMergeMutation.id,
        params: undoAddMergeMutation,
    });

    return { undos: undoMutationsInfo, redos: redoMutationsInfo };
}

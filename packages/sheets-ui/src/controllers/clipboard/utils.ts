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

import type { ICellData, IDocumentBody, IMutationInfo, IParagraph, IRange, Nullable } from '@univerjs/core';
import { cellToRange, IUniverInstanceService, ObjectMatrix, Range, Rectangle, Tools } from '@univerjs/core';
import type {
    IAddWorksheetMergeMutationParams,
    IMoveRangeMutationParams,
    IRemoveWorksheetMergeMutationParams,
    ISetRangeValuesMutationParams,
    ISetSelectionsOperationParams,
} from '@univerjs/sheets';
import {
    AddMergeUndoMutationFactory,
    AddWorksheetMergeMutation,
    getAddMergeMutationRangeByType,
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

import type { ICellDataWithSpanInfo, ICopyPastePayload, ISheetRangeLocation } from '../../services/clipboard/type';
import { COPY_TYPE } from '../../services/clipboard/type';

// if special paste need append mutations instead of replace the default, it can use this function to generate default mutations.
export function getDefaultOnPasteCellMutations(
    pasteFrom: ISheetRangeLocation,
    pasteTo: ISheetRangeLocation,
    data: ObjectMatrix<ICellDataWithSpanInfo>,
    payload: ICopyPastePayload,
    accessor: IAccessor
) {
    const redoMutationsInfo: IMutationInfo[] = [];
    const undoMutationsInfo: IMutationInfo[] = [];
    if (payload.copyType === COPY_TYPE.CUT) {
        const { undos, redos } = getMoveRangeMutations(pasteFrom, pasteTo, accessor);
        redoMutationsInfo.push(...redos);
        undoMutationsInfo.push(...undos);
    } else {
        const { unitId, subUnitId, range } = pasteTo;
        // clear style
        const { undos: clearStyleUndos, redos: clearStyleRedos } = getClearCellStyleMutations(pasteTo, data, accessor);
        redoMutationsInfo.push(...clearStyleRedos);
        undoMutationsInfo.push(...clearStyleUndos);

        // set values
        const { undos: setValuesUndos, redos: setValuesRedos } = getSetCellValueMutations(pasteTo, data, accessor);
        redoMutationsInfo.push(...setValuesRedos);
        undoMutationsInfo.push(...setValuesUndos);

        // set styles
        const { undos: setStyleUndos, redos: setStyleRedos } = getSetCellStyleMutations(pasteTo, data, accessor);
        redoMutationsInfo.push(...setStyleRedos);
        undoMutationsInfo.push(...setStyleUndos);

        // clear and add merge
        const { undos: clearMergeUndos, redos: clearMergeRedos } = getClearAndSetMergeMutations(
            pasteTo,
            data,
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
    from: {
        unitId: string;
        subUnitId: string;
        range?: IRange;
    },
    to: {
        unitId: string;
        subUnitId: string;
        range?: IRange;
    },
    accessor: IAccessor
) {
    let redos: IMutationInfo[] = [];
    let undos: IMutationInfo[] = [];
    const { range: fromRange, subUnitId: fromSubUnitId, unitId } = from;
    const { range: toRange, subUnitId: toSubUnitId } = to;

    if (fromRange && toRange) {
        const univerInstanceService = accessor.get(IUniverInstanceService);
        const sheetInterceptorService = accessor.get(SheetInterceptorService);
        const workbook = univerInstanceService.getUniverSheetInstance(unitId);
        const fromWorksheet = workbook?.getSheetBySheetId(fromSubUnitId);
        const toWorksheet = workbook?.getSheetBySheetId(toSubUnitId);
        if (fromWorksheet && toWorksheet) {
            const fromCellValue = new ObjectMatrix<Nullable<ICellData>>();
            const newFromCellValue = new ObjectMatrix<Nullable<ICellData>>();
            const fromCellMatrix = fromWorksheet.getCellMatrix();
            const toCellMatrix = toWorksheet.getCellMatrix();

            Range.foreach(fromRange, (row, col) => {
                fromCellValue.setValue(row, col, Tools.deepClone(fromCellMatrix.getValue(row, col)));
                newFromCellValue.setValue(row, col, null);
            });
            const toCellValue = new ObjectMatrix<Nullable<ICellData>>();

            Range.foreach(toRange, (row, col) => {
                toCellValue.setValue(row, col, Tools.deepClone(toCellMatrix.getValue(row, col)));
            });

            const newToCellValue = new ObjectMatrix<Nullable<ICellData>>();

            Range.foreach(fromRange, (row, col) => {
                const cellRange = cellToRange(row, col);
                const relativeRange = Rectangle.getRelativeRange(cellRange, fromRange);
                const range = Rectangle.getPositionRange(relativeRange, toRange);
                newToCellValue.setValue(range.startRow, range.startColumn, fromCellMatrix.getValue(row, col));
            });

            const doMoveRangeMutation: IMoveRangeMutationParams = {
                from: {
                    value: newFromCellValue.getMatrix(),
                    subUnitId: fromSubUnitId,
                },
                to: {
                    value: newToCellValue.getMatrix(),
                    subUnitId: toSubUnitId,
                },
                unitId,
            };
            const undoMoveRangeMutation: IMoveRangeMutationParams = {
                from: {
                    value: fromCellValue.getMatrix(),
                    subUnitId: fromSubUnitId,
                },
                to: {
                    value: toCellValue.getMatrix(),
                    subUnitId: toSubUnitId,
                },
                unitId,
            };
            const interceptorCommands = sheetInterceptorService.onCommandExecute({
                id: MoveRangeCommand.id,
                params: { toRange, fromRange },
            });

            // handle merge mutations
            const fromMergeData = fromWorksheet.getMergeData();
            const toMergeData = toWorksheet.getMergeData();
            const fromMergeRanges = fromMergeData.filter((item) => Rectangle.intersects(item, fromRange));
            const toMergeRanges = toMergeData.filter((item) => Rectangle.intersects(item, toRange));

            const willMoveToMergeRanges = fromMergeRanges
                .map((mergeRange) => Rectangle.getRelativeRange(mergeRange, fromRange))
                .map((relativeRange) => Rectangle.getPositionRange(relativeRange, toRange));

            const addMergeCellRanges = getAddMergeMutationRangeByType(willMoveToMergeRanges).filter(
                (range) => !toMergeData.some((mergeRange) => Rectangle.equals(range, mergeRange))
            );

            const mergeRedos: Array<{
                id: string;
                params: IAddWorksheetMergeMutationParams | IRemoveWorksheetMergeMutationParams;
            }> = [
                {
                    id: RemoveWorksheetMergeMutation.id,
                    params: {
                        unitId,
                        subUnitId: fromSubUnitId,
                        ranges: fromMergeRanges,
                    },
                },
                {
                    id: RemoveWorksheetMergeMutation.id,
                    params: {
                        unitId,
                        subUnitId: fromSubUnitId,
                        ranges: toMergeRanges,
                    },
                },
                {
                    id: AddWorksheetMergeMutation.id,
                    params: {
                        unitId,
                        subUnitId: toSubUnitId,
                        ranges: addMergeCellRanges,
                    },
                },
            ];
            const mergeUndos: Array<{
                id: string;
                params: IAddWorksheetMergeMutationParams | IRemoveWorksheetMergeMutationParams;
            }> = [
                {
                    id: RemoveWorksheetMergeMutation.id,
                    params: {
                        unitId,
                        subUnitId: toSubUnitId,
                        ranges: addMergeCellRanges,
                    },
                },
                {
                    id: AddWorksheetMergeMutation.id,
                    params: {
                        unitId,
                        subUnitId: toSubUnitId,
                        ranges: toMergeRanges,
                    },
                },
                {
                    id: AddWorksheetMergeMutation.id,
                    params: {
                        unitId,
                        subUnitId: fromSubUnitId,
                        ranges: fromMergeRanges,
                    },
                },
            ];
            // +++++++++++++++++++++

            redos = [
                { id: MoveRangeMutation.id, params: doMoveRangeMutation },
                ...interceptorCommands.redos,
                ...mergeRedos,
                {
                    id: SetSelectionsOperation.id,
                    params: {
                        unitId,
                        subUnitId: toSubUnitId,
                        pluginName: NORMAL_SELECTION_PLUGIN_NAME,
                        selections: [{ range: toRange }],
                    } as ISetSelectionsOperationParams,
                },
            ];
            undos = [
                {
                    id: SetSelectionsOperation.id,
                    params: {
                        unitId,
                        sheetId: fromSubUnitId,
                        pluginName: NORMAL_SELECTION_PLUGIN_NAME,
                        selections: [{ range: fromRange }],
                    },
                },
                ...interceptorCommands.undos,
                ...mergeUndos,
                { id: MoveRangeMutation.id, params: undoMoveRangeMutation },
            ];
        }
    }

    return {
        undos,
        redos,
    };
}

export function getSetCellValueMutations(
    pasteTo: ISheetRangeLocation,
    matrix: ObjectMatrix<ICellDataWithSpanInfo>,
    accessor: IAccessor
) {
    const { unitId, subUnitId, range } = pasteTo;
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
    pasteTo: ISheetRangeLocation,
    matrix: ObjectMatrix<ICellDataWithSpanInfo>,
    accessor: IAccessor
) {
    const redoMutationsInfo: IMutationInfo[] = [];
    const undoMutationsInfo: IMutationInfo[] = [];
    const { unitId, subUnitId, range } = pasteTo;
    const { startColumn, startRow } = range;
    const valueMatrix = new ObjectMatrix<ICellData>();

    matrix.forValue((row, col, value) => {
        const newValue: ICellData = {
            s: value.s,
        };
        if (value.p?.body) {
            newValue.p = value.p;
        }
        valueMatrix.setValue(row + startRow, col + startColumn, newValue);
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
    pasteTo: ISheetRangeLocation,
    matrix: ObjectMatrix<ICellDataWithSpanInfo>,
    accessor: IAccessor
) {
    const redoMutationsInfo: IMutationInfo[] = [];
    const undoMutationsInfo: IMutationInfo[] = [];
    const clearStyleMatrix = new ObjectMatrix<ICellData>();
    const { unitId, subUnitId, range } = pasteTo;
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
    pasteTo: ISheetRangeLocation,
    matrix: ObjectMatrix<ICellDataWithSpanInfo>,
    accessor: IAccessor
) {
    const redoMutationsInfo: IMutationInfo[] = [];
    const undoMutationsInfo: IMutationInfo[] = [];
    const { unitId, subUnitId, range } = pasteTo;
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
    if (mergeRangeData.length > 0) {
        redoMutationsInfo.push({
            id: AddWorksheetMergeMutation.id,
            params: addMergeMutationParams,
        });
    }

    // undo
    const undoAddMergeMutation: IRemoveWorksheetMergeMutationParams = AddMergeUndoMutationFactory(
        accessor,
        addMergeMutationParams
    );

    if (mergeRangeData.length > 0) {
        undoMutationsInfo.push({
            id: RemoveWorksheetMergeMutation.id,
            params: undoAddMergeMutation,
        });
    }

    return { undos: undoMutationsInfo, redos: redoMutationsInfo };
}

export function generateBody(text: string): IDocumentBody {
    // Convert all \n to \r, because we use \r to indicate paragraph break.
    let dataStream = text.replace(/(\r\n|\n)/g, '\r');
    if (!dataStream.endsWith('\r\n')) {
        dataStream += '\r\n';
    }
    const paragraphs: IParagraph[] = [];

    for (let i = 0; i < dataStream.length; i++) {
        if (dataStream[i] === '\r') {
            paragraphs.push({ startIndex: i });
        }
    }

    return {
        dataStream,
        paragraphs,
        sectionBreaks: [{ startIndex: dataStream.indexOf('\n') }],
    };
}

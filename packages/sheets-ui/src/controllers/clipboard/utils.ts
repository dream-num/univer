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

import type { IAccessor, IBorderData, ICellData, ICustomRange, IDocumentBody, IMutationInfo, IParagraph, IRange, IStyleData, Nullable } from '@univerjs/core';
import type {
    IAddWorksheetMergeMutationParams,
    IMoveRangeMutationParams,
    IRemoveWorksheetMergeMutationParams,
    ISetRangeValuesMutationParams,
    ISetSelectionsOperationParams,
} from '@univerjs/sheets';
import type { ICellDataWithSpanInfo, ICopyPastePayload, ISheetDiscreteRangeLocation } from '../../services/clipboard/type';
import type { IDiscreteRange } from '../utils/range-tools';

import { cellToRange, CellValueType, CustomRangeType, DEFAULT_STYLES, generateRandomId, IUniverInstanceService, numfmt, ObjectMatrix, Range, Rectangle, Tools } from '@univerjs/core';
import { isTextFormat } from '@univerjs/engine-numfmt';
import { DEFAULT_PADDING_DATA } from '@univerjs/engine-render';
import {
    AddMergeUndoMutationFactory,
    AddWorksheetMergeMutation,
    getAddMergeMutationRangeByType,
    MoveRangeCommand,
    MoveRangeMutation,
    RemoveMergeUndoMutationFactory,
    RemoveWorksheetMergeMutation,
    SelectionMoveType,
    SetRangeValuesMutation,
    SetRangeValuesUndoMutationFactory,
    SetSelectionsOperation,
    SheetInterceptorService,
} from '@univerjs/sheets';
import { COPY_TYPE } from '../../services/clipboard/type';
import { isRichText } from '../editor/editing.render-controller';
import { discreteRangeToRange, virtualizeDiscreteRanges } from '../utils/range-tools';

// if special paste need append mutations instead of replace the default, it can use this function to generate default mutations.
/**
 *
 * @param pasteFrom
 * @param pasteTo
 * @param data
 * @param payload
 * @param accessor
 */
export function getDefaultOnPasteCellMutations(
    pasteFrom: ISheetDiscreteRangeLocation,
    pasteTo: ISheetDiscreteRangeLocation,
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
        // clear style
        const { undos: clearStyleUndos, redos: clearStyleRedos } = getClearCellStyleMutations(pasteTo, data, accessor);
        redoMutationsInfo.push(...clearStyleRedos);
        undoMutationsInfo.push(...clearStyleUndos);

        // clear value
        const { undos: clearValueUndos, redos: clearValueRedos } = getClearCellValueMutations(pasteTo, data, accessor);
        redoMutationsInfo.push(...clearValueRedos);
        undoMutationsInfo.push(...clearValueUndos);

        // set values
        const { undos: setValuesUndos, redos: setValuesRedos } = getSetCellValueMutations(pasteTo, pasteFrom, data, accessor);
        redoMutationsInfo.push(...setValuesRedos);
        undoMutationsInfo.push(...setValuesUndos);

        // set styles
        const { undos: setStyleUndos, redos: setStyleRedos } = getSetCellStyleMutations(pasteTo, pasteFrom, data, accessor, true);
        redoMutationsInfo.push(...setStyleRedos);
        undoMutationsInfo.push(...setStyleUndos);

        // Do not process the custom attribute here, users can extend the paste event by themselves

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

/**
 *
 * @param from
 * @param from.unitId
 * @param from.subUnitId
 * @param from.range
 * @param to
 * @param to.unitId
 * @param to.subUnitId
 * @param to.range
 * @param accessor
 */
export function getMoveRangeMutations(
    from: {
        unitId: string;
        subUnitId: string;
        range?: IDiscreteRange;
    },
    to: {
        unitId: string;
        subUnitId: string;
        range?: IDiscreteRange;
    },
    accessor: IAccessor
) {
    let redos: IMutationInfo[] = [];
    let undos: IMutationInfo[] = [];
    const { range: fromDiscreteRange, subUnitId: fromSubUnitId, unitId } = from;
    const { range: toDiscreteRange, subUnitId: toSubUnitId } = to;
    const toRange = toDiscreteRange ? discreteRangeToRange(toDiscreteRange) : null;
    const fromRange = fromDiscreteRange ? discreteRangeToRange(fromDiscreteRange) : null;

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
                fromRange,
                toRange,
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
                fromRange: toRange,
                toRange: fromRange,
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

            const addMergeCellRanges = getAddMergeMutationRangeByType(willMoveToMergeRanges);

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
                        selections: [{ range: toRange }],
                        type: SelectionMoveType.MOVE_END,
                    } as ISetSelectionsOperationParams,
                },
            ];
            undos = [
                { id: MoveRangeMutation.id, params: undoMoveRangeMutation },
                ...interceptorCommands.undos,
                ...mergeUndos,
                {
                    id: SetSelectionsOperation.id,
                    params: {
                        unitId,
                        subUnitId: fromSubUnitId,
                        type: SelectionMoveType.MOVE_END,
                        selections: [{ range: fromRange }],
                    },
                },
            ];
        }
    }

    return {
        undos,
        redos,
    };
}

/**
 *
 * @param pasteTo
 * @param pasteFrom
 * @param matrix
 * @param accessor
 */
export function getSetCellValueMutations(
    pasteTo: ISheetDiscreteRangeLocation,
    pasteFrom: Nullable<ISheetDiscreteRangeLocation>,
    matrix: ObjectMatrix<ICellDataWithSpanInfo>,
    accessor: IAccessor
) {
    const { unitId, subUnitId, range } = pasteTo;
    const worksheet = accessor.get(IUniverInstanceService).getUniverSheetInstance(unitId)?.getSheetBySheetId(subUnitId);
    const redoMutationsInfo: IMutationInfo[] = [];
    const undoMutationsInfo: IMutationInfo[] = [];
    const { mapFunc } = virtualizeDiscreteRanges([range]);
    const valueMatrix = new ObjectMatrix<ICellData>();

    matrix.forValue((row, col, value) => {
        const { row: realRow, col: realCol } = mapFunc(row, col);

        const cellValue: ICellData = {
            v: value.v,
            t: value.t,
        };

        if (!value.p && value.v && !pasteFrom) {
            // pasteFrom is null, means the data is pasted from outside, at this time, the data has no number format.
            // If the paste to cell has a number format, google sheet will apply the number format, but excel will not.
            // Here the text format need to be handled, other number format need to discuss. TODO: @wzhudev @ybzky
            const style = worksheet?.getCellStyle(realRow, realCol);

            if (isTextFormat(style?.n?.pattern)) {
                cellValue.t = CellValueType.STRING;
            } else {
                const content = String(value.v);
                const numfmtValue = numfmt.parseValue(content);
                if (numfmtValue?.v !== undefined && typeof numfmtValue.v === 'number') {
                    cellValue.v = numfmtValue.v;
                }
            }
        }

        if (value.p?.body && isRichText(value.p.body)) {
            const newValue = Tools.deepClone({ p: value.p, v: value.v });
            valueMatrix.setValue(realRow, realCol, newValue);
        } else {
            valueMatrix.setValue(realRow, realCol, Tools.deepClone(cellValue));
        }
    });
    // set cell value and style
    const setValuesMutation: ISetRangeValuesMutationParams = {
        unitId,
        subUnitId,
        cellValue: Tools.deepClone(valueMatrix.getMatrix()),
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

/**
 *
 * @param pasteTo
 * @param matrix
 * @param accessor
 * @param withRichFormat
 */
export function getSetCellStyleMutations(
    pasteTo: ISheetDiscreteRangeLocation,
    pasteFrom: Nullable<ISheetDiscreteRangeLocation>,
    matrix: ObjectMatrix<ICellDataWithSpanInfo>,
    accessor: IAccessor,
    withRichFormat = false
) {
    const redoMutationsInfo: IMutationInfo[] = [];
    const undoMutationsInfo: IMutationInfo[] = [];
    const { unitId, subUnitId, range } = pasteTo;
    const worksheet = accessor.get(IUniverInstanceService).getUniverSheetInstance(unitId)?.getSheetBySheetId(subUnitId);
    const valueMatrix = new ObjectMatrix<ICellData>();

    const { mapFunc } = virtualizeDiscreteRanges([range]);

    matrix.forValue((row, col, value) => {
        const newValue: ICellData = {
            s: Object.assign({}, {
                ...DEFAULT_STYLES,
                pd: DEFAULT_PADDING_DATA,
                bg: null,
                cl: null,
            }, value.s),
        };

        // Here I don't know why when setting the border, an empty object is also assigned to the adjacent cells without borders.
        // This is the fundamental cause of the problem. This should be unreasonable, so I bypassed this problem first.
        const cellBd = (newValue.s as IStyleData).bd as IBorderData;
        if (cellBd) {
            const isValid = Object.keys(cellBd).length > 0;
            if (!isValid) {
                (newValue.s as IStyleData)!.bd = {
                    b: null,
                    l: null,
                    r: null,
                    t: null,
                };
            }
        }

        const { row: actualRow, col: actualCol } = mapFunc(row, col);

        // pasteFrom is null, means the data is pasted from outside, at this time, the data has no number format.
        // If the paste to cell has a number format, google sheet will apply the number format, but excel will not.
        // Here the text format need to be handled, other number format need to discuss. TODO: @wzhudev @ybzky
        const style = worksheet?.getCellStyle(actualRow, actualCol);

        if (value.v && !pasteFrom && isTextFormat(style?.n?.pattern)) {
            if (!newValue.s) {
                newValue.s = {};
            }
            (newValue.s as IStyleData).n = style?.n;
        } else {
            const content = String(value.v);
            const numfmtValue = numfmt.parseValue(content);
            if (numfmtValue?.z) {
                if (!newValue.s) {
                    newValue.s = {};
                }
                if (typeof newValue.s === 'object') {
                    if (!newValue.s?.n) {
                        newValue.s.n = { pattern: numfmtValue.z };
                    } else {
                        newValue.s.n.pattern = numfmtValue.z;
                    }
                }
            }
        }

        valueMatrix.setValue(actualRow, actualCol, newValue);
    });
    // set cell style
    const setValuesMutation: ISetRangeValuesMutationParams = {
        unitId,
        subUnitId,
        cellValue: Tools.deepClone(valueMatrix.getMatrix()),
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

/**
 *
 * @param pasteTo
 * @param matrix
 * @param accessor
 */
export function getClearCellStyleMutations(
    pasteTo: ISheetDiscreteRangeLocation,
    matrix: ObjectMatrix<ICellDataWithSpanInfo>,
    accessor: IAccessor
) {
    const redoMutationsInfo: IMutationInfo[] = [];
    const undoMutationsInfo: IMutationInfo[] = [];
    const clearStyleMatrix = new ObjectMatrix<ICellData>();
    const { unitId, subUnitId, range } = pasteTo;
    const { mapFunc } = virtualizeDiscreteRanges([range]);

    matrix.forEach((rowIndex, row) => {
        Object.keys(row).forEach((colIndexStr) => {
            const colIndex = Number(colIndexStr);
            const { row: actualRow, col: actualCol } = mapFunc(rowIndex, colIndex);
            clearStyleMatrix.setValue(actualRow, actualCol, { s: null });
        });
    });
    // clear style
    if (clearStyleMatrix.getLength() > 0) {
        const clearMutation: ISetRangeValuesMutationParams = {
            subUnitId,
            unitId,
            cellValue: Tools.deepClone(clearStyleMatrix.getMatrix()),
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

/**
 *
 * @param pasteTo
 * @param matrix
 * @param accessor
 */
export function getClearCellValueMutations(
    pasteTo: ISheetDiscreteRangeLocation,
    matrix: ObjectMatrix<ICellDataWithSpanInfo>,
    accessor: IAccessor
) {
    const redoMutationsInfo: IMutationInfo[] = [];
    const undoMutationsInfo: IMutationInfo[] = [];
    const clearValueMatrix = new ObjectMatrix<ICellData>();
    const { unitId, subUnitId, range } = pasteTo;
    const { mapFunc } = virtualizeDiscreteRanges([range]);

    matrix.forValue((row, col, _value) => {
        const { row: actualRow, col: actualCol } = mapFunc(row, col);
        clearValueMatrix.setValue(actualRow, actualCol, { v: null, p: null });
    });
    if (clearValueMatrix.getLength() > 0) {
        const clearMutation: ISetRangeValuesMutationParams = {
            subUnitId,
            unitId,
            cellValue: Tools.deepClone(clearValueMatrix.getMatrix()),
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

/**
 *
 * @param pasteTo
 * @param matrix
 * @param accessor
 */
export function getClearAndSetMergeMutations(
    pasteTo: ISheetDiscreteRangeLocation,
    matrix: ObjectMatrix<ICellDataWithSpanInfo>,
    accessor: IAccessor
) {
    const redoMutationsInfo: IMutationInfo[] = [];
    const undoMutationsInfo: IMutationInfo[] = [];
    const { unitId, subUnitId, range } = pasteTo;
    const { startColumn, startRow, endColumn, endRow } = discreteRangeToRange(range);
    const hasMerge = false;
    const mergeRangeData: IRange[] = [];

    matrix.forValue((row, col, value) => {
        if (value.rowSpan && value.rowSpan > 1) {
            const colSpan = value.colSpan || 1;
            const mergeRange = {
                startRow: startRow + row,
                endRow: startRow + row + value.rowSpan - 1,
                startColumn: startColumn + col,
                endColumn: startColumn + col + colSpan - 1,
            };
            mergeRangeData.push(mergeRange);
        } else if (value.colSpan && value.colSpan > 1) {
            const rowSpan = value.rowSpan || 1;
            const mergeRange = {
                startRow: startRow + row,
                endRow: startRow + row + rowSpan - 1,
                startColumn: startColumn + col,
                endColumn: startColumn + col + value.colSpan - 1,
            };
            mergeRangeData.push(mergeRange);
        }
    });

    // clear merge
    // remove current range's all merged Cell
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

/**
 *
 * @param text
 */
export function generateBody(text: string): IDocumentBody {
    if (!text.includes('\r') && Tools.isLegalUrl(text)) {
        const id = generateRandomId();
        const urlText = `${text}`;
        const range: ICustomRange = {
            startIndex: 0,
            endIndex: urlText.length - 1,
            rangeId: id,
            rangeType: CustomRangeType.HYPERLINK,
            properties: {
                url: text,
            },
        };

        return {
            dataStream: `${urlText}\r\n`,
            paragraphs: [{
                startIndex: urlText.length,
            }],
            customRanges: [range],
        };
    }

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

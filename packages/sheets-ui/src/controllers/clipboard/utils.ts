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

import type { IAccessor, ICellData, ICustomRange, IDocumentBody, IMutationInfo, IParagraph, IRange, IStyleData, Nullable } from '@univerjs/core';
import type {
    IAddWorksheetMergeMutationParams,
    IDiscreteRange,
    IRemoveWorksheetMergeMutationParams,
    ISetRangeValuesMutationParams,
} from '@univerjs/sheets';
import type { ICellDataWithSpanInfo, ICopyPastePayload, ISheetDiscreteRangeLocation } from '../../services/clipboard/type';
import {
    CellValueType,
    cloneCellDataMatrix,
    createParagraphId,
    createSectionId,
    CustomRangeType,
    generateRandomId,
    getNumfmtParseValueFilter,
    isTextFormat,
    IUniverInstanceService,
    ObjectMatrix,
    Rectangle,
    Tools,
    willLoseNumericPrecision,
} from '@univerjs/core';
import {
    AddMergeUndoMutationFactory,
    AddWorksheetMergeMutation,
    discreteRangeToRange,
    getMoveRangeCommandMutations,
    getSheetCommandTarget,
    RemoveMergeUndoMutationFactory,
    RemoveWorksheetMergeMutation,
    SetRangeValuesMutation,
    SetRangeValuesUndoMutationFactory,
} from '@univerjs/sheets';
import { COPY_TYPE } from '../../services/clipboard/type';
import { isRichText } from '../editor/editing.render-controller';
import { virtualizeDiscreteRanges } from '../utils/range-tools';

interface IExternalPasteNumberFormatResult {
    n?: IStyleData['n'];
    t?: CellValueType;
    v?: ICellData['v'];
}

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
    if (payload.copyType === COPY_TYPE.CUT) {
        const { undos, redos } = getMoveRangeMutations(pasteFrom, pasteTo, accessor);
        return { undos, redos };
    }

    const redoMutationsInfo: IMutationInfo[] = [];
    const undoMutationsInfo: IMutationInfo[] = [];

    // Set cell value and style
    const { redo, undo } = getSetCellDataMutations(
        pasteTo,
        pasteFrom,
        data,
        accessor
    );
    redoMutationsInfo.push(redo);
    undoMutationsInfo.push(undo);

    // clear and add merge
    const { undos: clearMergeUndos, redos: clearMergeRedos } = getClearAndSetMergeMutations(
        pasteTo,
        data,
        accessor
    );
    redoMutationsInfo.push(...clearMergeRedos);
    undoMutationsInfo.push(...clearMergeUndos);

    return {
        undos: undoMutationsInfo,
        redos: redoMutationsInfo,
    };
}

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
    const { range: fromDiscreteRange, subUnitId: fromSubUnitId, unitId } = from;
    const { range: toDiscreteRange, subUnitId: toSubUnitId } = to;
    const toRange = toDiscreteRange ? discreteRangeToRange(toDiscreteRange) : null;
    const fromRange = fromDiscreteRange ? discreteRangeToRange(fromDiscreteRange) : null;

    if (!fromRange || !toRange) {
        return {
            undos: [],
            redos: [],
        };
    }

    const moveRangeMutations = getMoveRangeCommandMutations(accessor, {
        fromRange,
        toRange,
        fromUnitId: unitId,
        fromSubUnitId,
        toUnitId: to.unitId,
        toSubUnitId,
    }, {
        includeAutoHeight: false,
    });

    return moveRangeMutations
        ? {
            undos: moveRangeMutations.undos,
            redos: moveRangeMutations.redos,
        }
        : {
            undos: [],
            redos: [],
        };
}

function getExternalPasteNumberFormatResult(
    value: ICellData['v'],
    currentCellStyle: Nullable<IStyleData> | undefined
): IExternalPasteNumberFormatResult {
    if (isTextFormat(currentCellStyle?.n?.pattern)) {
        return {
            n: currentCellStyle?.n,
            t: CellValueType.STRING,
        };
    }

    const content = String(value).trim();
    const numfmtValue = getNumfmtParseValueFilter(content);
    const result: IExternalPasteNumberFormatResult = {};

    if (numfmtValue?.v !== undefined && typeof numfmtValue.v === 'number') {
        // If the numeric string will lose precision when converted to a number, set the cell type to force string
        // e.g. 123456789123456789
        // e.g. 1212121212121212.2345
        if (!numfmtValue.z && willLoseNumericPrecision(content)) {
            result.t = CellValueType.FORCE_STRING;
        } else {
            result.v = numfmtValue.v;
        }
    }

    if (numfmtValue?.z) {
        result.n = { pattern: numfmtValue.z };
    }

    return result;
}

export function getSetCellDataMutations(
    pasteTo: ISheetDiscreteRangeLocation,
    pasteFrom: Nullable<ISheetDiscreteRangeLocation>,
    matrix: ObjectMatrix<ICellDataWithSpanInfo>,
    accessor: IAccessor
): {
    redo: IMutationInfo;
    undo: IMutationInfo;
} {
    const { unitId, subUnitId, range } = pasteTo;
    const target = getSheetCommandTarget(accessor.get(IUniverInstanceService), { unitId, subUnitId });
    const worksheet = target?.worksheet;
    const { mapFunc } = virtualizeDiscreteRanges([range]);

    const cellValueMatrix = new ObjectMatrix<ICellData>();

    matrix.forValue((rowIndex, columnIndex, value) => {
        const { row, col } = mapFunc(rowIndex, columnIndex);

        const newStyle = { ...(value.s ?? {}) as IStyleData };
        if (newStyle.bd && Object.keys(newStyle.bd).length === 0) {
            newStyle.bd = {
                t: null,
                r: null,
                b: null,
                l: null,
            };
        }

        let cellValue: ICellData = {
            p: null,
            v: value.v,
            t: value.t,
        };

        if (value.p?.body && isRichText(value.p.body)) {
            cellValue = {
                p: value.p,
                v: value.v,
            };
        } else if (!pasteFrom && value.v && !newStyle.n?.pattern) {
            /**
             * The `pasteFrom` is null, means the data is pasted from outside.
             * If the value's style has no number format, handle it as follows:
             * 1. The paste to cell has a number format, google sheets will apply the number format, but excel does not.
             * Here we only handle the text format, other number format are left unhandled now.
             * 2. If the above case does not apply, parse the value to check whether it has a number format.
             */
            const currentCellStyle = worksheet?.getCellStyle(row, col);
            const numfmtResult = getExternalPasteNumberFormatResult(value.v, currentCellStyle);

            if (numfmtResult.n) {
                newStyle.n = numfmtResult.n;
            }
            if (numfmtResult.t !== undefined) {
                cellValue.t = numfmtResult.t;
            }
            if (numfmtResult.v !== undefined) {
                cellValue.v = numfmtResult.v;
            }
        }

        cellValue.s = Object.keys(newStyle).length > 0 ? newStyle : null;

        cellValueMatrix.setValue(row, col, cellValue);
    });

    const redoParams: ISetRangeValuesMutationParams = {
        unitId,
        subUnitId,
        cellValue: cloneCellDataMatrix(cellValueMatrix.getMatrix()),
        isOverrideStyle: true,
    };
    const undoParams: ISetRangeValuesMutationParams = SetRangeValuesUndoMutationFactory(
        accessor,
        redoParams
    );

    return {
        redo: {
            id: SetRangeValuesMutation.id,
            params: redoParams,
        },
        undo: {
            id: SetRangeValuesMutation.id,
            params: undoParams,
        },
    };
}

export function getSetCellValueMutations(
    pasteTo: ISheetDiscreteRangeLocation,
    pasteFrom: Nullable<ISheetDiscreteRangeLocation>,
    matrix: ObjectMatrix<ICellDataWithSpanInfo>,
    accessor: IAccessor
): {
    redo: IMutationInfo;
    undo: IMutationInfo;
} {
    const { unitId, subUnitId, range } = pasteTo;
    const target = getSheetCommandTarget(accessor.get(IUniverInstanceService), { unitId, subUnitId });
    const worksheet = target?.worksheet;
    const { mapFunc } = virtualizeDiscreteRanges([range]);

    const cellValueMatrix = new ObjectMatrix<ICellData>();

    matrix.forValue((rowIndex, columnIndex, value) => {
        const { row, col } = mapFunc(rowIndex, columnIndex);

        let cellValue: ICellData = {
            p: null,
            v: value.v,
            t: value.t,
        };

        if (value.p?.body && isRichText(value.p.body)) {
            cellValue = {
                p: value.p,
                v: value.v,
            };
        } else if (value.v && !pasteFrom && !(value.s as IStyleData)?.n?.pattern) {
            /**
             * The `pasteFrom` is null, means the data is pasted from outside.
             * If the value's style has no number format, handle it as follows:
             * 1. The paste to cell has a number format, google sheets will apply the number format, but excel does not.
             * Here we only handle the text format, other number format are left unhandled now.
             * 2. If the above case does not apply, parse the value to check whether it has a number format.
             */
            const currentCellStyle = worksheet?.getCellStyle(row, col);
            const numfmtResult = getExternalPasteNumberFormatResult(value.v, currentCellStyle);

            if (numfmtResult.t !== undefined) {
                cellValue.t = numfmtResult.t;
            }
            if (numfmtResult.v !== undefined) {
                cellValue.v = numfmtResult.v;
            }
        }

        cellValueMatrix.setValue(row, col, cellValue);
    });

    const redoParams: ISetRangeValuesMutationParams = {
        unitId,
        subUnitId,
        cellValue: cloneCellDataMatrix(cellValueMatrix.getMatrix()),
    };
    const undoParams: ISetRangeValuesMutationParams = SetRangeValuesUndoMutationFactory(
        accessor,
        redoParams
    );

    return {
        redo: {
            id: SetRangeValuesMutation.id,
            params: redoParams,
        },
        undo: {
            id: SetRangeValuesMutation.id,
            params: undoParams,
        },
    };
}

export function getSetCellStyleMutations(
    pasteTo: ISheetDiscreteRangeLocation,
    pasteFrom: Nullable<ISheetDiscreteRangeLocation>,
    matrix: ObjectMatrix<ICellDataWithSpanInfo>,
    accessor: IAccessor
): {
    redo: IMutationInfo;
    undo: IMutationInfo;
} {
    const { unitId, subUnitId, range } = pasteTo;
    const target = getSheetCommandTarget(accessor.get(IUniverInstanceService), { unitId, subUnitId });
    const worksheet = target?.worksheet;
    const { mapFunc } = virtualizeDiscreteRanges([range]);

    const cellValueMatrix = new ObjectMatrix<ICellData>();

    matrix.forValue((rowIndex, columnIndex, value) => {
        const { row, col } = mapFunc(rowIndex, columnIndex);

        const newStyle = { ...(value.s ?? {}) as IStyleData };
        if (newStyle.bd && Object.keys(newStyle.bd).length === 0) {
            newStyle.bd = {
                t: null,
                r: null,
                b: null,
                l: null,
            };
        }

        if (!pasteFrom && value.v && !newStyle.n?.pattern) {
            /**
             * The `pasteFrom` is null, means the data is pasted from outside.
             * If the value's style has no number format, handle it as follows:
             * 1. The paste to cell has a number format, google sheets will apply the number format, but excel does not.
             * Here we only handle the text format, other number format are left unhandled now.
             * 2. If the above case does not apply, parse the value to check whether it has a number format.
             */
            const currentCellStyle = worksheet?.getCellStyle(row, col);
            const numfmtResult = getExternalPasteNumberFormatResult(value.v, currentCellStyle);

            if (numfmtResult.n) {
                newStyle.n = numfmtResult.n;
            }
        }

        cellValueMatrix.setValue(row, col, {
            s: Object.keys(newStyle).length > 0 ? newStyle : null,
        });
    });

    const redoParams: ISetRangeValuesMutationParams = {
        unitId,
        subUnitId,
        cellValue: cloneCellDataMatrix(cellValueMatrix.getMatrix()),
        isOverrideStyle: true,
    };
    const undoParams: ISetRangeValuesMutationParams = SetRangeValuesUndoMutationFactory(
        accessor,
        redoParams
    );

    return {
        redo: {
            id: SetRangeValuesMutation.id,
            params: redoParams,
        },
        undo: {
            id: SetRangeValuesMutation.id,
            params: undoParams,
        },
    };
}

export function getClearAndSetMergeMutations(
    pasteTo: ISheetDiscreteRangeLocation,
    matrix: ObjectMatrix<ICellDataWithSpanInfo>,
    accessor: IAccessor
) {
    const redoMutationsInfo: IMutationInfo[] = [];
    const undoMutationsInfo: IMutationInfo[] = [];

    const { unitId, subUnitId, range } = pasteTo;
    const { startColumn, startRow, endColumn, endRow } = discreteRangeToRange(range);
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
    const target = getSheetCommandTarget(accessor.get(IUniverInstanceService), { unitId, subUnitId });
    if (target && target.worksheet) {
        const mergeData = target.worksheet.getMergeData();
        const mergedCellsInRange = mergeData.filter((rect) =>
            Rectangle.intersects({ startRow, startColumn, endRow, endColumn }, rect)
        );

        if (mergedCellsInRange.length > 0) {
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

    if (mergeRangeData.length > 0) {
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
        undoMutationsInfo.unshift({
            id: RemoveWorksheetMergeMutation.id,
            params: undoAddMergeMutation,
        });
    }

    return { redos: redoMutationsInfo, undos: undoMutationsInfo };
}

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
                paragraphId: createParagraphId(new Set()),
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
    const existingParagraphIds = new Set<string>();

    for (let i = 0; i < dataStream.length; i++) {
        if (dataStream[i] === '\r') {
            paragraphs.push({ startIndex: i, paragraphId: createParagraphId(existingParagraphIds) });
        }
    }

    return {
        dataStream,
        paragraphs,
        sectionBreaks: [{ sectionId: createSectionId(new Set()), startIndex: dataStream.indexOf('\n') }],
    };
}

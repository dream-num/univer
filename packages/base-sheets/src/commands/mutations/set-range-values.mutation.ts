import {
    CommandType,
    ICellData,
    ICopyToOptionsData,
    ICurrentUniverService,
    IMutation,
    IRange,
    IStyleData,
    Nullable,
    ObjectMatrix,
    ObjectMatrixPrimitiveType,
    Tools,
} from '@univerjs/core';
import { IAccessor } from '@wendellhu/redi';

import { mergeRichTextStyle, mergeStyle, transformStyle } from './set-border-styles.mutation';

/** Params of `SetRangeValuesMutation` */
export interface ISetRangeValuesMutationParams {
    range: IRange[]; // FIXME: maybe don't need this
    worksheetId: string;
    workbookId: string;

    /**
     * null for clear all
     */
    cellValue?: ObjectMatrixPrimitiveType<ICellData | null>;

    /**
     * @deprecated not a good design
     */
    options?: ICopyToOptionsData;
}

/**
 * Generate undo mutation of a `SetRangeValuesMutation`
 *
 * @param {IAccessor} accessor - injector accessor
 * @param {ISetRangeValuesMutationParams} params - do mutation params
 * @returns {ISetRangeValuesMutationParams} undo mutation params
 */
export const SetRangeValuesUndoMutationFactory = (
    accessor: IAccessor,
    params: ISetRangeValuesMutationParams
): ISetRangeValuesMutationParams => {
    const { workbookId, worksheetId, cellValue } = params;
    const currentUniverService = accessor.get(ICurrentUniverService);
    const universheet = currentUniverService.getUniverSheetInstance(workbookId);
    if (universheet == null) {
        throw new Error('universheet is null error!');
    }

    const workbook = universheet;

    const worksheet = workbook.getSheetBySheetId(worksheetId);
    if (worksheet == null) {
        throw new Error('worksheet is null error!');
    }

    const cellMatrix = worksheet.getCellMatrix();
    const styles = workbook.getStyles();
    const undoData = new ObjectMatrix<ICellData>();

    const newValues = new ObjectMatrix(cellValue);

    // for (let i = 0; i < range.length; i++) {
    newValues.forValue((row, col, newVal) => {
        const cell = Tools.deepClone(cellMatrix?.getValue(row, col)) || {}; // clone cell data，prevent modify the original data
        const oldStyle = styles.getStyleByCell(cell);
        const newStyle = transformStyle(oldStyle, newVal && newVal.s ? (newVal.s as Nullable<IStyleData>) : null);
        cell.s = newStyle;

        undoData.setValue(row, col, Tools.deepClone(setNull(cell)));
    });
    // for (let i = 0; i < params.range.length; i++) {
    //     const { startRow, endRow, startColumn, endColumn } = params.range[i];

    //     for (let r = startRow; r <= endRow; r++) {
    //         for (let c = startColumn; c <= endColumn; c++) {
    //             const value = cellMatrix?.getValue(r, c);
    //             undoData.setValue(r, c, Tools.deepClone(value as ICellData));
    //         }
    //     }
    // }

    return {
        ...Tools.deepClone(params),
        options: {},
        cellValue: undoData.getData(),
    } as ISetRangeValuesMutationParams;
};

/**
 * Supplement the data of the cell, set the other value to NULL, Used to reset properties when undoing
 * @param value
 * @returns
 */
function setNull(value: Nullable<ICellData>) {
    if (value == null) return null;

    if (value.p === undefined) {
        value.p = null;
    }

    if (value.v === undefined) {
        value.v = null;
    }

    if (value.m === undefined) {
        value.m = null;
    }

    if (value.t === undefined) {
        value.t = null;
    }

    if (value.s === undefined) {
        value.s = null;
    }

    return value;
}

export const SetRangeValuesMutation: IMutation<ISetRangeValuesMutationParams, boolean> = {
    id: 'sheet.mutation.set-range-values',
    type: CommandType.MUTATION,
    handler: async (accessor, params) => {
        const currentUniverService = accessor.get(ICurrentUniverService);
        const workbook = currentUniverService.getCurrentUniverSheetInstance();
        const worksheet = workbook.getSheetBySheetId(params.worksheetId);
        if (!worksheet) {
            return false;
        }
        const cellMatrix = worksheet.getCellMatrix();
        const styles = workbook.getStyles();
        const { cellValue } = params;
        const newValues = new ObjectMatrix(cellValue);

        newValues.forValue((row, col, newVal) => {
            // clear all
            if (!newVal) {
                cellMatrix?.setValue(row, col, {});
            } else {
                const oldVal = cellMatrix.getValue(row, col) || {};

                if (newVal.p !== undefined) {
                    oldVal.p = newVal.p;
                }

                // Set to null, clear content
                if (newVal.v !== undefined) {
                    oldVal.v = newVal.v;
                    oldVal.m = String(oldVal.v);
                }

                if (newVal.m !== undefined) {
                    oldVal.m = newVal.m;
                }

                if (newVal.t !== undefined) {
                    oldVal.t = newVal.t;
                }

                // handle style
                if (newVal.s !== undefined) {
                    // use null to clear style
                    const oldStyle = styles.getStyleByCell(oldVal);

                    if (oldStyle == null) {
                        // clear
                        delete oldVal.s;
                    }

                    // set style
                    const merge = mergeStyle(oldStyle, newVal.s ? (newVal.s as Nullable<IStyleData>) : null);

                    // then remove null
                    merge && Tools.removeNull(merge);

                    if (Tools.isEmptyObject(merge)) {
                        delete oldVal.s;
                    } else {
                        oldVal.s = styles.setValue(merge);
                    }

                    // When the rich text sets the cell style, you need to modify the style of all rich text
                    if (oldVal.p) {
                        mergeRichTextStyle(oldVal.p, newVal.s ? (newVal.s as Nullable<IStyleData>) : null);
                    }
                }

                cellMatrix.setValue(row, col, Tools.removeNull(oldVal));
            }
        });

        return true;
    },
};

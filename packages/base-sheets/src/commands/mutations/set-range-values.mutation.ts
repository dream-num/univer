import {
    CommandType,
    ICellData,
    ICopyToOptionsData,
    ICurrentUniverService,
    IMutation,
    ISelectionRange,
    Nullable,
    ObjectMatrix,
    ObjectMatrixPrimitiveType,
    Tools,
} from '@univerjs/core';
import { IAccessor } from '@wendellhu/redi';

/** Params of `SetRangeValuesMutation` */
export interface ISetRangeValuesMutationParams {
    rangeData: ISelectionRange[]; // FIXME: maybe don't need this
    worksheetId: string;
    workbookId: string;

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

    const worksheet = universheet.getWorkBook().getSheetBySheetId(worksheetId);
    if (worksheet == null) {
        throw new Error('worksheet is null error!');
    }

    const cellMatrix = worksheet.getCellMatrix();
    const undoData = new ObjectMatrix<ICellData>();

    const newValues = new ObjectMatrix(cellValue);

    // for (let i = 0; i < rangeData.length; i++) {
    newValues.forValue((row, col) => {
        const value = cellMatrix?.getValue(row, col);
        undoData.setValue(row, col, Tools.deepClone(setNull(value)));
    });
    // for (let i = 0; i < params.rangeData.length; i++) {
    //     const { startRow, endRow, startColumn, endColumn } = params.rangeData[i];

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

// TODO@Dushusir: this would cover style as well. Which is not expected.
// Deal with style and abandon Set-Style Mutation
export const SetRangeValuesMutation: IMutation<ISetRangeValuesMutationParams, boolean> = {
    id: 'sheet.mutation.set-range-values',
    type: CommandType.MUTATION,
    handler: async (accessor, params) => {
        const currentUniverService = accessor.get(ICurrentUniverService);
        const workbook = currentUniverService.getCurrentUniverSheetInstance().getWorkBook();
        const worksheet = workbook.getSheetBySheetId(params.worksheetId);
        if (!worksheet) {
            return false;
        }
        const cellMatrix = worksheet.getCellMatrix();
        const { cellValue } = params;
        const newValues = new ObjectMatrix(cellValue);

        newValues.forValue((row, col, newVal) => {
            // clear all
            if (!newVal) {
                cellMatrix?.setValue(row, col, {});
            } else {
                const oldVal = cellMatrix.getValue(row, col) || {};
                let dirty = false;

                if (newVal.p !== undefined) {
                    oldVal.p = newVal.p;
                    dirty = true;
                }

                // Set to null, clear content
                if (newVal.v !== undefined) {
                    oldVal.v = newVal.v;
                    dirty = true;
                }

                if (newVal.m !== undefined) {
                    oldVal.m = newVal.m;
                    dirty = true;
                } else {
                    oldVal.m = String(oldVal.v);
                    dirty = true;
                }

                if (newVal.t !== undefined) {
                    oldVal.t = newVal.t;
                    dirty = true;
                }
                cellMatrix.setValue(row, col, Tools.removeNull(oldVal));
            }
        });

        return true;
    },
};

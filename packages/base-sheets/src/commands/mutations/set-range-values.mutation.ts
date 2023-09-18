import {
    CommandType,
    ICellData,
    ICopyToOptionsData,
    ICurrentUniverService,
    IMutation,
    ISelectionRange,
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

    cellValue?: ObjectMatrixPrimitiveType<ICellData>;

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
export const SetRangeValuesUndoMutationFactory = (accessor: IAccessor, params: ISetRangeValuesMutationParams): ISetRangeValuesMutationParams => {
    const { workbookId, worksheetId } = params;
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

    for (let i = 0; i < params.rangeData.length; i++) {
        const { startRow, endRow, startColumn, endColumn } = params.rangeData[i];

        for (let r = startRow; r <= endRow; r++) {
            for (let c = startColumn; c <= endColumn; c++) {
                const value = cellMatrix?.getValue(r, c);
                undoData.setValue(r, c, Tools.deepClone(value as ICellData));
            }
        }
    }

    return {
        ...Tools.deepClone(params),
        options: {},
        cellValue: undoData.getData(),
    } as ISetRangeValuesMutationParams;
};

// TODO@Dushusir: this would cover style as well. Which is not expected.
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
        const { cellValue, rangeData } = params;
        const newValues = new ObjectMatrix(cellValue);

        // for (let i = 0; i < rangeData.length; i++) {
        newValues.forValue((row, col, newVal) => {
            const oldVal = cellMatrix.getValue(row, col) || {};

            // clear all
            if (!newVal) {
                cellMatrix?.setValue(row, col, {
                    v: null,
                });
            } else {
                let dirty = false;

                if (newVal.p != null) {
                    oldVal.p = newVal.p;
                    dirty = true;
                }

                // Set to null, clear content
                if (newVal.v != null || newVal.v === null) {
                    oldVal.v = newVal.v;
                    dirty = true;
                }

                if (newVal.m != null || newVal.m === null) {
                    oldVal.m = newVal.m;
                    dirty = true;
                } else {
                    oldVal.m = String(oldVal.v);
                    dirty = true;
                }

                if (newVal.t != null) {
                    oldVal.t = newVal.t;
                    dirty = true;
                }

                cellMatrix.setValue(row, col, oldVal);
            }
        });
        // }

        return true;
    },
};

import {
    CommandType,
    ICellData,
    ICopyToOptionsData,
    ICurrentUniverService,
    IMutation,
    IRangeData,
    ObjectMatrix,
    ObjectMatrixPrimitiveType,
    Tools,
} from '@univerjs/core';
import { IAccessor } from '@wendellhu/redi';

/** Params of `SetRangeValuesMutation` */
export interface ISetRangeValuesMutationParams {
    rangeData: IRangeData[];
    worksheetId: string;

    cellValue?: ObjectMatrixPrimitiveType<ICellData>;
    workbookId?: string;
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
    const currentUniverService = accessor.get(ICurrentUniverService);
    const worksheet = currentUniverService
        .getCurrentUniverSheetInstance()
        .getWorkBook()
        .getSheetBySheetId(params.worksheetId);
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

        for (let i = 0; i < rangeData.length; i++) {
            const { startRow, startColumn, endColumn, endRow } = rangeData[i];

            // clear selection content
            // createRowColIter(startRow, endRow, startColumn, endColumn).forEach((r, c) => {
            //     if (cellMatrix.getValue(r, c)) {
            //         cellMatrix.setValue(r, c, { v: null });
            //     }
            // });

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

                    if (newVal.v != null) {
                        oldVal.v = newVal.v;
                        dirty = true;
                    }

                    if (newVal.m != null) {
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
        }

        return true;
    },
};

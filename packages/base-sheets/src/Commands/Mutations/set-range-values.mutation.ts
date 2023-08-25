import {
    IMutation,
    CommandType,
    ICurrentUniverService,
    ICellData,
    ObjectMatrix,
    Tools,
    ObjectMatrixPrimitiveType,
    ICopyToOptionsData,
    IRangeData,
    createRowColIter,
} from '@univerjs/core';
import { IAccessor } from '@wendellhu/redi';

/** Params of `SetRangeValuesMutation` */
export interface ISetRangeValuesMutationParams {
    rangeData: IRangeData;
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
export const SetRangeValuesUndoMutationFactory = (accessor: IAccessor, params: ISetRangeValuesMutationParams): ISetRangeValuesMutationParams => {
    const currentUniverService = accessor.get(ICurrentUniverService);
    const worksheet = currentUniverService.getCurrentUniverSheetInstance().getWorkBook().getSheetBySheetId(params.worksheetId);
    const cellMatrix = worksheet?.getCellMatrix();
    const { startRow, endRow, startColumn, endColumn } = params.rangeData;

    const undoData = new ObjectMatrix<ICellData>();
    for (let r = startRow; r <= endRow; r++) {
        for (let c = startColumn; c <= endColumn; c++) {
            const value = cellMatrix?.getValue(r, c);
            undoData.setValue(r, c, Tools.deepClone(value as ICellData));
        }
    }

    return {
        ...Tools.deepClone(params),
        options: {},
        cellValue: undoData.getData(),
    } as ISetRangeValuesMutationParams;
};

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

        // TODO: worksheet 要增加一个迭代器
        const cellMatrix = worksheet.getCellMatrix();
        const { cellValue, rangeData } = params;
        const { startRow, startColumn, endColumn, endRow } = rangeData;

        // clear selection content
        createRowColIter(startRow, endRow, startColumn, endColumn).forEach((r, c) => {
            if (cellMatrix.getValue(r, c)) {
                cellMatrix.setValue(r, c, { v: null });
            }
        });

        const newValues = new ObjectMatrix(cellValue);
        newValues.forValue((row, col, newVal) => {
            const oldVal = cellMatrix.getValue(row, col) || {};

            // clear all
            if (!newVal) {
                cellMatrix?.setValue(row, col, {
                    v: null,
                });
            } else {
                // TODO: @wzhudev: add config to change value or format only
                if (newVal.p != null) {
                    oldVal.p = newVal.p;
                }

                if (newVal.v != null) {
                    oldVal.v = newVal.v;
                }

                if (newVal.m != null) {
                    oldVal.m = newVal.m;
                } else {
                    oldVal.m = String(oldVal.v);
                }

                if (newVal.t != null) {
                    oldVal.t = newVal.t;
                }

                cellMatrix.setValue(row, col, oldVal);
            }
        });

        return true;
    },
};

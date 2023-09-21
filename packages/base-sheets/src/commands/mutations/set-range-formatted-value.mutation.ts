import {
    CommandType,
    ICellData,
    ICellV,
    ICurrentUniverService,
    IMutation,
    ISelectionRange,
    Nullable,
    ObjectMatrix,
    ObjectMatrixPrimitiveType,
    Tools,
} from '@univerjs/core';
import { IAccessor } from '@wendellhu/redi';

export interface ISetRangeFormattedValueMutationParams {
    workbookId: string;
    worksheetId: string;
    range: ISelectionRange[];
    value: ObjectMatrixPrimitiveType<ICellV>;
}

/**
 * Generate undo mutation of a `SetRangeFormattedValueMutation`
 *
 * @param {IAccessor} accessor - injector accessor
 * @param {ISetRangeFormattedValueMutationParams} params - do mutation params
 * @returns {ISetRangeFormattedValueMutationParams} undo mutation params
 */
export const SetRangeFormattedValueUndoMutationFactory = (
    accessor: IAccessor,
    params: ISetRangeFormattedValueMutationParams
): ISetRangeFormattedValueMutationParams => {
    const currentUniverService = accessor.get(ICurrentUniverService);
    const worksheet = currentUniverService
        .getCurrentUniverSheetInstance()
        .getWorkBook()
        .getSheetBySheetId(params.worksheetId);
    const cellMatrix = worksheet?.getCellMatrix();

    const undoData = new ObjectMatrix<ICellV>();
    for (let i = 0; i < params.range.length; i++) {
        const rangeData = params.range[i];
        for (let j = rangeData.startRow; j <= rangeData.endRow; j++) {
            for (let k = rangeData.startColumn; k <= rangeData.endColumn; k++) {
                const cell: Nullable<ICellData> = cellMatrix?.getValue(j, k);
                undoData.setValue(j, k, (cell && cell.v) || '');
            }
        }
    }

    return {
        ...Tools.deepClone(params),
        value: undoData.getData(),
    } as ISetRangeFormattedValueMutationParams;
};

export const SetRangeFormattedValueMutation: IMutation<ISetRangeFormattedValueMutationParams, boolean> = {
    id: 'sheet.mutation.set-range-formatted-value',
    type: CommandType.MUTATION,
    handler: async (accessor, params) => {
        const currentUniverService = accessor.get(ICurrentUniverService);
        const workbook = currentUniverService.getUniverSheetInstance(params.workbookId)?.getWorkBook();
        if (!workbook) return false;
        const worksheet = workbook.getSheetBySheetId(params.worksheetId);
        if (!worksheet) return false;

        const cellMatrix = worksheet.getCellMatrix();
        const target = new ObjectMatrix(params.value);

        for (let i = 0; i < params.range.length; i++) {
            const rangeData = params.range[i];
            for (let j = rangeData.startRow; j <= rangeData.endRow; j++) {
                for (let k = rangeData.startColumn; k <= rangeData.endColumn; k++) {
                    const value = target.getValue(j, k);
                    const cell: Nullable<ICellData> = cellMatrix.getValue(j, k);
                    // update new value, cell may be undefined
                    const cellValue = Tools.deepClone(cell || {});
                    cellValue.v = value;
                    // TODO:calculate m from cell format
                    // TODO:解析外移，性能监测
                    cellValue.m = `${value}`;

                    cellMatrix.setValue(j, k, cellValue || {});
                }
            }
        }

        return true;
    },
};

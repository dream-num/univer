import { ICellData, IOptionsData, IRangeData } from '../../Interfaces';
import { Tools, ObjectMatrix, ObjectMatrixPrimitiveType } from '../../Shared';

import { CommandUnit, IClearRangeActionData } from '../../Command';

/**
 *
 * @param cellMatrix
 * @param options
 * @param rangeData
 * @returns
 *
 * @internal
 */
export function ClearRange(
    cellMatrix: ObjectMatrix<ICellData>,
    options: IOptionsData,
    rangeData: IRangeData
): ObjectMatrixPrimitiveType<ICellData> {
    const { startRow, endRow, startColumn, endColumn } = rangeData;

    const rows = endRow - startRow + 1;
    const columns = endColumn - startColumn + 1;

    const result = new ObjectMatrix<ICellData>();
    // build new data
    for (let r = startRow; r <= endRow; r++) {
        for (let c = startColumn; c <= endColumn; c++) {
            // get current value
            const value = cellMatrix.getValue(r, c);
            result.setValue(r, c, Tools.deepClone(value as ICellData));
            if (value) {
                if (options.formatOnly) {
                    delete value.s;
                }
                if (options.contentsOnly) {
                    value.v = '';
                    value.m = '';
                }
                // TODO more options

                cellMatrix.setValue(r, c, Tools.deepClone(value as ICellData));
            }
        }
    }

    return result.getData();
}

export function ClearRangeApply(unit: CommandUnit, data: IClearRangeActionData) {
    const worksheet = unit.WorkBookUnit?.getSheetBySheetId(data.sheetId);
    const cellMatrix = worksheet?.getCellMatrix();
    const { startRow, endRow, startColumn, endColumn } = data.rangeData;

    const rows = endRow - startRow + 1;
    const columns = endColumn - startColumn + 1;

    const result = new ObjectMatrix<ICellData>();
    // build new data
    for (let r = startRow; r <= endRow; r++) {
        for (let c = startColumn; c <= endColumn; c++) {
            // get current value
            const value = cellMatrix?.getValue(r, c);
            result.setValue(r, c, Tools.deepClone(value as ICellData));
            if (value) {
                if (data.options.formatOnly) {
                    delete value.s;
                }
                if (data.options.contentsOnly) {
                    value.v = '';
                    value.m = '';
                }
                // TODO more options

                cellMatrix?.setValue(r, c, Tools.deepClone(value as ICellData));
            }
        }
    }

    return result.getData();
}

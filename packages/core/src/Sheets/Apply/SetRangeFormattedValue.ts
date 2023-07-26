import { ICellData, ICellV, IRangeData } from '../../Types/Interfaces';
import { Nullable, Tools } from '../../Shared';
import { ObjectMatrix, ObjectMatrixPrimitiveType } from '../../Shared/ObjectMatrix';
import { CommandModel } from '../../Command';
import { ISetRangeFormattedValueActionData } from '../../Types/Interfaces/IActionModel';

/**
 *
 * @param cellMatrix
 * @param addMatrix
 * @param rangeData
 * @returns
 *
 * @internal
 */
export function SetRangeFormattedValue(
    cellMatrix: ObjectMatrix<ICellData>,
    addMatrix: ObjectMatrixPrimitiveType<ICellV>,
    rangeData: IRangeData
): ObjectMatrixPrimitiveType<ICellV> {
    const target = new ObjectMatrix(addMatrix);
    const result = new ObjectMatrix<ICellV>();
    for (let i = rangeData.startRow; i <= rangeData.endRow; i++) {
        for (let j = rangeData.startColumn; j <= rangeData.endColumn; j++) {
            const value = target.getValue(i, j);

            // store history value
            const cell: Nullable<ICellData> = cellMatrix.getValue(i, j);
            result.setValue(i, j, (cell && cell.v) || '');

            // update new value, cell may be undefined
            const cellValue = Tools.deepClone(cell || {});
            cellValue.v = value;
            // TODO:calculate m from cell format
            // TODO:解析外移，性能监测
            cellValue.m = `${value}`;

            cellMatrix.setValue(i, j, cellValue || {});
        }
    }
    return result.getData();
}

export function SetRangeFormattedValueApply(unit: CommandModel, data: ISetRangeFormattedValueActionData) {
    const workbook = unit.WorkBookUnit;
    const worksheet = workbook!.getSheetBySheetId(data.sheetId)!;
    const cellMatrix = worksheet.getCellMatrix();
    const addMatrix = data.cellValue;
    const rangeData = data.rangeData;

    const target = new ObjectMatrix(addMatrix);
    const result = new ObjectMatrix<ICellV>();
    for (let i = rangeData.startRow; i <= rangeData.endRow; i++) {
        for (let j = rangeData.startColumn; j <= rangeData.endColumn; j++) {
            const value = target.getValue(i, j);

            // store history value
            const cell: Nullable<ICellData> = cellMatrix.getValue(i, j);
            result.setValue(i, j, (cell && cell.v) || '');

            // update new value, cell may be undefined
            const cellValue = Tools.deepClone(cell || {});
            cellValue.v = value;
            // TODO:calculate m from cell format
            // TODO:解析外移，性能监测
            cellValue.m = `${value}`;

            cellMatrix.setValue(i, j, cellValue || {});
        }
    }
    return result.getData();
}

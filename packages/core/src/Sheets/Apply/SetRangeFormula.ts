import { ICellData, IRangeData } from '../../Interfaces';
import { Nullable, Tools } from '../../Shared';
import { ObjectMatrix, ObjectMatrixPrimitiveType } from '../../Shared/ObjectMatrix';
import { CommandUnit, ISetRangeFormulaActionData } from '../../Command';

/**
 * TODO remove tp Formula Plugin
 */

/**
 *
 * @param cellMatrix
 * @param addMatrix
 * @param rangeData
 * @returns
 *
 * @internal
 */
export function SetRangeFormula(
    cellMatrix: ObjectMatrix<ICellData>,
    addMatrix: ObjectMatrixPrimitiveType<string>,
    rangeData: IRangeData
): ObjectMatrixPrimitiveType<string> {
    const target = new ObjectMatrix(addMatrix);
    const result = new ObjectMatrix<string>();
    for (let i = rangeData.startRow; i <= rangeData.endRow; i++) {
        for (let j = rangeData.startColumn; j <= rangeData.endColumn; j++) {
            const value = target.getValue(i, j);

            // store history value
            const cell: Nullable<ICellData> = cellMatrix.getValue(i, j);
            // result.setValue(i, j, (cell && cell.f) || '');

            // update new value, cell may be undefined
            const cellValue = Tools.deepClone(cell || {});

            cellValue.f = value;

            cellMatrix.setValue(i, j, cellValue || {});
        }
    }
    return result.getData();
}

export function SetRangeFormulaApply(
    unit: CommandUnit,
    data: ISetRangeFormulaActionData
) {
    const workbook = unit.WorkBookUnit;
    const worksheet = workbook!.getSheetBySheetId(data.sheetId)!;
    const cellMatrix = worksheet.getCellMatrix();
    const addMatrix = data.cellFormula;
    const rangeData = data.rangeData;

    const target = new ObjectMatrix(addMatrix);
    const result = new ObjectMatrix<string>();
    for (let i = rangeData.startRow; i <= rangeData.endRow; i++) {
        for (let j = rangeData.startColumn; j <= rangeData.endColumn; j++) {
            const value = target.getValue(i, j);

            // store history value
            const cell: Nullable<ICellData> = cellMatrix.getValue(i, j);
            // result.setValue(i, j, (cell && cell.f) || '');

            // update new value, cell may be undefined
            const cellValue = Tools.deepClone(cell || {});

            cellValue.f = value;

            cellMatrix.setValue(i, j, cellValue || {});
        }
    }
    return result.getData();
}

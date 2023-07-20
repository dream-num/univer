import { ICellData, IRangeData } from '../../Types/Interfaces';
import { Nullable, Tools } from '../../Shared';
import { ObjectMatrix, ObjectMatrixPrimitiveType } from '../../Shared/ObjectMatrix';
import { CommandModel } from '../../Command';
import { ISetRangeNoteActionData } from '../../Types/Interfaces/IActionModel';

/**
 *
 * @param cellMatrix
 * @param addMatrix
 * @param rangeData
 * @returns
 *
 * @internal
 */
export function SetRangeNote(cellMatrix: ObjectMatrix<ICellData>, addMatrix: ObjectMatrixPrimitiveType<string>, rangeData: IRangeData): ObjectMatrixPrimitiveType<string> {
    const target = new ObjectMatrix(addMatrix);
    const result = new ObjectMatrix<string>();
    for (let i = rangeData.startRow; i <= rangeData.endRow; i++) {
        for (let j = rangeData.startColumn; j <= rangeData.endColumn; j++) {
            const value = target.getValue(i, j);

            // store history value
            const cell: Nullable<ICellData> = cellMatrix.getValue(i, j);
            // result.setValue(i, j, (cell && cell.n) || '');

            // update new value, cell may be undefined
            const cellValue = Tools.deepClone(cell || {});

            cellValue.n = value;

            cellMatrix.setValue(i, j, cellValue || {});
        }
    }
    return result.getData();
}

export function SetRangeNoteApply(unit: CommandModel, data: ISetRangeNoteActionData): ObjectMatrixPrimitiveType<string> {
    const workbook = unit.WorkBookUnit;
    const worksheet = workbook!.getSheetBySheetId(data.sheetId)!;
    const cellMatrix = worksheet.getCellMatrix();
    const addMatrix = data.cellNote;
    const rangeData = data.rangeData;

    const target = new ObjectMatrix(addMatrix);
    const result = new ObjectMatrix<string>();
    for (let i = rangeData.startRow; i <= rangeData.endRow; i++) {
        for (let j = rangeData.startColumn; j <= rangeData.endColumn; j++) {
            const value = target.getValue(i, j);

            // store history value
            const cell: Nullable<ICellData> = cellMatrix.getValue(i, j);
            // result.setValue(i, j, (cell && cell.n) || '');

            // update new value, cell may be undefined
            const cellValue = Tools.deepClone(cell || {});

            cellValue.n = value;

            cellMatrix.setValue(i, j, cellValue || {});
        }
    }
    return result.getData();
}

import { ICellData, IRangeData } from '../../Interfaces';
import { Nullable, Tools } from '../../Shared';
import { ObjectMatrix, ObjectMatrixPrimitiveType } from '../../Shared/ObjectMatrix';
import { CommandUnit, ISetRangeFormatActionData } from '../../Command';

/**
 * TODO remove tp Format Plugin
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
export function SetRangeFormat(
    cellMatrix: ObjectMatrix<ICellData>,
    addMatrix: ObjectMatrixPrimitiveType<string>,
    rangeData: IRangeData
): ObjectMatrixPrimitiveType<string> {
    const target = new ObjectMatrix(addMatrix);
    const result = new ObjectMatrix<string>();
    for (let i = rangeData.startRow; i <= rangeData.endRow; i++) {
        for (let j = rangeData.startColumn; j <= rangeData.endColumn; j++) {
            const targetValue = target.getValue(i, j);

            if (targetValue) {
                const value = JSON.parse(targetValue);

                // store history value
                const cell: Nullable<ICellData> = cellMatrix.getValue(i, j);
                // result.setValue(i, j, (cell && JSON.stringify(cell.fm)) || '');

                // update new value, cell may be undefined
                const cellValue: ICellData = Tools.deepClone(cell || {});

                // cellValue.fm = {
                //     f: value.f,
                //     t: value.t,
                // };

                cellMatrix.setValue(i, j, cellValue || {});
            } else {
                const cell: Nullable<ICellData> = cellMatrix.getValue(i, j);
                // result.setValue(i, j, (cell && JSON.stringify(cell.fm)) || '');
                const cellValue: ICellData = Tools.deepClone(cell || {});
                // delete cellValue.fm;
                cellMatrix.setValue(i, j, cellValue || {});
            }
        }
    }
    return result.getData();
}

export function SetRangeFormatApply(
    unit: CommandUnit,
    data: ISetRangeFormatActionData
) {
    const workbook = unit.WorkBookUnit;
    const worksheet = workbook!.getSheetBySheetId(data.sheetId)!;
    const cellMatrix = worksheet.getCellMatrix();
    const addMatrix = data.cellFormat;
    const rangeData = data.rangeData;

    const target = new ObjectMatrix(addMatrix);
    const result = new ObjectMatrix<string>();
    for (let i = rangeData.startRow; i <= rangeData.endRow; i++) {
        for (let j = rangeData.startColumn; j <= rangeData.endColumn; j++) {
            const targetValue = target.getValue(i, j);

            if (targetValue) {
                const value = JSON.parse(targetValue);

                // store history value
                const cell: Nullable<ICellData> = cellMatrix.getValue(i, j);
                // result.setValue(i, j, (cell && JSON.stringify(cell.fm)) || '');

                // update new value, cell may be undefined
                const cellValue: ICellData = Tools.deepClone(cell || {});

                // cellValue.fm = {
                //     f: value.f,
                //     t: value.t,
                // };

                cellMatrix.setValue(i, j, cellValue || {});
            } else {
                const cell: Nullable<ICellData> = cellMatrix.getValue(i, j);
                // result.setValue(i, j, (cell && JSON.stringify(cell.fm)) || '');
                const cellValue: ICellData = Tools.deepClone(cell || {});
                // delete cellValue.fm;
                cellMatrix.setValue(i, j, cellValue || {});
            }
        }
    }
    return result.getData();
}

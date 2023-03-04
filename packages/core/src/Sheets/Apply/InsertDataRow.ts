import { ICellData } from '../../Interfaces';
import { ObjectMatrix, ObjectMatrixPrimitiveType } from '../../Shared/ObjectMatrix';
import { CommandUnit } from '../../Command';
import { IInsertRowDataActionData } from '../Action';

/**
 *
 * @param rowIndex
 * @param addData
 * @param cellData
 *
 * @internal
 */
export function InsertDataRow(
    rowIndex: number,
    rowData: ObjectMatrixPrimitiveType<ICellData>,
    primitiveData: ObjectMatrixPrimitiveType<ICellData>
) {
    const wrapper = new ObjectMatrix(primitiveData);
    wrapper.insertRows(rowIndex, new ObjectMatrix(rowData));
}

export function InsertDataRowApply(
    unit: CommandUnit,
    data: IInsertRowDataActionData
) {
    const worksheet = unit.WorkBookUnit!.getSheetBySheetId(data.sheetId);
    const primitiveData = worksheet!.getCellMatrix().toJSON();

    const wrapper = new ObjectMatrix(primitiveData);
    wrapper.insertRows(data.rowIndex, new ObjectMatrix(data.rowData));
}

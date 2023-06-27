import { ICellData } from '../../Interfaces';
import { ObjectMatrix, ObjectMatrixPrimitiveType } from '../../Shared/ObjectMatrix';
import { CommandUnit } from '../../Command';
import { IRemoveRowDataActionData } from '../Action';

/**
 *
 * @param rowIndex
 * @param rowCount
 * @param cellData
 * @returns
 *
 * @internal
 */
export function RemoveRowData(
    rowIndex: number,
    rowCount: number,
    primitiveData: ObjectMatrixPrimitiveType<ICellData>
): ObjectMatrixPrimitiveType<ICellData> {
    const wrapper = new ObjectMatrix(primitiveData);
    return wrapper.spliceRows(rowIndex, rowCount).toJSON();
}

export function RemoveRowDataApply(
    unit: CommandUnit,
    data: IRemoveRowDataActionData
) {
    const worksheet = unit.WorkBookUnit!.getSheetBySheetId(data.sheetId);
    const primitiveData = worksheet!.getCellMatrix().toJSON();
    const wrapper = new ObjectMatrix(primitiveData);
    return wrapper.spliceRows(data.rowIndex, data.rowCount).toJSON();
}

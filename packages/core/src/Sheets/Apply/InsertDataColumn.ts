import { ICellData } from '../../Interfaces';
import { ObjectMatrix, ObjectMatrixPrimitiveType } from '../../Shared/ObjectMatrix';
import { CommandUnit, IInsertColumnDataActionData } from '../../Command';

/**
 *
 * @param columnIndex
 * @param columnData
 * @param cellData
 *
 * @internal
 */
export function InsertDataColumn(
    columnIndex: number,
    columnData: ObjectMatrixPrimitiveType<ICellData>,
    primitiveData: ObjectMatrixPrimitiveType<ICellData>
) {
    const wrapper = new ObjectMatrix(primitiveData);
    wrapper.insertColumns(columnIndex, new ObjectMatrix(columnData));
}

export function InsertDataColumnApply(
    unit: CommandUnit,
    data: IInsertColumnDataActionData
) {
    const worksheet = unit.WorkBookUnit!.getSheetBySheetId(data.sheetId);
    const primitiveData = worksheet!.getCellMatrix().toJSON();

    const wrapper = new ObjectMatrix(primitiveData);
    wrapper.insertColumns(data.columnIndex, new ObjectMatrix(data.columnData));
}

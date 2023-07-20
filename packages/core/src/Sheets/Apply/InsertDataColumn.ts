import { ICellData } from '../../Types/Interfaces';
import { ObjectMatrix, ObjectMatrixPrimitiveType } from '../../Shared/ObjectMatrix';
import { CommandModel } from '../../Command';
import { IInsertColumnDataActionData } from '../../Types/Interfaces/IActionModel';

/**
 *
 * @param columnIndex
 * @param columnData
 * @param cellData
 *
 * @internal
 */
export function InsertDataColumn(columnIndex: number, columnData: ObjectMatrixPrimitiveType<ICellData>, primitiveData: ObjectMatrixPrimitiveType<ICellData>) {
    const wrapper = new ObjectMatrix(primitiveData);
    wrapper.insertColumns(columnIndex, new ObjectMatrix(columnData));
}

export function InsertDataColumnApply(unit: CommandModel, data: IInsertColumnDataActionData) {
    const worksheet = unit.WorkBookUnit!.getSheetBySheetId(data.sheetId);
    const primitiveData = worksheet!.getCellMatrix().toJSON();

    const wrapper = new ObjectMatrix(primitiveData);
    wrapper.insertColumns(data.columnIndex, new ObjectMatrix(data.columnData));
}

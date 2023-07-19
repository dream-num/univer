import { IColumnData } from '../../Types/Interfaces';
import { ObjectArray, ObjectArrayPrimitiveType } from '../../Shared/ObjectArray';
import { CommandModel } from '../../Command';
import { IRemoveColumnAction } from '../Action';

/**
 * Inserts addData into columnData
 * @param columnIndex
 * @param columnData
 * @param insertData
 *
 * @internal
 */
export function InsertColumn(columnIndex: number = 0, columnCount: number = 1, primitiveData: ObjectArrayPrimitiveType<IColumnData>) {
    const wrapper = new ObjectArray(primitiveData);
    wrapper.inserts(columnIndex, new ObjectArray(columnCount));
}

export function InsertColumnApply(unit: CommandModel, data: IRemoveColumnAction): void {
    const worksheet = unit.WorkBookUnit!.getSheetBySheetId(data.sheetId);
    const columnManager = worksheet!.getColumnManager();
    const primitiveData = columnManager.getColumnData().toJSON();

    const wrapper = new ObjectArray(primitiveData);
    wrapper.inserts(data.columnIndex, new ObjectArray(data.columnCount));
}

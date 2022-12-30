import { IColumnData } from '../../Interfaces';
import { ObjectArray, ObjectArrayPrimitiveType } from '../../Shared/ObjectArray';
import { CommandUnit, IRemoveColumnAction } from '../../Command';

/**
 * Inserts addData into columnData
 * @param columnIndex
 * @param columnData
 * @param insertData
 *
 * @internal
 */
export function InsertColumn(
    columnIndex: number = 0,
    columnCount: number = 1,
    primitiveData: ObjectArrayPrimitiveType<IColumnData>
) {
    const wrapper = new ObjectArray(primitiveData);
    wrapper.inserts(columnIndex, new ObjectArray(columnCount));
}

export function InsertColumnApply(unit: CommandUnit, data: IRemoveColumnAction) {
    const worksheet = unit.WorkBookUnit!.getSheetBySheetId(data.sheetId);
    const columnManager = worksheet!.getColumnManager();
    const primitiveData = columnManager.getColumnData().toJSON();

    const wrapper = new ObjectArray(primitiveData);
    wrapper.inserts(data.columnIndex, new ObjectArray(data.columnCount));
}

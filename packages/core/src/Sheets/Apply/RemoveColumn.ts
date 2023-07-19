import { IColumnData } from '../../Types/Interfaces';
import { ObjectArray, ObjectArrayPrimitiveType } from '../../Shared';
import { CommandModel } from '../../Command';
import { IRemoveColumnAction } from '../Action';

/**
 * Deletes the specified number of columns in columnData
 * @param columnIndex
 * @param columnCount
 * @param columnData
 *
 * @internal
 */
export function RemoveColumn(columnIndex: number, columnCount: number, primitiveData: ObjectArrayPrimitiveType<IColumnData>): number {
    const wrapper = new ObjectArray(primitiveData);
    const result = new ObjectArray<IColumnData>();
    const start = columnIndex;
    const end = columnIndex + columnCount;
    for (let i = start; i < end; i++) {
        const splice = wrapper.splice(columnIndex, 1);
        if (splice.getLength()) {
            result.set(i, splice.first() as IColumnData);
        }
    }
    return result.getLength();
}

export function RemoveColumnApply(unit: CommandModel, data: IRemoveColumnAction) {
    const worksheet = unit.WorkBookUnit!.getSheetBySheetId(data.sheetId);
    const columnManager = worksheet!.getColumnManager();
    const primitiveData = columnManager.getColumnData().toJSON();

    const wrapper = new ObjectArray(primitiveData);
    const result = new ObjectArray<IColumnData>();
    const start = data.columnIndex;
    const end = data.columnIndex + data.columnCount;
    for (let i = start; i < end; i++) {
        const splice = wrapper.splice(data.columnIndex, 1);
        if (splice.getLength()) {
            result.set(i, splice.first() as IColumnData);
        }
    }

    return result.getLength();
}

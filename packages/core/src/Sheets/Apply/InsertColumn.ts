import { IColumnData } from '../../Interfaces';
import { ObjectArray, ObjectArrayPrimitiveType } from '../../Shared/ObjectArray';

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

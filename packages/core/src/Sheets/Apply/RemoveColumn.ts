import { IColumnData } from '../../Interfaces';
import { ObjectArray, ObjectArrayPrimitiveType } from '../../Shared';

/**
 * Deletes the specified number of columns in columnData
 * @param columnIndex
 * @param columnCount
 * @param columnData
 *
 * @internal
 */
export function RemoveColumn(
    columnIndex: number,
    columnCount: number,
    primitiveData: ObjectArrayPrimitiveType<IColumnData>
): number {
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

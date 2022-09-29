import { IRowData } from '../../Interfaces';
import { ObjectArray, ObjectArrayPrimitiveType } from '../../Shared/ObjectArray';

/**
 * Deletes the specified number of rows in rowData
 * @param rowIndex
 * @param rowCount
 * @param rowData
 *
 * @internal
 */
export function RemoveRow(
    rowIndex: number,
    rowCount: number,
    primitiveData: ObjectArrayPrimitiveType<IRowData>
): number {
    const wrapper = new ObjectArray(primitiveData);
    const result = new ObjectArray<IRowData>();
    const start = rowIndex;
    const end = rowIndex + rowCount;
    for (let i = start; i < end; i++) {
        const splice = wrapper.splice(rowIndex, 1);
        if (splice.getLength()) {
            result.set(i, splice.first() as IRowData);
        }
    }
    return result.getLength();
}

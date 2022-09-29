import { IRowData } from '../../Interfaces';
import { ObjectArray, ObjectArrayPrimitiveType } from '../../Shared/ObjectArray';

/**
 * Inserts addData into rowData
 * @param rowIndex
 * @param rowData
 * @param insertData
 *
 * @internal
 */
export function InsertRow(
    rowIndex: number = 0,
    rowCount: number = 1,
    primitiveData: ObjectArrayPrimitiveType<IRowData>
) {
    const wrapper = new ObjectArray(primitiveData);
    wrapper.inserts(rowIndex, new ObjectArray(rowCount));
}

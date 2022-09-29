import { ICellData } from '../../Interfaces';
import { ObjectMatrix, ObjectMatrixPrimitiveType } from '../../Shared/ObjectMatrix';

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

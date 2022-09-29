import { ICellData } from '../../Interfaces';
import { ObjectMatrix, ObjectMatrixPrimitiveType } from '../../Shared/ObjectMatrix';

/**
 *
 * @param rowIndex
 * @param addData
 * @param cellData
 *
 * @internal
 */
export function InsertDataRow(
    rowIndex: number,
    rowData: ObjectMatrixPrimitiveType<ICellData>,
    primitiveData: ObjectMatrixPrimitiveType<ICellData>
) {
    const wrapper = new ObjectMatrix(primitiveData);
    wrapper.insertRows(rowIndex, new ObjectMatrix(rowData));
}

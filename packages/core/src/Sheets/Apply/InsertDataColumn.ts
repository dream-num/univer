import { ICellData } from '../../Interfaces';
import { ObjectMatrix, ObjectMatrixPrimitiveType } from '../../Shared/ObjectMatrix';

/**
 *
 * @param columnIndex
 * @param columnData
 * @param cellData
 *
 * @internal
 */
export function InsertDataColumn(
    columnIndex: number,
    columnData: ObjectMatrixPrimitiveType<ICellData>,
    primitiveData: ObjectMatrixPrimitiveType<ICellData>
) {
    const wrapper = new ObjectMatrix(primitiveData);
    wrapper.insertColumns(columnIndex, new ObjectMatrix(columnData));
}

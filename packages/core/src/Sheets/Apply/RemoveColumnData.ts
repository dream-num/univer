import { ICellData } from '../../Interfaces';
import { ObjectMatrix, ObjectMatrixPrimitiveType } from '../../Shared/ObjectMatrix';

/**
 *
 * @param columnIndex
 * @param columnCount
 * @param cellData
 * @returns
 *
 * @internal
 */
export function RemoveColumnData(
    columnIndex: number,
    columnCount: number,
    primitiveData: ObjectMatrixPrimitiveType<ICellData>
): ObjectMatrixPrimitiveType<ICellData> {
    return new ObjectMatrix(primitiveData)
        .spliceColumns(columnIndex, columnCount)
        .toJSON();
}

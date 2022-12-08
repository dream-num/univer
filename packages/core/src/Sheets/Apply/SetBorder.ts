import { Styles } from '../Domain';
import { ICellData, IStyleData } from '../../Interfaces';
import { ObjectMatrix, ObjectMatrixPrimitiveType } from '../../Shared';

/**
 *
 * @param matrix
 * @param globalStyles
 * @param updateStyles
 * @returns
 *
 * @internal
 */
export function SetBorder(
    matrix: ObjectMatrix<ICellData>,
    globalStyles: Styles,
    primitiveStyles: ObjectMatrixPrimitiveType<IStyleData>
): ObjectMatrixPrimitiveType<IStyleData> {
    const wrapper = new ObjectMatrix(primitiveStyles);
    const result = new ObjectMatrix<IStyleData>();
    wrapper.forValue((row, column, value) => {
        const cell = matrix.getValue(row, column);
        if (cell) {
            const old = globalStyles.get(cell.s);
            if (old) {
                result.setValue(row, column, old);
            }
            cell.s = globalStyles.setValue(value);
        }
    });
    return result.toJSON();
}

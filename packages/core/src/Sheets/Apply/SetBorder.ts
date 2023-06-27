import { Styles } from '../Domain';
import { ICellData, IStyleData } from '../../Interfaces';
import { ObjectMatrix, ObjectMatrixPrimitiveType } from '../../Shared';
import { CommandUnit } from '../../Command';
import { BorderStyleData } from '../Action';

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

export function SetBorderApply(
    unit: CommandUnit,
    data: BorderStyleData
): ObjectMatrixPrimitiveType<IStyleData> {
    const workbook = unit.WorkBookUnit;
    const worksheet = workbook!.getSheetBySheetId(data.sheetId)!;
    const globalStyles = workbook!.getStyles();
    const matrix = worksheet.getCellMatrix();
    const wrapper = new ObjectMatrix(data.styles);

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

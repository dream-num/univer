import { Style } from '../Domain';
import { ICellData, IStyleData } from '../../Types/Interfaces';
import { ObjectMatrix, ObjectMatrixPrimitiveType } from '../../Shared';
import { CommandModel } from '../../Command';
import { BorderStyleData } from '../../Types/Interfaces/IActionModel';

/**
 *
 * @param matrix
 * @param globalStyles
 * @param updateStyles
 * @returns
 *
 * @internal
 */
export function SetBorder(matrix: ObjectMatrix<ICellData>, globalStyles: Style, primitiveStyles: ObjectMatrixPrimitiveType<IStyleData>): ObjectMatrixPrimitiveType<IStyleData> {
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

export function SetBorderApply(unit: CommandModel, data: BorderStyleData): ObjectMatrixPrimitiveType<IStyleData> {
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

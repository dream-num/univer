import { ObjectMatrix } from '../../Shared/ObjectMatrix';
import { CommandUnit } from '../../Command';
import { ISetRangeDataActionData } from '../Action';

// eslint-disable-next-line max-lines-per-function
/**
 * @deprecated
 */
export function SetRangeDataApply(unit: CommandUnit, data: ISetRangeDataActionData) {
    const workbook = unit.WorkBookUnit;
    const worksheet = workbook!.getSheetBySheetId(data.sheetId)!;
    const cellMatrix = worksheet.getCellMatrix();
    const options = data.options;
    const addMatrix = data.cellValue;
    const styles = workbook!.getStyles();

    // FIXME: result should be removed out of the applying process

    const target = new ObjectMatrix(addMatrix);

    // FIXME: 不应该写两个循环体，而应该在循环体内判断 options
    // 另外和 clearRangeValues 的代码重复了
    if (options) {
        target.forValue((r, c, value) => {
            cellMatrix.setValue(r, c, value || {});
        });
    }

    target.forValue((row, col, value) => {
        const newVal = cellMatrix.getValue(row, col) || {};

        // set null, clear cell
        if (!value) {
            cellMatrix.setValue(row, col, null);
        } else {
            if (value.p != null) {
                newVal.p = value.p;
            }

            if (value.v != null) {
                newVal.v = value.v;
            }

            if (value.m != null) {
                newVal.m = value.m;
            } else {
                newVal.m = String(newVal.v);
            }

            if (value.t != null) {
                newVal.t = value.t;
            }

            cellMatrix.setValue(row, col, newVal);
        }
    });
}
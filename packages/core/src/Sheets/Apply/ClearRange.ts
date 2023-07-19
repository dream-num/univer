import { ICellData } from '../../Types/Interfaces';
import { Tools, ObjectMatrix } from '../../Shared';

import { CommandModel } from '../../Command';
import { IClearRangeActionData } from '../Action';

export function ClearRangeApply(unit: CommandModel, data: IClearRangeActionData) {
    const worksheet = unit.WorkBookUnit?.getSheetBySheetId(data.sheetId);
    const cellMatrix = worksheet?.getCellMatrix();
    const { startRow, endRow, startColumn, endColumn } = data.rangeData;

    const rows = endRow - startRow + 1;
    const columns = endColumn - startColumn + 1;

    const result = new ObjectMatrix<ICellData>();
    // build new data
    for (let r = startRow; r <= endRow; r++) {
        for (let c = startColumn; c <= endColumn; c++) {
            // get current value
            const value = cellMatrix?.getValue(r, c);
            result.setValue(r, c, Tools.deepClone(value as ICellData));
            if (value) {
                if (data.options.formatOnly) {
                    delete value.s;
                }
                if (data.options.contentsOnly) {
                    value.v = '';
                    value.m = '';
                }

                cellMatrix?.setValue(r, c, Tools.deepClone(value as ICellData));
            }
        }
    }

    return result.getData();
}

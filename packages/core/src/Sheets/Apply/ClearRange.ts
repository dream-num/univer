import { ObjectMatrix } from '../../Shared/ObjectMatrix';
import { Tools } from '../../Shared/Tools';
import { ICellData } from '../../Types/Interfaces';

import { IClearRangeActionData } from '../../Types/Interfaces/IActionModel';
import { SpreadsheetModel } from '../Model/SpreadsheetModel';

export function ClearRangeApply(spreadsheetModel: SpreadsheetModel, data: IClearRangeActionData) {
    const worksheet = spreadsheetModel.worksheets[data.sheetId];
    const cellMatrix = worksheet.cell;

    const { startRow, endRow, startColumn, endColumn } = data.rangeData;

    const result = new ObjectMatrix<ICellData>();
    if (!cellMatrix) {
        return result.getData();
    }
    // build new data
    for (let r = startRow; r <= endRow; r++) {
        for (let c = startColumn; c <= endColumn; c++) {
            // get current value
            const value = cellMatrix.getValue(r, c);
            result.setValue(r, c, Tools.deepClone(value as ICellData));
            if (value) {
                if (data.options.formatOnly) {
                    delete value.s;
                }
                if (data.options.contentsOnly) {
                    value.v = '';
                    value.m = '';
                }

                cellMatrix.setValue(r, c, Tools.deepClone(value as ICellData));
            }
        }
    }

    return result.getData();
}

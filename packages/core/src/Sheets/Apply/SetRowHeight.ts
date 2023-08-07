import { BooleanNumber } from '../../Types/Enum';
import { ISetRowHeightActionData } from '../../Types/Interfaces/ISheetActionInterfaces';
import { SpreadsheetModel } from '../Model/SpreadsheetModel';

/**
 *
 * @param rowIndex
 * @param rowHeight
 * @returns
 *
 * @internal
 */

export function SetRowHeightApply(spreadsheetModel: SpreadsheetModel, data: ISetRowHeightActionData) {
    const worksheetModel = spreadsheetModel.worksheets[data.sheetId];
    const { row } = worksheetModel;
    const rowIndex = data.rowIndex;
    const rowHeight = data.rowHeight;

    const result: number[] = [];
    for (let i = rowIndex; i < rowIndex + rowHeight.length; i++) {
        const rowInfo = row.get(i);
        const height = rowHeight[i - rowIndex];
        if (rowInfo) {
            result[i - rowIndex] = rowInfo.h;
            rowInfo.h = height;
        } else {
            const defaultRowInfo = {
                h: height,
                hd: BooleanNumber.FALSE,
            };
            row.set(i, defaultRowInfo);
            result[i - rowIndex] = worksheetModel.defaultRowHeight;
        }
    }
    return result;
}

import { BooleanNumber } from '../../Types/Enum';
import { ISetRowShowActionData } from '../../Types/Interfaces/IActionModel';
import { SpreadsheetModel } from '../Model/SpreadsheetModel';

/**
 *
 * @param rowIndex
 * @param rowCount
 * @param rowManager
 *
 * @internal
 */
export function SetRowShowApply(spreadsheetModel: SpreadsheetModel, data: ISetRowShowActionData) {
    const worksheetModel = spreadsheetModel.worksheets[data.sheetId];
    const { row } = worksheetModel;
    const rowIndex = data.rowIndex;
    const rowCount = data.rowCount;

    for (let i = rowIndex; i < rowIndex + rowCount; i++) {
        const rowInfo = row.get(i);
        if (rowInfo) {
            rowInfo.hd = BooleanNumber.FALSE;
        } else {
            const defaultRowInfo = {
                h: worksheetModel.defaultRowHeight,
                hd: BooleanNumber.FALSE,
            };
            row.set(i, defaultRowInfo);
        }
    }
}

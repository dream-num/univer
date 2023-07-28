import { ISetRowHideActionData } from '../../Types/Interfaces/ISheetActionInterfaces';
import { SpreadsheetModel } from '../Model/SpreadsheetModel';
import { BooleanNumber } from '../../Types/Enum';

/**
 *
 * @param rowIndex
 * @param rowCount
 * @param rowManager
 *
 * @internal
 */
export function SetRowHideApply(spreadsheetModel: SpreadsheetModel, data: ISetRowHideActionData) {
    const worksheetModel = spreadsheetModel.worksheets[data.sheetId];
    const { row } = worksheetModel;
    const rowIndex = data.rowIndex;
    const rowCount = data.rowCount;

    for (let i = rowIndex; i < rowIndex + rowCount; i++) {
        const rowInfo = row.get(i);
        if (rowInfo) {
            rowInfo.hd = BooleanNumber.TRUE;
        } else {
            const defaultRowInfo = {
                h: worksheetModel.defaultRowHeight,
                hd: BooleanNumber.TRUE,
            };
            row.set(i, defaultRowInfo);
        }
    }
}

import { IRemoveSheetActionData } from '../../Types/Interfaces/IActionModel';
import { SpreadsheetModel } from '../Model/SpreadsheetModel';

export function RemoveSheetApply(spreadsheetModel: SpreadsheetModel, data: IRemoveSheetActionData) {
    if (spreadsheetModel.worksheets[data.sheetId] == null) {
        throw new Error(`Remove Sheet fail ${data.sheetId} is not exist`);
    }
    let removeWorksheet = spreadsheetModel.worksheets[data.sheetId];
    const sheetOrder = removeWorksheet.sheetOrder;
    delete spreadsheetModel.worksheets[data.sheetId];
    return {
        sheetOrder,
        sheet: removeWorksheet,
    };
}

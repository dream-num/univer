import { IRemoveRowDataActionData } from '../../Types/Interfaces/ISheetActionInterfaces';
import { SpreadsheetModel } from '../Model/SpreadsheetModel';

export function RemoveRowDataApply(spreadsheetModel: SpreadsheetModel, data: IRemoveRowDataActionData) {
    const worksheet = spreadsheetModel.worksheets[data.sheetId];
    return worksheet.cell.spliceRows(data.rowIndex, data.rowCount).toJSON();
}

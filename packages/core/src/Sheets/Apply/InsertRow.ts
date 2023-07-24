import { ObjectArray } from '../../Shared/ObjectArray';
import { SpreadsheetModel } from '../Model/SpreadsheetModel';
import { IInsertRowActionData } from '../../Types/Interfaces/IActionModel';

export function InsertRowApply(spreadsheetModel: SpreadsheetModel, data: IInsertRowActionData) {
    const worksheet = spreadsheetModel.worksheets[data.sheetId];
    worksheet.row.inserts(data.rowIndex, new ObjectArray(data.rowCount));
}

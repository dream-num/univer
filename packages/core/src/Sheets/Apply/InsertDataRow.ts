import { ObjectMatrix } from '../../Shared/ObjectMatrix';
import { SpreadsheetModel } from '../Model/SpreadsheetModel';
import { IInsertRowDataActionData } from '../../Types/Interfaces/ISheetActionInterfaces';

export function InsertDataRowApply(spreadsheetModel: SpreadsheetModel, data: IInsertRowDataActionData) {
    const worksheet = spreadsheetModel.worksheets[data.sheetId];
    worksheet.cell.insertRows(data.rowIndex, new ObjectMatrix(data.rowData));
}

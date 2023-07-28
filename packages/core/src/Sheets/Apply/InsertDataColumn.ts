import { ObjectMatrix } from '../../Shared/ObjectMatrix';
import { IInsertColumnDataActionData } from '../../Types/Interfaces/ISheetActionInterfaces';
import { SpreadsheetModel } from '../Model/SpreadsheetModel';

export function InsertDataColumnApply(spreadsheetModel: SpreadsheetModel, data: IInsertColumnDataActionData) {
    const worksheetModel = spreadsheetModel.worksheets[data.sheetId];
    worksheetModel.cell.insertColumns(data.columnIndex, new ObjectMatrix(data.columnData));
}

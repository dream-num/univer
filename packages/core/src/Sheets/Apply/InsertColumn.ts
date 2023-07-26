import { ObjectArray } from '../../Shared/ObjectArray';
import { IRemoveColumnAction } from '../../Types/Interfaces/IActionModel';
import { SpreadsheetModel } from '../Model/SpreadsheetModel';

export function InsertColumnApply(spreadsheetModel: SpreadsheetModel, data: IRemoveColumnAction): void {
    const worksheetModel = spreadsheetModel.worksheets[data.sheetId];
    const columnModel = worksheetModel.column;
    columnModel.inserts(data.columnIndex, new ObjectArray(data.columnCount));
}

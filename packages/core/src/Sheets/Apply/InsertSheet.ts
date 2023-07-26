import { ObjectArray } from '../../Shared/ObjectArray';
import { WorksheetModel } from '../Model/WorksheetModel';
import { ObjectMatrix } from '../../Shared/ObjectMatrix';
import { IInsertSheetActionData } from '../../Types/Interfaces/IActionModel';
import { SpreadsheetModel } from '../Model/SpreadsheetModel';

export function InsertSheetApply(spreadsheetModel: SpreadsheetModel, data: IInsertSheetActionData) {
    const worksheetModel = spreadsheetModel.worksheets[data.sheetId];
    const newWorksheetConfig = data.sheet;
    const index = data.index;
    const { sheetOrder } = worksheetModel;
    if (spreadsheetModel.worksheets[newWorksheetConfig.id]) {
        throw new Error(`Insert worksheet fail ${newWorksheetConfig.id} is already exist`);
    }
    const newWorksheetModel = new WorksheetModel();
    newWorksheetModel.merge = [];
    newWorksheetModel.style = {};
    newWorksheetModel.activation = false;
    newWorksheetModel.sheetOrder = sheetOrder;
    newWorksheetModel.row = new ObjectArray(newWorksheetConfig.rowData);
    newWorksheetModel.column = new ObjectArray(newWorksheetConfig.columnData);
    newWorksheetModel.cell = new ObjectMatrix(newWorksheetConfig.cellData);
    newWorksheetModel.sheetId = newWorksheetConfig.id;
    spreadsheetModel.worksheets[newWorksheetConfig.id] = newWorksheetModel;
    return newWorksheetConfig.id;
}

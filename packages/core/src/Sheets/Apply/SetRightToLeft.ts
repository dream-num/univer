import { ISetRightToLeftActionData } from '../../Types/Interfaces/ISheetActionInterfaces';
import { SpreadsheetModel } from '../Model/SpreadsheetModel';

export function SetRightToLeftApply(spreadsheetModel: SpreadsheetModel, data: ISetRightToLeftActionData) {
    const worksheet = spreadsheetModel.worksheets[data.sheetId];
    const rightToLeft = data.rightToLeft;

    // store old
    const oldState = worksheet.rightToLeft;

    // set new
    worksheet.rightToLeft = rightToLeft;

    // return old
    return oldState;
}

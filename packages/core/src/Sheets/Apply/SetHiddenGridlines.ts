import { BooleanNumber } from '../../Types/Enum';
import { ISetHiddenGridlinesActionData } from '../../Types/Interfaces/IActionModel';
import { SpreadsheetModel } from '../Model/SpreadsheetModel';

export function SetHiddenGridlinesApply(spreadsheetModel: SpreadsheetModel, data: ISetHiddenGridlinesActionData) {
    const worksheet = spreadsheetModel.worksheets[data.sheetId];
    const hideGridlines = data.hideGridlines;

    // store old
    const oldStatus = worksheet.showGridlines === 0;

    // set new
    if (hideGridlines) {
        worksheet.showGridlines = BooleanNumber.FALSE;
    } else {
        worksheet.showGridlines = BooleanNumber.TRUE;
    }

    // return old
    return oldStatus;
}

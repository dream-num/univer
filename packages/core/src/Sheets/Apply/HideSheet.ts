import { BooleanNumber } from '../../Types/Enum';
import { ISetWorkSheetHideActionData } from '../../Types/Interfaces/ISheetActionInterfaces';
import { SpreadsheetModel } from '../Model/SpreadsheetModel';

export function SetWorkSheetHideServiceApply(spreadsheetModel: SpreadsheetModel, data: ISetWorkSheetHideActionData) {
    // if (unit.WorkBookUnit == null) {
    //     throw new Error('Error WorkBookUnit is null');
    // }

    // const worksheet = unit.WorkBookUnit.getSheetBySheetId(data.sheetId);

    // if (worksheet == null) {
    //     throw new Error(`Error worksheet is null sheetId:${data.sheetId}`);
    // }

    // // get config
    // const config = worksheet.getConfig();

    // // store old hidden setting
    // const oldHidden = config?.hidden;

    // // set new hidden setting
    // config.hidden = data.hidden;

    // // return old hidden setting to undo
    // return oldHidden;
    return BooleanNumber.FALSE;
}

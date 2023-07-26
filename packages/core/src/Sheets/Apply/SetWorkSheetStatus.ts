import { BooleanNumber } from '../../Types/Enum';
import { SpreadsheetModel } from '../Model/SpreadsheetModel';

/**
 *
 * @param worksheet
 * @param sheetStatus
 * @returns
 *
 * @internal
 */
export function SetWorkSheetStatusApply(spreadsheetModel: SpreadsheetModel, data: ISetWorkSheetStatusActionData): BooleanNumber {
    // // get config
    // const config = worksheet.getConfig();

    // // store old sheet name
    // const oldStatus = config.status;

    // // set new sheet name
    // config.status = sheetStatus;

    // // return old sheet name to undo
    // return oldStatus;
    return BooleanNumber.FALSE;
}

import { ISetWorkSheetNameActionData } from '../../Types/Interfaces/IActionModel';
import { SpreadsheetModel } from '../Model/SpreadsheetModel';

/**
 *
 * @param worksheet
 * @param sheetName
 * @returns
 *
 * @internal
 */
export function SetWorkSheetNameApply(spreadsheetModel: SpreadsheetModel, data: ISetWorkSheetNameActionData): string {
    // // get config
    // const config = worksheet.getConfig();

    // // store old sheet name
    // const oldSheetName = config.name;

    // // set new sheet name
    // config.name = sheetName;

    // // return old sheet name to undo
    // return oldSheetName;

    return '';
}

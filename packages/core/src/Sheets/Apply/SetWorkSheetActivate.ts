import { BooleanNumber } from '../../Types/Enum';
import { ISetWorkSheetActivateActionData, ISheetStatus } from '../../Types/Interfaces/IActionModel';
import { SpreadsheetModel } from '../Model/SpreadsheetModel';

/**
 *
 * @param worksheet
 * @param status
 * @returns
 *
 * @internal
 */
export function SetWorkSheetActivate(spreadsheetModel: SpreadsheetModel, data: ISetWorkSheetActivateActionData): ISheetStatus {
    // // store old status

    // const oldSheet = worksheet.getContext().getWorkBook().getActiveSheet();
    // let oldSheetId = '';
    // const oldStatus = BooleanNumber.FALSE;
    // if (oldSheet) {
    //     oldSheetId = oldSheet.getSheetId();
    //     // oldSheet.getStatus();
    // }

    // const sheets = worksheet.getContext().getWorkBook().getSheets();
    // const currentSheetId = worksheet.getSheetId();

    // sheets.forEach((sheet) => {
    //     const sheetId = sheet.getSheetId();
    //     if (sheetId === currentSheetId) {
    //         // set new status
    //         // sheet.setStatus(status);
    //         sheet.getConfig().status = BooleanNumber.TRUE;
    //     } else {
    //         // reset status
    //         // sheet.setStatus(BooleanNumber.FALSE);
    //         sheet.getConfig().status = BooleanNumber.FALSE;
    //     }
    // });

    // // return old status to undo
    // return { oldSheetId, status: oldStatus };

    return { oldSheetId: '', status: BooleanNumber.FALSE };
}

import { ISetSheetOrderActionData } from '../../Types/Interfaces/IActionModel';
import { SpreadsheetModel } from '../Model/SpreadsheetModel';

export function SetSheetOrderApply(spreadsheetModel: SpreadsheetModel, data: ISetSheetOrderActionData): number {
    // const config = workbook.getConfig();
    // const oldIndex = config.sheetOrder.findIndex((current) => current === sheetId);
    // const exclude = config.sheetOrder.filter((currentId) => currentId !== sheetId);
    // exclude.splice(order, 0, sheetId);
    // config.sheetOrder = exclude;
    // return oldIndex;
    return 0;
}

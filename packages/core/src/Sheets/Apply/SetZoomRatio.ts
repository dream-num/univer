import { ISetZoomRatioActionData } from '../../Types/Interfaces/ISheetActionInterfaces';
import { SpreadsheetModel } from '../Model/SpreadsheetModel';

export function SetZoomRatio(spreadsheetModel: SpreadsheetModel, data: ISetZoomRatioActionData): number {
    // const worksheet = workbook.getSheetBySheetId(sheetId);
    // if (worksheet) {
    //     const order = worksheet.getConfig().zoomRatio;
    //     worksheet.getConfig().zoomRatio = zoom;
    //     return order;
    // }
    return 1;
}

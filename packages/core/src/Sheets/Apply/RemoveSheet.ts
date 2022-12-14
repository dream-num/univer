import { Workbook } from '../Domain';
import { IWorksheetConfig } from '../../Interfaces';

export function RemoveSheet(
    workbook: Workbook,
    sheetId: string
): {
    index: number;
    sheet: IWorksheetConfig;
} {
    const iSheets = workbook.getWorksheets();
    const config = workbook.getConfig();
    const { sheets } = config;
    if (sheets[sheetId] == null) {
        throw new Error(`Remove Sheet fail ${sheetId} is not exist`);
    }
    const removeSheet = sheets[sheetId];
    const removeIndex = config.sheetOrder.findIndex((id) => id === sheetId);
    delete sheets[sheetId];

    if (removeIndex !== config.sheetOrder.length - 1) {
        sheets[config.sheetOrder[removeIndex + 1]].status = 1;
    } else {
        sheets[config.sheetOrder[removeIndex - 1]].status = 1;
    }

    config.sheetOrder.splice(removeIndex, 1);
    iSheets.delete(sheetId);

    return {
        index: removeIndex,
        sheet: removeSheet as IWorksheetConfig,
    };
}

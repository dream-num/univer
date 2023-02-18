import { Workbook } from '../Domain';
import { IWorksheetConfig } from '../../Interfaces';
import { CommandUnit, IRemoveSheetActionData } from '../../Command';

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

    config.sheetOrder.splice(removeIndex, 1);
    iSheets.delete(sheetId);

    return {
        index: removeIndex,
        sheet: removeSheet as IWorksheetConfig,
    };
}

export function RemoveSheetApply(unit: CommandUnit, data: IRemoveSheetActionData) {
    let workbook = unit.WorkBookUnit;
    let sheetId = data.sheetId;

    const iSheets = workbook!.getWorksheets();
    const config = workbook!.getConfig();

    const { sheets } = config;
    if (sheets[sheetId] == null) {
        throw new Error(`Remove Sheet fail ${sheetId} is not exist`);
    }
    const findSheet = sheets[sheetId];
    const findIndex = config.sheetOrder.findIndex((id) => id === sheetId);
    delete sheets[sheetId];

    config.sheetOrder.splice(findIndex, 1);
    iSheets.delete(sheetId);

    return {
        index: findIndex,
        sheet: findSheet as IWorksheetConfig,
    };
}

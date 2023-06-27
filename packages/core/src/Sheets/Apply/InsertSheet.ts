import { Workbook, Worksheet } from '../Domain';
import { IWorksheetConfig } from '../../Interfaces';
import { CommandUnit } from '../../Command';
import { IInsertSheetActionData } from '../Action';

export function InsertSheet(
    workbook: Workbook,
    index: number,
    worksheetConfig: IWorksheetConfig
): string {
    const iSheets = workbook.getWorksheets();
    const config = workbook.getConfig();
    const { sheets, sheetOrder } = config;
    if (sheets[worksheetConfig.id]) {
        throw new Error(`Insert Sheet fail ${worksheetConfig.id} is already exist`);
    }
    sheets[worksheetConfig.id] = worksheetConfig;
    sheetOrder.splice(index, 0, worksheetConfig.id);
    iSheets.set(
        worksheetConfig.id,
        new Worksheet(workbook.getContext(), worksheetConfig)
    );
    return worksheetConfig.id;
}

export function InsertSheetApply(unit: CommandUnit, data: IInsertSheetActionData) {
    const worksheet = unit.WorkBookUnit!.getSheetBySheetId(data.sheetId);
    const index = data.index;
    const worksheetConfig = data.sheet;

    const iSheets = unit.WorkBookUnit!.getWorksheets();
    const config = unit.WorkBookUnit!.getConfig();
    const { sheets, sheetOrder } = config;
    if (sheets[worksheetConfig.id]) {
        throw new Error(`Insert Sheet fail ${worksheetConfig.id} is already exist`);
    }
    sheets[worksheetConfig.id] = worksheetConfig;
    sheetOrder.splice(index, 0, worksheetConfig.id);
    iSheets.set(
        worksheetConfig.id,
        new Worksheet(unit.WorkBookUnit!.getContext(), worksheetConfig)
    );
    return worksheetConfig.id;
}

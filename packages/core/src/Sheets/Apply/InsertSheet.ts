import { WorkBook, WorkSheet } from '../Domain';
import { IWorksheetConfig } from '../../Interfaces';

export function InsertSheet(
    workbook: WorkBook,
    index: number,
    worksheetConfig: IWorksheetConfig
): string {
    const iSheets = workbook._getWorksheets();
    const config = workbook.getConfig();
    const { sheets, sheetOrder } = config;
    if (sheets[worksheetConfig.id]) {
        throw new Error(`Insert Sheet fail ${worksheetConfig.id} is already exist`);
    }
    sheets[worksheetConfig.id] = worksheetConfig;
    sheetOrder.splice(index, 0, worksheetConfig.id);
    iSheets.set(
        worksheetConfig.id,
        new WorkSheet(workbook.getContext(), worksheetConfig)
    );
    return worksheetConfig.id;
}

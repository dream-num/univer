import { IWorksheetConfig } from '@univerjs/core';

/** Params of `RemoveSheetMutation` */
export interface IRemoveSheetMutationParams {
    worksheetId: string;
    workbookId: string;
}

/** Params of `InsertSheetMutation` */
export interface IInsertSheetMutationParams {
    index: number;
    sheet: IWorksheetConfig;
    workbookId: string;
}

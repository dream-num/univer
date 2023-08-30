import { ICellData, IWorksheetConfig, ObjectMatrixPrimitiveType } from '@univerjs/core';

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

/** Params of InsertRowMutation */
export interface IInsertRowMutationParams {
    workbookId: string;
    worksheetId: string;
    rowIndex: number;
    rowCount: number;
    insertRowData: ObjectMatrixPrimitiveType<ICellData>;
}

/** Params of InsertColMutation */
export interface IInsertColMutationParams {
    workbookId: string;
    worksheetId: string;
    colIndex: number;
    colCount: number;
    insertColData: ObjectMatrixPrimitiveType<ICellData>;
}

/** Params of InsertRowMutation */
export interface IRemoveRowMutationParams {
    workbookId: string;
    worksheetId: string;
    rowIndex: number;
    rowCount: number;
}

/** Params of InsertColMutation */
export interface IRemoveColMutationParams {
    workbookId: string;
    worksheetId: string;
    colIndex: number;
    colCount: number;
}

import { Dimension, ICellData, IColumnData, IRowData, ISelectionRange, IWorksheetConfig, ObjectArray, ObjectMatrixPrimitiveType } from '@univerjs/core';

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
    ranges: ISelectionRange[];
    rowInfo?: ObjectArray<IRowData>;
}

/** Params of InsertColMutation */
export interface IInsertColMutationParams {
    workbookId: string;
    worksheetId: string;
    ranges: ISelectionRange[];
    colInfo?: ObjectArray<IColumnData>;
}

/** Params of InsertRowMutation */
export interface IRemoveRowMutationParams {
    workbookId: string;
    worksheetId: string;
    ranges: ISelectionRange[];
}

/** Params of InsertColMutation */
export interface IRemoveColMutationParams {
    workbookId: string;
    worksheetId: string;
    ranges: ISelectionRange[];
}

/** Params of DeleteRange */
export interface IDeleteRangeMutationParams {
    workbookId: string;
    worksheetId: string;
    range: ISelectionRange[];
    shiftDimension: Dimension;
}

/** Params of InsertRange */
export interface IInsertRangeMutationParams {
    workbookId: string;
    worksheetId: string;
    range: ISelectionRange[];
    shiftDimension: Dimension;
    cellValue: ObjectMatrixPrimitiveType<ICellData>;
}

/** Params of RemoveWorksheetMergeMutation */
export interface IRemoveWorksheetMergeMutationParams {
    workbookId: string;
    worksheetId: string;
    ranges: ISelectionRange[];
}

/** Params of AddWorksheetMergeMutation */
export interface IAddWorksheetMergeMutationParams {
    workbookId: string;
    worksheetId: string;
    ranges: ISelectionRange[];
}

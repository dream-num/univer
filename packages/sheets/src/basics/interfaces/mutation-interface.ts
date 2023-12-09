import type {
    Dimension,
    ICellData,
    IColumnData,
    IRange,
    IRowData,
    IWorksheetData,
    ObjectArray,
    ObjectMatrixPrimitiveType,
} from '@univerjs/core';

/** Params of `RemoveSheetMutation` */
export interface IRemoveSheetMutationParams {
    worksheetId: string;
    workbookId: string;
    previousIndex: number;
}

/** Params of `InsertSheetMutation` */
export interface IInsertSheetMutationParams {
    index: number;
    sheet: IWorksheetData;
    workbookId: string;
}

/** Params of InsertRowMutation */
export interface IInsertRowMutationParams {
    workbookId: string;
    worksheetId: string;
    ranges: IRange[];
    rowInfo?: ObjectArray<IRowData>;
}

/** Params of InsertColMutation */
export interface IInsertColMutationParams {
    workbookId: string;
    worksheetId: string;
    ranges: IRange[];
    colInfo?: ObjectArray<IColumnData>;
}

/** Params of InsertRowMutation */
export interface IRemoveRowsMutationParams {
    workbookId: string;
    worksheetId: string;
    ranges: IRange[];
}

/** Params of InsertColMutation */
export interface IRemoveColMutationParams {
    workbookId: string;
    worksheetId: string;
    ranges: IRange[];
}

/** Params of DeleteRange */
export interface IDeleteRangeMutationParams {
    workbookId: string;
    worksheetId: string;
    ranges: IRange[];
    shiftDimension: Dimension;
}

/** Params of InsertRange */
export interface IInsertRangeMutationParams {
    workbookId: string;
    worksheetId: string;
    ranges: IRange[];
    shiftDimension: Dimension;
    cellValue: ObjectMatrixPrimitiveType<ICellData>;
}

/** Params of RemoveWorksheetMergeMutation */
export interface IRemoveWorksheetMergeMutationParams {
    workbookId: string;
    worksheetId: string;
    ranges: IRange[];
}

/** Params of AddWorksheetMergeMutation */
export interface IAddWorksheetMergeMutationParams {
    workbookId: string;
    worksheetId: string;
    ranges: IRange[];
}

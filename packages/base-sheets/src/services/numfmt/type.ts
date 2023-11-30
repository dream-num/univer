import type { ICellData, Nullable, ObjectMatrix, ObjectMatrixPrimitiveType, RefAlias } from '@univerjs/core';
import { LifecycleStages, runOnLifecycle } from '@univerjs/core';
import { createIdentifier } from '@wendellhu/redi';

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
export type INumfmtItem = {
    pattern: string;
};

export type FormatType =
    | 'currency'
    | 'date'
    | 'datetime'
    | 'error'
    | 'fraction'
    | 'general'
    | 'grouped'
    | 'number'
    | 'percent'
    | 'scientific'
    | 'text'
    | 'time'
    | 'unknown';

export type INumfmtItemWithCache = INumfmtItem & {
    // when change parameters or pattern, the cache is cleared follow mutation execute
    _cache?: {
        result: ICellData;
        parameters: number; // The parameter that was last calculated
    };
    type: FormatType;
};
export type IRefItem = INumfmtItem & { count: number; numfmtId: string; type: FormatType };

export interface INumfmtService {
    getValue(workbookId: string, worksheetId: string, row: number, col: number): Nullable<INumfmtItemWithCache>;
    getModel(workbookId: string, worksheetId: string): Nullable<ObjectMatrix<INumfmtItem>>;
    setValues(
        workbookId: string,
        worksheetId: string,
        values: Array<{ row: number; col: number; pattern?: string; type: FormatType }>
    ): void;
    getRefModel(workbookId: string): Nullable<RefAlias<IRefItem, 'numfmtId' | 'pattern'>>;
}

export interface ISnapshot {
    model: Record<string, ObjectMatrixPrimitiveType<INumfmtItem>>;
    refModel: IRefItem[];
}

export const INumfmtService = createIdentifier<INumfmtService>('INumfmtService');
runOnLifecycle(LifecycleStages.Rendered, INumfmtService);

import type { ICellData, Nullable, ObjectMatrix, ObjectMatrixPrimitiveType, RefAlias } from '@univerjs/core';
import { LifecycleStages, runOnLifecycle } from '@univerjs/core';
import { createIdentifier } from '@wendellhu/redi';
import type { Observable } from 'rxjs';

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
export type INumfmtItem = {
    i: string;
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

export interface INumfmtItemWithCache {
    // when change parameters or pattern, the cache is cleared follow mutation execute
    _cache?: {
        result: ICellData;
        parameters: number; // The parameter that was last calculated
    };
    pattern: string;
    type: FormatType;
}
export type IRefItem = INumfmtItem & { count: number; type: FormatType; pattern: string };

export interface INumfmtService {
    getValue(
        workbookId: string,
        worksheetId: string,
        row: number,
        col: number,
        model?: ObjectMatrix<INumfmtItem>
    ): Nullable<INumfmtItemWithCache>;
    getModel(workbookId: string, worksheetId: string): Nullable<ObjectMatrix<INumfmtItem>>;
    setValues(
        workbookId: string,
        worksheetId: string,
        values: Array<{ row: number; col: number; pattern?: string; type?: FormatType }>
    ): void;
    getRefModel(workbookId: string): Nullable<RefAlias<IRefItem, 'i' | 'pattern'>>;
    modelReplace$: Observable<string>;
}

export interface ISnapshot {
    model: Record<string, ObjectMatrixPrimitiveType<INumfmtItem>>;
    refModel: IRefItem[];
}

export const INumfmtService = createIdentifier<INumfmtService>('INumfmtService');
runOnLifecycle(LifecycleStages.Rendered, INumfmtService);

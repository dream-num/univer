import type { ICellData, Nullable, ObjectMatrix } from '@univerjs/core';
import { LifecycleStages, runOnLifecycle } from '@univerjs/core';
import { createIdentifier } from '@wendellhu/redi';

import { FormatType, NumfmtItem } from '../base/types/index';

export type NumfmtItemWithCache = NumfmtItem & {
    // when change parameters or pattern, the cache is cleared follow mutation execute
    _cache?: {
        result: ICellData;
        parameters: number; // The parameter that was last calculated
    };
    type: FormatType;
};
export type RefItem = NumfmtItem & { count: number; numfmtId: string; type: FormatType };

export interface INumfmtService {
    getValue(workbookId: string, worksheetId: string, row: number, col: number): Nullable<NumfmtItemWithCache>;
    getModel(workbookId: string, worksheetId: string): Nullable<ObjectMatrix<NumfmtItem>>;
    setValues(
        workbookId: string,
        worksheetId: string,
        values: Array<{ row: number; col: number; pattern?: string; type: FormatType }>
    ): void;
}

export const INumfmtService = createIdentifier<INumfmtService>('INumfmtService');
runOnLifecycle(LifecycleStages.Rendered, INumfmtService);

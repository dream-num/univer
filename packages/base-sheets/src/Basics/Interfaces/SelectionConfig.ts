import { IRangeCellData, IRangeData } from '@univerjs/core';

export interface ISelectionConfig {
    selection: IRangeData;
    cell?: IRangeCellData;
}

export interface ISelectionsConfig {
    [worksheetId: string]: ISelectionConfig[];
}

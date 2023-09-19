import { IRangeCellData, ISelectionRange } from '@univerjs/core';

export interface ISelectionConfig {
    selection: ISelectionRange;
    cell?: IRangeCellData;
}

export interface ISelectionsConfig {
    [worksheetId: string]: ISelectionConfig[];
}

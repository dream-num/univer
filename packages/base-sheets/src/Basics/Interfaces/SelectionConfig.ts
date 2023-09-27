import { IRange, IRangeCellData } from '@univerjs/core';

export interface ISelectionConfig {
    selection: IRange;
    cell?: IRangeCellData;
}

export interface ISelectionsConfig {
    [worksheetId: string]: ISelectionConfig[];
}

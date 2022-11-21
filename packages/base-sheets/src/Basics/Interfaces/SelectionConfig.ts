import { IRangeCellData, IRangeData } from '@univer/core';

export interface ISelectionConfig {
    selection: IRangeData;
    cell?: IRangeCellData;
}

export interface ISelectionsConfig {
    [worksheetId: string]: ISelectionConfig[];
}

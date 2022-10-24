import { IRangeCellData, IRangeData } from '@univer/core';

export interface ISelectionValue {
    selection: IRangeData;
    cell?: IRangeCellData;
}

export interface ISelectionsConfig {
    [worksheetId: string]: ISelectionValue[];
}

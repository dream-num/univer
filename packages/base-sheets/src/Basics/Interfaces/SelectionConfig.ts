import { ICellInfo, IRangeCellData, IRangeData, ISelection, ISheetActionData, Nullable } from '@univerjs/core';

export interface ISelectionConfig {
    selection: IRangeData;
    cell?: IRangeCellData;
}

export interface ISelectionsConfig {
    [worksheetId: string]: ISelectionConfig[];
}

export interface ISelectionModelValue {
    selection: ISelection;
    cell: Nullable<ICellInfo>;
}

export interface ISetSelectionValueActionData extends ISheetActionData {
    selections: ISelectionModelValue[];
}

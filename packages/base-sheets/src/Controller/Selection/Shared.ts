import { IRangeCellData, IRangeData, Nullable } from '@univerjs/core';

export interface IColumnTitleControllerHandlers {
    clearSelectionControls: () => void;
    addControlToCurrentByRangeData: (selectionRange: IRangeData, curCellRange: Nullable<IRangeCellData>, command?: boolean) => any;
}

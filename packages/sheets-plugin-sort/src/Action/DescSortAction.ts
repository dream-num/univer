import { SheetActionBase, ISheetActionData, IRangeData } from '@univerjs/core';
import { IAscSortData } from './index';

export interface IDescSortData extends ISheetActionData {
    range: IRangeData;
}

export class DescSortAction extends SheetActionBase<IDescSortData, IAscSortData> {
    do(): void {}

    redo(): void {
        this.do();
    }

    undo(): void {}

    validate(): boolean {
        return false;
    }
}

// const actionData: IDescSortData = {
//     actionName: ACTION_NAMES.DESC_SORT_ACTION,
//     range: range.getRangeData(),
//     sheetId: this._workSheet.getSheetId(),
// };

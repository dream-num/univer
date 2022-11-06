import { SheetAction, ActionObservers, ISheetActionData, IRangeData, Workbook } from '@univer/core';
import { IAscSortData } from './index';

export interface IDescSortData extends ISheetActionData {
    range: IRangeData;
}

export class DescSortAction extends SheetAction<IDescSortData, IAscSortData> {
    constructor(actionData: IDescSortData, workbook: Workbook, observers: ActionObservers) {
        super(actionData, workbook, observers);
    }

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

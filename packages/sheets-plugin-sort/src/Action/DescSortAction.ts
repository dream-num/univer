import { ActionBase, ActionObservers, IActionData, IRangeData, Workbook } from '@univer/core';
import { IAscSortData } from './index';

export interface IDescSortData extends IActionData {
    range: IRangeData;
}

export class DescSortAction extends ActionBase<IDescSortData, IAscSortData> {
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

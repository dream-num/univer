import { ActionBase, ActionObservers, IActionData, IRangeData, Workbook1 } from '@univer/core';
import { ACTION_NAMES } from '../Enum';
import { IDescSortData } from './DescSortAction';

export interface IAscSortData extends IActionData {
    rangeData: IRangeData;
}

export class AscSortAction extends ActionBase<IAscSortData, IDescSortData> {
    constructor(actionData: IAscSortData, workbook: Workbook1, observers: ActionObservers) {
        super(actionData, workbook, observers);
        this._doActionData = {
            ...actionData,
        };
        this._oldActionData = {
            actionName: ACTION_NAMES.ASC_SORT_ACTION,
            sheetId: actionData.sheetId,
            range: actionData.rangeData,
        };
    }

    do(): void {
        const { rangeData } = this._doActionData;
        const worksheet = this.getWorkSheet();
        if (worksheet) return;
    }

    redo(): void {
        this.do();
    }

    undo(): void {}

    validate(): boolean {
        return false;
    }
}

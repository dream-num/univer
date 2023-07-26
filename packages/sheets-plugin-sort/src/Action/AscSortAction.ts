import { SheetActionBase, ActionObservers, ISheetActionData, IRangeData, CommandModel } from '@univerjs/core';
import { ACTION_NAMES } from '../Enum';
import { IDescSortData } from './DescSortAction';

export interface IAscSortData extends ISheetActionData {
    rangeData: IRangeData;
}

export class AscSortAction extends SheetActionBase<IAscSortData, IDescSortData> {
    constructor(actionData: IAscSortData, commandModel: CommandModel, observers: ActionObservers) {
        super(actionData, commandModel, observers);
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
    }

    redo(): void {
        this.do();
    }

    undo(): void {}

    validate(): boolean {
        return false;
    }
}

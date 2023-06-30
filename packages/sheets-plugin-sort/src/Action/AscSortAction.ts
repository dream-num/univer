import { SheetActionBase, ActionObservers, ISheetActionData, IRangeData, CommandUnit } from '@univerjs/core';
import { ACTION_NAMES } from '../Enum';
import { IDescSortData } from './DescSortAction';

export interface IAscSortData extends ISheetActionData {
    rangeData: IRangeData;
}

export class AscSortAction extends SheetActionBase<IAscSortData, IDescSortData> {
    constructor(actionData: IAscSortData, commandUnit: CommandUnit, observers: ActionObservers) {
        super(actionData, commandUnit, observers);
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

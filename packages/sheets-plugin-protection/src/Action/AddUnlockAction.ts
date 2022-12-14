import { SheetActionBase, ActionObservers, ISheetActionData, Range, Workbook } from '@univer/core';
import { AddUnlock, RemoveUnlock } from '../Apply';
import { ACTION_NAMES } from '../Basic/Enum/ACTION_NAMES';

export interface IAddUnlockActionData extends ISheetActionData {
    unlock: Range;
}

export class AddUnlockAction extends SheetActionBase<IAddUnlockActionData, IAddUnlockActionData> {
    constructor(actionData: IAddUnlockActionData, workbook: Workbook, observers: ActionObservers) {
        super(actionData, workbook, observers);
        this._doActionData = {
            ...actionData,
        };
        this._oldActionData = {
            actionName: ACTION_NAMES.ADD_UNLOCK_ACTION,
            sheetId: actionData.sheetId,
            unlock: actionData.unlock,
        };
        this.do();
        this.validate();
    }

    do(): void {
        this.redo();
    }

    redo(): void {
        const worksheet = this.getWorkSheet();
        AddUnlock(worksheet, this._doActionData.unlock);
    }

    undo(): void {
        const worksheet = this.getWorkSheet();
        RemoveUnlock(worksheet, this._doActionData.unlock);
    }

    validate(): boolean {
        return false;
    }
}

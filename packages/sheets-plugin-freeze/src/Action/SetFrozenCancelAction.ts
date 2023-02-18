import { SheetActionBase, ISheetActionData, Workbook, ActionObservers, ActionType } from '@univerjs/core';
import { SetFrozenCancel } from '../Apply/SetFrozenCancel';
import { SetFrozenColumns } from '../Apply/SetFrozenColumns';
import { SetFrozenRows } from '../Apply/SetFrozenRows';
import { ACTION_NAMES } from '../Basic/Enum/ACTION_NAMES';

export class SetFrozenCancelAction extends SheetActionBase<ISheetActionData> {
    _numbers: number[] = [];

    constructor(actionData: ISheetActionData, workbook: Workbook, observers: ActionObservers) {
        super(actionData, workbook, observers);
        this._doActionData = {
            ...actionData,
        };
        this._oldActionData = {
            actionName: ACTION_NAMES.SET_FROZEN_COLUMNS_ACTION,
            sheetId: actionData.sheetId,
        };
        this.do();
        this.validate();
    }

    do(): void {
        const worksheet = this.getWorkSheet();
        this._numbers = SetFrozenCancel(worksheet);
        this._observers.notifyObservers({
            type: ActionType.REDO,
            data: this._doActionData,
            action: this,
        });
    }

    redo(): void {
        this.do();
    }

    undo(): void {
        const worksheet = this.getWorkSheet();

        SetFrozenRows(worksheet, this._numbers[0]);
        SetFrozenColumns(worksheet, this._numbers[1]);

        this._observers.notifyObservers({
            type: ActionType.UNDO,
            data: this._oldActionData,
            action: this,
        });
    }

    validate(): boolean {
        return false;
    }
}

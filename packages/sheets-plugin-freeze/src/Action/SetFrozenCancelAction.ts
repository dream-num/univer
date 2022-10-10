import { ActionBase, IActionData, WorkBook, ActionObservers, WorkSheetConvertor, CONVERTOR_OPERATION, ActionType } from '@univer/core';
import { SetFrozenCancel } from '../Apply/SetFrozenCancel';
import { SetFrozenColumns } from '../Apply/SetFrozenColumns';
import { SetFrozenRows } from '../Apply/SetFrozenRows';
import { ACTION_NAMES } from '../Basic/Enum/ACTION_NAMES';

export class SetFrozenCancelAction extends ActionBase<IActionData> {
    _numbers: number[] = [];

    constructor(actionData: IActionData, workbook: WorkBook, observers: ActionObservers) {
        super(actionData, workbook, observers);
        this._doActionData = {
            ...actionData,
            convertor: [new WorkSheetConvertor(CONVERTOR_OPERATION.SET)],
        };
        this._oldActionData = {
            actionName: ACTION_NAMES.SET_FROZEN_COLUMNS_ACTION,
            sheetId: actionData.sheetId,
            convertor: [new WorkSheetConvertor(CONVERTOR_OPERATION.SET)],
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

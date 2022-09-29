import { ActionBase, ActionObservers, IActionData } from '../../../Command';
import { WorkBook } from '../../../Sheets/Domain';
import { WorkSheetConvertor } from '../../../Convertor';
import { SetFrozenCancelService } from '../Service/SetFrozenCancelService';
import { ACTION_NAMES, CONVERTOR_OPERATION } from '../../../Const';
import { SetFrozenColumns, SetFrozenRows } from '../../../Sheets/Apply';

export class SetFrozenCancelAction extends ActionBase<IActionData> {
    _numbers: number[] = [];

    constructor(
        actionData: IActionData,
        workbook: WorkBook,
        observers: ActionObservers
    ) {
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
        this.redo();
    }

    redo(): void {
        const worksheet = this.getWorkSheet();
        this._observers.onActionDoObserver.notifyObservers(this);
        this._numbers = SetFrozenCancelService(worksheet);
    }

    undo(): void {
        const worksheet = this.getWorkSheet();
        this._observers.onActionDoObserver.notifyObservers(this);
        SetFrozenRows(worksheet, this._numbers[0]);
        SetFrozenColumns(worksheet, this._numbers[1]);
    }

    validate(): boolean {
        return false;
    }
}

import { ActionBase, ActionObservers, IActionData } from '../../../Command';
import { Range, Workbook1 } from '../../../Sheets/Domain';
import { WorkSheetConvertor } from '../../../Convertor';
import { ACTION_NAMES, CONVERTOR_OPERATION } from '../../../Const';
import { AddUnlockService } from '../Service/AddUnlockService';
import { RemoveUnlockService } from '../Service/RemoveUnlockService';

export interface IAddUnlockActionData extends IActionData {
    unlock: Range;
}

export class AddUnlockAction extends ActionBase<
    IAddUnlockActionData,
    IAddUnlockActionData
> {
    constructor(
        actionData: IAddUnlockActionData,
        workbook: Workbook1,
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
            unlock: actionData.unlock,
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
        AddUnlockService(worksheet, this._doActionData.unlock);
    }

    undo(): void {
        const worksheet = this.getWorkSheet();
        RemoveUnlockService(worksheet, this._doActionData.unlock);
    }

    validate(): boolean {
        return false;
    }
}

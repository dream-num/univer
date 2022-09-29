import { ActionBase, ActionObservers, IActionData } from '../../../Command';
import { Allowed } from '../Allowed';
import { WorkBook } from '../../../Sheets/Domain';
import { WorkSheetConvertor } from '../../../Convertor';
import { ACTION_NAMES, CONVERTOR_OPERATION } from '../../../Const';
import { AddAllowedService } from '../Service/AddAllowedService';
import { RemoveAllowedService } from '../Service/RemoveAllowedService';

export interface IAddAllowedActionData extends IActionData {
    allowed: Allowed;
}

export class AddAllowedAction extends ActionBase<
    IAddAllowedActionData,
    IAddAllowedActionData
> {
    constructor(
        actionData: IAddAllowedActionData,
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
            allowed: actionData.allowed,
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
        AddAllowedService(worksheet, this._doActionData.allowed);
    }

    undo(): void {
        const worksheet = this.getWorkSheet();
        RemoveAllowedService(worksheet, this._doActionData.allowed);
    }

    validate(): boolean {
        return false;
    }
}

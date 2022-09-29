import { ActionBase, ActionObservers, IActionData } from '../../../Command';
import { WorkBook } from '../../../Sheets/Domain';
import { WorkSheetConvertor } from '../../../Convertor';
import { ACTION_NAMES, CONVERTOR_OPERATION } from '../../../Const';
import { SetProtectionService } from '../Service/SetProtectionService';

export interface ISetProtectionActionData extends IActionData {
    enable: boolean;
    password: string;
}

export class SetProtectionAction extends ActionBase<
    ISetProtectionActionData,
    ISetProtectionActionData
> {
    protected _oldValue: [boolean, string];

    constructor(
        actionData: ISetProtectionActionData,
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
            enable: actionData.enable,
            password: actionData.password,
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
        this._oldValue = SetProtectionService(
            worksheet,
            this._doActionData.enable,
            this._doActionData.password
        );
    }

    undo(): void {
        const worksheet = this.getWorkSheet();
        SetProtectionService(worksheet, this._oldValue[0], this._oldValue[1]);
    }

    validate(): boolean {
        return false;
    }
}

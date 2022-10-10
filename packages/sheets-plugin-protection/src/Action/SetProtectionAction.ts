import { ActionBase, ActionObservers, ACTION_NAMES, CONVERTOR_OPERATION, IActionData, Workbook, WorkSheetConvertor } from '@univer/core';
import { SetProtection } from '../Apply';

export interface ISetProtectionActionData extends IActionData {
    enable: boolean;
    password: string;
}

export class SetProtectionAction extends ActionBase<ISetProtectionActionData, ISetProtectionActionData> {
    protected _oldValue: [boolean, string];

    constructor(actionData: ISetProtectionActionData, workbook: Workbook, observers: ActionObservers) {
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
        this._oldValue = SetProtection(worksheet, this._doActionData.enable, this._doActionData.password);
    }

    undo(): void {
        const worksheet = this.getWorkSheet();
        SetProtection(worksheet, this._oldValue[0], this._oldValue[1]);
    }

    validate(): boolean {
        return false;
    }
}

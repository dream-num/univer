import { SheetActionBase, ActionObservers, ISheetActionData, Workbook } from '@univer/core';
import { SetProtection } from '../Apply';
import { ACTION_NAMES } from '../Basic/Enum/ACTION_NAMES';

export interface ISetProtectionActionData extends ISheetActionData {
    enable: boolean;
    password: string;
}

export class SetProtectionAction extends SheetActionBase<ISetProtectionActionData, ISetProtectionActionData> {
    protected _oldValue: [boolean, string];

    constructor(actionData: ISetProtectionActionData, workbook: Workbook, observers: ActionObservers) {
        super(actionData, workbook, observers);
        this._doActionData = {
            ...actionData,
        };
        this._oldActionData = {
            actionName: ACTION_NAMES.SET_PROTECTION_ACTION,
            sheetId: actionData.sheetId,
            enable: actionData.enable,
            password: actionData.password,
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

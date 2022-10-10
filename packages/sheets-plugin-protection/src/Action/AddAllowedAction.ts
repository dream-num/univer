import { ActionBase, ActionObservers, ACTION_NAMES, CONVERTOR_OPERATION, IActionData, Workbook, WorkSheetConvertor } from '@univer/core';
import { Allowed } from '../Domain';
import { AddAllowed, RemoveAllowed } from '../Apply';

export interface IAddAllowedActionData extends IActionData {
    allowed: Allowed;
}

export class AddAllowedAction extends ActionBase<IAddAllowedActionData, IAddAllowedActionData> {
    constructor(actionData: IAddAllowedActionData, workbook: Workbook, observers: ActionObservers) {
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
        AddAllowed(worksheet, this._doActionData.allowed);
    }

    undo(): void {
        const worksheet = this.getWorkSheet();
        RemoveAllowed(worksheet, this._doActionData.allowed);
    }

    validate(): boolean {
        return false;
    }
}

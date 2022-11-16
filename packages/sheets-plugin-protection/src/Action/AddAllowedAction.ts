import { SheetActionBase, ActionObservers, CONVERTOR_OPERATION, ISheetActionData, Workbook, WorkSheetConvertor } from '@univer/core';
import { Allowed } from '../Controller';
import { AddAllowed, RemoveAllowed } from '../Apply';
import { ACTION_NAMES } from '../Basic/Enum/ACTION_NAMES';

export interface IAddAllowedActionData extends ISheetActionData {
    allowed: Allowed;
}

export class AddAllowedAction extends SheetActionBase<IAddAllowedActionData, IAddAllowedActionData> {
    constructor(actionData: IAddAllowedActionData, workbook: Workbook, observers: ActionObservers) {
        super(actionData, workbook, observers);
        this._doActionData = {
            ...actionData,
            convertor: [new WorkSheetConvertor(CONVERTOR_OPERATION.SET)],
        };
        this._oldActionData = {
            actionName: ACTION_NAMES.ADD_ALLOWED_ACTION,
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

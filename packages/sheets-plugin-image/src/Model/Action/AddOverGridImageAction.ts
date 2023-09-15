import { ActionObservers, ActionType, CommandUnit, ISheetActionData, SheetActionBase } from '@univerjs/core';

import { ACTION_NAMES, OverGridImageBorderType } from '../../Basics';
import { AddOverGridImageApply, RemoveOverGridImageApply } from '../Apply';
import { IRemoveOverGridImageActionData } from './RemoveOverGridImageAction';

export interface IAddOverGridImageActionData extends ISheetActionData {
    id: string;
    sheetId: string;
    radius: number;
    url: string;
    borderType: OverGridImageBorderType;
    width: number;
    height: number;
    row: number;
    column: number;
    borderColor: string;
    borderWidth: number;
}

export class AddOverGridImageAction extends SheetActionBase<IAddOverGridImageActionData, IRemoveOverGridImageActionData> {
    static NAME = 'AddImagePropertyAction';

    constructor(actionData: IAddOverGridImageActionData, commandUnit: CommandUnit, observers: ActionObservers) {
        super(actionData, commandUnit, observers);
        this._oldActionData = {
            actionName: ACTION_NAMES.SET_IMAGE_TYPE_ACTION,
            id: this.do(),
            sheetId: actionData.sheetId,
            injector: actionData.injector,
        };
    }

    do(): string {
        const result = AddOverGridImageApply(this._doActionData);
        this._observers.notifyObservers({
            type: ActionType.REDO,
            data: this._doActionData,
            action: this,
        });
        return result;
    }

    redo(): void {
        this.do();
    }

    undo(): void {
        RemoveOverGridImageApply(this._oldActionData);
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

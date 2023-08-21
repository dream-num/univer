import { SheetActionBase, ActionObservers, ISheetActionData, CommandUnit, ActionType } from '@univerjs/core';
import { ACTION_NAMES, OverGridImageBorderType } from '../../Basics';
import { AddImageProperty, RemoveImageProperty } from '../Apply';
import { IRemoveImagePropertyData } from './RemoveImagePropertyAction';

export interface IAddImagePropertyData extends ISheetActionData {
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

export class AddImagePropertyAction extends SheetActionBase<IAddImagePropertyData, IRemoveImagePropertyData> {
    static NAME = 'AddImagePropertyAction';

    constructor(actionData: IAddImagePropertyData, commandUnit: CommandUnit, observers: ActionObservers) {
        super(actionData, commandUnit, observers);
        this._oldActionData = {
            actionName: ACTION_NAMES.SET_IMAGE_TYPE_ACTION,
            id: this.do(),
            sheetId: actionData.sheetId,
            injector: actionData.injector,
        };
    }

    do(): string {
        const result = AddImageProperty(this._doActionData);
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
        RemoveImageProperty(this._oldActionData);
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

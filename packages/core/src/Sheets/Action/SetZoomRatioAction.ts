import { ActionObservers, ActionType } from '../../Command/ActionBase';
import { CommandModel } from '../../Command/CommandModel';
import { SheetActionBase } from '../../Command/SheetActionBase';
import { ISetZoomRatioActionData } from '../../Types/Interfaces/ISheetActionInterfaces';
import { SetZoomRatio } from '../Apply/SetZoomRatio';

export class SetZoomRatioAction extends SheetActionBase<ISetZoomRatioActionData, ISetZoomRatioActionData> {
    constructor(actionData: ISetZoomRatioActionData, commandModel: CommandModel, observers: ActionObservers) {
        super(actionData, commandModel, observers);
        this._doActionData = {
            ...actionData,
        };
        this._oldActionData = {
            ...actionData,
            zoom: this.do(),
        };
        this.validate();
    }

    redo(): number {
        const result = SetZoomRatio(this.getSpreadsheetModel(), this._doActionData);

        this._observers.notifyObservers({
            type: ActionType.REDO,
            data: this._doActionData,
            action: this,
        });

        return result;
    }

    do(): number {
        return this.redo();
    }

    undo(): void {
        SetZoomRatio(this.getSpreadsheetModel(), this._oldActionData);

        this._observers.notifyObservers({
            type: ActionType.REDO,
            data: this._oldActionData,
            action: this,
        });
    }

    validate(): boolean {
        return false;
    }
}

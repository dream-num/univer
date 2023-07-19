import { SheetActionBase, ActionObservers, ActionType, CommandModel } from '../../Command';
import { ISetZoomRatioActionData } from '../../Types/Interfaces/IActionModel';
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
        const result = SetZoomRatio(this.getWorkBook(), this._doActionData.sheetId, this._doActionData.zoom);

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
        SetZoomRatio(this.getWorkBook(), this._oldActionData.sheetId, this._oldActionData.zoom);

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

import {
    SheetActionBase,
    ActionObservers,
    ActionType,
    ISheetActionData,
    CommandUnit,
} from '../../Command';
import { SetZoomRatio } from '../Apply/SetZoomRatio';

export interface ISetZoomRatioActionData extends ISheetActionData {
    zoom: number;
    sheetId: string;
}

export class SetZoomRatioAction extends SheetActionBase<
    ISetZoomRatioActionData,
    ISetZoomRatioActionData
> {
    static NAME = 'SetZoomRatioAction';

    constructor(
        actionData: ISetZoomRatioActionData,
        commandUnit: CommandUnit,
        observers: ActionObservers
    ) {
        super(actionData, commandUnit, observers);
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
        const result = SetZoomRatio(
            this.getWorkBook(),
            this._doActionData.sheetId,
            this._doActionData.zoom
        );

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
        SetZoomRatio(
            this.getWorkBook(),
            this._oldActionData.sheetId,
            this._oldActionData.zoom
        );

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

import { ActionBase, ActionObservers, ActionType, IActionData } from '../../Command';
import { Workbook } from '../Domain';
import { SetZoomRatio } from '../Apply/SetZoomRatio';

export interface ISetZoomRatioActionData extends IActionData {
    zoom: number;
    sheetId: string;
}

export class SetZoomRatioAction extends ActionBase<
    ISetZoomRatioActionData,
    ISetZoomRatioActionData
> {
    constructor(
        actionData: ISetZoomRatioActionData,
        workbook: Workbook,
        observers: ActionObservers
    ) {
        super(actionData, workbook, observers);
        this._doActionData = {
            ...actionData,
            convertor: [],
        };
        this._oldActionData = {
            ...actionData,
            zoom: this.do(),
            convertor: [],
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

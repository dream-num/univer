import { ActionObservers, ActionType } from '../../Command/ActionBase';
import { CommandModel } from '../../Command/CommandModel';
import { SheetActionBase } from '../../Command/SheetActionBase';
import { ISetSheetOrderActionData } from '../../Types/Interfaces/ISheetActionInterfaces';
import { SetSheetOrderApply } from '../Apply/SetSheetOrder';

export class SetSheetOrderAction extends SheetActionBase<ISetSheetOrderActionData, ISetSheetOrderActionData> {
    constructor(actionData: ISetSheetOrderActionData, commandModel: CommandModel, observers: ActionObservers) {
        super(actionData, commandModel, observers);
        this._doActionData = {
            ...actionData,
        };
        this._oldActionData = {
            ...actionData,
            order: this.do(),
        };
        this.validate();
    }

    do(): number {
        const result = SetSheetOrderApply(this.getSpreadsheetModel(), this._doActionData);
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
        SetSheetOrderApply(this.getSpreadsheetModel(), this._oldActionData);
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

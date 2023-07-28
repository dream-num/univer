import { SetColumnHideApply } from '../Apply/SetColumnHide';
import { SetColumnShowApply } from '../Apply/SetColumnShow';
import { SheetActionBase } from '../../Command/SheetActionBase';
import { ISetColumnHideActionData, ISetColumnShowActionData } from '../../Types/Interfaces/ISheetActionInterfaces';
import { CommandModel } from '../../Command/CommandModel';
import { ActionObservers, ActionType } from '../../Command/ActionBase';

/**
 * Set column hiding based on specified column index and number of columns
 *
 * @internal
 */
export class SetColumnHideAction extends SheetActionBase<ISetColumnHideActionData, ISetColumnShowActionData> {
    constructor(actionData: ISetColumnHideActionData, commandModel: CommandModel, observers: ActionObservers) {
        super(actionData, commandModel, observers);
        this._doActionData = {
            ...actionData,
        };
        this.do();
        this._oldActionData = {
            ...actionData,
        };
        this.validate();
    }

    do(): void {
        SetColumnHideApply(this.getSpreadsheetModel(), this._doActionData);
        this._observers.notifyObservers({
            type: ActionType.REDO,
            data: this._doActionData,
            action: this,
        });
    }

    redo(): void {
        this.do();
    }

    undo(): void {
        SetColumnShowApply(this.getSpreadsheetModel(), this._oldActionData);
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

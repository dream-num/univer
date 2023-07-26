import { SetColumnHideApply } from '../Apply/SetColumnHide';
import { SetColumnShowApply } from '../Apply/SetColumnShow';
import { SheetActionBase } from '../../Command/SheetActionBase';
import { ISetColumnShowActionData } from '../../Types/Interfaces/IActionModel';
import { ActionObservers, ActionType } from '../../Command/ActionBase';
import { CommandModel } from '../../Command/CommandModel';

/**
 * Set column display based on specified column index and number of columns
 *
 * @internal
 */
export class SetColumnShowAction extends SheetActionBase<ISetColumnShowActionData> {
    constructor(actionData: ISetColumnShowActionData, commandModel: CommandModel, observers: ActionObservers) {
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
        SetColumnShowApply(this.getSpreadsheetModel(), this._doActionData);
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
        SetColumnHideApply(this.getSpreadsheetModel(), this._oldActionData);
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

import { CommandModel } from '../../Command/CommandModel';
import { SheetActionBase } from '../../Command/SheetActionBase';
import { ISetRowHideActionData, ISetRowShowActionData } from '../../Types/Interfaces/ISheetActionInterfaces';
import { ActionObservers, ActionType } from '../../Command/ActionBase';
import { SetRowHideApply } from '../Apply/SetRowHide';
import { SetRowShowApply } from '../Apply/SetRowShow';

/**
 * Set row hiding based on specified row index and number of rows
 *
 * @internal
 */
export class SetRowHideAction extends SheetActionBase<ISetRowHideActionData, ISetRowShowActionData> {
    constructor(actionData: ISetRowHideActionData, commandModel: CommandModel, observers: ActionObservers) {
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
        const result = SetRowHideApply(this.getSpreadsheetModel(), this._doActionData);

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
        SetRowShowApply(this.getSpreadsheetModel(), this._doActionData);

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

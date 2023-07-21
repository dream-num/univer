import { SheetActionBase, ActionObservers, ActionType, CommandModel } from '../../Command';
import { IInsertRowActionData, IRemoveRowActionData } from '../../Types/Interfaces/IActionModel';
import { InsertRowApply, RemoveRowApply } from '../Apply';

/**
 * Insert the row configuration of the specified row index
 *
 * @internal
 */
export class InsertRowAction extends SheetActionBase<IInsertRowActionData, IRemoveRowActionData> {
    constructor(actionData: IInsertRowActionData, commandModel: CommandModel, observers: ActionObservers) {
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
        InsertRowApply(this.getSpreadsheetModel(), this._doActionData);
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
        RemoveRowApply(this.getSpreadsheetModel(), this._oldActionData);
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

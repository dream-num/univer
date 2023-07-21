import { InsertColumnApply, RemoveColumnApply } from '../Apply';
import { ActionObservers, ActionType, CommandModel } from '../../Command';
import { SheetActionBase } from '../../Command/SheetActionBase';
import { IRemoveColumnAction, IInsertColumnActionData } from '../../Types/Interfaces/IActionModel';

/**
 * Remove the column configuration of the specified column index and column count
 *
 * @internal
 */
export class RemoveColumnAction extends SheetActionBase<IRemoveColumnAction, IInsertColumnActionData> {
    constructor(actionData: IRemoveColumnAction, commandModel: CommandModel, observers: ActionObservers) {
        super(actionData, commandModel, observers);
        this._doActionData = {
            ...actionData,
        };
        this._oldActionData = {
            ...actionData,
            columnCount: this.do(),
        };
        this.validate();
    }

    do(): number {
        const result = RemoveColumnApply(this.getSpreadsheetModel(), this._doActionData);
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
        InsertColumnApply(this.getSpreadsheetModel(), this._oldActionData);
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

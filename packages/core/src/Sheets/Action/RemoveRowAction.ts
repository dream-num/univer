import { InsertRowApply, RemoveRowApply } from '../Apply';
import { SheetActionBase } from '../../Command/SheetActionBase';
import { CommandModel } from '../../Command';
import { ActionObservers, ActionType } from '../../Command/ActionObservers';
import { IInsertRowActionData } from './InsertRowAction';

/**
 * Remove the row configuration of the specified row index and row count
 *
 * @internal
 */
export class RemoveRowAction extends SheetActionBase<IRemoveRowActionData, IInsertRowActionData> {

    constructor(actionData: IRemoveRowActionData, commandModel: CommandModel, observers: ActionObservers) {
        super(actionData, commandModel, observers);
        this._doActionData = {
            ...actionData,
        };
        this._oldActionData = {
            ...actionData,
            rowCount: this.do(),
        };
        this.validate();
    }

    do(): number {
        const result = RemoveRowApply(this._commandModel, this._doActionData);
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
        InsertRowApply(this._commandModel, this._oldActionData);
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

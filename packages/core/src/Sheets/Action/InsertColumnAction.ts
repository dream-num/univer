import { InsertColumnApply, RemoveColumnApply } from '../Apply';
import { SheetActionBase } from '../../Command/SheetActionBase';
import { ActionObservers, ActionType } from '../../Command/ActionObservers';
import { IRemoveColumnAction } from './RemoveColumnAction';
import { CommandModel } from '../../Command';

/**
 * Insert the column configuration of the specified column index
 *
 * @internal
 */
export class InsertColumnAction extends SheetActionBase<IInsertColumnActionData, IRemoveColumnAction> {

    constructor(actionData: IInsertColumnActionData, commandModel: CommandModel, observers: ActionObservers) {
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
        InsertColumnApply(this._commandModel, this._doActionData);
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
        RemoveColumnApply(this._commandModel, this._oldActionData);
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

import { SetColumnHideApply, SetColumnShowApply } from '../Apply';
import { SheetActionBase } from '../../Command/SheetActionBase';
import { ActionObservers, ActionType } from '../../Command/ActionObservers';
import { CommandModel } from '../../Command';

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
        SetColumnShowApply(this._commandModel, this._doActionData);
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
        SetColumnHideApply(this._commandModel, this._oldActionData);
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

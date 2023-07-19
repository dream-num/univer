import { SetHiddenGridlinesApply } from '../Apply';
import { SheetActionBase, ISheetActionData } from '../../Command/SheetActionBase';
import { ActionObservers, ActionType } from '../../Command/ActionObservers';
import { CommandModel } from '../../Command';

/**
 * @internal
 */
export interface ISetHiddenGridlinesActionData extends ISheetActionData {
    hideGridlines: boolean;
}

/**
 * @internal
 */
export class SetHiddenGridlinesAction extends SheetActionBase<ISetHiddenGridlinesActionData> {
    static NAME = 'SetHiddenGridlinesAction';

    constructor(actionData: ISetHiddenGridlinesActionData, commandModel: CommandModel, observers: ActionObservers) {
        super(actionData, commandModel, observers);
        this._doActionData = {
            ...actionData,
        };

        this._oldActionData = {
            ...actionData,
            hideGridlines: this.do(),
        };
        this.validate();
    }

    do(): boolean {
        const result = SetHiddenGridlinesApply(this._commandModel, this._doActionData);
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
        SetHiddenGridlinesApply(this._commandModel, this._oldActionData);
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

import { SetTabColor } from '../Apply';
import { Nullable } from '../../Shared/Types';
import { SheetActionBase } from '../../Command/SheetActionBase';
import { ActionObservers, ActionType } from '../../Command/ActionObservers';
import { CommandModel } from '../../Command';

/**
 * @internal
 */
export class SetTabColorAction extends SheetActionBase<ISetTabColorActionData, ISetTabColorActionData, Nullable<string>> {

    constructor(actionData: ISetTabColorActionData, commandModel: CommandModel, observers: ActionObservers) {
        super(actionData, commandModel, observers);

        this._doActionData = {
            ...actionData,
        };
        this._oldActionData = {
            ...actionData,
            color: this.do(),
        };

        this.validate();
    }

    do(): Nullable<string> {
        const worksheet = this.getWorkSheet();

        const result = SetTabColor(worksheet, this._doActionData.color);

        this._observers.notifyObservers({
            type: ActionType.REDO,
            data: this._doActionData,
            action: this,
        });

        return result;
    }

    redo(): void {
        // update pre data
        const { sheetId } = this._doActionData;
        this._oldActionData = {
            sheetId,
            // actionName: ACTION_NAMES.SET_TAB_COLOR_ACTION,
            actionName: SetTabColorAction.NAME,
            color: this.do(),
        };
    }

    undo(): void {
        const { color, sheetId } = this._oldActionData;
        const worksheet = this.getWorkSheet();

        // update current data
        this._doActionData = {
            // actionName: ACTION_NAMES.SET_TAB_COLOR_ACTION,
            actionName: SetTabColorAction.NAME,
            sheetId,
            color: SetTabColor(worksheet, color),
        };

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

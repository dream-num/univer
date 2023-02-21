import { SetColumnHideApply, SetColumnShowApply } from '../Apply';
import { SheetActionBase, ISheetActionData } from '../../Command/SheetActionBase';
import { ActionObservers, ActionType } from '../../Command/ActionObservers';
import { ISetColumnShowActionData } from './SetColumnShowAction';
import { CommandManager, CommandUnit } from '../../Command';

/**
 * @internal
 */
export interface ISetColumnHideActionData extends ISheetActionData {
    columnIndex: number;
    columnCount: number;
}

/**
 * Set column hiding based on specified column index and number of columns
 *
 * @internal
 */
export class SetColumnHideAction extends SheetActionBase<
    ISetColumnHideActionData,
    ISetColumnShowActionData
> {
    static NAME = 'SetColumnHideAction';

    constructor(
        actionData: ISetColumnHideActionData,
        commandUnit: CommandUnit,
        observers: ActionObservers
    ) {
        super(actionData, commandUnit, observers);
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
        SetColumnHideApply(this._commandUnit, this._doActionData);
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
        SetColumnShowApply(this._commandUnit, this._oldActionData);
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

CommandManager.register(SetColumnHideAction.NAME, SetColumnHideAction);

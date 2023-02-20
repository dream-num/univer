import { InsertColumnApply, RemoveColumnApply } from '../Apply';
import { SheetActionBase, ISheetActionData } from '../../Command/SheetActionBase';
import { ActionObservers, ActionType } from '../../Command/ActionObservers';
import { IRemoveColumnAction } from './removeColumnAction';
import { CommandUnit } from '../../Command';

/**
 * @internal
 */
export interface IInsertColumnActionData extends ISheetActionData {
    columnIndex: number;
    columnCount: number;
}

/**
 * Insert the column configuration of the specified column index
 *
 * @internal
 */
export class InsertColumnAction extends SheetActionBase<
    IInsertColumnActionData,
    IRemoveColumnAction
> {
    static NAME = 'InsertColumnAction';

    constructor(
        actionData: IInsertColumnActionData,
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
        InsertColumnApply(this._commandUnit, this._doActionData);
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
        RemoveColumnApply(this._commandUnit, this._oldActionData);
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

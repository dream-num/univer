import { InsertColumnApply, RemoveColumnApply } from '../Apply';
import { CommandUnit } from '../../Command';
import { SheetActionBase, ISheetActionData } from '../../Command/SheetActionBase';
import { ActionObservers, ActionType } from '../../Command/ActionObservers';
import { IInsertColumnActionData } from './InsertColumnAction';

/**
 * @internal
 */
export interface IRemoveColumnAction extends ISheetActionData {
    columnCount: number;
    columnIndex: number;
}

/**
 * Remove the column configuration of the specified column index and column count
 *
 * @internal
 */
export class RemoveColumnAction extends SheetActionBase<
    IRemoveColumnAction,
    IInsertColumnActionData
> {
    static NAME = 'RemoveColumnAction';

    constructor(
        actionData: IRemoveColumnAction,
        commandUnit: CommandUnit,
        observers: ActionObservers
    ) {
        super(actionData, commandUnit, observers);
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
        const result = RemoveColumnApply(this._commandUnit, this._doActionData);
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
        InsertColumnApply(this._commandUnit, this._oldActionData);
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

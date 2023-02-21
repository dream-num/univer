import { InsertRowApply, RemoveRowApply } from '../Apply';
import { SheetActionBase, ISheetActionData } from '../../Command/SheetActionBase';
import { CommandManager, CommandUnit } from '../../Command';
import { ActionObservers, ActionType } from '../../Command/ActionObservers';
import { IInsertRowActionData } from './InsertRowAction';

/**
 * @internal
 */
export interface IRemoveRowActionData extends ISheetActionData {
    rowIndex: number;
    rowCount: number;
}

/**
 * Remove the row configuration of the specified row index and row count
 *
 * @internal
 */
export class RemoveRowAction extends SheetActionBase<
    IRemoveRowActionData,
    IInsertRowActionData
> {
    static NAME = 'RemoveRowAction';

    constructor(
        actionData: IRemoveRowActionData,
        commandUnit: CommandUnit,
        observers: ActionObservers
    ) {
        super(actionData, commandUnit, observers);
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
        const result = RemoveRowApply(this._commandUnit, this._doActionData);
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
        InsertRowApply(this._commandUnit, this._oldActionData);
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

CommandManager.register(RemoveRowAction.NAME, RemoveRowAction);

import { SheetActionBase, ISheetActionData, ActionObservers, ActionType, CommandUnit, CommandManager } from '../../Command';
import { InsertRowApply, RemoveRowApply } from '../Apply';
import { IRemoveRowActionData } from './RemoveRowAction';

/**
 * @internal
 */
export interface IInsertRowActionData extends ISheetActionData {
    rowIndex: number;
    rowCount: number;
}

/**
 * Insert the row configuration of the specified row index
 *
 * @internal
 */
export class InsertRowAction extends SheetActionBase<IInsertRowActionData, IRemoveRowActionData> {
    static NAME = 'InsertRowAction';

    constructor(actionData: IInsertRowActionData, commandUnit: CommandUnit, observers: ActionObservers) {
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
        InsertRowApply(this._commandUnit, this._doActionData);
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
        RemoveRowApply(this._commandUnit, this._oldActionData);
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

CommandManager.register(InsertRowAction.NAME, InsertRowAction);
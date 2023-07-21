import { InsertDataColumnApply, RemoveColumnDataApply } from '../Apply';
import { ObjectArray } from '../../Shared';
import { ActionObservers, ActionType, CommandModel } from '../../Command';
import { SheetActionBase } from '../../Command/SheetActionBase';
import { IInsertColumnDataActionData, IRemoveColumnDataAction } from '../../Types/Interfaces/IActionModel';

/**
 * Insert the column data of the specified column index
 *
 * @internal
 */
export class InsertColumnDataAction extends SheetActionBase<IInsertColumnDataActionData, IRemoveColumnDataAction> {
    constructor(actionData: IInsertColumnDataActionData, commandModel: CommandModel, observers: ActionObservers) {
        super(actionData, commandModel, observers);
        this._doActionData = {
            ...actionData,
        };
        this.do();
        this._oldActionData = {
            ...actionData,
            columnCount: ObjectArray.getMaxLength(actionData.columnData[0]),
        };
        this.validate();
    }

    do(): void {
        InsertDataColumnApply(this.getSpreadsheetModel(), this._doActionData);
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
        RemoveColumnDataApply(this.getSpreadsheetModel(), this._oldActionData);
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

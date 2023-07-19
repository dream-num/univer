import { InsertDataColumnApply, RemoveColumnDataApply } from '../Apply';
import { ICellData } from '../../Types/Interfaces';
import { ObjectMatrixPrimitiveType } from '../../Shared/ObjectMatrix';
import { SheetActionBase } from '../../Command/SheetActionBase';
<<<<<<< HEAD
import { ActionObservers, ActionType, CommandModel } from '../../Command';
import { IRemoveColumnDataAction, IInsertColumnDataActionData } from '../../Types/Interfaces/IActionModel';
=======
import { ActionObservers, ActionType } from '../../Command/ActionObservers';
import { IInsertColumnDataActionData } from './InsertColumnDataAction';
import { CommandModel } from '../../Command';
>>>>>>> 978105c8 (fix(core): action names, action interfaces)

/**
 * Remove the column data of the specified column index and column count
 *
 * @internal
 */
export class RemoveColumnDataAction extends SheetActionBase<IRemoveColumnDataAction, IInsertColumnDataActionData> {
<<<<<<< HEAD
=======

>>>>>>> 978105c8 (fix(core): action names, action interfaces)
    constructor(actionData: IRemoveColumnDataAction, commandModel: CommandModel, observers: ActionObservers) {
        super(actionData, commandModel, observers);
        this._doActionData = {
            ...actionData,
        };
        this._oldActionData = {
            ...actionData,
            columnData: this.do(),
        };
        this.validate();
    }

    do(): ObjectMatrixPrimitiveType<ICellData> {
        const result = RemoveColumnDataApply(this.getSpreadsheetModel(), this._doActionData);
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
        InsertDataColumnApply(this.getSpreadsheetModel(), this._oldActionData);
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

import { InsertDataRowApply, RemoveRowDataApply } from '../Apply';
import { ObjectArray } from '../../Shared';
<<<<<<< HEAD
import { ActionObservers, ActionType, CommandModel } from '../../Command';
import { SheetActionBase } from '../../Command/SheetActionBase';
import { IInsertRowDataActionData, IRemoveRowDataActionData } from '../../Types/Interfaces/IActionModel';
=======
import { CommandModel } from '../../Command';
import { SheetActionBase } from '../../Command/SheetActionBase';
import { ActionObservers, ActionType } from '../../Command/ActionObservers';
import { IRemoveRowDataActionData } from './RemoveRowDataAction';
>>>>>>> 978105c8 (fix(core): action names, action interfaces)

/**
 * Insert the row data of the specified row index
 *
 * @internal
 */
export class InsertRowDataAction extends SheetActionBase<IInsertRowDataActionData, IRemoveRowDataActionData> {
<<<<<<< HEAD
=======

>>>>>>> 978105c8 (fix(core): action names, action interfaces)
    constructor(actionData: IInsertRowDataActionData, commandModel: CommandModel, observers: ActionObservers) {
        super(actionData, commandModel, observers);
        this._doActionData = {
            ...actionData,
        };
        this.do();
        this._oldActionData = {
            ...actionData,
            rowCount: ObjectArray.getMaxLength(actionData.rowData[0]),
        };
        this.validate();
    }

    do(): void {
        InsertDataRowApply(this.getSpreadsheetModel(), this._doActionData);
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
        RemoveRowDataApply(this.getSpreadsheetModel(), this._oldActionData);
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

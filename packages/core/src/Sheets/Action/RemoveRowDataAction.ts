import { InsertDataRowApply, RemoveRowDataApply } from '../Apply';
import { ICellData } from '../../Types/Interfaces';
import { ObjectMatrixPrimitiveType } from '../../Shared/ObjectMatrix';
import { SheetActionBase } from '../../Command/SheetActionBase';
import { ActionObservers, ActionType, CommandModel } from '../../Command';
import { IRemoveRowDataActionData, IInsertRowDataActionData } from '../../Types/Interfaces/IActionModel';

/**
 * Remove the row data of the specified row index and row count
 *
 * @internal
 */
export class RemoveRowDataAction extends SheetActionBase<IRemoveRowDataActionData, IInsertRowDataActionData> {
    constructor(actionData: IRemoveRowDataActionData, commandModel: CommandModel, observers: ActionObservers) {
        super(actionData, commandModel, observers);
        this._doActionData = {
            ...actionData,
        };
        this._oldActionData = {
            ...actionData,
            rowData: this.do(),
        };
        this.validate();
    }

    do(): ObjectMatrixPrimitiveType<ICellData> {
        const result = RemoveRowDataApply(this._commandModel, this._doActionData);
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
        InsertDataRowApply(this._commandModel, this._oldActionData);
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

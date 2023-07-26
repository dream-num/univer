import { ActionObservers, ActionType } from '../../Command/ActionBase';
import { InsertDataColumnApply } from '../Apply/InsertDataColumn';
import { RemoveColumnDataApply } from '../Apply/RemoveColumnData';
import { ICellData } from '../../Types/Interfaces';
import { ObjectMatrixPrimitiveType } from '../../Shared/ObjectMatrix';
import { SheetActionBase } from '../../Command/SheetActionBase';
import { IRemoveColumnDataAction, IInsertColumnDataActionData } from '../../Types/Interfaces/ISheetActionInterfaces';
import { CommandModel } from '../../Command/CommandModel';

/**
 * Remove the column data of the specified column index and column count
 *
 * @internal
 */
export class RemoveColumnDataAction extends SheetActionBase<IRemoveColumnDataAction, IInsertColumnDataActionData> {
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

import { InsertDataRowApply } from '../Apply/InsertDataRow';
import { RemoveRowDataApply } from '../Apply/RemoveRowData';
import { ObjectArray } from '../../Shared/ObjectArray';
import { SheetActionBase } from '../../Command/SheetActionBase';
import { IInsertRowDataActionData, IRemoveRowDataActionData } from '../../Types/Interfaces/ISheetActionInterfaces';
import { CommandModel } from '../../Command/CommandModel';
import { ActionObservers, ActionType } from '../../Command/ActionBase';

/**
 * Insert the row data of the specified row index
 *
 * @internal
 */
export class InsertRowDataAction extends SheetActionBase<IInsertRowDataActionData, IRemoveRowDataActionData> {
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

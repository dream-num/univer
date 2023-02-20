import { InsertDataRowApply, RemoveRowDataApply } from '../Apply';
import { ICellData } from '../../Interfaces';
import { ObjectMatrixPrimitiveType } from '../../Shared/ObjectMatrix';
import { ObjectArray } from '../../Shared';
import { CommandUnit } from '../../Command';
import { SheetActionBase, ISheetActionData } from '../../Command/SheetActionBase';
import { ActionObservers, ActionType } from '../../Command/ActionObservers';
import { IRemoveRowDataActionData } from './RemoveRowDataAction';

/**
 * @internal
 */
export interface IInsertRowDataActionData extends ISheetActionData {
    rowIndex: number;
    rowData: ObjectMatrixPrimitiveType<ICellData>;
}

/**
 * Insert the row data of the specified row index
 *
 * @internal
 */
export class InsertRowDataAction extends SheetActionBase<
    IInsertRowDataActionData,
    IRemoveRowDataActionData
> {
    static NAME = 'InsertRowDataAction';

    constructor(
        actionData: IInsertRowDataActionData,
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
            rowCount: ObjectArray.getMaxLength(actionData.rowData[0]),
        };
        this.validate();
    }

    do(): void {
        InsertDataRowApply(this._commandUnit, this._doActionData);
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
        RemoveRowDataApply(this._commandUnit, this._oldActionData);
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

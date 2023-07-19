import { InsertDataColumnApply, RemoveColumnDataApply } from '../Apply';
import { ObjectMatrixPrimitiveType } from '../../Shared/ObjectMatrix';
import { ObjectArray } from '../../Shared';
import { CommandModel } from '../../Command';
import { SheetActionBase, ISheetActionData } from '../../Command/SheetActionBase';
import { ICellData } from '../../Types/Interfaces';
import { ActionObservers, ActionType } from '../../Command/ActionObservers';
import { IRemoveColumnDataAction } from './RemoveColumnDataAction';

/**
 * @internal
 */
export interface IInsertColumnDataActionData extends ISheetActionData {
    columnIndex: number;
    columnData: ObjectMatrixPrimitiveType<ICellData>; // TODO Does it need to be merged with IKeyValue
}

/**
 * Insert the column data of the specified column index
 *
 * @internal
 */
export class InsertColumnDataAction extends SheetActionBase<IInsertColumnDataActionData, IRemoveColumnDataAction> {
    static NAME = 'InsertColumnDataAction';

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
        InsertDataColumnApply(this._commandModel, this._doActionData);
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
        RemoveColumnDataApply(this._commandModel, this._oldActionData);
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

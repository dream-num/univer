import { InsertDataColumn, RemoveColumnData } from '../Apply';
import { ObjectMatrixPrimitiveType } from '../../Shared/ObjectMatrix';
import { SheetActionBase, ISheetActionData } from '../../Command/SheetActionBase';
import { ICellData } from '../../Interfaces';
import { ActionObservers, ActionType } from '../../Command/ActionObservers';
import { IRemoveColumnDataAction } from './RemoveColumnDataAction';
import { ObjectArray } from '../../Shared';
import { CommandUnit } from '../../Command';

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
export class InsertColumnDataAction extends SheetActionBase<
    IInsertColumnDataActionData,
    IRemoveColumnDataAction
> {
    constructor(
        actionData: IInsertColumnDataActionData,
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
            columnCount: ObjectArray.getMaxLength(actionData.columnData[0]),
        };
        this.validate();
    }

    do(): void {
        const worksheet = this.getWorkSheet();

        InsertDataColumn(
            this._doActionData.columnIndex,
            this._doActionData.columnData,
            worksheet.getCellMatrix().toJSON()
        );

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
        const worksheet = this.getWorkSheet();

        RemoveColumnData(
            this._oldActionData.columnIndex,
            this._oldActionData.columnCount,
            worksheet.getCellMatrix().toJSON()
        );

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

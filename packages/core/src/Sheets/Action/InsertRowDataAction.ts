import { InsertDataRow, RemoveRowData } from '../Apply';
import { ICellData } from '../../Interfaces';
import { ObjectMatrixPrimitiveType } from '../../Shared/ObjectMatrix';
import { SheetActionBase, ISheetActionData } from '../../Command/SheetActionBase';
import { ActionObservers, ActionType } from '../../Command/ActionObservers';
import { IRemoveRowDataActionData } from './RemoveRowDataAction';
import { ObjectArray } from '../../Shared';
import { CommandUnit } from '../../Command';

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
        const worksheet = this.getWorkSheet();

        InsertDataRow(
            this._doActionData.rowIndex,
            this._doActionData.rowData,
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

        RemoveRowData(
            this._oldActionData.rowIndex,
            this._oldActionData.rowCount,
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

import { InsertDataRow, RemoveRowData } from '../Apply';
import { WorkBook } from '../Domain';
import { ICellData } from '../../Interfaces';
import { ObjectMatrixPrimitiveType } from '../../Shared/ObjectMatrix';
import { ActionBase, IActionData } from '../../Command/ActionBase';
import { ActionObservers, ActionType } from '../../Command/ActionObservers';
import { IInsertRowDataActionData } from './InsertRowDataAction';

/**
 * @internal
 */
export interface IRemoveRowDataActionData extends IActionData {
    rowIndex: number;
    rowCount: number;
}

/**
 * Remove the row data of the specified row index and row count
 *
 * @internal
 */
export class RemoveRowDataAction extends ActionBase<
    IRemoveRowDataActionData,
    IInsertRowDataActionData
> {
    constructor(
        actionData: IRemoveRowDataActionData,
        workbook: WorkBook,
        observers: ActionObservers
    ) {
        super(actionData, workbook, observers);
        this._doActionData = {
            ...actionData,
            convertor: [],
        };
        this._oldActionData = {
            ...actionData,
            rowData: this.do(),
            convertor: [],
        };
        this.validate();
    }

    do(): ObjectMatrixPrimitiveType<ICellData> {
        const worksheet = this.getWorkSheet();

        const result = RemoveRowData(
            this._doActionData.rowIndex,
            this._doActionData.rowCount,
            worksheet.getCellMatrix().toJSON()
        );

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
        const worksheet = this.getWorkSheet();

        InsertDataRow(
            this._oldActionData.rowIndex,
            this._oldActionData.rowData,
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

import { InsertDataRow, RemoveRowData } from '../Apply';
import { ICellData } from '../../Interfaces';
import { ObjectMatrixPrimitiveType } from '../../Shared/ObjectMatrix';
import { SheetActionBase, ISheetActionData } from '../../Command/SheetActionBase';
import { Workbook } from '../Domain';
import { ActionObservers, ActionType } from '../../Command/ActionObservers';
import { IRemoveRowDataActionData } from './RemoveRowDataAction';
import { ObjectArray } from '../../Shared';

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
    constructor(
        actionData: IInsertRowDataActionData,
        workbook: Workbook,
        observers: ActionObservers
    ) {
        super(actionData, workbook, observers);
        this._doActionData = {
            ...actionData,
            convertor: [],
        };
        this.do();
        this._oldActionData = {
            ...actionData,
            rowCount: ObjectArray.getMaxLength(actionData.rowData[0]),
            convertor: [],
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

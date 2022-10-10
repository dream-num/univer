import { InsertDataColumn, RemoveColumnData } from '../Apply';
import { CONVERTOR_OPERATION } from '../../Const';
import { WorkSheetConvertor } from '../../Convertor';
import { Workbook1 } from '../Domain';
import { ICellData } from '../../Interfaces';
import { ObjectMatrixPrimitiveType } from '../../Shared/ObjectMatrix';
import { ActionBase, IActionData } from '../../Command/ActionBase';
import { ActionObservers, ActionType } from '../../Command/ActionObservers';
import { IInsertColumnDataActionData } from './InsertColumnDataAction';

/**
 * @internal
 */
export interface IRemoveColumnDataAction extends IActionData {
    columnIndex: number;
    columnCount: number;
}

/**
 * Remove the column data of the specified column index and column count
 *
 * @internal
 */
export class RemoveColumnDataAction extends ActionBase<
    IRemoveColumnDataAction,
    IInsertColumnDataActionData
> {
    constructor(
        actionData: IRemoveColumnDataAction,
        workbook: Workbook1,
        observers: ActionObservers
    ) {
        super(actionData, workbook, observers);
        this._doActionData = {
            ...actionData,
            convertor: [new WorkSheetConvertor(CONVERTOR_OPERATION.REMOVE)],
        };
        this._oldActionData = {
            ...actionData,
            columnData: this.do(),
            convertor: [new WorkSheetConvertor(CONVERTOR_OPERATION.INSERT)],
        };
        this.validate();
    }

    do(): ObjectMatrixPrimitiveType<ICellData> {
        const worksheet = this.getWorkSheet();

        const result = RemoveColumnData(
            this._doActionData.columnIndex,
            this._doActionData.columnCount,
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

        InsertDataColumn(
            this._oldActionData.columnIndex,
            this._oldActionData.columnData,
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

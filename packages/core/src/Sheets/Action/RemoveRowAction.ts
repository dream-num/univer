import { InsertRow, RemoveRow } from '../Apply';
import { CONVERTOR_OPERATION } from '../../Const';
import { WorkSheetConvertor } from '../../Convertor';
import { Workbook1 } from '../Domain';
import { ActionBase, IActionData } from '../../Command/ActionBase';
import { ActionObservers, ActionType } from '../../Command/ActionObservers';
import { IInsertRowActionData } from './InsertRowAction';

/**
 * @internal
 */
export interface IRemoveRowActionData extends IActionData {
    rowIndex: number;
    rowCount: number;
}

/**
 * Remove the row configuration of the specified row index and row count
 *
 * @internal
 */
export class RemoveRowAction extends ActionBase<
    IRemoveRowActionData,
    IInsertRowActionData
> {
    constructor(
        actionData: IRemoveRowActionData,
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
            rowCount: this.do(),
            convertor: [new WorkSheetConvertor(CONVERTOR_OPERATION.REMOVE)],
        };
        this.validate();
    }

    do(): number {
        const worksheet = this.getWorkSheet();
        const rowManager = worksheet.getRowManager()!;

        const result = RemoveRow(
            this._doActionData.rowIndex,
            this._doActionData.rowCount,
            rowManager.getRowData().toJSON()
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
        const rowManager = worksheet.getRowManager()!;

        InsertRow(
            this._oldActionData.rowIndex,
            this._oldActionData.rowCount,
            rowManager.getRowData().toJSON()
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

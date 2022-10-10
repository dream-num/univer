import { ActionBase, IActionData } from '../../Command/ActionBase';
import { InsertRow, RemoveRow } from '../Apply';
import { Workbook1 } from '../Domain';
import { ActionObservers, ActionType } from '../../Command/ActionObservers';
import { IRemoveRowActionData } from './RemoveRowAction';

/**
 * @internal
 */
export interface IInsertRowActionData extends IActionData {
    rowIndex: number;
    rowCount: number;
}

/**
 * Insert the row configuration of the specified row index
 *
 * @internal
 */
export class InsertRowAction extends ActionBase<
    IInsertRowActionData,
    IRemoveRowActionData
> {
    constructor(
        actionData: IInsertRowActionData,
        workbook: Workbook1,
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
            convertor: [],
        };
        this.validate();
    }

    do(): void {
        const worksheet = this.getWorkSheet();
        const rowManager = worksheet.getRowManager()!;

        InsertRow(
            this._doActionData.rowIndex,
            this._doActionData.rowCount,
            rowManager.getRowData().toJSON()
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
        const rowManager = worksheet.getRowManager()!;

        this._observers.notifyObservers({
            type: ActionType.UNDO,
            data: this._oldActionData,
            action: this,
        });

        RemoveRow(
            this._oldActionData.rowIndex,
            this._oldActionData.rowCount,
            rowManager.getRowData().toJSON()
        );
    }

    validate(): boolean {
        return false;
    }
}

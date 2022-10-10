import { InsertColumn, RemoveColumn } from '../Apply';
import { Workbook1 } from '../Domain';
import { ActionBase, IActionData } from '../../Command/ActionBase';
import { ActionObservers, ActionType } from '../../Command/ActionObservers';
import { IInsertColumnActionData } from './InsertColumnAction';

/**
 * @internal
 */
export interface IRemoveColumnAction extends IActionData {
    columnCount: number;
    columnIndex: number;
}

/**
 * Remove the column configuration of the specified column index and column count
 *
 * @internal
 */
export class RemoveColumnAction extends ActionBase<
    IRemoveColumnAction,
    IInsertColumnActionData
> {
    constructor(
        actionData: IRemoveColumnAction,
        workbook: Workbook1,
        observers: ActionObservers
    ) {
        super(actionData, workbook, observers);
        this._doActionData = {
            ...actionData,
            convertor: [],
        };
        this._oldActionData = {
            ...actionData,
            columnCount: this.do(),
            convertor: [],
        };
        this.validate();
    }

    do(): number {
        const worksheet = this.getWorkSheet();
        const columnManager = worksheet.getColumnManager();

        const result = RemoveColumn(
            this._doActionData.columnIndex,
            this._doActionData.columnCount,
            columnManager.getColumnData().toJSON()
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
        const columnManager = worksheet.getColumnManager();

        InsertColumn(
            this._oldActionData.columnIndex,
            this._oldActionData.columnCount,
            columnManager.getColumnData().toJSON()
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

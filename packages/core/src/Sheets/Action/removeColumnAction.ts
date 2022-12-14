import { InsertColumn, RemoveColumn } from '../Apply';
import { SheetActionBase, ISheetActionData } from '../../Command/SheetActionBase';
import { ActionObservers, ActionType } from '../../Command/ActionObservers';
import { IInsertColumnActionData } from './InsertColumnAction';
import { CommandUnit } from '../../Command';

/**
 * @internal
 */
export interface IRemoveColumnAction extends ISheetActionData {
    columnCount: number;
    columnIndex: number;
}

/**
 * Remove the column configuration of the specified column index and column count
 *
 * @internal
 */
export class RemoveColumnAction extends SheetActionBase<
    IRemoveColumnAction,
    IInsertColumnActionData
> {
    constructor(
        actionData: IRemoveColumnAction,
        commandUnit: CommandUnit,
        observers: ActionObservers
    ) {
        super(actionData, commandUnit, observers);
        this._doActionData = {
            ...actionData,
        };
        this._oldActionData = {
            ...actionData,
            columnCount: this.do(),
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

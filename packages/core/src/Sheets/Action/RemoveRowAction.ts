import { InsertRow, RemoveRow } from '../Apply';
import { SheetActionBase, ISheetActionData } from '../../Command/SheetActionBase';
import { ActionObservers, ActionType } from '../../Command/ActionObservers';
import { IInsertRowActionData } from './InsertRowAction';
import { CommandUnit } from '../../Command';

/**
 * @internal
 */
export interface IRemoveRowActionData extends ISheetActionData {
    rowIndex: number;
    rowCount: number;
}

/**
 * Remove the row configuration of the specified row index and row count
 *
 * @internal
 */
export class RemoveRowAction extends SheetActionBase<
    IRemoveRowActionData,
    IInsertRowActionData
> {
    static NAME = 'RemoveRowAction';

    constructor(
        actionData: IRemoveRowActionData,
        commandUnit: CommandUnit,
        observers: ActionObservers
    ) {
        super(actionData, commandUnit, observers);
        this._doActionData = {
            ...actionData,
        };
        this._oldActionData = {
            ...actionData,
            rowCount: this.do(),
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

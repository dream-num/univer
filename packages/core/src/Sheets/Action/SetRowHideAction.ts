import { SetHideRow, SetShowRow } from '../Apply';
import { SheetActionBase, ISheetActionData } from '../../Command/SheetActionBase';
import { ActionObservers, ActionType } from '../../Command/ActionObservers';
import { Workbook } from '../Domain';
import { ISetRowShowActionData } from './SetRowShowAction';

/**
 * @internal
 */
export interface ISetRowHideActionData extends ISheetActionData {
    rowIndex: number;
    rowCount: number;
}

/**
 * Set row hiding based on specified row index and number of rows
 *
 * @internal
 */
export class SetRowHideAction extends SheetActionBase<
    ISetRowHideActionData,
    ISetRowShowActionData
> {
    constructor(
        actionData: ISetRowHideActionData,
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
            convertor: [],
        };
        this.validate();
    }

    do(): void {
        const worksheet = this.getWorkSheet();

        SetHideRow(
            this._doActionData.rowIndex,
            this._doActionData.rowCount,
            worksheet.getRowManager()
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

        SetShowRow(
            this._oldActionData.rowIndex,
            this._doActionData.rowCount,
            worksheet.getRowManager()
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

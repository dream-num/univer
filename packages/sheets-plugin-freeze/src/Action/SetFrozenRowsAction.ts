import { ISheetActionData, SheetActionBase, Workbook, ActionObservers, ActionType } from '@univerjs/core';
import { SetFrozenRows } from '../Apply/SetFrozenRows';
import { ACTION_NAMES } from '../Basics/Enum/ACTION_NAMES';

export interface ISetFrozenRowsActionData extends ISheetActionData {
    numRows: number;
}

export class SetFrozenRowsAction extends SheetActionBase<ISetFrozenRowsActionData> {
    constructor(actionData: ISetFrozenRowsActionData, workbook: Workbook, observers: ActionObservers) {
        super(actionData, workbook, observers);
        this._doActionData = {
            ...actionData,
        };

        this._oldActionData = {
            actionName: ACTION_NAMES.SET_FROZEN_ROWS_ACTION,
            sheetId: actionData.sheetId,
            numRows: this.do(),
        };
        this.validate();
    }

    do(): number {
        const worksheet = this.getWorkSheet();
        const result = SetFrozenRows(worksheet, this._doActionData.numRows);
        this._observers.notifyObservers({
            type: ActionType.REDO,
            data: this._doActionData,
            action: this,
        });
        return result;
    }

    redo(): void {
        // update pre data
        const { sheetId } = this._doActionData;
        this._oldActionData = {
            sheetId,
            actionName: ACTION_NAMES.SET_FROZEN_ROWS_ACTION,
            numRows: this.do(),
        };
    }

    undo(): void {
        const { numRows, sheetId } = this._oldActionData;
        const worksheet = this.getWorkSheet();
        // update current data
        this._doActionData = {
            actionName: ACTION_NAMES.SET_FROZEN_ROWS_ACTION,
            sheetId,
            numRows: SetFrozenRows(worksheet, numRows),
        };
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

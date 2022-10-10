import { ActionBase, ActionObservers, ActionType, IActionData } from 'src/Command';
import { WorkSheetConvertor } from 'src/Convertor';
import { Workbook } from 'src/Sheets/Domain';
import { SetFrozenRows } from 'src/Sheets/Apply';
import { ACTION_NAMES, CONVERTOR_OPERATION } from 'src/Const';

export interface ISetFrozenRowsActionData extends IActionData {
    numRows: number;
}

export class SetFrozenRowsAction extends ActionBase<ISetFrozenRowsActionData> {
    constructor(
        actionData: ISetFrozenRowsActionData,
        workbook: Workbook,
        observers: ActionObservers
    ) {
        super(actionData, workbook, observers);
        this._doActionData = {
            ...actionData,
            convertor: [new WorkSheetConvertor(CONVERTOR_OPERATION.SET)],
        };

        this._oldActionData = {
            actionName: ACTION_NAMES.SET_FROZEN_ROWS_ACTION,
            sheetId: actionData.sheetId,
            numRows: this.do(),
            convertor: [new WorkSheetConvertor(CONVERTOR_OPERATION.SET)],
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

import { IActionData, ActionBase, WorkBook, ActionObservers, WorkSheetConvertor, CONVERTOR_OPERATION, ActionType } from '@univer/core';
import { SetFrozenColumns } from '../Apply/SetFrozenColumns';
import { ACTION_NAMES } from '../Basic/Enum/ACTION_NAMES';

export interface ISetFrozenColumnsActionData extends IActionData {
    numColumns: number;
}

export class SetFrozenColumnsAction extends ActionBase<ISetFrozenColumnsActionData> {
    constructor(actionData: ISetFrozenColumnsActionData, workbook: WorkBook, observers: ActionObservers) {
        super(actionData, workbook, observers);
        this._doActionData = {
            ...actionData,
            convertor: [new WorkSheetConvertor(CONVERTOR_OPERATION.SET)],
        };

        this._oldActionData = {
            actionName: ACTION_NAMES.SET_FROZEN_COLUMNS_ACTION,
            sheetId: actionData.sheetId,
            numColumns: this.do(),
            convertor: [new WorkSheetConvertor(CONVERTOR_OPERATION.SET)],
        };
        this.validate();
    }

    do(): number {
        const worksheet = this.getWorkSheet();
        this._observers.notifyObservers({
            type: ActionType.REDO,
            data: this._doActionData,
            action: this,
        });
        return SetFrozenColumns(worksheet, this._doActionData.numColumns);
    }

    redo(): void {
        // update pre data
        const { sheetId } = this._doActionData;
        this._oldActionData = {
            sheetId,
            actionName: ACTION_NAMES.SET_FROZEN_COLUMNS_ACTION,
            numColumns: this.do(),
        };
    }

    undo(): void {
        const { numColumns, sheetId } = this._oldActionData;
        const worksheet = this.getWorkSheet();
        // update current data
        this._doActionData = {
            actionName: ACTION_NAMES.SET_FROZEN_COLUMNS_ACTION,
            sheetId,
            numColumns: SetFrozenColumns(worksheet, numColumns),
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

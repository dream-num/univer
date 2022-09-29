import { ActionBase, ActionObservers, IActionData } from 'src/Command';
import { WorkBook } from 'src/Sheets/Domain';
import { WorkSheetConvertor } from 'src/Convertor';
import { ACTION_NAMES, CONVERTOR_OPERATION } from 'src/Const';
import { SetFrozenColumnsService } from '../Service/SetFrozenColumnsService';

export interface ISetFrozenColumnsActionData extends IActionData {
    numColumns: number;
}

export class SetFrozenColumnsAction extends ActionBase<ISetFrozenColumnsActionData> {
    constructor(
        actionData: ISetFrozenColumnsActionData,
        workbook: WorkBook,
        observers: ActionObservers
    ) {
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
        this._observers.onActionDoObserver.notifyObservers(this);
        return SetFrozenColumnsService(worksheet, this._doActionData.numColumns);
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
        this._observers.onActionUndoObserver.notifyObservers(this);
        // update current data
        this._doActionData = {
            actionName: ACTION_NAMES.SET_FROZEN_COLUMNS_ACTION,
            sheetId,
            numColumns: SetFrozenColumnsService(worksheet, numColumns),
        };
    }

    validate(): boolean {
        return false;
    }
}

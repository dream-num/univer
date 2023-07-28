import { BooleanNumber } from '../../Types/Enum';
import { SheetActionBase } from '../../Command/SheetActionBase';
import { ISetWorkSheetHideActionData } from '../../Types/Interfaces/ISheetActionInterfaces';
import { SHEET_ACTION_NAMES } from '../../Types/Const';
import { CommandModel } from '../../Command/CommandModel';
import { ActionObservers, ActionType } from '../../Command/ActionBase';
import { SetWorkSheetHideServiceApply } from '../Apply/HideSheet';

/**
 * @internal
 */
export class SetWorkSheetHideAction extends SheetActionBase<ISetWorkSheetHideActionData, ISetWorkSheetHideActionData, BooleanNumber> {
    constructor(actionData: ISetWorkSheetHideActionData, commandModel: CommandModel, observers: ActionObservers) {
        super(actionData, commandModel, observers);
        this._doActionData = {
            ...actionData,
        };
        this._oldActionData = {
            ...actionData,
            hidden: this.do(),
        };
        this.validate();
    }

    do(): BooleanNumber {
        const result = SetWorkSheetHideServiceApply(this.getSpreadsheetModel(), this._doActionData);
        this._observers.notifyObservers({
            type: ActionType.REDO,
            data: this._doActionData,
            action: this,
        });
        return result;
    }

    redo(): void {
        const { sheetId } = this._doActionData;
        this._oldActionData = {
            sheetId,
            actionName: SHEET_ACTION_NAMES.HIDE_SHEET_ACTION,
            // actionName: SetWorkSheetHideAction.NAME,
            hidden: this.do(),
        };
    }

    undo(): void {
        const { hidden, sheetId } = this._oldActionData;
        this._doActionData = {
            actionName: SHEET_ACTION_NAMES.HIDE_SHEET_ACTION,
            // actionName: SetWorkSheetHideAction.NAME,
            sheetId,
            hidden: SetWorkSheetHideServiceApply(this.getSpreadsheetModel(), this._oldActionData),
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

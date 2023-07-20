import { SetWorkSheetHideService } from '../Apply';
import { BooleanNumber } from '../../Types/Enum';
import { SheetActionBase } from '../../Command/SheetActionBase';
import { ActionObservers, ActionType, CommandModel } from '../../Command';
import { ISetWorkSheetHideActionData } from '../../Types/Interfaces/IActionModel';
import { ACTION_NAMES } from '../../Types/Const';

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
        const worksheet = this.getWorkSheet();

        const result = SetWorkSheetHideService(worksheet, this._doActionData.hidden);

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
            actionName: ACTION_NAMES.HIDE_SHEET_ACTION,
            // actionName: SetWorkSheetHideAction.NAME,
            hidden: this.do(),
        };
    }

    undo(): void {
        const { hidden, sheetId } = this._oldActionData;
        const worksheet = this.getWorkSheet();

        this._doActionData = {
            actionName: ACTION_NAMES.HIDE_SHEET_ACTION,
            // actionName: SetWorkSheetHideAction.NAME,
            sheetId,
            hidden: SetWorkSheetHideService(worksheet, hidden),
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

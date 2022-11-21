import { SetWorkSheetHideService } from '../Apply';
import { ACTION_NAMES } from '../../Const/ACTION_NAMES';
import { BooleanNumber } from '../../Enum';
import { SheetActionBase, ISheetActionData } from '../../Command/SheetActionBase';
import { ActionObservers, ActionType } from '../../Command/ActionObservers';
import { CommandUnit } from '../../Command';

/**
 * @internal
 */
export interface ISetWorkSheetHideActionData extends ISheetActionData {
    hidden: BooleanNumber;
}

/**
 * @internal
 */
export class SetWorkSheetHideAction extends SheetActionBase<
    ISetWorkSheetHideActionData,
    ISetWorkSheetHideActionData,
    BooleanNumber
> {
    constructor(
        actionData: ISetWorkSheetHideActionData,
        commandUnit: CommandUnit,
        observers: ActionObservers
    ) {
        super(actionData, commandUnit, observers);
        this._doActionData = {
            ...actionData,
            convertor: [],
        };
        this._oldActionData = {
            ...actionData,
            hidden: this.do(),
            convertor: [],
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
            hidden: this.do(),
        };
    }

    undo(): void {
        const { hidden, sheetId } = this._oldActionData;
        const worksheet = this.getWorkSheet();

        this._doActionData = {
            actionName: ACTION_NAMES.HIDE_SHEET_ACTION,
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

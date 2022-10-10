import { SetWorkSheetHideService } from '../Apply';
import { ACTION_NAMES } from '../../Const/ACTION_NAMES';
import { BooleanNumber } from '../../Enum';
import { ActionBase, IActionData } from '../../Command/ActionBase';
import { Workbook1 } from '../Domain';
import { ActionObservers, ActionType } from '../../Command/ActionObservers';

/**
 * @internal
 */
export interface ISetWorkSheetHideActionData extends IActionData {
    hidden: BooleanNumber;
}

/**
 * @internal
 */
export class SetWorkSheetHideAction extends ActionBase<
    ISetWorkSheetHideActionData,
    ISetWorkSheetHideActionData,
    BooleanNumber
> {
    constructor(
        actionData: ISetWorkSheetHideActionData,
        workbook: Workbook1,
        observers: ActionObservers
    ) {
        super(actionData, workbook, observers);
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

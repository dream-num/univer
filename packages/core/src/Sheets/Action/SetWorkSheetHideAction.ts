import { SetWorkSheetHideService } from '../Apply';
import { BooleanNumber } from '../../Enum';
import { SheetActionBase, ISheetActionData } from '../../Command/SheetActionBase';
import { ActionObservers, ActionType } from '../../Command/ActionObservers';
import { CommandManager, CommandUnit } from '../../Command';

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
    static NAME = 'SetWorkSheetHideAction';

    constructor(
        actionData: ISetWorkSheetHideActionData,
        commandUnit: CommandUnit,
        observers: ActionObservers
    ) {
        super(actionData, commandUnit, observers);
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
            // actionName: ACTION_NAMES.HIDE_SHEET_ACTION,
            actionName: SetWorkSheetHideAction.NAME,
            hidden: this.do(),
        };
    }

    undo(): void {
        const { hidden, sheetId } = this._oldActionData;
        const worksheet = this.getWorkSheet();

        this._doActionData = {
            actionName: SetWorkSheetHideAction.NAME,
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

CommandManager.register(SetWorkSheetHideAction.NAME, SetWorkSheetHideAction);

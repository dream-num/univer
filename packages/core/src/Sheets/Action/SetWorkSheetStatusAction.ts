import { SetWorkSheetStatus } from '../Apply';
import { ACTION_NAMES } from '../../Const/ACTION_NAMES';
import { BooleanNumber } from '../../Enum';
import { SheetActionBase, ISheetActionData } from '../../Command/SheetActionBase';
import { ActionObservers, ActionType } from '../../Command/ActionObservers';
import { CommandManager, CommandUnit } from '../../Command';

/**
 * @internal
 */
export interface ISetWorkSheetStatusActionData extends ISheetActionData {
    sheetStatus: BooleanNumber;
}

/**
 * @internal
 */
export class SetWorkSheetStatusAction extends SheetActionBase<ISetWorkSheetStatusActionData> {
    static NAME = 'SetWorkSheetStatusAction';

    constructor(
        actionData: ISetWorkSheetStatusActionData,
        commandUnit: CommandUnit,
        observers: ActionObservers
    ) {
        super(actionData, commandUnit, observers);
        this._doActionData = {
            ...actionData,
        };

        this._oldActionData = {
            ...actionData,
            sheetStatus: this.do(),
        };
        this.validate();
    }

    do(): number {
        const worksheet = this.getWorkSheet();

        const result = SetWorkSheetStatus(worksheet, this._doActionData.sheetStatus);

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
            actionName: ACTION_NAMES.SET_WORKSHEET_STATUS_ACTION,
            sheetStatus: this.do(),
        };
    }

    undo(): void {
        const { sheetStatus, sheetId } = this._oldActionData;
        const worksheet = this.getWorkSheet();

        // update current data
        this._doActionData = {
            actionName: ACTION_NAMES.SET_WORKSHEET_STATUS_ACTION,
            sheetId,
            sheetStatus: SetWorkSheetStatus(worksheet, sheetStatus),
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

CommandManager.register(SetWorkSheetStatusAction.NAME, SetWorkSheetStatusAction);

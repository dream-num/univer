import { SetWorkSheetName } from '../Apply';
import { SheetActionBase } from '../../Command/SheetActionBase';
import { ActionObservers, ActionType, CommandModel } from '../../Command';
import { ISetWorkSheetNameActionData } from '../../Types/Interfaces/IActionModel';
import { ACTION_NAMES } from '../../Types/Const';

/**
 * @internal
 */
export class SetWorkSheetNameAction extends SheetActionBase<ISetWorkSheetNameActionData, ISetWorkSheetNameActionData, string> {
    constructor(actionData: ISetWorkSheetNameActionData, commandModel: CommandModel, observers: ActionObservers) {
        super(actionData, commandModel, observers);
        this._doActionData = {
            ...actionData,
        };

        this._oldActionData = {
            ...actionData,
            sheetName: this.do(),
        };
        this.validate();
    }

    do(): string {
        const worksheet = this.getWorkSheet();

        const result = SetWorkSheetName(worksheet, this._doActionData.sheetName);

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
            actionName: ACTION_NAMES.SET_WORKSHEET_NAME_ACTION,
            // actionName: SetWorkSheetNameAction.NAME,
            sheetName: this.do(),
        };
    }

    undo(): void {
        const { sheetName, sheetId } = this._oldActionData;
        const worksheet = this.getWorkSheet();

        // update current data
        this._doActionData = {
            actionName: ACTION_NAMES.SET_WORKSHEET_NAME_ACTION,
            // actionName: SetWorkSheetNameAction.NAME,
            sheetId,
            sheetName: SetWorkSheetName(worksheet, sheetName),
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

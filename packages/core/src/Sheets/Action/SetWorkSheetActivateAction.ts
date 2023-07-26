import { SetWorkSheetActivate } from '../Apply/SetWorkSheetActivate';
import { SheetActionBase } from '../../Command/SheetActionBase';
import { ActionObservers, ActionOperationType, ActionType } from '../../Command/ActionBase';
import { ISetWorkSheetActivateActionData, ISheetStatus } from '../../Types/Interfaces/IActionModel';
import { ACTION_NAMES } from '../../Types/Const';
import { CommandModel } from '../../Command/CommandModel';

/**
 * @internal
 */
export class SetWorkSheetActivateAction extends SheetActionBase<ISetWorkSheetActivateActionData, ISetWorkSheetActivateActionData, ISheetStatus> {
    constructor(actionData: ISetWorkSheetActivateActionData, commandModel: CommandModel, observers: ActionObservers) {
        super(actionData, commandModel, observers);
        this._doActionData = {
            ...actionData,
        };
        const { oldSheetId, status } = this.do();
        this._oldActionData = {
            ...actionData,
            sheetId: oldSheetId,
            status,
        };
        this.validate();
        this.removeOperation(ActionOperationType.SERVER_ACTION);
    }

    do(): ISheetStatus {
        const { sheetId, status } = this._doActionData;
        const result = SetWorkSheetActivate(this.getSpreadsheetModel(), this.getDoActionData());
        this._observers.notifyObservers({
            type: ActionType.REDO,
            data: this._doActionData,
            action: this,
        });

        return result;
    }

    redo(): void {
        // update pre data
        const { oldSheetId, status } = this.do();
        this._oldActionData = {
            actionName: ACTION_NAMES.SET_WORKSHEET_ACTIVATE_ACTION,
            // actionName: SetWorkSheetActivateAction.NAME,
            sheetId: oldSheetId,
            status,
        };
    }

    undo(): void {
        const { oldSheetId, status } = SetWorkSheetActivate(this.getSpreadsheetModel(), this._oldActionData);
        // update current data
        this._doActionData = {
            actionName: ACTION_NAMES.SET_WORKSHEET_ACTIVATE_ACTION,
            // actionName: SetWorkSheetActivateAction.NAME,
            sheetId: oldSheetId,
            status,
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

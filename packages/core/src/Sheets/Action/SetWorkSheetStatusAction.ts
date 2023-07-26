import { SetWorkSheetStatusApply } from '../Apply/SetWorkSheetStatus';
import { SHEET_ACTION_NAMES } from '../../Types/Const/SHEET_ACTION_NAMES';
import { SheetActionBase } from '../../Command/SheetActionBase';
import { ISetWorkSheetStatusActionData } from '../../Types/Interfaces/ISheetActionInterfaces';
import { ActionObservers, ActionType } from '../../Command/ActionBase';
import { CommandModel } from '../../Command/CommandModel';

/**
 * @internal
 */
export class SetWorkSheetStatusAction extends SheetActionBase<ISetWorkSheetStatusActionData> {
    constructor(actionData: ISetWorkSheetStatusActionData, commandModel: CommandModel, observers: ActionObservers) {
        super(actionData, commandModel, observers);
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
        const result = SetWorkSheetStatusApply(this.getSpreadsheetModel(), this._doActionData);

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
            actionName: SHEET_ACTION_NAMES.SET_WORKSHEET_STATUS_ACTION,
            sheetStatus: this.do(),
        };
    }

    undo(): void {
        const { sheetId } = this._oldActionData;
        // update current data
        this._doActionData = {
            actionName: SHEET_ACTION_NAMES.SET_WORKSHEET_STATUS_ACTION,
            sheetId,
            sheetStatus: SetWorkSheetStatusApply(this.getSpreadsheetModel(), this._oldActionData),
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

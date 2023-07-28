import { SheetActionBase } from '../../Command/SheetActionBase';
import { ISetWorkSheetNameActionData } from '../../Types/Interfaces/ISheetActionInterfaces';
import { SHEET_ACTION_NAMES } from '../../Types/Const';
import { CommandModel } from '../../Command/CommandModel';
import { ActionObservers, ActionType } from '../../Command/ActionBase';
import { SetWorkSheetNameApply } from '../Apply/SetWorkSheetName';

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
        const result = SetWorkSheetNameApply(this.getSpreadsheetModel(), this._doActionData);
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
            actionName: SHEET_ACTION_NAMES.SET_WORKSHEET_NAME_ACTION,
            // actionName: SetWorkSheetNameAction.NAME,
            sheetName: this.do(),
        };
    }

    undo(): void {
        const { sheetId } = this._oldActionData;
        // update current data
        this._doActionData = {
            actionName: SHEET_ACTION_NAMES.SET_WORKSHEET_NAME_ACTION,
            // actionName: SetWorkSheetNameAction.NAME,
            sheetId,
            sheetName: SetWorkSheetNameApply(this.getSpreadsheetModel(), this._oldActionData),
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

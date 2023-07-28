import { SheetActionBase, ActionObservers, ActionType, CommandModel } from '@univerjs/core';
import { ACTION_NAMES, ISelectionModelValue, ISetSelectionValueActionData } from '../../Basics';
import { SetSelectionValueApply } from '../Apply/SetSelectionValue';

export class SetSelectionValueAction extends SheetActionBase<ISetSelectionValueActionData, ISetSelectionValueActionData, ISelectionModelValue[]> {
    constructor(actionData: ISetSelectionValueActionData, commandModel: CommandModel, observers: ActionObservers) {
        super(actionData, commandModel, observers);

        this._doActionData = {
            ...actionData,
        };

        const selections = this.do();

        this._oldActionData = {
            ...actionData,
            selections,
        };

        this.validate();
    }

    do(): ISelectionModelValue[] {
        const spreadsheetModel = this.getSpreadsheetModel();

        const result = SetSelectionValueApply(spreadsheetModel, this._doActionData);

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
        const selections = this.do();
        this._oldActionData = {
            actionName: ACTION_NAMES.SET_SELECTION_VALUE_ACTION,
            sheetId,
            selections,
        };
    }

    undo(): void {
        const { sheetId } = this._oldActionData;
        const spreadsheetModel = this.getSpreadsheetModel();

        // update current data
        this._doActionData = {
            actionName: ACTION_NAMES.SET_SELECTION_VALUE_ACTION,
            sheetId,
            selections: SetSelectionValueApply(spreadsheetModel, this._oldActionData),
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

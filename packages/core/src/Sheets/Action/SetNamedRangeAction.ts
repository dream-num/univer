import { SetNamedRangeApply } from '../ApplySetNamedRange';
import { INamedRange } from '../../Types/Interfaces';
import { ISetNamedRangeActionData } from '../../Types/Interfaces/IActionModel';
import { ACTION_NAMES } from '../../Types/Const/ACTION_NAMES';
import { SheetActionBase } from '../../Command/SheetActionBase';
import { CommandModel } from '../../Command/CommandModel';
import { ActionObservers } from '../../Command/ActionBase';

export class SetNamedRangeAction extends SheetActionBase<ISetNamedRangeActionData, ISetNamedRangeActionData, INamedRange> {
    constructor(actionData: ISetNamedRangeActionData, commandModel: CommandModel, observers: ActionObservers) {
        super(actionData, commandModel, observers);

        this._doActionData = {
            ...actionData,
        };
        this._oldActionData = {
            actionName: ACTION_NAMES.SET_NAMED_RANGE_ACTION,
            // actionName: SetNamedRangeAction.NAME,
            namedRange: this.do(),
            sheetId: actionData.sheetId,
        };
        this.validate();
    }

    do(): INamedRange {
        const result = SetNamedRangeApply(this.getSpreadsheetModel(), this._doActionData);
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
            actionName: ACTION_NAMES.SET_NAMED_RANGE_ACTION,
            // actionName: SetNamedRangeAction.NAME,
            sheetId,
            namedRange: this.do(),
        };
    }

    undo(): void {
        const { sheetId } = this._oldActionData;
        this._observers.notifyObservers({
            type: ActionType.UNDO,
            data: this._oldActionData,
            action: this,
        });
        // update current data
        this._doActionData = {
            actionName: ACTION_NAMES.SET_NAMED_RANGE_ACTION,
            // actionName: SetNamedRangeAction.NAME,
            sheetId,
            namedRange: SetNamedRangeApply(this.getSpreadsheetModel(), this._oldActionData),
        };
    }

    validate(): boolean {
        return false;
    }
}

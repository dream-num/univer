import { INamedRange } from '../../Types/Interfaces';
import { IAddNamedRangeActionData, IDeleteNamedRangeActionData } from '../../Types/Interfaces/IActionModel';
import { ACTION_NAMES } from '../../Types/Const/ACTION_NAMES';
import { DeleteNamedRangeApply } from '../Apply/DeleteNamedRange';
import { SheetActionBase } from '../../Command/SheetActionBase';
import { CommandModel } from '../../Command/CommandModel';
import { ActionObservers, ActionType } from '../../Command/ActionBase';
import { AddNamedRangeApply } from '../Apply/AddNamedRange';

export class DeleteNamedRangeAction extends SheetActionBase<IDeleteNamedRangeActionData, IAddNamedRangeActionData, INamedRange> {
    constructor(actionData: IDeleteNamedRangeActionData, commandModel: CommandModel, observers: ActionObservers) {
        super(actionData, commandModel, observers);

        this._doActionData = {
            ...actionData,
        };
        this._oldActionData = {
            actionName: ACTION_NAMES.ADD_NAMED_RANGE_ACTION,
            // actionName: AddNamedRangeAction.NAME,
            sheetId: actionData.sheetId,
            namedRange: this.do(),
        };
        this.validate();
    }

    do(): INamedRange {
        const result = DeleteNamedRangeApply(this.getSpreadsheetModel(), this._doActionData);
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
            actionName: ACTION_NAMES.ADD_BANDING_ACTION,
            // actionName: AddNamedRangeAction.NAME,
            namedRange: this.do(),
        };
    }

    undo(): void {
        AddNamedRangeApply(this.getSpreadsheetModel(), this._oldActionData);
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

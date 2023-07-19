import { SheetActionBase, ActionObservers, ActionType, CommandModel } from '../../Command';
import { ACTION_NAMES } from '../../Types/Const/ACTION_NAMES';
import { IAddNamedRangeActionData, IDeleteNamedRangeActionData } from '../../Types/Interfaces/IActionModel';
import { AddNamedRangeApply } from '../Apply';
import { DeleteNamedRangeApply } from '../Apply/DeleteNamedRange';

export class AddNamedRangeAction extends SheetActionBase<IAddNamedRangeActionData, IDeleteNamedRangeActionData, void> {
    constructor(actionData: IAddNamedRangeActionData, commandModel: CommandModel, observers: ActionObservers) {
        super(actionData, commandModel, observers);

        this._doActionData = {
            ...actionData,
        };
        this.do();
        this._oldActionData = {
            actionName: ACTION_NAMES.DELETE_NAMED_RANGE_ACTION,
            // actionName: DeleteNamedRangeAction.NAME,
            sheetId: actionData.sheetId,
            namedRangeId: actionData.namedRange.namedRangeId,
        };
        this.validate();
    }

    do(): void {
        AddNamedRangeApply(this._commandModel, this._doActionData);
        this._observers.notifyObservers({
            type: ActionType.REDO,
            data: this._doActionData,
            action: this,
        });
    }

    redo(): void {
        this.do();
        // no need store
    }

    undo(): void {
        const { sheetId } = this._oldActionData;
        // update current data
        this._doActionData = {
            // actionName: ACTION_NAMES.ADD_NAMED_RANGE_ACTION,
            actionName: AddNamedRangeAction.NAME,
            sheetId,
            namedRange: DeleteNamedRangeApply(this._commandModel, this._oldActionData),
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

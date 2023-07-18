import {
    ISheetActionData,
    SheetActionBase,
    ActionObservers,
    ActionType,
    CommandUnit,
    CommandManager,
} from '../../Command';
import { INamedRange } from '../../Types/Interfaces/INamedRange';
import { AddNamedRangeApply } from '../Apply';
import { DeleteNamedRangeApply } from '../Apply/DeleteNamedRange';
import {
    DeleteNamedRangeAction,
    IDeleteNamedRangeActionData,
} from './DeleteNamedRangeAction';

export interface IAddNamedRangeActionData extends ISheetActionData {
    namedRange: INamedRange;
}

export class AddNamedRangeAction extends SheetActionBase<
    IAddNamedRangeActionData,
    IDeleteNamedRangeActionData,
    void
> {
    static NAME = 'AddNamedRangeAction';

    constructor(
        actionData: IAddNamedRangeActionData,
        commandUnit: CommandUnit,
        observers: ActionObservers
    ) {
        super(actionData, commandUnit, observers);

        this._doActionData = {
            ...actionData,
        };
        this.do();
        this._oldActionData = {
            //actionName: ACTION_NAMES.DELETE_NAMED_RANGE_ACTION,
            actionName: DeleteNamedRangeAction.NAME,
            sheetId: actionData.sheetId,
            namedRangeId: actionData.namedRange.namedRangeId,
        };
        this.validate();
    }

    do(): void {
        AddNamedRangeApply(this._commandUnit, this._doActionData);
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
            namedRange: DeleteNamedRangeApply(
                this._commandUnit,
                this._oldActionData
            ),
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

CommandManager.register(AddNamedRangeAction.NAME, AddNamedRangeAction);

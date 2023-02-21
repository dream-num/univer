import {
    ISheetActionData,
    SheetActionBase,
    ActionObservers,
    ActionType,
    CommandUnit,
    CommandManager,
} from '../../Command';
import { SetNamedRangeApply } from '../Apply';
import { INamedRange } from '../../Interfaces';

export interface ISetNamedRangeActionData extends ISheetActionData {
    namedRange: INamedRange;
}

export class SetNamedRangeAction extends SheetActionBase<
    ISetNamedRangeActionData,
    ISetNamedRangeActionData,
    INamedRange
> {
    static NAME = 'SetNamedRangeAction';

    constructor(
        actionData: ISetNamedRangeActionData,
        commandUnit: CommandUnit,
        observers: ActionObservers
    ) {
        super(actionData, commandUnit, observers);

        this._doActionData = {
            ...actionData,
        };
        this._oldActionData = {
            // actionName: ACTION_NAMES.SET_NAMED_RANGE_ACTION,
            actionName: SetNamedRangeAction.NAME,
            namedRange: this.do(),
            sheetId: actionData.sheetId,
        };
        this.validate();
    }

    do(): INamedRange {
        const result = SetNamedRangeApply(this._commandUnit, this._doActionData);
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
            // actionName: ACTION_NAMES.SET_NAMED_RANGE_ACTION,
            actionName: SetNamedRangeAction.NAME,
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
            // actionName: ACTION_NAMES.SET_NAMED_RANGE_ACTION,
            actionName: SetNamedRangeAction.NAME,
            sheetId,
            namedRange: SetNamedRangeApply(this._commandUnit, this._oldActionData),
        };
    }

    validate(): boolean {
        return false;
    }
}

CommandManager.register(SetNamedRangeAction.NAME, SetNamedRangeAction);

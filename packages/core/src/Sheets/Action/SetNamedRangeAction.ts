import { ISheetActionData, SheetActionBase, ActionObservers, ActionType, CommandModel } from '../../Command';
import { SetNamedRangeApply } from '../Apply';
import { INamedRange } from '../../Types/Interfaces';

export interface ISetNamedRangeActionData extends ISheetActionData {
    namedRange: INamedRange;
}

export class SetNamedRangeAction extends SheetActionBase<ISetNamedRangeActionData, ISetNamedRangeActionData, INamedRange> {
    static NAME = 'SetNamedRangeAction';

    constructor(actionData: ISetNamedRangeActionData, commandModel: CommandModel, observers: ActionObservers) {
        super(actionData, commandModel, observers);

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
        const result = SetNamedRangeApply(this._commandModel, this._doActionData);
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
            namedRange: SetNamedRangeApply(this._commandModel, this._oldActionData),
        };
    }

    validate(): boolean {
        return false;
    }
}

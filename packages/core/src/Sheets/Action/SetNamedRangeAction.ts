import {
    ISheetActionData,
    SheetActionBase,
    ActionObservers,
    ActionType,
    CommandUnit,
} from '../../Command';
import { SetNamedRange } from '../Apply';
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
        const { namedRange } = this._doActionData;
        const namedRanges = this._workbook.getConfig().namedRanges;
        this._observers.notifyObservers({
            type: ActionType.REDO,
            data: this._doActionData,
            action: this,
        });
        return SetNamedRange(namedRanges, namedRange);
    }

    redo(): void {
        // update pre data
        const { sheetId, namedRange } = this._doActionData;
        this._oldActionData = {
            // actionName: ACTION_NAMES.SET_NAMED_RANGE_ACTION,
            actionName: SetNamedRangeAction.NAME,
            sheetId,
            namedRange: this.do(),
        };
    }

    undo(): void {
        const { namedRange, sheetId } = this._oldActionData;
        const namedRanges = this._workbook.getConfig().namedRanges;
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
            namedRange: SetNamedRange(namedRanges, namedRange),
        };
    }

    validate(): boolean {
        return false;
    }
}

import {
    ActionBase,
    ActionObservers,
    ActionType,
    IActionData,
} from '../../../Command';
import { ACTION_NAMES, CONVERTOR_OPERATION } from '../../../Const';
import { WorkSheetConvertor } from '../../../Convertor';
import { Workbook } from '../../../Sheets/Domain';
import { INamedRange } from '../INamedRange';
import { SetNamedRangeService } from '../Service/SetNamedRangeService';

export interface ISetNamedRangeActionData extends IActionData {
    namedRange: INamedRange;
}

export class SetNamedRangeAction extends ActionBase<
    ISetNamedRangeActionData,
    ISetNamedRangeActionData,
    INamedRange
> {
    constructor(
        actionData: ISetNamedRangeActionData,
        workbook: Workbook,
        observers: ActionObservers
    ) {
        super(actionData, workbook, observers);

        this._doActionData = {
            ...actionData,
            convertor: [new WorkSheetConvertor(CONVERTOR_OPERATION.SET)],
        };
        this._oldActionData = {
            actionName: ACTION_NAMES.SET_NAMED_RANGE_ACTION,
            sheetId: actionData.sheetId,
            namedRange: this.do(),
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
        return SetNamedRangeService(namedRanges, namedRange);
    }

    redo(): void {
        // update pre data
        const { sheetId, namedRange } = this._doActionData;
        this._oldActionData = {
            actionName: ACTION_NAMES.SET_NAMED_RANGE_ACTION,
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
            actionName: ACTION_NAMES.SET_NAMED_RANGE_ACTION,
            sheetId,
            namedRange: SetNamedRangeService(namedRanges, namedRange),
        };
    }

    validate(): boolean {
        return false;
    }
}

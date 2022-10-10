import {
    ActionBase,
    ActionObservers,
    ActionType,
    IActionData,
} from '../../../Command';
import { ACTION_NAMES, CONVERTOR_OPERATION } from '../../../Const';
import { WorkSheetConvertor } from '../../../Convertor';
import { Workbook1 } from '../../../Sheets/Domain';
import { INamedRange } from '../INamedRange';
import { AddNamedRangeService } from '../Service/AddNamedRangeService';
import { DeleteNamedRangeService } from '../Service/DeleteNamedRangeService';
import { IDeleteNamedRangeActionData } from './DeleteNamedRangeAction';

export interface IAddNamedRangeActionData extends IActionData {
    namedRange: INamedRange;
}

export class AddNamedRangeAction extends ActionBase<
    IAddNamedRangeActionData,
    IDeleteNamedRangeActionData,
    void
> {
    constructor(
        actionData: IAddNamedRangeActionData,
        workbook: Workbook1,
        observers: ActionObservers
    ) {
        super(actionData, workbook, observers);

        this._doActionData = {
            ...actionData,
            convertor: [new WorkSheetConvertor(CONVERTOR_OPERATION.SET)],
        };
        this.do();
        this._oldActionData = {
            actionName: ACTION_NAMES.DELETE_NAMED_RANGE_ACTION,
            sheetId: actionData.sheetId,
            namedRangeId: actionData.namedRange.namedRangeId,
        };
        this.validate();
    }

    do(): void {
        const { namedRange } = this._doActionData;
        const namedRanges = this._workbook.getConfig().namedRanges;
        this._observers.notifyObservers({
            type: ActionType.REDO,
            data: this._doActionData,
            action: this,
        });
        AddNamedRangeService(namedRanges, namedRange);
    }

    redo(): void {
        this.do();
        // no need store
    }

    undo(): void {
        const { namedRangeId, sheetId } = this._oldActionData;
        const namedRanges = this._workbook.getConfig().namedRanges;
        this._observers.notifyObservers({
            type: ActionType.UNDO,
            data: this._oldActionData,
            action: this,
        });

        // update current data
        this._doActionData = {
            actionName: ACTION_NAMES.ADD_NAMED_RANGE_ACTION,
            sheetId,
            namedRange: DeleteNamedRangeService(namedRanges, namedRangeId),
        };
    }

    validate(): boolean {
        return false;
    }
}

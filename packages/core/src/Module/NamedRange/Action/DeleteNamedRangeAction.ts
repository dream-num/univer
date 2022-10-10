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
import { AddNamedRangeService } from '../Service/AddNamedRangeService';
import { DeleteNamedRangeService } from '../Service/DeleteNamedRangeService';
import { IAddNamedRangeActionData } from './AddNamedRangeAction';

export interface IDeleteNamedRangeActionData extends IActionData {
    namedRangeId: string;
}

export class DeleteNamedRangeAction extends ActionBase<
    IDeleteNamedRangeActionData,
    IAddNamedRangeActionData,
    INamedRange
> {
    constructor(
        actionData: IDeleteNamedRangeActionData,
        workbook: Workbook,
        observers: ActionObservers
    ) {
        super(actionData, workbook, observers);

        this._doActionData = {
            ...actionData,
            convertor: [new WorkSheetConvertor(CONVERTOR_OPERATION.SET)],
        };
        this._oldActionData = {
            actionName: ACTION_NAMES.ADD_NAMED_RANGE_ACTION,
            sheetId: actionData.sheetId,
            namedRange: this.do(),
        };
        this.validate();
    }

    do(): INamedRange {
        const { namedRangeId } = this._doActionData;
        const namedRanges = this._workbook.getConfig().namedRanges;
        this._observers.notifyObservers({
            type: ActionType.REDO,
            data: this._doActionData,
            action: this,
        });
        return DeleteNamedRangeService(namedRanges, namedRangeId);
    }

    redo(): void {
        // update pre data
        const { sheetId } = this._doActionData;

        this._oldActionData = {
            sheetId,
            actionName: ACTION_NAMES.ADD_BANDING_ACTION,
            namedRange: this.do(),
            convertor: [new WorkSheetConvertor(CONVERTOR_OPERATION.INSERT)],
        };
    }

    undo(): void {
        const { namedRange } = this._oldActionData;
        const namedRanges = this._workbook.getConfig().namedRanges;
        this._observers.notifyObservers({
            type: ActionType.UNDO,
            data: this._oldActionData,
            action: this,
        });
        AddNamedRangeService(namedRanges, namedRange);
    }

    validate(): boolean {
        return false;
    }
}

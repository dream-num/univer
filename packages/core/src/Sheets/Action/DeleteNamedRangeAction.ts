import { ISheetActionData, SheetAction, ActionObservers, ActionType } from '../../Command';
import { CONVERTOR_OPERATION, ACTION_NAMES } from '../../Const';
import { WorkSheetConvertor } from '../../Convertor';
import { INamedRange } from '../../Interfaces/INamedRange';
import { AddNamedRange } from '../Apply/AddNamedRange';
import { DeleteNamedRange } from '../Apply/DeleteNamedRange';
import { Workbook } from '../Domain';
import { IAddNamedRangeActionData } from './AddNamedRangeAction';

export interface IDeleteNamedRangeActionData extends ISheetActionData {
    namedRangeId: string;
}

export class DeleteNamedRangeAction extends SheetAction<
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
        return DeleteNamedRange(namedRanges, namedRangeId);
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
        AddNamedRange(namedRanges, namedRange);
    }

    validate(): boolean {
        return false;
    }
}

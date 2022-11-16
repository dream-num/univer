import { ISheetActionData, SheetActionBase, ActionObservers, ActionType } from '../../Command';
import { CONVERTOR_OPERATION, ACTION_NAMES } from '../../Const';
import { WorkSheetConvertor } from '../../Convertor';
import { INamedRange } from '../../Interfaces/INamedRange';
import { AddNamedRange } from '../Apply/AddNamedRange';
import { DeleteNamedRange } from '../Apply/DeleteNamedRange';
import { Workbook } from '../Domain';
import { IDeleteNamedRangeActionData } from './DeleteNamedRangeAction';

export interface IAddNamedRangeActionData extends ISheetActionData {
    namedRange: INamedRange;
}

export class AddNamedRangeAction extends SheetActionBase<
    IAddNamedRangeActionData,
    IDeleteNamedRangeActionData,
    void
> {
    constructor(
        actionData: IAddNamedRangeActionData,
        workbook: Workbook,
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
        AddNamedRange(namedRanges, namedRange);
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
            namedRange: DeleteNamedRange(namedRanges, namedRangeId),
        };
    }

    validate(): boolean {
        return false;
    }
}

import {
    ISheetActionData,
    SheetActionBase,
    ActionObservers,
    ActionType,
    CommandUnit,
    DeleteNamedRangeAction,
} from '../../Command';
import { INamedRange } from '../../Interfaces/INamedRange';
import { AddNamedRange } from '../Apply/AddNamedRange';
import { DeleteNamedRange } from '../Apply/DeleteNamedRange';
import { IDeleteNamedRangeActionData } from './DeleteNamedRangeAction';

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
            // actionName: ACTION_NAMES.ADD_NAMED_RANGE_ACTION,
            actionName: AddNamedRangeAction.NAME,
            sheetId,
            namedRange: DeleteNamedRange(namedRanges, namedRangeId),
        };
    }

    validate(): boolean {
        return false;
    }
}

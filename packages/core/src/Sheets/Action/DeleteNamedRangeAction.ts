import {
    ISheetActionData,
    SheetActionBase,
    ActionObservers,
    ActionType,
    CommandUnit,
    AddNamedRangeAction,
} from '../../Command';
import { DeleteNamedRange, AddNamedRange } from '../Apply';
import { INamedRange } from '../../Interfaces';
import { IAddNamedRangeActionData } from './AddNamedRangeAction';

export interface IDeleteNamedRangeActionData extends ISheetActionData {
    namedRangeId: string;
}

export class DeleteNamedRangeAction extends SheetActionBase<
    IDeleteNamedRangeActionData,
    IAddNamedRangeActionData,
    INamedRange
> {
    static NAME = 'DeleteNamedRangeAction';

    constructor(
        actionData: IDeleteNamedRangeActionData,
        commandUnit: CommandUnit,
        observers: ActionObservers
    ) {
        super(actionData, commandUnit, observers);

        this._doActionData = {
            ...actionData,
        };
        this._oldActionData = {
            // actionName: ACTION_NAMES.ADD_NAMED_RANGE_ACTION,
            actionName: AddNamedRangeAction.NAME,
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
            // actionName: ACTION_NAMES.ADD_BANDING_ACTION,
            actionName: AddNamedRangeAction.NAME,
            namedRange: this.do(),
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

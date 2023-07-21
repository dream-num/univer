import { ActionObservers, ActionType, CommandModel } from '../../Command';
import { SetRangeDataAction } from './SetRangeDataAction';
import { DeleteRangeApply, InsertRangeApply } from '../Apply';
import { SheetActionBase } from '../../Command/SheetActionBase';
import { IInsertRangeActionData, IDeleteRangeActionData } from '../../Types/Interfaces/IActionModel';
import { ACTION_NAMES } from '../../Types/Const/ACTION_NAMES';

/**
 * Insert data into a range and move the range to the right or below
 *
 * @internal
 */
export class InsertRangeAction extends SheetActionBase<IInsertRangeActionData, IDeleteRangeActionData> {
    constructor(actionData: IInsertRangeActionData, commandModel: CommandModel, observers: ActionObservers) {
        super(actionData, commandModel, observers);
        this._doActionData = {
            ...actionData,
        };
        this.do();
        this._oldActionData = {
            ...actionData,
        };
        this.validate();
    }

    do(): void {
        const worksheet = this.getWorkSheet();
        if (worksheet) {
            InsertRangeApply(this.getSpreadsheetModel(), this._doActionData);
            this._observers.notifyObservers({
                type: ActionType.REDO,
                data: this._doActionData,
                action: this,
            });
        }
    }

    redo(): void {
        this.do();
        // no need store
    }

    undo(): void {
        const { rangeData, sheetId, shiftDimension } = this._oldActionData;
        const worksheet = this.getWorkSheet();
        if (worksheet) {
            // update current data
            this._doActionData = {
                actionName: ACTION_NAMES.SET_RANGE_DATA_ACTION,
                // actionName: SetRangeDataAction.NAME,
                sheetId,
                cellValue: DeleteRangeApply(this.getSpreadsheetModel(), this._oldActionData),
                rangeData,
                shiftDimension,
            };
            this._observers.notifyObservers({
                type: ActionType.UNDO,
                data: this._oldActionData,
                action: this,
            });
        }
    }

    validate(): boolean {
        return false;
    }
}

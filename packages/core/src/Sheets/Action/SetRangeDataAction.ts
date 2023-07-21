import { SetRangeDataApply } from '../Apply';
import { SheetActionBase, ActionObservers, ActionType, CommandModel } from '../../Command';
import { ICellData } from '../../Types/Interfaces';
import { ISetRangeDataActionData } from '../../Types/Interfaces/IActionModel';
import { ACTION_NAMES } from '../../Types/Const/ACTION_NAMES';
import { ObjectMatrixPrimitiveType } from '../../Shared/ObjectMatrix';

/**
 * Modify values in the range
 *
 * @internal
 */
export class SetRangeDataAction extends SheetActionBase<ISetRangeDataActionData, ISetRangeDataActionData, ObjectMatrixPrimitiveType<ICellData>> {
    constructor(actionData: ISetRangeDataActionData, commandModel: CommandModel, observers: ActionObservers) {
        super(actionData, commandModel, observers);

        this._doActionData = {
            ...actionData,
        };
        this._oldActionData = {
            ...actionData,
            cellValue: this.do(),
        };

        this.validate();
    }

    do(): ObjectMatrixPrimitiveType<ICellData> {
        const result = SetRangeDataApply(this.getSpreadsheetModel(), this._doActionData);
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
            actionName: ACTION_NAMES.SET_RANGE_DATA_ACTION,
            // actionName: SetRangeDataAction.NAME,
            sheetId,
            cellValue: this.do(),
        };
    }

    undo(): void {
        const { sheetId } = this._oldActionData;

        // update current data
        this._doActionData = {
            actionName: ACTION_NAMES.SET_RANGE_DATA_ACTION,
            // actionName: SetRangeDataAction.NAME,
            sheetId,
            cellValue: SetRangeDataApply(this.getSpreadsheetModel(), this._oldActionData),
        };

        this._observers.notifyObservers({
            type: ActionType.UNDO,
            data: this._oldActionData,
            action: this,
        });
    }

    validate(): boolean {
        return false;
    }
}

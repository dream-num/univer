import { ClearRangeApply } from '../Apply/ClearRange';
import { SetRangeDataApply } from '../Apply/SetRangeData';
import { ICellData } from '../../Types/Interfaces';
import { ObjectMatrixPrimitiveType } from '../../Shared/ObjectMatrix';
import { SheetActionBase } from '../../Command/SheetActionBase';
import { IClearRangeActionData, ISetRangeDataActionData } from '../../Types/Interfaces/ISheetActionInterfaces';
import { SHEET_ACTION_NAMES } from '../../Types/Const/SHEET_ACTION_NAMES';
import { CommandModel } from '../../Command/CommandModel';
import { ActionObservers, ActionType } from '../../Command/ActionBase';

/**
 * Clearly specify a range of styles, content, comments, validation, filtering
 *
 * @internal
 */
export class ClearRangeAction extends SheetActionBase<IClearRangeActionData, ISetRangeDataActionData, ObjectMatrixPrimitiveType<ICellData>> {
    constructor(actionData: IClearRangeActionData, commandModel: CommandModel, observers: ActionObservers) {
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
        const result = ClearRangeApply(this.getSpreadsheetModel(), this._doActionData);
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
            actionName: SHEET_ACTION_NAMES.SET_RANGE_DATA_ACTION,
            // actionName: SetRangeDataAction.NAME,
            sheetId,
            cellValue: this.do(),
        };
    }

    undo(): void {
        SetRangeDataApply(this.getSpreadsheetModel(), this._oldActionData);
        // no need update current data
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

import { ObjectMatrixPrimitiveType } from '../../Shared/ObjectMatrix';
import { SheetActionBase } from '../../Command/SheetActionBase';
import { DeleteRangeApply, InsertRangeApply } from '../Apply';
import { ICellData } from '../../Types/Interfaces/ICellData';
import { IDeleteRangeActionData, IInsertRangeActionData } from '../../Types/Interfaces/ISheetActionInterfaces';
import { SHEET_ACTION_NAMES } from '../../Types/Const/SHEET_ACTION_NAMES';
import { ActionObservers, ActionType } from '../../Command/ActionBase';
import { CommandModel } from '../../Command/CommandModel';

/**
 * Delete the specified range and move the right or lower range
 *
 * @internal
 */
export class DeleteRangeAction extends SheetActionBase<IDeleteRangeActionData, IInsertRangeActionData, ObjectMatrixPrimitiveType<ICellData>> {
    constructor(actionData: IDeleteRangeActionData, commandModel: CommandModel, observers: ActionObservers) {
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
        const result = DeleteRangeApply(this.getSpreadsheetModel(), this._doActionData);
        this._observers.notifyObservers({
            type: ActionType.REDO,
            data: this._doActionData,
            action: this,
        });

        return result;
    }

    redo(): void {
        // update pre data
        const { sheetId, rangeData, shiftDimension } = this._doActionData;
        this._oldActionData = {
            sheetId,
            actionName: SHEET_ACTION_NAMES.INSERT_RANGE_ACTION,
            // actionName: InsertRangeAction.NAME,
            shiftDimension,
            rangeData,
            cellValue: this.do(),
        };
    }

    undo(): void {
        InsertRangeApply(this.getSpreadsheetModel(), this._oldActionData);
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

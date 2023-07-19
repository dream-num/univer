import { Dimension } from '../../Types/Enum/Dimension';
import { ICellData, IRangeData } from '../../Types/Interfaces';
import { ObjectMatrixPrimitiveType } from '../../Shared/ObjectMatrix';
import { SheetActionBase, ISheetActionData } from '../../Command/SheetActionBase';
import { ActionObservers, ActionType } from '../../Command/ActionObservers';
import { IInsertRangeActionData, InsertRangeAction } from './InsertRangeAction';
import { CommandManager, CommandUnit } from '../../Command';
import { DeleteRangeApply, InsertRangeApply } from '../Apply';

/**
 * @internal
 */
export interface IDeleteRangeActionData extends ISheetActionData {
    shiftDimension: Dimension;
    rangeData: IRangeData;
}

/**
 * Delete the specified range and move the right or lower range
 *
 * @internal
 */
export class DeleteRangeAction extends SheetActionBase<
    IDeleteRangeActionData,
    IInsertRangeActionData,
    ObjectMatrixPrimitiveType<ICellData>
> {
    static NAME = 'DeleteRangeAction';

    constructor(
        actionData: IDeleteRangeActionData,
        commandUnit: CommandUnit,
        observers: ActionObservers
    ) {
        super(actionData, commandUnit, observers);

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
        const result = DeleteRangeApply(this._commandUnit, this._doActionData);
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
            // actionName: ACTION_NAMES.INSERT_RANGE_ACTION,
            actionName: InsertRangeAction.NAME,
            shiftDimension,
            rangeData,
            cellValue: this.do(),
        };
    }

    undo(): void {
        const worksheet = this.getWorkSheet();
        if (worksheet) {
            InsertRangeApply(this._commandUnit, this._oldActionData);
            this._observers.notifyObservers({
                type: ActionType.UNDO,
                data: this._oldActionData,
                action: this,
            });
            // no need update current data
        }
    }

    validate(): boolean {
        return false;
    }
}

CommandManager.register(DeleteRangeAction.NAME, DeleteRangeAction);

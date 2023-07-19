import { ICellData, IRangeData } from '../../Types/Interfaces';
import { ObjectMatrixPrimitiveType } from '../../Shared/ObjectMatrix';
import { Dimension } from '../../Types/Enum/Dimension';
import { IDeleteRangeActionData } from './DeleteRangeAction';
import { CommandModel } from '../../Command';
import { SetRangeDataAction } from './SetRangeDataAction';
import { DeleteRangeApply, InsertRangeApply } from '../Apply';
import { SheetActionBase, ISheetActionData } from '../../Command/SheetActionBase';
import { ActionObservers, ActionType } from '../../Command/ActionObservers';

/**
 * @internal
 */
export interface IInsertRangeActionData extends ISheetActionData {
    shiftDimension: Dimension;
    rangeData: IRangeData;
    cellValue: ObjectMatrixPrimitiveType<ICellData>;
}

/**
 * Insert data into a range and move the range to the right or below
 *
 * @internal
 */
export class InsertRangeAction extends SheetActionBase<IInsertRangeActionData, IDeleteRangeActionData> {
    static NAME = 'InsertRangeAction';

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
            InsertRangeApply(this._commandModel, this._doActionData);
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
                // actionName: ACTION_NAMES.SET_RANGE_DATA_ACTION,
                actionName: SetRangeDataAction.NAME,
                sheetId,
                cellValue: DeleteRangeApply(this._commandModel, this._oldActionData),
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

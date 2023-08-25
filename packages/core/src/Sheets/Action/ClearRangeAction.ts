import { ClearRangeApply, SetRangeDataApply } from '../Apply';
import { ICellData, IOptionData, IRangeData } from '../../Types/Interfaces';
import { ObjectMatrixPrimitiveType } from '../../Shared/ObjectMatrix';
import { SheetActionBase, ISheetActionData } from '../../Command/SheetActionBase';
import { ActionObservers, ActionType } from '../../Command/ActionObservers';
import { ISetRangeDataActionData, SetRangeDataAction } from './SetRangeDataAction';
import { CommandManager, CommandUnit } from '../../Command';

/**
 * @internal
 * @deprecated
 */
export interface IClearRangeActionData extends ISheetActionData {
    options: IOptionData;
    rangeData: IRangeData;
}

/**
 * Clearly specify a range of styles, content, comments, validation, filtering
 *
 * @deprecated
 * @internal
 */
export class ClearRangeAction extends SheetActionBase<IClearRangeActionData, ISetRangeDataActionData, ObjectMatrixPrimitiveType<ICellData>> {
    static NAME = 'ClearRangeAction';

    constructor(actionData: IClearRangeActionData, commandUnit: CommandUnit, observers: ActionObservers) {
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
        const result = ClearRangeApply(this._commandUnit, this._doActionData);

        // action 不应该跟 undo redo 耦合在一起，因为 action 可能被发送到协同端去
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
            // actionName: ACTION_NAMES.SET_RANGE_DATA_ACTION,
            actionName: SetRangeDataAction.NAME,
            sheetId,
            cellValue: this.do(),
        };
    }

    undo(): void {
        const worksheet = this.getWorkSheet();
        if (worksheet) {
            SetRangeDataApply(this._commandUnit, this._oldActionData);
            // no need update current data
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

CommandManager.register(ClearRangeAction.NAME, ClearRangeAction);

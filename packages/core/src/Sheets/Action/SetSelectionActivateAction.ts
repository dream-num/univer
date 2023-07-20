import { SheetActionBase } from '../../Command/SheetActionBase';
import { SetSelectionActivate } from '../Apply';
import { ActionObservers, ActionType, CommandModel } from '../../Command';
import { ISetSelectionActivateActionData, ISetSelectionActivateServiceData } from '../../Types/Interfaces/IActionModel';
import { ACTION_NAMES } from '../../Types/Const/ACTION_NAMES';

/**
 * @internal
 */
export class SetSelectionActivateAction extends SheetActionBase<ISetSelectionActivateActionData, ISetSelectionActivateActionData, ISetSelectionActivateServiceData> {
    constructor(actionData: ISetSelectionActivateActionData, commandModel: CommandModel, observers: ActionObservers) {
        super(actionData, commandModel, observers);

        this._doActionData = {
            ...actionData,
        };

        const { activeRangeList, activeRange, currentCell } = this.do();

        this._oldActionData = {
            ...actionData,
            activeRangeList,
            activeRange,
            currentCell,
        };

        this.validate();
    }

    do(): ISetSelectionActivateServiceData {
        const { activeRangeList, activeRange, currentCell } = this._doActionData;
        const worksheet = this.getWorkSheet();

        const result = SetSelectionActivate(worksheet, activeRangeList, activeRange, currentCell);

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
        const { activeRangeList, activeRange, currentCell } = this.do();
        this._oldActionData = {
            actionName: ACTION_NAMES.SET_SELECTION_ACTION,
            // actionName: SetSelectionActivateAction.NAME,
            sheetId,
            activeRangeList,
            activeRange,
            currentCell,
        };
    }

    undo(): void {
        const { activeRangeList, activeRange, currentCell, sheetId } = this._oldActionData;
        const worksheet = this.getWorkSheet();

        const doData = SetSelectionActivate(worksheet, activeRangeList, activeRange, currentCell);
        // update current data
        this._doActionData = {
            actionName: ACTION_NAMES.SET_SELECTION_ACTION,
            // actionName: SetSelectionActivateAction.NAME,
            sheetId,
            activeRangeList: doData.activeRangeList,
            activeRange: doData.activeRange,
            currentCell: doData.currentCell,
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

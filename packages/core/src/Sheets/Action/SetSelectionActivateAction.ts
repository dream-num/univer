import { IRangeData } from '../../Interfaces';
import { SheetActionBase, ISheetActionData } from '../../Command/SheetActionBase';
import { ActionObservers, ActionType } from '../../Command/ActionObservers';
import { SetSelectionActivate } from '../Apply';
import { CommandManager, CommandUnit } from '../../Command';

/**
 * @internal
 */
export interface ISetSelectionActivateActionData extends ISheetActionData {
    activeRangeList: IRangeData | IRangeData[];
    activeRange: IRangeData;
    currentCell: IRangeData;
}

/**
 * @internal
 */
export interface ISetSelectionActivateServiceData {
    activeRangeList: IRangeData | IRangeData[];
    activeRange: IRangeData;
    currentCell: IRangeData;
}

/**
 * @internal
 */
export class SetSelectionActivateAction extends SheetActionBase<
    ISetSelectionActivateActionData,
    ISetSelectionActivateActionData,
    ISetSelectionActivateServiceData
> {
    static NAME = 'SetSelectionActivateAction';

    constructor(
        actionData: ISetSelectionActivateActionData,
        commandUnit: CommandUnit,
        observers: ActionObservers
    ) {
        super(actionData, commandUnit, observers);

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

        const result = SetSelectionActivate(
            worksheet,
            activeRangeList,
            activeRange,
            currentCell
        );

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
            // actionName: ACTION_NAMES.SET_SELECTION_ACTION,
            actionName: SetSelectionActivateAction.NAME,
            sheetId,
            activeRangeList,
            activeRange,
            currentCell,
        };
    }

    undo(): void {
        const { activeRangeList, activeRange, currentCell, sheetId } =
            this._oldActionData;
        const worksheet = this.getWorkSheet();

        const doData = SetSelectionActivate(
            worksheet,
            activeRangeList,
            activeRange,
            currentCell
        );
        // update current data
        this._doActionData = {
            // actionName: ACTION_NAMES.SET_SELECTION_ACTION,
            actionName: SetSelectionActivateAction.NAME,
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

CommandManager.register(SetSelectionActivateAction.NAME, SetSelectionActivateAction);

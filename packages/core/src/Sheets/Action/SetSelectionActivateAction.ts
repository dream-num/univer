import { ACTION_NAMES } from '../../Const/ACTION_NAMES';
import { Workbook } from '../Domain';
import { IRangeData } from '../../Interfaces';
import { SheetAction, ISheetActionData } from '../../Command/SheetAction';
import { ActionObservers, ActionType } from '../../Command/ActionObservers';
import { SetSelectionActivate } from '../Apply';
import { CONVERTOR_OPERATION } from '../../Const/CONST';
import { WorkSheetConvertor } from '../../Convertor/WorkSheetConvertor';

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
export class SetSelectionActivateAction extends SheetAction<
    ISetSelectionActivateActionData,
    ISetSelectionActivateActionData,
    ISetSelectionActivateServiceData
> {
    constructor(
        actionData: ISetSelectionActivateActionData,
        workbook: Workbook,
        observers: ActionObservers
    ) {
        super(actionData, workbook, observers);

        this._doActionData = {
            ...actionData,
            convertor: [new WorkSheetConvertor(CONVERTOR_OPERATION.SET)],
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
            actionName: ACTION_NAMES.SET_SELECTION_ACTION,
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
            actionName: ACTION_NAMES.SET_SELECTION_ACTION,
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

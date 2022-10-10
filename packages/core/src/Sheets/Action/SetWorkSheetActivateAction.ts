import { SetWorkSheetActivate } from '../Apply';
import { ACTION_NAMES } from '../../Const/ACTION_NAMES';
import { Workbook1 } from '../Domain';
import { ActionBase, ActionOperation, IActionData } from '../../Command/ActionBase';
import { ActionObservers, ActionType } from '../../Command/ActionObservers';
import { BooleanNumber } from '../../Enum';

/**
 * @internal
 */
export interface ISetWorkSheetActivateActionData extends IActionData {
    status: BooleanNumber;
}

/**
 * @internal
 */
export interface ISheetStatus {
    oldSheetId: string;
    status: BooleanNumber;
}

/**
 * @internal
 */
export class SetWorkSheetActivateAction extends ActionBase<
    ISetWorkSheetActivateActionData,
    ISetWorkSheetActivateActionData,
    ISheetStatus
> {
    constructor(
        actionData: ISetWorkSheetActivateActionData,
        workbook: Workbook1,
        observers: ActionObservers
    ) {
        super(actionData, workbook, observers);
        this._doActionData = {
            ...actionData,
            convertor: [],
        };
        const { oldSheetId, status } = this.do();
        this._oldActionData = {
            ...actionData,
            sheetId: oldSheetId,
            status,
            convertor: [],
        };
        this.validate();
        this.removeOperation(ActionOperation.SERVER_ACTION);
    }

    do(): ISheetStatus {
        const { sheetId, status } = this._doActionData;
        const worksheet = this._workbook.getSheetBySheetId(sheetId)!;

        const result = SetWorkSheetActivate(worksheet, status);

        this._observers.notifyObservers({
            type: ActionType.REDO,
            data: this._doActionData,
            action: this,
        });

        return result;
    }

    redo(): void {
        // update pre data
        const { oldSheetId, status } = this.do();
        this._oldActionData = {
            actionName: ACTION_NAMES.SET_WORKSHEET_ACTIVATE_ACTION,
            sheetId: oldSheetId,
            status,
        };
    }

    undo(): void {
        const { sheetId } = this._oldActionData;
        const oldStatus = this._oldActionData.status;
        const worksheet = this._workbook.getSheetBySheetId(sheetId);
        if (worksheet) {
            const { oldSheetId, status } = SetWorkSheetActivate(
                worksheet,
                oldStatus
            );
            // update current data
            this._doActionData = {
                actionName: ACTION_NAMES.SET_WORKSHEET_ACTIVATE_ACTION,
                sheetId: oldSheetId,
                status,
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

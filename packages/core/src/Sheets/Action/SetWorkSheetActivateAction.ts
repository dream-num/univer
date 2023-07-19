import { SetWorkSheetActivate } from '../Apply';
import { SheetActionBase } from '../../Command/SheetActionBase';
import { ActionObservers, ActionType } from '../../Command/ActionObservers';
import { ActionOperationType } from '../../Command/ActionBase';
import { CommandModel } from '../../Command';

/**
 * @internal
 */
export class SetWorkSheetActivateAction extends SheetActionBase<ISetWorkSheetActivateActionData, ISetWorkSheetActivateActionData, ISheetStatus> {

    constructor(actionData: ISetWorkSheetActivateActionData, commandModel: CommandModel, observers: ActionObservers) {
        super(actionData, commandModel, observers);
        this._doActionData = {
            ...actionData,
        };
        const { oldSheetId, status } = this.do();
        this._oldActionData = {
            ...actionData,
            sheetId: oldSheetId,
            status,
        };
        this.validate();
        this.removeOperation(ActionOperationType.SERVER_ACTION);
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
            // actionName: ACTION_NAMES.SET_WORKSHEET_ACTIVATE_ACTION,
            actionName: SetWorkSheetActivateAction.NAME,
            sheetId: oldSheetId,
            status,
        };
    }

    undo(): void {
        const { sheetId } = this._oldActionData;
        const oldStatus = this._oldActionData.status;
        const worksheet = this._workbook.getSheetBySheetId(sheetId);
        if (worksheet) {
            const { oldSheetId, status } = SetWorkSheetActivate(worksheet, oldStatus);
            // update current data
            this._doActionData = {
                actionName: SetWorkSheetActivateAction.NAME,
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

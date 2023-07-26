import { SheetActionBase } from '../../Command/SheetActionBase';
import { ISetRowShowActionData } from '../../Types/Interfaces/ISheetActionInterfaces';
import { CommandModel } from '../../Command/CommandModel';
import { ActionObservers, ActionType } from '../../Command/ActionBase';
import { SetRowShowApply } from '../Apply/SetRowShow';
import { SetRowHideApply } from '../Apply/SetRowHide';

/**
 * @internal
 */
export class SetRowShowAction extends SheetActionBase<ISetRowShowActionData> {
    constructor(actionData: ISetRowShowActionData, commandModel: CommandModel, observers: ActionObservers) {
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
        const result = SetRowShowApply(this.getSpreadsheetModel(), this._doActionData);

        this._observers.notifyObservers({
            type: ActionType.REDO,
            data: this._doActionData,
            action: this,
        });

        return result;
    }

    redo(): void {
        this.do();
    }

    undo(): void {
        SetRowHideApply(this.getSpreadsheetModel(), this._oldActionData);

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

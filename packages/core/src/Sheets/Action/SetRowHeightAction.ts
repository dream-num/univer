import { ActionObservers, ActionType } from '../../Command/ActionBase';
import { CommandModel } from '../../Command/CommandModel';
import { SheetActionBase } from '../../Command/SheetActionBase';
import { ISetRowHeightActionData } from '../../Types/Interfaces/IActionModel';
import { SetRowHeightApply } from '../Apply/SetRowHeight';

/**
 * Set the row height according to the specified row index
 *
 * @internal
 */
export class SetRowHeightAction extends SheetActionBase<ISetRowHeightActionData> {
    constructor(actionData: ISetRowHeightActionData, commandModel: CommandModel, observers: ActionObservers) {
        super(actionData, commandModel, observers);
        this._doActionData = {
            ...actionData,
        };
        this._oldActionData = {
            ...actionData,
            rowHeight: this.do(),
        };
        this.validate();
    }

    do(): number[] {
        const result = SetRowHeightApply(this.getSpreadsheetModel(), this._doActionData);

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

    undo(): number[] {
        const result = SetRowHeightApply(this.getSpreadsheetModel(), this._oldActionData);

        this._observers.notifyObservers({
            type: ActionType.UNDO,
            data: this._oldActionData,
            action: this,
        });

        return result;
    }

    validate(): boolean {
        return false;
    }
}

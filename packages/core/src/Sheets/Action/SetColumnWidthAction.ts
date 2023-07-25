import { SheetActionBase } from '../../Command/SheetActionBase';
import { SetColumnWidthApply } from '../Apply/SetColumnWidth';
import { ISetColumnWidthActionData } from '../../Types/Interfaces/IActionModel';
import { CommandModel } from '../../Command/CommandModel';
import { ActionObservers, ActionType } from '../../Command/ActionBase';

/**
 * Set the column width according to the specified column index
 *
 * @internal
 */
export class SetColumnWidthAction extends SheetActionBase<ISetColumnWidthActionData> {
    constructor(actionData: ISetColumnWidthActionData, commandModel: CommandModel, observers: ActionObservers) {
        super(actionData, commandModel, observers);
        this._doActionData = {
            ...actionData,
        };
        this._oldActionData = {
            ...actionData,
            columnWidth: this.do(),
        };
        this.validate();
    }

    do(): number[] {
        const result = SetColumnWidthApply(this.getSpreadsheetModel(), this._doActionData);
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
        const result = SetColumnWidthApply(this.getSpreadsheetModel(), this._doActionData);
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

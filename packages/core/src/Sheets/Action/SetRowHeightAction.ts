import { SetRowHeight } from '../Apply';
import { SheetActionBase } from '../../Command/SheetActionBase';
import { ActionObservers, ActionType, CommandModel } from '../../Command';
import { ISetRowHeightActionData } from '../../Types/Interfaces/IActionModel';

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
        const worksheet = this.getWorkSheet();

        const result = SetRowHeight(this._doActionData.rowIndex, this._doActionData.rowHeight, worksheet.getRowManager());

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
        const worksheet = this.getWorkSheet();

        const result = SetRowHeight(this._oldActionData.rowIndex, this._oldActionData.rowHeight, worksheet.getRowManager());

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

import { SetRightToLeftApply } from '../Apply';
import { BooleanNumber } from '../../Types/Enum';
import { SheetActionBase } from '../../Command/SheetActionBase';
import { ActionObservers, ActionType, CommandModel } from '../../Command';
import { ISetRightToLeftActionData } from '../../Types/Interfaces/IActionModel';

/**
 * @internal
 */
export class SetRightToLeftAction extends SheetActionBase<ISetRightToLeftActionData> {
    constructor(actionData: ISetRightToLeftActionData, commandModel: CommandModel, observers: ActionObservers) {
        super(actionData, commandModel, observers);
        this._doActionData = {
            ...actionData,
        };

        this._oldActionData = {
            ...actionData,
            rightToLeft: this.do(),
        };
        this.validate();
    }

    do(): BooleanNumber {

        const result = SetRightToLeftApply(this.getSpreadsheetModel(), this._doActionData);

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
        SetRightToLeftApply(this.getSpreadsheetModel(), this._oldActionData);
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

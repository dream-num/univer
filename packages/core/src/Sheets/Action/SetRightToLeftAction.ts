import { BooleanNumber } from '../../Types/Enum';
import { SheetActionBase } from '../../Command/SheetActionBase';
import { ISetRightToLeftActionData } from '../../Types/Interfaces/IActionModel';
import { SetRightToLeftApply } from '../Apply/SetRightToLeft';
import { CommandModel } from '../../Command/CommandModel';
import { ActionObservers, ActionType } from '../../Command/ActionBase';

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

import { ObjectMatrixPrimitiveType } from '../../Shared';
import { SheetActionBase } from '../../Command/SheetActionBase';
import { SetBorderApply } from '../Apply';
import { IStyleData } from '../../Types/Interfaces';
import { ActionObservers, ActionType, CommandModel } from '../../Command';
import { BorderStyleData } from '../../Types/Interfaces/IActionModel';

/**
 * set border style
 *
 * @internal
 */
export class SetBorderAction extends SheetActionBase<BorderStyleData, BorderStyleData> {
    constructor(actionData: BorderStyleData, commandModel: CommandModel, observers: ActionObservers) {
        super(actionData, commandModel, observers);
        this._doActionData = {
            ...actionData,
        };
        this._oldActionData = {
            ...actionData,
            styles: this.do(),
        };
        this.validate();
    }

    do(): ObjectMatrixPrimitiveType<IStyleData> {
        const result = SetBorderApply(this.getSpreadsheetModel(), this._doActionData);
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
        SetBorderApply(this.getSpreadsheetModel(), this._oldActionData);
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

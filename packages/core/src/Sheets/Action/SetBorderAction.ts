import { ObjectMatrixPrimitiveType } from '../../Shared';
import { SheetActionBase, ISheetActionData } from '../../Command/SheetActionBase';
import { SetBorderApply } from '../Apply';
import { IStyleData } from '../../Types/Interfaces';
import { ActionObservers, ActionType } from '../../Command/ActionObservers';
import { CommandModel } from '../../Command';

/**
 * @internal
 * Border style format
 */
export interface BorderStyleData extends ISheetActionData {
    styles: ObjectMatrixPrimitiveType<IStyleData>;
}

/**
 * set border style
 *
 * @internal
 */
export class SetBorderAction extends SheetActionBase<BorderStyleData, BorderStyleData> {
    static NAME = 'SetBorderAction';

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
        const result = SetBorderApply(this._commandModel, this._doActionData);
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
        SetBorderApply(this._commandModel, this._oldActionData);
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

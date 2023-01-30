import { SetHiddenGridlines } from '../Apply';
import { SheetActionBase, ISheetActionData } from '../../Command/SheetActionBase';
import { ActionObservers, ActionType } from '../../Command/ActionObservers';
import { CommandUnit } from '../../Command';

/**
 * @internal
 */
export interface ISetHiddenGridlinesActionData extends ISheetActionData {
    hideGridlines: boolean;
}

/**
 * @internal
 */
export class SetHiddenGridlinesAction extends SheetActionBase<ISetHiddenGridlinesActionData> {
    static NAME = 'SetHiddenGridlinesAction';

    constructor(
        actionData: ISetHiddenGridlinesActionData,
        commandUnit: CommandUnit,
        observers: ActionObservers
    ) {
        super(actionData, commandUnit, observers);
        this._doActionData = {
            ...actionData,
        };

        this._oldActionData = {
            ...actionData,
            hideGridlines: this.do(),
        };
        this.validate();
    }

    do(): boolean {
        const worksheet = this.getWorkSheet();

        const result = SetHiddenGridlines(
            worksheet,
            this._doActionData.hideGridlines
        );

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
        const { hideGridlines, sheetId } = this._oldActionData;
        const worksheet = this.getWorkSheet();

        SetHiddenGridlines(worksheet, this._oldActionData.hideGridlines);

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

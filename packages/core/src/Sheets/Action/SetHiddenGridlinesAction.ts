import { SetHiddenGridlines } from '../Apply';
import { Workbook1 } from '../Domain/Workbook1';
import { ActionBase, IActionData } from '../../Command/ActionBase';
import { ActionObservers, ActionType } from '../../Command/ActionObservers';

/**
 * @internal
 */
export interface ISetHiddenGridlinesActionData extends IActionData {
    hideGridlines: boolean;
}

/**
 * @internal
 */
export class SetHiddenGridlinesAction extends ActionBase<ISetHiddenGridlinesActionData> {
    constructor(
        actionData: ISetHiddenGridlinesActionData,
        workbook: Workbook1,
        observers: ActionObservers
    ) {
        super(actionData, workbook, observers);
        this._doActionData = {
            ...actionData,
            convertor: [],
        };

        this._oldActionData = {
            ...actionData,
            hideGridlines: this.do(),
            convertor: [],
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

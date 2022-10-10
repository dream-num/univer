import { SetRightToLeft } from '../Apply';
import { Workbook1 } from '../Domain/Workbook1';
import { BooleanNumber } from '../../Enum';
import { ActionBase, IActionData } from '../../Command/ActionBase';
import { ActionObservers, ActionType } from '../../Command/ActionObservers';

/**
 * @internal
 */
export interface ISetRightToLeftActionData extends IActionData {
    rightToLeft: BooleanNumber;
}

/**
 * @internal
 */
export class SetRightToLeftAction extends ActionBase<ISetRightToLeftActionData> {
    constructor(
        actionData: ISetRightToLeftActionData,
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
            rightToLeft: this.do(),
            convertor: [],
        };
        this.validate();
    }

    do(): BooleanNumber {
        const worksheet = this.getWorkSheet();

        const result = SetRightToLeft(worksheet, this._doActionData.rightToLeft);

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
        const { rightToLeft, sheetId } = this._oldActionData;
        const worksheet = this.getWorkSheet();
        SetRightToLeft(worksheet, this._oldActionData.rightToLeft);
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

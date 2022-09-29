import { SetFrozenRows } from '../Apply';
import { WorkBook } from '../Domain/WorkBook';
import { ActionBase, IActionData } from '../../Command/ActionBase';
import { ActionObservers, ActionType } from '../../Command/ActionObservers';

/**
 * @internal
 */
export interface ISetFrozenRowsActionData extends IActionData {
    numRows: number;
}

/**
 * @internal
 */
export class SetFrozenRowsAction extends ActionBase<ISetFrozenRowsActionData> {
    constructor(
        actionData: ISetFrozenRowsActionData,
        workbook: WorkBook,
        observers: ActionObservers
    ) {
        super(actionData, workbook, observers);
        this._doActionData = {
            ...actionData,
            convertor: [],
        };

        this._oldActionData = {
            ...actionData,
            numRows: this.do(),
            convertor: [],
        };
        this.validate();
    }

    do(): number {
        const worksheet = this.getWorkSheet();

        const result = SetFrozenRows(worksheet, this._doActionData.numRows);

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
        const { numRows, sheetId } = this._oldActionData;
        const worksheet = this.getWorkSheet();

        SetFrozenRows(worksheet, this._oldActionData.numRows);

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

import { SetFrozenColumns } from '../Apply';
import { Workbook } from '../Domain/Workbook';
import { ActionBase, IActionData } from '../../Command/ActionBase';
import { ActionObservers, ActionType } from '../../Command/ActionObservers';

/**
 * @internal
 */
export interface ISetFrozenColumnsActionData extends IActionData {
    numColumns: number;
}

/**
 * @internal
 */
export class SetFrozenColumnsAction extends ActionBase<ISetFrozenColumnsActionData> {
    constructor(
        actionData: ISetFrozenColumnsActionData,
        workbook: Workbook,
        observers: ActionObservers
    ) {
        super(actionData, workbook, observers);
        this._doActionData = {
            ...actionData,
            convertor: [],
        };

        this._oldActionData = {
            ...actionData,
            numColumns: this.do(),
            convertor: [],
        };
        this.validate();
    }

    do(): number {
        const worksheet = this.getWorkSheet();

        const result = SetFrozenColumns(worksheet, this._doActionData.numColumns);

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
        const { numColumns, sheetId } = this._oldActionData;
        const worksheet = this.getWorkSheet();

        SetFrozenColumns(worksheet, this._oldActionData.numColumns);

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

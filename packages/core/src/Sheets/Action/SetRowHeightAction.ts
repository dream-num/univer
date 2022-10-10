import { SetRowHeight } from '../Apply';
import { Workbook } from '../Domain';
import { ActionBase, IActionData } from '../../Command/ActionBase';
import { ActionObservers, ActionType } from '../../Command/ActionObservers';

/**
 * @internal
 */
export interface ISetRowHeightActionData extends IActionData {
    rowIndex: number;
    rowHeight: number[];
}

/**
 * Set the row height according to the specified row index
 *
 * @internal
 */
export class SetRowHeightAction extends ActionBase<ISetRowHeightActionData> {
    constructor(
        actionData: ISetRowHeightActionData,
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
            rowHeight: this.do(),
            convertor: [],
        };
        this.validate();
    }

    redo(): void {
        this.do();
    }

    undo(): number[] {
        const worksheet = this.getWorkSheet();

        const result = SetRowHeight(
            this._oldActionData.rowIndex,
            this._oldActionData.rowHeight,
            worksheet.getRowManager()
        );

        this._observers.notifyObservers({
            type: ActionType.UNDO,
            data: this._oldActionData,
            action: this,
        });

        return result;
    }

    do(): number[] {
        const worksheet = this.getWorkSheet();

        const result = SetRowHeight(
            this._doActionData.rowIndex,
            this._doActionData.rowHeight,
            worksheet.getRowManager()
        );

        this._observers.notifyObservers({
            type: ActionType.REDO,
            data: this._doActionData,
            action: this,
        });

        return result;
    }

    validate(): boolean {
        return false;
    }
}

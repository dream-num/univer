import { SetColumnHide, SetColumnShow } from '../Apply';
import { WorkBook } from '../Domain';
import { ActionBase, IActionData } from '../../Command/ActionBase';
import { ActionObservers, ActionType } from '../../Command/ActionObservers';

/**
 * @internal
 */
export interface ISetColumnShowActionData extends IActionData {
    columnIndex: number;
    columnCount: number;
}

/**
 * Set column display based on specified column index and number of columns
 *
 * @internal
 */
export class SetColumnShowAction extends ActionBase<ISetColumnShowActionData> {
    constructor(
        actionData: ISetColumnShowActionData,
        workbook: WorkBook,
        observers: ActionObservers
    ) {
        super(actionData, workbook, observers);
        this._doActionData = {
            ...actionData,
            convertor: [],
        };
        this.do();
        this._oldActionData = {
            ...actionData,
            convertor: [],
        };
        this.validate();
    }

    do(): void {
        const worksheet = this.getWorkSheet();

        SetColumnShow(
            this._doActionData.columnIndex,
            this._doActionData.columnCount,
            worksheet.getColumnManager()
        );

        this._observers.notifyObservers({
            type: ActionType.REDO,
            data: this._doActionData,
            action: this,
        });
    }

    redo(): void {
        this.do();
    }

    undo(): void {
        const worksheet = this.getWorkSheet();

        SetColumnHide(
            this._doActionData.columnIndex,
            this._doActionData.columnCount,
            worksheet.getColumnManager()
        );

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

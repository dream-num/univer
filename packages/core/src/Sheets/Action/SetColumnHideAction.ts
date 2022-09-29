import { SetColumnHide, SetColumnShow } from '../Apply';
import { ActionBase, IActionData } from '../../Command/ActionBase';
import { ActionObservers, ActionType } from '../../Command/ActionObservers';
import { WorkBook } from '../Domain';
import { ISetColumnShowActionData } from './SetColumnShowAction';

/**
 * @internal
 */
export interface ISetColumnHideActionData extends IActionData {
    columnIndex: number;
    columnCount: number;
}

/**
 * Set column hiding based on specified column index and number of columns
 *
 * @internal
 */
export class SetColumnHideAction extends ActionBase<
    ISetColumnHideActionData,
    ISetColumnShowActionData
> {
    constructor(
        actionData: ISetColumnHideActionData,
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

    redo(): void {
        this.do();
    }

    undo(): void {
        const worksheet = this.getWorkSheet();

        SetColumnShow(
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

    do(): void {
        const worksheet = this.getWorkSheet();

        SetColumnHide(
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

    validate(): boolean {
        return false;
    }
}

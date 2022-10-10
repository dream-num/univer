import { SetHideRow, SetShowRow } from '../Apply';
import { Workbook1 } from '../Domain';
import { ActionBase, IActionData } from '../../Command/ActionBase';
import { ActionObservers, ActionType } from '../../Command/ActionObservers';

/**
 * @internal
 */
export interface ISetRowShowActionData extends IActionData {
    rowIndex: number;
    rowCount: number;
}

/**
 * @internal
 */
export class SetRowShowAction extends ActionBase<ISetRowShowActionData> {
    constructor(
        actionData: ISetRowShowActionData,
        workbook: Workbook1,
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

        SetHideRow(
            this._oldActionData.rowIndex,
            this._oldActionData.rowCount,
            worksheet.getRowManager()
        );

        this._observers.notifyObservers({
            type: ActionType.UNDO,
            data: this._oldActionData,
            action: this,
        });
    }

    do(): void {
        const worksheet = this.getWorkSheet();

        SetShowRow(
            this._doActionData.rowIndex,
            this._doActionData.rowCount,
            worksheet.getRowManager()
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

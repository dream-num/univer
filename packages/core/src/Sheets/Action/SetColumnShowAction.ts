import { SetColumnHide, SetColumnShow } from '../Apply';
import { SheetActionBase, ISheetActionData } from '../../Command/SheetActionBase';
import { ActionObservers, ActionType } from '../../Command/ActionObservers';
import { CommandUnit } from '../../Command';

/**
 * @internal
 */
export interface ISetColumnShowActionData extends ISheetActionData {
    columnIndex: number;
    columnCount: number;
}

/**
 * Set column display based on specified column index and number of columns
 *
 * @internal
 */
export class SetColumnShowAction extends SheetActionBase<ISetColumnShowActionData> {
    constructor(
        actionData: ISetColumnShowActionData,
        commandUnit: CommandUnit,
        observers: ActionObservers
    ) {
        super(actionData, commandUnit, observers);
        this._doActionData = {
            ...actionData,
        };
        this.do();
        this._oldActionData = {
            ...actionData,
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

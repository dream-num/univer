import { SetHideRow, SetShowRow } from '../Apply';
import { SheetActionBase, ISheetActionData } from '../../Command/SheetActionBase';
import { ActionObservers, ActionType } from '../../Command/ActionObservers';
import { ISetRowShowActionData } from './SetRowShowAction';
import { CommandManager, CommandUnit } from '../../Command';

/**
 * @internal
 */
export interface ISetRowHideActionData extends ISheetActionData {
    rowIndex: number;
    rowCount: number;
}

/**
 * Set row hiding based on specified row index and number of rows
 *
 * @internal
 */
export class SetRowHideAction extends SheetActionBase<
    ISetRowHideActionData,
    ISetRowShowActionData
> {
    static NAME = 'SetRowHideAction';

    constructor(
        actionData: ISetRowHideActionData,
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

        SetHideRow(
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

    redo(): void {
        this.do();
    }

    undo(): void {
        const worksheet = this.getWorkSheet();

        SetShowRow(
            this._oldActionData.rowIndex,
            this._doActionData.rowCount,
            worksheet.getRowManager()
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

CommandManager.register(SetRowHideAction.NAME, SetRowHideAction);

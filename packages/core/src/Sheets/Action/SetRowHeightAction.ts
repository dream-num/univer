import { SetRowHeight } from '../Apply';
import { SheetActionBase, ISheetActionData } from '../../Command/SheetActionBase';
import { ActionObservers, ActionType } from '../../Command/ActionObservers';
import { CommandUnit } from '../../Command';

/**
 * @internal
 */
export interface ISetRowHeightActionData extends ISheetActionData {
    rowIndex: number;
    rowHeight: number[];
}

/**
 * Set the row height according to the specified row index
 *
 * @internal
 */
export class SetRowHeightAction extends SheetActionBase<ISetRowHeightActionData> {
    constructor(
        actionData: ISetRowHeightActionData,
        commandUnit: CommandUnit,
        observers: ActionObservers
    ) {
        super(actionData, commandUnit, observers);
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

    validate(): boolean {
        return false;
    }
}

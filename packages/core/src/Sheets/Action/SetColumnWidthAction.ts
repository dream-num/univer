import { SheetActionBase, ISheetActionData } from '../../Command/SheetActionBase';
import { ActionObservers, ActionType } from '../../Command/ActionObservers';
import { CommandUnit } from '../../Command';
import { SetColumnWidthApply } from '../Apply';

/**
 * @internal
 */
export interface ISetColumnWidthActionData extends ISheetActionData {
    columnIndex: number;
    columnWidth: number[];
}

/**
 * Set the column width according to the specified column index
 *
 * @internal
 */
export class SetColumnWidthAction extends SheetActionBase<ISetColumnWidthActionData> {
    static NAME = 'SetColumnWidthAction';

    constructor(
        actionData: ISetColumnWidthActionData,
        commandUnit: CommandUnit,
        observers: ActionObservers
    ) {
        super(actionData, commandUnit, observers);
        this._doActionData = {
            ...actionData,
        };
        this._oldActionData = {
            ...actionData,
            columnWidth: this.do(),
        };
        this.validate();
    }

    do(): number[] {
        const result = SetColumnWidthApply(this._commandUnit, this._doActionData);
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
        const result = SetColumnWidthApply(this._commandUnit, this._doActionData);
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

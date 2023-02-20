import { addMergeApply, RemoveMergeApply } from '../Apply';
import { IRangeData } from '../../Interfaces';
import { SheetActionBase, ISheetActionData } from '../../Command/SheetActionBase';
import { CommandUnit } from '../../Command';
import { ActionObservers, ActionType } from '../../Command/ActionObservers';
import { IAddMergeActionData } from './AddMergeAction';

/**
 * @internal
 */
export interface IRemoveMergeActionData extends ISheetActionData {
    rectangles: IRangeData[];
}

/**
 * Remove merged cells from a specified range
 *
 * @internal
 */
export class RemoveMergeAction extends SheetActionBase<
    IRemoveMergeActionData,
    IAddMergeActionData,
    IRangeData[]
> {
    static NAME = 'RemoveMergeAction';

    constructor(
        actionData: IRemoveMergeActionData,
        commandUnit: CommandUnit,
        observers: ActionObservers
    ) {
        super(actionData, commandUnit, observers);
        this._doActionData = {
            ...actionData,
        };
        this._oldActionData = {
            ...actionData,
            rectangles: this.do(),
        };
        this.validate();
    }

    do(): IRangeData[] {
        const result = RemoveMergeApply(this._commandUnit, this._doActionData);
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
        addMergeApply(this._commandUnit, this._oldActionData);
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

import { addMergeApply, RemoveMergeApply } from '../Apply';
import { IRangeData } from '../../Types/Interfaces';
import { SheetActionBase } from '../../Command/SheetActionBase';
import { CommandModel } from '../../Command';
import { ActionObservers, ActionType } from '../../Command/ActionObservers';
import { IAddMergeActionData } from './AddMergeAction';

/**
 * Remove merged cells from a specified range
 *
 * @internal
 */
export class RemoveMergeAction extends SheetActionBase<IRemoveMergeActionData, IAddMergeActionData, IRangeData[]> {

    constructor(actionData: IRemoveMergeActionData, commandModel: CommandModel, observers: ActionObservers) {
        super(actionData, commandModel, observers);
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
        const result = RemoveMergeApply(this._commandModel, this._doActionData);
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
        addMergeApply(this._commandModel, this._oldActionData);
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

import { IRangeData } from '../../Types/Interfaces';
import { SheetActionBase, ISheetActionData } from '../../Command/SheetActionBase';
import { ActionObservers } from '../../Command/ActionObservers';
import { IRemoveMergeActionData } from './RemoveMergeAction';
import { addMergeApply, RemoveMergeApply } from '../Apply';
import { CommandModel } from '../../Command/CommandModel';

/**
 * @internal
 * Format of AddMergeActionData param
 */
export interface IAddMergeActionData extends ISheetActionData {
    rectangles: IRangeData[];
}

/**
 * Set merged cell range
 *
 * @internal
 */
export class AddMergeAction extends SheetActionBase<IAddMergeActionData, IRemoveMergeActionData, IRangeData[]> {
    static NAME = 'AddMergeAction';

    constructor(actionData: IAddMergeActionData, commandModel: CommandModel, observers: ActionObservers) {
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
        return addMergeApply(this._commandModel, this._doActionData);
    }

    redo(): void {
        this.do();
    }

    undo(): void {
        RemoveMergeApply(this._commandModel, this._oldActionData);
    }

    validate(): boolean {
        return false;
    }
}

import { IRangeData } from '../../Types/Interfaces/IRangeData';
import { SheetActionBase } from '../../Command/SheetActionBase';
import { addMergeApply, RemoveMergeApply } from '../Apply';
import { CommandModel } from '../../Command/CommandModel';
import { ActionObservers } from '../../Command/ActionBase';
import { addMergeApply } from '../Apply/AddMerge';
import { SheetActionBase } from '../../Command/SheetActionBase';
import { IAddMergeActionData, IRemoveMergeActionData } from '../../Types/Interfaces/IActionModel';
import { RemoveMergeApply } from '../Apply/RemoveMerge';
import { IAddMergeActionData, IRemoveMergeActionData } from '../../Types/Interfaces/IActionModel';
import { ActionObservers } from '../../Command/ActionBase';

/**
 * Set merged cell range
 *
 * @internal
 */
export class AddMergeAction extends SheetActionBase<IAddMergeActionData, IRemoveMergeActionData, IRangeData[]> {
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
        return addMergeApply(this.getSpreadsheetModel(), this._doActionData);
    }

    redo(): void {
        this.do();
    }

    undo(): void {
        RemoveMergeApply(this.getSpreadsheetModel(), this._oldActionData);
    }

    validate(): boolean {
        return false;
    }
}

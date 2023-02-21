import { CommandManager, CommandUnit } from '../../Command';
import { IRangeData } from '../../Interfaces';
import { SheetActionBase, ISheetActionData } from '../../Command/SheetActionBase';
import { ActionObservers } from '../../Command/ActionObservers';
import { IRemoveMergeActionData } from './RemoveMergeAction';
import { addMergeApply, RemoveMergeApply } from '../Apply';

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
export class AddMergeAction extends SheetActionBase<
    IAddMergeActionData,
    IRemoveMergeActionData,
    IRangeData[]
> {
    static NAME = 'AddMergeAction';

    constructor(
        actionData: IAddMergeActionData,
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
        return addMergeApply(this._commandUnit, this._doActionData);
    }

    redo(): void {
        this.do();
    }

    undo(): void {
        RemoveMergeApply(this._commandUnit, this._doActionData);
    }

    validate(): boolean {
        return false;
    }
}

CommandManager.register(AddMergeAction.NAME, AddMergeAction);

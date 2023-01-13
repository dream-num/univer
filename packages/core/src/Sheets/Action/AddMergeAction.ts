import { addMerge } from '../Apply/AddMerge';
import { RemoveMerge } from '../Apply/RemoveMerge';
import { IRangeData } from '../../Interfaces';
import { SheetActionBase, ISheetActionData } from '../../Command/SheetActionBase';
import { ActionObservers } from '../../Command/ActionObservers';
import { IRemoveMergeActionData } from './RemoveMergeAction';
import { CommandUnit } from '../../Command';

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
        const worksheet = this.getWorkSheet();
        return addMerge(worksheet.getMerges(), this._doActionData.rectangles);
    }

    redo(): void {
        this.do();
    }

    undo(): void {
        const worksheet = this.getWorkSheet();
        RemoveMerge(worksheet.getMerges(), this._doActionData.rectangles);
    }

    validate(): boolean {
        return false;
    }
}

import { addMerge, RemoveMerge } from '../Apply';
import { IRangeData } from '../../Interfaces';
import { SheetActionBase, ISheetActionData } from '../../Command/SheetActionBase';
import { ActionObservers, ActionType } from '../../Command/ActionObservers';
import { IAddMergeActionData } from './AddMergeAction';
import { CommandUnit } from '../../Command';

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
        const worksheet = this.getWorkSheet();

        const result = RemoveMerge(
            worksheet.getMerges(),
            this._doActionData.rectangles
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

    undo(): void {
        const worksheet = this.getWorkSheet();

        addMerge(worksheet.getMerges(), this._doActionData.rectangles);

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

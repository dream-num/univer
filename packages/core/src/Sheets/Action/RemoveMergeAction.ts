import { addMerge, RemoveMerge } from '../Apply';
import { Workbook } from '../Domain';
import { IRangeData } from '../../Interfaces';
import { ActionBase, IActionData } from '../../Command/ActionBase';
import { ActionObservers, ActionType } from '../../Command/ActionObservers';
import { IAddMergeActionData } from './AddMergeAction';

/**
 * @internal
 */
export interface IRemoveMergeActionData extends IActionData {
    rectangles: IRangeData[];
}

/**
 * Remove merged cells from a specified range
 *
 * @internal
 */
export class RemoveMergeAction extends ActionBase<
    IRemoveMergeActionData,
    IAddMergeActionData,
    IRangeData[]
> {
    constructor(
        actionData: IRemoveMergeActionData,
        workbook: Workbook,
        observers: ActionObservers
    ) {
        super(actionData, workbook, observers);
        this._doActionData = {
            ...actionData,
            convertor: [],
        };
        this._oldActionData = {
            ...actionData,
            rectangles: this.do(),
            convertor: [],
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

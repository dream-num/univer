import { SetCollapseAllRowGroups } from '../Apply';
import { Workbook1 } from '../Domain';
import { GroupOpenType } from '../../Module/Group';
import { ActionBase, IActionData } from '../../Command/ActionBase';
import { ActionObservers, ActionType } from '../../Command/ActionObservers';

/**
 * @internal
 */
export interface ISetCollapseAllRowGroupsData extends IActionData {}

/**
 * Set to collapse all row groups
 *
 * @internal
 */
export class SetCollapseAllRowGroupsAction extends ActionBase<
    ISetCollapseAllRowGroupsData,
    ISetCollapseAllRowGroupsData
> {
    constructor(
        actionData: ISetCollapseAllRowGroupsData,
        workbook: Workbook1,
        observers: ActionObservers
    ) {
        super(actionData, workbook, observers);
        this._doActionData = {
            ...actionData,
            convertor: [],
        };
        this.do();
        this._oldActionData = {
            ...actionData,
            convertor: [],
        };
        this.validate();
    }

    do(): void {
        const workSheet = this.getWorkSheet();
        const rowStructGroup = workSheet.getRowStructGroup();

        SetCollapseAllRowGroups(rowStructGroup, GroupOpenType.open);

        this._observers.notifyObservers({
            type: ActionType.REDO,
            data: this._doActionData,
            action: this,
        });
    }

    redo(): void {
        this.do();
    }

    undo(): void {
        const workSheet = this.getWorkSheet();
        const rowStructGroup = workSheet.getRowStructGroup();

        SetCollapseAllRowGroups(rowStructGroup, GroupOpenType.close);

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

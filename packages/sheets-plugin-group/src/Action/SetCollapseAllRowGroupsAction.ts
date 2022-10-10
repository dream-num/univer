import { IActionData, ActionBase, Workbook, ActionObservers, ActionType } from "@univer/core";
import { SetCollapseAllRowGroups } from "../Apply/SetCollapseAllRowGroups";
import { GroupOpenType } from "../Controller/StructGroup";

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
        workbook: Workbook,
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

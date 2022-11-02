import { ISheetActionData, SheetAction, Workbook, ActionObservers, ActionType } from '@univer/core';
import { SetCollapseAllColumnGroups } from '../Apply/SetCollapseAllColumnGroups';
import { GroupOpenType } from '../Controller/StructGroup';

/**
 * @internal
 */
export interface ISetCollapseAllColumnGroupsData extends ISheetActionData {}

/**
 * Set to collapse all column groups
 *
 * @internal
 */
export class SetCollapseAllColumnGroupsAction extends SheetAction<ISetCollapseAllColumnGroupsData, ISetCollapseAllColumnGroupsData> {
    constructor(actionData: ISetCollapseAllColumnGroupsData, workbook: Workbook, observers: ActionObservers) {
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
        // const structGroup = workSheet.getColumnStructGroup();

        // SetCollapseAllColumnGroups(structGroup, GroupOpenType.open);

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
        // const structGroup = workSheet.getColumnStructGroup();

        // SetCollapseAllColumnGroups(structGroup, GroupOpenType.close);

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

import { ISheetActionData, SheetActionBase, ActionObservers, ActionType, CommandUnit } from '@univerjs/core';

/**
 * @internal
 */
export interface ISetCollapseAllColumnGroupsData extends ISheetActionData {}

/**
 * Set to collapse all column groups
 *
 * @internal
 */
export class SetCollapseAllColumnGroupsAction extends SheetActionBase<ISetCollapseAllColumnGroupsData, ISetCollapseAllColumnGroupsData> {
    constructor(actionData: ISetCollapseAllColumnGroupsData, commandUnit: CommandUnit, observers: ActionObservers) {
        super(actionData, commandUnit, observers);
        this._doActionData = {
            ...actionData,
        };
        this.do();
        this._oldActionData = {
            ...actionData,
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

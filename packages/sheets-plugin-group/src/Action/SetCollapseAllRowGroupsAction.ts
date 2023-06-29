import { ISheetActionData, SheetActionBase, ActionObservers, ActionType, CommandUnit } from '@univerjs/core';

/**
 * @internal
 */
export interface ISetCollapseAllRowGroupsData extends ISheetActionData {}

/**
 * Set to collapse all row groups
 *
 * @internal
 */
export class SetCollapseAllRowGroupsAction extends SheetActionBase<ISetCollapseAllRowGroupsData, ISetCollapseAllRowGroupsData> {
    constructor(actionData: ISetCollapseAllRowGroupsData, commandUnit: CommandUnit, observers: ActionObservers) {
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
        // const rowStructGroup = workSheet.getRowStructGroup();

        // SetCollapseAllRowGroups(rowStructGroup, GroupOpenType.open);

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
        // const rowStructGroup = workSheet.getRowStructGroup();

        // SetCollapseAllRowGroups(rowStructGroup, GroupOpenType.close);

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

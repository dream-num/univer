import { SheetActionBase, ActionObservers, ISheetActionData, Nullable, Workbook } from '@univer/core';
import { AddFilterCriteria, RemoveFilterCriteria } from '../Apply';
import { ACTION_NAMES, FILTER_PLUGIN } from '../Const';
import { IFilterCriteriaColumn } from '../Domain';
import { IAddFilterCriteriaActionData } from './AddFilterCriteriaAction';

export interface IRemoveFilterCriteriaAction extends ISheetActionData {
    columnPosition: number;
}

export class RemoveFilterCriteriaAction extends SheetActionBase<IRemoveFilterCriteriaAction, IAddFilterCriteriaActionData> {
    constructor(actionData: IRemoveFilterCriteriaAction, workbook: Workbook, observers: ActionObservers) {
        super(actionData, workbook, observers);
        this._doActionData = {
            ...actionData,
        };
        this._oldActionData = {
            actionName: ACTION_NAMES.ADD_FILTER_CRITERIA_ACTION,
            sheetId: actionData.sheetId,
            columnPosition: actionData.columnPosition,
            criteriaColumn: this.do(),
        };
        this.validate();
    }

    do(): Nullable<IFilterCriteriaColumn> {
        return this.redo();
    }

    redo(): Nullable<IFilterCriteriaColumn> {
        const worksheet = this.getWorkSheet();
        const context = worksheet.getContext();
        const manager = context.getPluginManager();
        return RemoveFilterCriteria(manager.getRequirePluginByName(FILTER_PLUGIN), this._oldActionData.sheetId, this._doActionData.columnPosition);
    }

    undo(): void {
        const worksheet = this.getWorkSheet();
        const context = worksheet.getContext();
        const manager = context.getPluginManager();
        AddFilterCriteria(manager.getRequirePluginByName(FILTER_PLUGIN), this._doActionData.sheetId, this._oldActionData.criteriaColumn);
    }

    validate(): boolean {
        return false;
    }
}

import { SheetAction, ActionObservers, ISheetActionData, Nullable, Workbook } from '@univer/core';
import { IFilterCriteriaColumn } from '../Domain/FilterCriteriaColumn';
import { ACTION_NAMES } from '../Const/ACTION_NAME';
import { FILTER_PLUGIN } from '../Const';
import { AddFilterCriteria, RemoveFilterCriteria } from '../Apply';
import { IRemoveFilterCriteriaAction } from './RemoveFilterCriteriaAction';

export interface IAddFilterCriteriaActionData extends ISheetActionData {
    columnPosition: number;
    criteriaColumn: Nullable<IFilterCriteriaColumn>;
}

export class AddFilterCriteriaAction extends SheetAction<IAddFilterCriteriaActionData, IRemoveFilterCriteriaAction> {
    constructor(actionData: IAddFilterCriteriaActionData, workbook: Workbook, observers: ActionObservers) {
        super(actionData, workbook, observers);
        this._doActionData = {
            ...actionData,
        };
        this._oldActionData = {
            columnPosition: actionData.columnPosition,
            sheetId: actionData.sheetId,
            actionName: ACTION_NAMES.ADD_FILTER_CRITERIA_ACTION,
        };
        this.do();
        this.validate();
    }

    do(): void {
        this.redo();
    }

    redo(): void {
        const worksheet = this.getWorkSheet();
        const context = worksheet.getContext();
        const manager = context.getPluginManager();
        AddFilterCriteria(manager.getRequirePluginByName(FILTER_PLUGIN), this._doActionData.sheetId, this._doActionData.criteriaColumn);
    }

    undo(): void {
        const worksheet = this.getWorkSheet();
        const context = worksheet.getContext();
        const manager = context.getPluginManager();
        RemoveFilterCriteria(manager.getRequirePluginByName(FILTER_PLUGIN), this._oldActionData.sheetId, this._oldActionData.columnPosition);
    }

    validate(): boolean {
        return false;
    }
}

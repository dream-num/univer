import { SheetActionBase, ActionObservers, Nullable, Workbook } from '@univerjs/core';
import { AddFilterCriteria, RemoveFilterCriteria } from '../Apply';
import { ACTION_NAMES } from '../Const';
import { IAddFilterCriteriaActionData, IFilterCriteriaColumn, IRemoveFilterCriteriaAction } from '../IData/FilterType';

export class RemoveFilterCriteriaAction extends SheetActionBase<IRemoveFilterCriteriaAction, IAddFilterCriteriaActionData> {
    constructor(actionData: IRemoveFilterCriteriaAction, workbook: Workbook, observers: ActionObservers) {
        super(
            actionData,
            {
                WorkBookUnit: workbook,
            },
            observers
        );
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
        return RemoveFilterCriteria(this._oldActionData.sheetId, this._doActionData.columnPosition);
    }

    undo(): void {
        AddFilterCriteria(this._doActionData.sheetId, this._oldActionData.criteriaColumn);
    }

    validate(): boolean {
        return false;
    }
}

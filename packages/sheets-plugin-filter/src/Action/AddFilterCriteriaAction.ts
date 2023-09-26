import { ActionObservers, SheetActionBase, Workbook } from '@univerjs/core';

import { AddFilterCriteria, RemoveFilterCriteria } from '../Apply';
import { ACTION_NAMES } from '../Const/ACTION_NAME';
import { IAddFilterCriteriaActionData, IRemoveFilterCriteriaAction } from '../IData/FilterType';

export class AddFilterCriteriaAction extends SheetActionBase<
    IAddFilterCriteriaActionData,
    IRemoveFilterCriteriaAction
> {
    constructor(actionData: IAddFilterCriteriaActionData, workbook: Workbook, observers: ActionObservers) {
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
        AddFilterCriteria(this._doActionData.sheetId, this._doActionData.criteriaColumn);
    }

    undo(): void {
        RemoveFilterCriteria(this._oldActionData.sheetId, this._oldActionData.columnPosition);
    }

    validate(): boolean {
        return false;
    }
}

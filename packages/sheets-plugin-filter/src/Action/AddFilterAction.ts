import { SheetActionBase, ActionObservers, Workbook } from '@univerjs/core';
import { ACTION_NAMES } from '../Const';
import { AddFilter, RemoveFilter } from '../Apply';
import { IAddFilterActionData, IRemoveFilterActionData } from '../IData/FilterType';

export class AddFilterAction extends SheetActionBase<IAddFilterActionData, IRemoveFilterActionData> {
    constructor(actionData: IAddFilterActionData, workbook: Workbook, observers: ActionObservers) {
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
            sheetId: this._doActionData.sheetId,
            actionName: ACTION_NAMES.ADD_FILTER_ACTION,
        };
        this.do();
        this.validate();
    }

    redo(): void {
        AddFilter(this._doActionData.sheetId, this._doActionData.filter);
    }

    undo(): void {
        RemoveFilter(this._oldActionData.sheetId);
    }

    do(): void {
        this.redo();
    }

    validate(): boolean {
        throw new Error('Method not implemented.');
    }
}

import { ActionObservers, Nullable, SheetActionBase, Workbook } from '@univerjs/core';

import { AddFilter, RemoveFilter } from '../Apply';
import { ACTION_NAMES } from '../Const';
import { IAddFilterActionData, IFilter, IRemoveFilterActionData } from '../IData/FilterType';

export class RemoveFilterAction extends SheetActionBase<IRemoveFilterActionData, IAddFilterActionData> {
    constructor(actionData: IRemoveFilterActionData, workbook: Workbook, observers: ActionObservers) {
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
            actionName: ACTION_NAMES.REMOVE_FILTER_ACTION,
            filter: this.do(),
        };
        this.validate();
    }

    redo(): Nullable<IFilter> {
        return RemoveFilter(this._doActionData.sheetId);
    }

    undo(): void {
        AddFilter(this._doActionData.sheetId, this._oldActionData.filter);
    }

    do(): Nullable<IFilter> {
        return this.redo();
    }

    validate(): boolean {
        throw new Error('Method not implemented.');
    }
}

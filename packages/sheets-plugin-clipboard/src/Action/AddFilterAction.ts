import { ActionBase, ActionObservers, IActionData, Nullable, WorkBook } from '@univer/core';
import { IFilter } from '../Domain';
import { ACTION_NAMES, FILTER_PLUGIN } from '../Const';
import { AddFilter, RemoveFilter } from '../Apply';
import { IRemoveFilterActionData } from './RemoveFilterAction';

export interface IAddFilterActionData extends IActionData {
    filter: Nullable<IFilter>;
}

export class AddFilterAction extends ActionBase<IAddFilterActionData, IRemoveFilterActionData> {
    constructor(actionData: IAddFilterActionData, workbook: WorkBook, observers: ActionObservers) {
        super(actionData, workbook, observers);
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
        const worksheet = this.getWorkSheet();
        const context = worksheet.getContext();
        const manager = context.getPluginManager();
        AddFilter(manager.getRequirePluginByName(FILTER_PLUGIN), this._doActionData.sheetId, this._doActionData.filter);
    }

    undo(): void {
        const worksheet = this.getWorkSheet();
        const context = worksheet.getContext();
        const manager = context.getPluginManager();
        RemoveFilter(manager.getRequirePluginByName(FILTER_PLUGIN), this._oldActionData.sheetId);
    }

    do(): void {
        this.redo();
    }

    validate(): boolean {
        throw new Error('Method not implemented.');
    }
}

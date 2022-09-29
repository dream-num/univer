import { ActionBase, ActionObservers, IActionData, Nullable, WorkBook } from '@univer/core';
import { AddFilter, RemoveFilter } from '../Apply';
import { ACTION_NAMES, FILTER_PLUGIN_NAME } from '../Const';
import { IFilter } from '../Domain';
import { IAddFilterActionData } from './AddFilterAction';

export interface IRemoveFilterActionData extends IActionData {}

export class RemoveFilterAction extends ActionBase<IRemoveFilterActionData, IAddFilterActionData> {
    constructor(actionData: IRemoveFilterActionData, workbook: WorkBook, observers: ActionObservers) {
        super(actionData, workbook, observers);
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
        const worksheet = this.getWorkSheet();
        const context = worksheet.getContext();
        const manager = context.getPluginManager();
        return RemoveFilter(manager.getRequirePluginByName(FILTER_PLUGIN_NAME), this._doActionData.sheetId);
    }

    undo(): void {
        const worksheet = this.getWorkSheet();
        const context = worksheet.getContext();
        const manager = context.getPluginManager();
        AddFilter(manager.getRequirePluginByName(FILTER_PLUGIN_NAME), this._doActionData.sheetId, this._oldActionData.filter);
    }

    do(): Nullable<IFilter> {
        return this.redo();
    }

    validate(): boolean {
        throw new Error('Method not implemented.');
    }
}

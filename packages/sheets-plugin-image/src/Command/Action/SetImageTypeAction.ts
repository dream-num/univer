import { ActionBase, ActionObservers, IActionData, WorkBook } from '@univer/core';
import { SetImageType } from '../../Apply';
import { OverGridImagePlugin } from '../../OverGridImagePlugin';
import { ACTION_NAMES } from '../../Const';
import { OVER_GRID_IMAGE_PLUGIN_NAME } from '../../Const/PLUGIN_NAME';

export interface ISetImageTypeData extends IActionData {
    id: string;
    type: string;
}

export class SetImageTypeAction extends ActionBase<ISetImageTypeData, ISetImageTypeData> {
    constructor(actionData: ISetImageTypeData, workbook: WorkBook, observers: ActionObservers) {
        super(actionData, workbook, observers);
        this._oldActionData = {
            actionName: ACTION_NAMES.SET_IMAGE_TYPE_ACTION,
            id: actionData.id,
            sheetId: actionData.sheetId,
            type: this.do(),
        };
    }

    redo(): void {
        this.do();
    }

    do(): string {
        const worksheet = this.getWorkSheet();
        const context = worksheet.getContext();
        const manager = context.getPluginManager();
        const plugin = manager.getPluginByName(OVER_GRID_IMAGE_PLUGIN_NAME) as OverGridImagePlugin;
        return SetImageType(plugin, this._doActionData.sheetId, this._doActionData.id, this._doActionData.type);
    }

    undo(): void {
        const worksheet = this.getWorkSheet();
        const context = worksheet.getContext();
        const manager = context.getPluginManager();
        const plugin = manager.getPluginByName(OVER_GRID_IMAGE_PLUGIN_NAME) as OverGridImagePlugin;
        SetImageType(plugin, this._oldActionData.sheetId, this._oldActionData.id, this._oldActionData.type);
    }

    validate(): boolean {
        return false;
    }
}

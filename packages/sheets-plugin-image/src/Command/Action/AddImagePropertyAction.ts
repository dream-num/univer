import { SheetActionBase, ActionObservers, ISheetActionData, Workbook } from '@univer/core';
import { ACTION_NAMES } from '../../Const';
import { OverGridImageBorderType, OverGridImagePlugin } from '../../OverGridImagePlugin';
import { AddImageProperty } from '../../Apply/AddImageProperty';
import { RemoveImageProperty } from '../../Apply/RemoveImageProperty';
import { OVER_GRID_IMAGE_PLUGIN_NAME } from '../../Const/PLUGIN_NAME';

export interface IAddImageProperty extends ISheetActionData {
    id?: string;
    sheetId: string;
    radius: number;
    url: string;
    borderType: OverGridImageBorderType;
    width: number;
    height: number;
    row: number;
    column: number;
    borderColor: string;
    borderWidth: number;
}

export class AddImagePropertyAction extends SheetActionBase<IAddImageProperty, IAddImageProperty> {
    constructor(actionData: IAddImageProperty, workbook: Workbook, observers: ActionObservers) {
        super(actionData, workbook, observers);
        this._oldActionData = {
            actionName: ACTION_NAMES.SET_IMAGE_TYPE_ACTION,
            id: this.do(),
            sheetId: actionData.sheetId,
            radius: actionData.radius,
            url: actionData.url,
            borderType: actionData.borderType,
            width: actionData.width,
            height: actionData.height,
            row: actionData.row,
            column: actionData.column,
            borderColor: actionData.borderColor,
            borderWidth: actionData.borderWidth,
        };
    }

    do(): string {
        const worksheet = this.getWorkSheet();
        const context = worksheet.getContext();
        const manager = context.getPluginManager();
        const plugin = manager.getPluginByName(OVER_GRID_IMAGE_PLUGIN_NAME) as OverGridImagePlugin;
        return AddImageProperty(plugin, {
            id: this._doActionData.id!,
            sheetId: this._doActionData.sheetId,
            radius: this._doActionData.radius,
            url: this._doActionData.url,
            borderType: this._doActionData.borderType,
            width: this._doActionData.width,
            height: this._doActionData.height,
            row: this._doActionData.row,
            column: this._doActionData.column,
            borderColor: this._doActionData.borderColor,
            borderWidth: this._doActionData.borderWidth,
        });
    }

    redo(): void {
        this.do();
    }

    undo(): void {
        const worksheet = this.getWorkSheet();
        const context = worksheet.getContext();
        const manager = context.getPluginManager();
        const plugin = manager.getPluginByName(OVER_GRID_IMAGE_PLUGIN_NAME) as OverGridImagePlugin;
        RemoveImageProperty(plugin, this._oldActionData.id!);
    }

    validate(): boolean {
        return false;
    }
}

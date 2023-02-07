import { CommandManager, ContextBase, ISheetActionData, SheetActionBase } from '@univerjs/core';
import { BaseComponentProps } from '@univerjs/base-ui';

import { SheetPlugin } from '../SheetPlugin';
import { IShowToolBarConfig } from '../Model';
import { IHideRightMenuConfig } from './RightMenuController';
// All skins' less file

export interface IShowContainerConfig {
    outerLeft?: boolean;

    outerRight?: boolean;

    header?: boolean;

    footer?: boolean;

    innerLeft?: boolean;

    innerRight?: boolean;

    frozenHeaderLT?: boolean;

    frozenHeaderRT?: boolean;

    frozenHeaderLM?: boolean;

    frozenContent?: boolean;

    infoBar?: boolean;

    formulaBar?: boolean;

    countBar?: boolean;

    sheetBar?: boolean;

    // Whether to show the toolbar
    toolBar?: boolean;

    rightMenu?: boolean;

    contentSplit?: boolean | string;
}

export interface ILayout {
    sheetContainerConfig?: IShowContainerConfig;
    toolBarConfig?: IShowToolBarConfig;
    rightMenuConfig?: IHideRightMenuConfig;
}

export interface ISheetPluginConfigBase {
    layout: ILayout;
}

export interface BaseSheetContainerConfig extends BaseComponentProps, ISheetPluginConfigBase {
    container: HTMLElement;
    skin: string;
    onDidMount: () => void;
    context: ContextBase;
}

export class SheetContainerController {
    private _plugin: SheetPlugin;

    constructor(plugin: SheetPlugin) {
        this._plugin = plugin;

        this._initialize();
    }

    private _initialize() {
        // Monitor all command changes and automatically trigger the refresh of the canvas
        CommandManager.getCommandObservers().add(({ actions }) => {
            const plugin: SheetPlugin = this._plugin;

            if (!plugin) return;
            if (!actions || actions.length === 0) return;
            const action = actions[0] as SheetActionBase<ISheetActionData, ISheetActionData, void>;

            const currentUnitId = plugin.context.getWorkBook().getUnitId();
            const actionUnitId = action.getWorkBook().getUnitId();

            if (currentUnitId !== actionUnitId) return;

            // Only the currently active worksheet needs to be refreshed
            const worksheet = action.getWorkBook().getActiveSheet();
            if (worksheet) {
                try {
                    const canvasView = plugin.getCanvasView();
                    if (canvasView) {
                        canvasView.updateToSheet(worksheet);
                        plugin.getMainComponent().makeDirty(true);
                    }
                } catch (error) {
                    console.info(error);
                }
            }
        });
    }
}

import { CommandManager } from '@univer/core';
import { SpreadsheetPlugin } from '../SpreadsheetPlugin';
import { SheetContainer } from '../View/UI/SheetContainer';

export class SheetContainerController {
    private _plugin: SpreadsheetPlugin;

    private _sheetContainer: SheetContainer;

    private _sheetContainerContent: HTMLElement;

    private __debounceTimeout: number;

    constructor(plugin: SpreadsheetPlugin) {
        this._plugin = plugin;

        this._initialize();
    }

    protected _initialize() {
        // Monitor all command changes and automatically trigger the refresh of the canvas
        CommandManager.getActionObservers().add((actionEvent) => {
            window.clearTimeout(this.__debounceTimeout);
            this.__debounceTimeout = window.setTimeout(() => {
                this._plugin.getMainComponent().makeDirty(true);
            }, 10);
        });
    }
}

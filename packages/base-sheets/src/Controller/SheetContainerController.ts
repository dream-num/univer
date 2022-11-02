import { BooleanNumber, CommandManager } from '@univer/core';
import { SheetPlugin } from '../SheetPlugin';

export class SheetContainerController {
    private _plugin: SheetPlugin;

    constructor(plugin: SheetPlugin) {
        this._plugin = plugin;

        this._initialize();
    }

    private _initialize() {
        // Monitor all command changes and automatically trigger the refresh of the canvas
        CommandManager.getCommandObservers().add(({ actions }) => {
            const worksheet = actions[0].getWorkSheet();

            // Only the currently active worksheet needs to be refreshed
            if (worksheet.getConfig().status === BooleanNumber.TRUE) {
                this._plugin.getCanvasView().updateToSheet(worksheet);
                this._plugin.getMainComponent().makeDirty(true);
            }
        });
    }
}

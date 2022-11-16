import { BooleanNumber, CommandManager, SheetActionBase, ISheetActionData } from '@univer/core';
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
            const action = actions[0] as SheetActionBase<ISheetActionData>;
            const worksheet = action.getWorkSheet();

            // Only the currently active worksheet needs to be refreshed
            if (worksheet.getConfig().status === BooleanNumber.TRUE) {
                try {
                    const canvasView = this._plugin?.getCanvasView()
                    if (canvasView) {
                        canvasView.updateToSheet(worksheet);
                    }
                    this._plugin?.getMainComponent().makeDirty(true);
                } catch (error) {
                    console.info(error)
                }

            }
        });
    }
}

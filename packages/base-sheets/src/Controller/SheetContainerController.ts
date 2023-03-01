import { CommandManager, ISheetActionData, SheetActionBase } from '@univerjs/core';
import { SheetPlugin } from '../SheetPlugin';
// All skins' less file

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
                        plugin.getSelectionManager().renderCurrentControls(false);
                    }
                } catch (error) {
                    console.info(error);
                }
            }
        });
    }
}

import { BaseClipboardExtension, BaseClipboardExtensionFactory, IClipboardData } from '@univerjs/base-ui';
import { ACTION_NAMES, ISetSelectionValueActionData, SheetPlugin } from '@univerjs/base-sheets';
import { DEFAULT_CELL, DEFAULT_SELECTION, PLUGIN_NAMES } from '@univerjs/core';
import { ClipboardPlugin } from '../../ClipboardPlugin';

/**
 * TODO
 */
export class ClipboardSelectionExtension extends BaseClipboardExtension<ClipboardPlugin> {
    execute() {
        let content = this._data.html || this._data.plain;

        const selection = this.handleSelection();
        return selection;
    }

    /**
     * TODO Calculated based on the currently active cell and pasted range
     * @returns
     */
    handleSelection() {
        const sheetId = this._plugin.getContext().getWorkBook().getActiveSheet().getSheetId();
        const selectionManager = this._plugin.getContext().getPluginManager().getRequirePluginByName<SheetPlugin>(PLUGIN_NAMES.SPREADSHEET).getSelectionManager();

        const selectionRange = DEFAULT_SELECTION;
        const curCellRange = DEFAULT_CELL;
        return null;
        selectionManager.clearSelectionControls();
        const models = selectionManager.addControlToCurrentByRangeData(selectionRange, curCellRange, false);

        if (!models) {
            return null;
        }
        selectionManager.updatePreviousSelection();

        let action: ISetSelectionValueActionData = {
            sheetId,
            actionName: ACTION_NAMES.SET_SELECTION_VALUE_ACTION,
            selections: models,
        };

        return action;
    }
}

export class ClipboardSelectionExtensionFactory extends BaseClipboardExtensionFactory<ClipboardPlugin> {
    get zIndex(): number {
        return 3;
    }

    create(data: IClipboardData): BaseClipboardExtension {
        return new ClipboardSelectionExtension(data, this._plugin);
    }

    check(data: IClipboardData): false | BaseClipboardExtension {
        // No judgment needed, constituencies must be dealt with
        return this.create(data);
    }
}

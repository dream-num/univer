import { BaseClipboardExtension, BaseClipboardExtensionFactory, IClipboardData } from '@univerjs/base-ui';
import { SheetPlugin } from '@univerjs/base-sheets';
import { DEFAULT_CELL, DEFAULT_SELECTION, PLUGIN_NAMES } from '@univerjs/core';
import { OperationPlugin } from '../../OperationPlugin';

/**
 * TODO move to ClipboardExtension
 */
export class ClipboardSelectionExtension extends BaseClipboardExtension<OperationPlugin> {
    execute() {
        let content = this._data.html || this._data.plain;

        const selectionManager = this._plugin.getContext().getPluginManager().getRequirePluginByName<SheetPlugin>(PLUGIN_NAMES.SPREADSHEET).getSelectionManager();

        // TODO get info from content
        const selectionRange = DEFAULT_SELECTION;
        const curCellRange = DEFAULT_CELL;
        selectionManager.clearSelectionControls();
        selectionManager.addControlToCurrentByRangeData(selectionRange, curCellRange);
        selectionManager.updatePreviousSelection();

        const actionData = {};
        return actionData;
    }
}

export class ClipboardSelectionExtensionFactory extends BaseClipboardExtensionFactory<OperationPlugin> {
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

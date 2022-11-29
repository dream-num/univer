import { ACTION_NAMES, BaseActionExtension, BaseActionExtensionFactory, ContextBase, IInsertRowActionData, ISheetActionData, Plugin } from '@univer/core';
import { IActionData } from '@univer/core/src/Command/ActionBase';
import { SheetPlugin } from '../../SheetPlugin';

export class NamedRangeInsertRowActionExtension extends BaseActionExtension<IInsertRowActionData, SheetPlugin> {
    execute() {
        const unitId = this._plugin.getContext().getWorkBook().getUnitId();
        const sheetId = this.actionData.sheetId;
        const commandManager = this._plugin.getContext().getCommandManager();

        const workBook = this._plugin.getContext().getWorkBook();
    }
}

export class NamedRangeInsertRowActionExtensionFactory extends BaseActionExtensionFactory<IInsertRowActionData, SheetPlugin> {
    get zIndex(): number {
        return 1;
    }

    get actionName(): ACTION_NAMES {
        return ACTION_NAMES.INSERT_ROW_ACTION;
    }

    create(actionData: IInsertRowActionData, actionDataList: ISheetActionData[]): BaseActionExtension<IInsertRowActionData> {
        return new NamedRangeInsertRowActionExtension(actionData, actionDataList, this._plugin);
    }

    check(actionData: IInsertRowActionData, actionDataList: IActionData[]): false | BaseActionExtension<IInsertRowActionData, Plugin<any, ContextBase>> {
        return false;
    }
}

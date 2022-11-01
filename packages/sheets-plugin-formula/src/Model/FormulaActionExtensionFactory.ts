import { ACTION_NAMES, Plugin, BaseActionExtension, BaseActionExtensionFactory, ISetRangeDataActionData, IActionData } from '@univer/core';

export class FormulaActionExtension extends BaseActionExtension<ISetRangeDataActionData> {
    execute() {}
}

export class FormulaActionExtensionFactory extends BaseActionExtensionFactory<ISetRangeDataActionData> {
    private _plugin: Plugin;

    get zIndex(): number {
        return 2;
    }

    get actionName(): ACTION_NAMES {
        return ACTION_NAMES.SET_RANGE_DATA_ACTION;
    }

    constructor(plugin: Plugin) {
        super();
        this._plugin = plugin;
    }

    create(actionData: ISetRangeDataActionData, actionDataList: IActionData[]): BaseActionExtension<ISetRangeDataActionData> {
        return new FormulaActionExtension(actionData, actionDataList);
    }
}

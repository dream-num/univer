import type { Plugin } from '../Plugin';
import type { IActionData } from './ActionBase';

// TODO: @wzhudev remove `_plugin` as constructor parameter after we refactor all up level plugins

/**
 * Manipulate the list of actions in a command
 */
export class BaseActionExtension<T extends Plugin = Plugin> {
    constructor(protected actionDataList: IActionData[], /** @deprecated would be removed in the future */ protected _plugin: T) {}

    getActionDataList(): IActionData[] {
        return this.actionDataList;
    }

    /**
     * Must use internal method to add action
     * @param actionData
     */
    push(actionData: IActionData) {
        this.actionDataList.push(actionData);
    }

    /**
     * Modify the data of action
     */
    setValue() {}

    /**
     * Execute the core logic after the check is successful
     */
    execute() {}
}

/**
 * Determine whether to intercept and create BaseActionExtension
 */
export class BaseActionExtensionFactory<T extends Plugin = Plugin> {
    constructor(protected _plugin: T) {}

    get zIndex() {
        return 0;
    }

    /**
     * Generate Action Extension
     * @param actionDataList
     * @returns
     */
    create(actionDataList: IActionData[]): BaseActionExtension<T> {
        return new BaseActionExtension(actionDataList, this._plugin);
    }

    /**
     * Intercept actionDataList
     * @returns
     */
    check(actionDataList: IActionData[]): false | BaseActionExtension<T> {
        return this.create(actionDataList);
    }
}